# 로컬 개발 모드 설계 (Local Dev Mode)

- **작성일**: 2026-05-09
- **작성자**: kwanghan-bae (with Claude)
- **상태**: Approved (구현 대기)

## 1. 배경 및 목적

현재 Clover Wallet은 Supabase Google OAuth를 통해서만 로그인 가능하다. Google OAuth가 환경에 따라 안정적으로 동작하지 않아 일상 개발/테스트 흐름이 막히고 있다. 또한 OAuth 대화상자를 매번 거치는 것 자체가 빠른 반복 개발에 마찰을 만든다.

**목표**: 개발자가 한 명령으로 백엔드 + 프론트엔드를 띄우고, 로그인 화면을 거치지 않고 즉시 앱 기능을 테스트할 수 있는 로컬 개발 모드를 제공한다. DB는 실제 prod Supabase Postgres에 그대로 연결한다(개발 단계라 데이터 오염 허용).

**비목표**:
- 로컬 격리 DB 셋업 (Docker/SQLite) — 추후 필요 시 별도 spec
- 멀티 디바이스 자동 띄우기, 시뮬레이터 자동 오픈
- Windows native 셸 지원 (macOS zsh/bash 기준)

## 2. 핵심 결정 사항

| 결정 | 선택 | 비고 |
|------|------|------|
| 백엔드 위치 | 로컬 + Render 둘 다 지원 | `EXPO_PUBLIC_API_URL`로 분기 |
| DB 타겟 | 실 Supabase Postgres | 개발 단계 오염 허용 |
| dev 유저 정책 | 3명 시드 + env로 선택 | `dev1~3@local.test` |
| 자동 로그인 | env에 지정된 1명으로 부팅 시 자동 | 전환은 `.env` 변경 + 재시작 |
| 통합 실행 | `npm run dev:local` 셸 스크립트 | Ctrl-C 일괄 종료, 가비지 정리 |

## 3. 아키텍처 개요

3개 컴포넌트로 구성된다.

### 3.1 백엔드 dev 엔드포인트

`POST /auth/dev-login { email }` 추가. 동작:
- `NODE_ENV !== 'production'` AND `DEV_AUTH_ENABLED=true`일 때만 컨트롤러 등록 (라우트가 prod에 존재하지 않음)
- 응답 shape은 기존 `/auth/login`과 100% 동일 (`accessToken`, `refreshToken`, `user`)
- Supabase JWT 디코드 단계 생략. 이메일을 `ssoQualifier='dev:${email}'`로 변환하여 기존 `AuthService.login()` 그대로 호출
- 시작 시 활성화 경고 로그 출력

### 3.2 프론트 dev 부트 플로우

`EXPO_PUBLIC_DEV_AUTH_BYPASS=true` AND `__DEV__`일 때:
- 앱 부팅 시 `AuthContext`가 Supabase listener 등록을 건너뛰고 `authApi.devLogin(email)` 자동 호출
- 응답 토큰을 기존 MMKV 키(`auth.access_token`, `user.profile`)에 저장 → 이후 모든 API 호출 흐름은 prod와 100% 동일
- 로그인 화면은 dev 모드에서 도달하지 않음 (실패 시에만 fallback으로 도달)

### 3.3 통합 셸 스크립트 `scripts/dev-local.sh`

5단계로 동작:
1. **Pre-flight**: `.env` 존재, 필수 변수, `node_modules` 확인 (없으면 abort, 자동 install X)
2. **가비지 정리**: 포트 3000(백엔드), 8081(Metro) 점유 PID를 `lsof -ti`로 조회 → SIGTERM → 1초 → SIGKILL
3. **DB 시드**: `cd apps/backend && npx prisma db seed` (멱등 upsert)
4. **백엔드 + 프론트 spawn**: 같은 process group에 background 실행, 로그에 색상 prefix 부착
5. **종료 트랩**: SIGINT/SIGTERM/EXIT에 cleanup() 등록 — 자식 PID + 손주(`pkill -P`) 일괄 종료

### 3.4 데이터 흐름 다이어그램

```
[앱 부팅]
   ↓
[AuthProvider useEffect]
   ↓
isDevAuthBypass() ── No ──→ [기존 Supabase 리스너 경로]
   ↓ Yes
authApi.devLogin('dev1@local.test')
   ↓ POST /auth/dev-login { email }
[백엔드 DevAuthController]  (NODE_ENV != prod 일 때만 존재)
   ↓ ssoQualifier = 'dev:dev1@local.test'
[AuthService.login()]  ←── 기존 코드, 수정 없음
   ↓ findOrCreateBySsoQualifier
[Postgres users 테이블]  ←── seed로 미리 존재
   ↓
[JWT access(1h) + refresh(7d) 발급]
   ↓
[프론트 MMKV 저장 → setUser()]
   ↓
[isAuthenticated = true → 홈 진입]
```

## 4. 보안 게이팅

dev 모드의 본질이 "auth 우회"이므로 prod에 켜지면 즉시 인증 우회 백도어가 된다. 다층 방어를 적용한다.

