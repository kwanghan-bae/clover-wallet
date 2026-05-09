# 로컬 개발 모드 (Local Development Mode)

OAuth 없이 로그인 화면을 건너뛰고 앱 기능을 테스트할 수 있는 개발자 전용 모드입니다.

## 목적

- Google OAuth 흐름 (Supabase 리다이렉트, 콜백) 없이 즉시 앱 진입
- 빠른 반복 개발 (재시작마다 OAuth 다시 거치는 마찰 제거)
- 백엔드 + 프론트엔드 동시 기동 + 일괄 종료

**주의**: `__DEV__` 빌드 + 명시적 환경변수 양쪽이 모두 켜졌을 때만 활성화됩니다. 프로덕션 빌드/배포 환경에서는 절대 켜지지 않도록 4중 게이팅이 적용되어 있습니다 ([게이팅 매트릭스](#게이팅-매트릭스)).

---

## 빠른 시작

### 1) 환경변수 셋업 (최초 1회)

```bash
cp apps/frontend/.env.example apps/frontend/.env
cp apps/backend/.env.example apps/backend/.env
```

`apps/frontend/.env`에서 다음 값들을 확인:
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_DEV_AUTH_BYPASS=true
EXPO_PUBLIC_DEV_USER_EMAIL=dev1@local.test
EXPO_PUBLIC_SUPABASE_URL=...   # prod 로그인용 (dev 모드에선 unused지만 채워둘 것)
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

`apps/backend/.env`:
```bash
DATABASE_URL=...               # Supabase Postgres 연결 문자열
JWT_SECRET=...
DEV_AUTH_ENABLED=true
```

### 2) 실행

```bash
npm run dev:local
```

흐름:
1. 잔존 프로세스 정리 (포트 3000, 8081, 19000-19002 점유 프로세스 있으면 종료)
2. Pre-flight 검사 (`.env`, `node_modules` 존재 확인)
3. Prisma seed 실행 (dev 유저 3명 멱등 upsert)
4. 백엔드 + 프론트엔드 동시 기동 (`[backend]` 녹색 / `[frontend]` 파랑 prefix)
5. 두 서비스 모두 listening되면 자동으로 dev 유저로 로그인

### 3) 종료

**Ctrl-C 한 번**. 트랩이 자식 프로세스(백엔드/Metro) 및 손주 프로세스까지 일괄 정리한 뒤 포트를 free 상태로 복구합니다.

---

## 옵션

```bash
npm run dev:local -- --no-seed         # Prisma seed 스킵 (재시작 빠르게)
npm run dev:local -- --remote-backend  # 로컬 백엔드 미기동 (Render API 사용)
npm run dev:local -- --help            # 사용법 출력
```

`--remote-backend`는 프론트만 로컬에서 띄우고 싶을 때 유용합니다. 이때 `apps/frontend/.env`의 `EXPO_PUBLIC_API_URL`을 Render URL로 변경해야 합니다.

---

## Dev 유저 전환

기본은 `dev1@local.test`로 자동 로그인됩니다. 다른 유저로 시작하려면:

```bash
# apps/frontend/.env
EXPO_PUBLIC_DEV_USER_EMAIL=dev2@local.test  # 또는 dev3@local.test
```

변경 후 재시작 + 앱 storage 클리어 (브라우저 devtools에서 MMKV/localStorage 비우거나, `auth.access_token` 키 삭제). 시드된 유저는 `dev1~dev3@local.test` 3명으로 고정.

**팔로우/댓글 같은 멀티유저 시나리오 테스트** 시: 시뮬레이터 + 웹 브라우저를 동시에 띄우고 각각 다른 `EXPO_PUBLIC_DEV_USER_EMAIL`로 설정하면 두 유저가 동시에 로그인된 상태를 만들 수 있습니다.

---

## 동작 원리

### 백엔드: `POST /auth/dev-login`

`NODE_ENV !== 'production' && DEV_AUTH_ENABLED === 'true'`일 때만 `AuthModule`이 `DevAuthController`를 등록합니다 (라우트가 prod에 존재하지 않음).

요청 → 응답:
```bash
curl -X POST http://localhost:3000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev1@local.test"}'
```
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { "id": "4", "email": "dev1@local.test", ... }
  }
}
```

DTO 검증 (`DevLoginDto`)이 `@IsEmail`로 잘못된 페이로드를 차단합니다.

### 프론트엔드: `AuthProvider` 자동 분기

부팅 시 `isDevAuthBypass()` 체크 (`__DEV__ && process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS === 'true'`):
- `true` → Supabase OAuth 리스너 등록 안 함, 즉시 `authApi.devLogin(email)` 호출
- `false` → 기존 prod 흐름 (Google 로그인 화면 → Supabase OAuth → 백엔드 `/auth/login`)

응답 토큰은 동일한 MMKV 키(`auth.access_token`, `user.profile`)에 저장되므로, 이후 모든 API 호출 흐름은 prod와 100% 동일합니다.

---

## 게이팅 매트릭스

| 환경 | NODE_ENV | DEV_AUTH_ENABLED | EXPO_PUBLIC_DEV_AUTH_BYPASS | __DEV__ | dev 모드? |
|------|----------|------------------|------------------------------|---------|-----------|
| 로컬 개발 | development | true | true | true | ✅ ON |
| Render staging (있다면) | development | true | - | - | 백엔드만 ON |
| Render prod | production | (unset) | - | - | ❌ OFF |
| Expo dev build (mobile) | - | - | true | true | 프론트만 ON |
| Expo prod build (mobile) | - | - | (unset) | false | ❌ OFF |

**모든 게이트가 통과돼야 dev 모드가 활성됩니다.** 한 곳만 빠져도 fallback으로 정상 OAuth 흐름.

추가 보호:
- `scripts/pre_commit.sh`에서 `EXPO_PUBLIC_DEV_AUTH_BYPASS` unset 상태로 빌드된 산출물에 dev 문자열이 발견되면 advisory 출력
- Render 배포 환경에는 `DEV_AUTH_ENABLED` / `EXPO_PUBLIC_DEV_AUTH_BYPASS` 변수를 등록하지 않음

---

## 트러블슈팅

### `apps/frontend/.env 누락`
`.env.example`을 복사하지 않았습니다. [빠른 시작](#빠른-시작) 1단계 참고.

### `node_modules 누락`
루트에서 `npm install`을 먼저 실행하세요. 셸 스크립트가 자동 install하지 않는 것은 의도된 설계입니다 (실수 방지).

### 백엔드가 `DriverAdapterError: tenant/user postgres.<id> not found`로 죽음
Supabase 프로젝트가 paused 상태이거나 `DATABASE_URL`이 잘못됐습니다. Supabase 대시보드에서 프로젝트를 unpause하거나 새 connection string을 `.env`에 반영하세요.

### 포트 3000/8081이 이미 점유됨
정상입니다. 셸 스크립트가 시작 시 잔존 프로세스를 자동 정리합니다(`[정리] 포트 3000 잔존 프로세스 종료: ...` 로그 확인).

### Ctrl-C 후에도 프로세스가 남음
일반적으로는 발생하지 않지만, `npm run dev:local`을 강제 종료(`kill -9`)했다면 손주 프로세스가 살아있을 수 있습니다. 다음 실행 시 자동 정리되지만 즉시 정리하려면:
```bash
lsof -ti:3000,8081,19000-19002 | xargs kill -9
```

### 자동 로그인이 안 되고 로그인 화면이 보임
1. `apps/frontend/.env`의 `EXPO_PUBLIC_DEV_AUTH_BYPASS=true` 확인
2. Expo CLI를 재시작 (env 변수는 빌드 타임에 인라인됨)
3. 브라우저 캐시/storage 비우기 (이전 세션 데이터가 남아있을 수 있음)
4. 백엔드 로그에 `⚠️ DEV AUTH BYPASS ENABLED` 경고가 출력되는지 확인

---

## 보안 주의사항

⚠️ **dev 모드의 본질은 "auth 우회"입니다.** 프로덕션에 켜지면 즉시 인증 우회 백도어가 됩니다.

다음을 절대 하지 마세요:
- `DEV_AUTH_ENABLED=true`를 Render production 환경변수에 등록
- `EXPO_PUBLIC_DEV_AUTH_BYPASS=true`를 production 빌드의 `.env.production`에 추가
- dev 코드 분기를 `__DEV__` 체크 없이 작성

`apps/frontend/.env`와 `apps/backend/.env`는 `.gitignore` 처리되어 있으니 실수로 커밋될 위험은 없습니다. `.env.example` 파일에 명시적인 caveat 주석이 포함되어 있으니 반드시 읽고 사용하세요.

---

## 관련 자료

- [설계 문서](../superpowers/specs/2026-05-09-local-dev-mode-design.md) — 4중 게이팅 상세, 데이터 흐름, 위험 분석
- [구현 플랜](../superpowers/plans/2026-05-09-local-dev-mode.md) — 18개 task 분해 + 작업 이력
- [`scripts/dev-local.sh`](../../scripts/dev-local.sh) — 통합 실행 스크립트 소스
- [`apps/backend/src/auth/dev-auth.controller.ts`](../../apps/backend/src/auth/dev-auth.controller.ts) — dev-login 엔드포인트
- [`apps/frontend/utils/dev-auth.ts`](../../apps/frontend/utils/dev-auth.ts) — 프론트 게이트 함수