### 4.1 백엔드 게이팅
- `AuthModule` 등록 시점에 컨트롤러 자체를 조건부로만 추가
- 두 환경변수가 **모두** 충족돼야 등록: `NODE_ENV !== 'production'` AND `DEV_AUTH_ENABLED === 'true'`
- 활성화 시 시작 로그에 경고 출력 (`⚠️ DEV AUTH BYPASS ENABLED`)
- Render prod 환경엔 `DEV_AUTH_ENABLED` 변수 자체를 등록하지 않음

### 4.2 프론트엔드 게이팅
- `__DEV__` (React Native 빌드 플래그) AND `EXPO_PUBLIC_DEV_AUTH_BYPASS === 'true'` 모두 true일 때만 dev 분기 진입
- release 빌드는 `__DEV__ === false`이므로 env가 잘못 들어가도 우회 불가
- 모든 분기는 단일 함수 `isDevAuthBypass()` 한 곳을 통하도록 강제 (게이트 일원화)

### 4.3 빌드 가드
- 기존 `scripts/guard-build.sh`에 검사 추가: prod 빌드 산출물에서 `dev-login`, `DEV_AUTH_BYPASS` 문자열이 발견되면 빌드 실패
- `.env.example`은 dev 변수 위주, `.env.production.example`은 dev 변수를 명시적 빈 값으로 두어 의도 표현

### 4.4 게이팅 매트릭스

| 환경 | NODE_ENV | DEV_AUTH_ENABLED | EXPO_PUBLIC_DEV_AUTH_BYPASS | __DEV__ | dev 모드? |
|------|----------|------------------|------------------------------|---------|-----------|
| 로컬 | development | true | true | true | ✅ ON |
| Render staging | development | true | - | - | 백엔드만 ON |
| Render prod | production | (unset) | - | - | ❌ OFF |
| Expo dev build | - | - | true | true | 프론트만 ON |
| Expo prod build | - | - | (unset) | false | ❌ OFF |

모든 게이트가 통과돼야 dev 모드 활성. 한 곳만 빠져도 fallback으로 정상 OAuth 시도.

## 5. 셸 스크립트 동작 사양

### 5.1 핵심 의사 코드

**가비지 정리** (idempotent):
```bash
cleanup_port() {
  local port=$1
  local pids=$(lsof -ti:$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "[정리] 포트 $port 잔존 프로세스 종료: $pids"
    kill -TERM $pids 2>/dev/null || true
    sleep 1
    kill -KILL $pids 2>/dev/null || true
  fi
}
```

**프로세스 그룹 + 트랩**:
```bash
set -m  # job control 활성화
CHILD_PIDS=()

cleanup() {
  trap '' INT TERM  # 중복 호출 방지
  echo "[shutdown] 자식 프로세스 정리 중..."
  for pid in "${CHILD_PIDS[@]}"; do
    kill -TERM "$pid" 2>/dev/null || true
    pkill -P "$pid" 2>/dev/null || true
  done
  sleep 2
  for pid in "${CHILD_PIDS[@]}"; do
    kill -KILL "$pid" 2>/dev/null || true
  done
  exit ${EXIT_CODE:-0}
}
trap cleanup INT TERM EXIT
```

**로그 prefix**:
```bash
( cd apps/backend && npm run start:dev 2>&1 \
    | sed -u "s/^/$(printf '\033[32m[backend]\033[0m ')/" ) &
BACKEND_PID=$!
CHILD_PIDS+=($BACKEND_PID)
```

### 5.2 옵션 플래그 (최소)
- `--no-seed`: 시드 스킵 (재시작 빠르게)
- `--remote-backend`: 로컬 백엔드 spawn 생략, 프론트만 (`EXPO_PUBLIC_API_URL`은 Render)

시뮬레이터 자동 오픈 같은 플래그는 추가하지 않음 (Expo CLI의 `i`/`a`/`w` 키로 충분, YAGNI).

### 5.3 npm 통합
루트 `package.json`에 `"dev:local": "bash scripts/dev-local.sh"` 추가.

## 6. 변경/추가 파일 목록

| 파일 | 종류 | 예상 LOC |
|------|------|----------|
| `apps/backend/src/auth/dev-auth.controller.ts` | 신규 | +35 |
| `apps/backend/src/auth/auth.module.ts` | 수정 | +5 |
| `apps/backend/prisma/seed.ts` | 신규 | +25 |
| `apps/backend/package.json` | 수정 | +3 (seed 스크립트 등록) |
| `apps/frontend/utils/dev-auth.ts` | 신규 | +12 |
| `apps/frontend/api/auth.ts` | 수정 | +3 |
| `apps/frontend/context/AuthContext.ts` | 수정 | +15, -3 |
| `apps/frontend/app/_layout.tsx` | 수정 | +3 |
| `scripts/dev-local.sh` | 신규 | +120 |
| `package.json` (루트) | 수정 | +1 |
| `apps/frontend/.env.example` | 수정 | +3 |
| `apps/backend/.env.example` | 수정 | +1 |
| `scripts/guard-build.sh` | 수정 | +5 (dev 산출물 검사) |
| `CLAUDE.md` | 수정 | +10 (로컬 실행 안내) |

모든 신규 파일은 150줄 룰 준수.

## 7. 테스트 전략

### 7.1 백엔드 (Jest)
- `dev-auth.controller.spec.ts` (신규)
  - 기존 user 있는 이메일 → 그 user의 JWT 반환
  - 없는 이메일 → 새 user 생성 후 JWT 반환 (멱등성)
  - 응답 shape이 `/auth/login`과 동일
- `auth.module.spec.ts` (보강)
  - `NODE_ENV=production` → `DevAuthController` 미등록
  - `DEV_AUTH_ENABLED !== 'true'` → 미등록

### 7.2 프론트엔드 (RNTL + Jest)
- `__tests__/utils/dev-auth.test.ts` (신규)
  - `__DEV__ × env` 4개 케이스, true 한 케이스만
- `__tests__/context/AuthContext.test.tsx` (보강)
  - dev 모드 활성 → `authApi.devLogin` 호출, Supabase listener 미호출
  - dev 모드 비활성 → 기존 Supabase 흐름 유지 (회귀 방지)
- `__tests__/api/auth.test.ts` (보강)
  - `devLogin(email)`이 올바른 URL/payload로 POST

### 7.3 Manual smoke checklist
- [ ] `npm run dev:local` → 백엔드 + 프론트 동시 기동, 로그 prefix 정상
- [ ] 로그인 화면 안 보이고 홈 직행
- [ ] `EXPO_PUBLIC_DEV_USER_EMAIL` 변경 후 재시작 → 다른 user로 로그인
- [ ] Ctrl-C 한 번으로 두 프로세스 종료, 포트 free 확인
- [ ] `kill -9`로 강제 종료 후 재실행 → 가비지 정리 로그 후 정상 기동
- [ ] prod 빌드 산출물에 `dev-login` 문자열 grep 시 매치 없음

### 7.4 빌드 가드 (자동화 회귀 방지)
`scripts/guard-build.sh`에 다음 추가:
```bash
if grep -r "dev-login\|DEV_AUTH_BYPASS" apps/frontend/dist/ 2>/dev/null; then
  echo "❌ dev artifacts leaked into prod build"
  exit 1
fi
```

## 8. 롤아웃 순서 (Phase별 독립 가치)

### Phase 1 — 백엔드 dev 엔드포인트
1. `DevAuthController` TDD (실패 테스트 → 구현 → 통과)
2. `AuthModule` 조건부 등록 + 게이팅 매트릭스 테스트
3. `prisma/seed.ts` + `db seed` 명령 등록
4. curl로 `POST /auth/dev-login` 검증

**완료 시 가치**: 백엔드 단독으로 Postman/curl 테스트 가능

### Phase 2 — 프론트 dev 부트
5. `utils/dev-auth.ts` + 단위 테스트
6. `api/auth.ts`의 `devLogin` + 테스트
7. `AuthContext` 분기 + 테스트 (dev/prod 양쪽 회귀 케이스)
8. `_layout.tsx` 리다이렉트 가드 수정

**완료 시 가치**: `npm start`만으로 자동 로그인 동작 (일상 개발 편의)

### Phase 3 — 통합 셸 스크립트
9. `scripts/dev-local.sh` 작성 (가비지 정리 → spawn → 트랩 순)
10. 루트 `package.json` `"dev:local"` 등록
11. Manual checklist 6개 통과

**완료 시 가치**: 한 명령으로 전체 기동

### Phase 4 — 하드닝
12. `.env.example` 정비 (dev / prod 분리, 명시적 비활성)
13. `guard-build.sh`에 dev 산출물 누출 검사
14. `CLAUDE.md` 로컬 실행 섹션 추가

**완료 시 가치**: prod 사고 방지 안전망

각 Phase는 독립 PR로 끊을 수 있다.

## 9. 위험 요소 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| dev 엔드포인트가 prod에 활성 배포 | Critical (인증 우회) | 4중 게이팅(NODE_ENV + DEV_AUTH_ENABLED + 빌드 가드 + Render env 미등록) |
| dev user들이 prod DB에 잔존 | Low (개발 단계 허용) | `dev:` 접두사 ssoQualifier로 식별 가능 → 추후 `cleanup-dev-users.ts` 스크립트 추가 가능 |
| 셸 트랩이 손주 프로세스를 못 잡음 | Medium (가비지 누적) | `pkill -P`로 손주까지 + 다음 실행 시 `lsof -ti` fallback 정리 |
| Expo Metro 8081 외 포트 사용 | Low | 셸 스크립트는 8081 + 19000-19002까지 검사 |
| Supabase listener 코드가 dev 모드에서도 일부 실행 | Low | `isDevAuthBypass()` true면 listener 등록 자체를 스킵하여 호출 경로 차단 |

## 10. 성공 지표

- 개발자가 새 머신에서 repo clone 후 `npm install && npm run dev:local` 두 명령으로 앱 기동 가능
- 로그인 화면 거치지 않고 홈 진입까지 5초 이내
- Ctrl-C 한 번으로 모든 프로세스 정리 (포트 0개 남음)
- prod 빌드에서 dev 관련 문자열 0건
