# Clover Wallet 프로젝트 고도화 설계

> 작성일: 2026-04-11
> 범위: 구조 리팩토링 + Phase 4-2 완성 (기능 변경 없음)

## 1. 배경 및 목표

Clover Wallet은 Phase 1-4.1까지 완료된 한국 로또 관리 플랫폼이다. 355개 커밋, NestJS 백엔드(192 tests) + Expo 프론트엔드(71 tests)로 구성되어 있다.

코드베이스가 성장하면서 다음 문제가 발생했다:
- 150줄 초과 파일 7개 이상 (최대 342줄)
- 프론트/백엔드 간 타입이 독립적으로 정의되어 불일치 위험
- 테스트 커버리지가 측정/강제되지 않음
- 문서 3개 이상이 Kotlin/Spring Boot를 참조하는 stale 상태
- 모노레포 도구 없이 수동 관리

### 목표
1. **에이전트 친화적 구조** — 150줄 이하 파일, 명확한 모듈 경계, CLAUDE.md 규칙
2. **출시 품질** — 80%+ 커버리지(CI 강제), E2E 7개+ 플로우, 접근성 강화
3. **유지보수성** — Turborepo, 공유 타입 패키지, 문서 정합성

## 2. 목표 디렉토리 구조

```
clover-wallet/
├── turbo.json
├── package.json                  # workspaces: ["apps/*", "packages/*"]
├── packages/
│   └── shared/
│       ├── package.json          # name: @clover/shared
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── types/
│       │   │   ├── user.ts
│       │   │   ├── lotto.ts
│       │   │   ├── community.ts
│       │   │   ├── ticket.ts
│       │   │   ├── notification.ts
│       │   │   └── api.ts        # 공통 response/pagination 타입
│       │   ├── constants/        # 로또 번호 범위, 지역 목록 등
│       │   └── validators/       # Zod 스키마
│       └── scripts/
│           └── generate-types.ts # Prisma → shared 타입 생성
├── apps/
│   ├── backend/                  # 기존 backend-node/
│   └── frontend/                 # 기존 frontend/
├── docs/
├── scripts/
└── .github/workflows/ci.yml
```

## 3. 스트림 설계

### 3.1 Stream 1: 인프라 (Phase A — 단독, 선행 필수)

Turborepo 도입, 디렉토리 이동, shared 패키지 생성, CI 강화.

**작업 목록:**
1. root `package.json`에 workspaces 정의
2. `turbo.json` 파이프라인 설정 (build, lint, test, typecheck)
3. `backend-node/` → `apps/backend/`, `frontend/` → `apps/frontend/` 이동
4. 모든 참조 경로 업데이트 (CI, Docker, render.yaml, import 등)
5. `packages/shared/` 생성 — Prisma 스키마 기반 타입 자동 생성 스크립트
6. 공통 상수/타입 이동 (로또 번호 범위, 지역 목록, API response 타입)
7. CI에 `turbo run lint test build` 통합
8. 커버리지 임계값 설정 (`--coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80}}'`)
9. `pre_commit.sh`에서 Gradle/Kotlin 로직 제거, Turborepo 기반으로 재작성

**완료 기준:** `turbo run build test lint` root에서 성공, `@clover/shared` 양쪽 import 가능

### 3.2 Stream 2: 백엔드 고도화 (Phase B — 병렬)

150줄 초과 파일 분리, 테스트 80%+ 달성, shared 타입 적용.

**파일 분리:**

| 현재 파일 | 줄수 | 분리 결과 |
|-----------|------|----------|
| `community.service.ts` | 342 | `post.service.ts` + `comment.service.ts` + `like.service.ts` + `feed.service.ts` |
| `community.controller.ts` | ~200 | `post.controller.ts` + `comment.controller.ts` |
| `winning-check.service.ts` | 235 | `winning-check.service.ts` + `winning-rank.calculator.ts` |
| `lotto-winning-store.service.ts` | 178 | `winning-store.service.ts` + `winning-store-sync.service.ts` |

**TDD 프로세스 (각 분리마다):**
1. 기존 테스트 통과 확인
2. 분리될 모듈의 테스트 먼저 작성 (Red)
3. 파일 분리 실행 (Green)
4. 리팩토링 (Refactor)
5. 커버리지 80%+ 확인

**추가 작업:**
- 기존 DTO에서 `@clover/shared` 타입 참조로 전환
- 기존 테스트를 분리된 파일에 맞게 재배치
- 새 서비스별 단위 테스트 추가

**완료 기준:** 모든 .ts 파일 ≤150줄, 커버리지 80%+, shared 타입 사용

### 3.3 Stream 3: 프론트엔드 고도화 (Phase B — 병렬)

150줄 초과 화면 분리, 컴포넌트 추출, 테스트 80%+ 달성.

**파일 분리:**

| 현재 파일 | 줄수 | 분리 결과 |
|-----------|------|----------|
| `mypage.tsx` | 229 | 레이아웃 + `mypage/BadgeSection.tsx` + `ThemeSelector.tsx` + `MenuSection.tsx` |
| `scan.tsx` | 224 | 레이아웃 + `scan/CameraView.tsx` + `ScanPreview.tsx` |
| `index.tsx` (홈) | 207 | 레이아웃 + `home/HeroSection.tsx` + `QuickActions.tsx` |
| `number-generation.tsx` | 191 | 레이아웃 + `generation/MethodSelector.tsx` + `ResultDisplay.tsx` |
| `community.tsx` | 181 | 레이아웃 + `community/FeedList.tsx` + `TabSelector.tsx` |
| `PostCard.tsx` | 176 | `PostCard.tsx` + `PostCardMenu.tsx` |
| `user/[id].tsx` | 170 | 레이아웃 + `profile/ProfileHeader.tsx` + `ProfileStats.tsx` |

**테스트 전략:**
- 분리된 모든 컴포넌트에 렌더링 테스트
- 커스텀 훅 8개 전부 테스트 보강
- API 클라이언트 모듈 테스트 추가
- 유틸리티 함수 100% 커버리지 목표
- `@clover/shared` 타입으로 API 타입 교체

**완료 기준:** 모든 .ts/.tsx 파일 ≤150줄, 커버리지 80%+, shared 타입 사용

### 3.4 Stream 4: Phase 4-2 완성 (Phase B — 병렬)

E2E 테스트, 성능 최적화, 접근성 강화.

**E2E (Maestro):**
- 기존 3개 플로우 보강 (로그인, 번호생성, 게시글)
- 추가 플로우: 스캔, 마이페이지, 지도/명당, 알림 (4개+)
- 가능한 범위 내 CI 연동

**성능:**
- React.memo 적용 범위 확대 (분리된 컴포넌트 대상)
- 번들 사이즈 분석 + 불필요 의존성 정리
- React Query 캐싱 전략 점검

**접근성:**
- 모든 신규/분리 컴포넌트에 접근성 라벨 확인
- 키보드 네비게이션, 스크린 리더 호환성
- WCAG AA 기준 유지

**완료 기준:** E2E 7개+ 플로우 통과, 번들 사이즈 기록, 접근성 라벨 완비

### 3.5 Stream 5: 문서 정합성 (Phase B — 병렬)

**정리 대상:**
- `TECHNICAL_SPEC.md` — Kotlin/Spring Boot → NestJS 전면 갱신
- `docs/README.md` — 현재 Turborepo 아키텍처 반영
- `ADR.md` — 새 ADR 추가:
  - ADR-012: Turborepo 모노레포 도구 도입
  - ADR-013: @clover/shared 공유 타입 패키지
  - ADR-014: 150줄 파일 크기 제한 규칙
  - ADR-015: 80% 커버리지 CI 강제
- `ROADMAP.md` — 완료 항목 업데이트
- `pre_commit.sh` — Gradle 참조 제거 (Stream 1에서 실행)
- `CLAUDE.md` 생성 — 에이전트용 프로젝트 규칙:
  - 파일 크기 150줄 제한
  - 테스트 요구사항 (TDD, 80%+)
  - shared 타입 사용 필수
  - 커밋 메시지 컨벤션
  - 금지 사항 (기능 변경 없는 리팩토링)

**완료 기준:** 모든 문서가 현재 코드와 일치, CLAUDE.md에 에이전트 규칙 명시

## 4. 에이전트 팀 구성

### 실행 순서

```
Phase A: Stream 1 (인프라) — 단독 실행
    ↓ 완료 후
Phase B: Stream 2, 3, 4, 5 — git worktree 격리 병렬 실행
    ↓ 모두 완료 후
Phase C: 통합 머지 + 코드 리뷰 + 최종 검증
```

### Phase B 에이전트 배치

| 에이전트 | 브랜치 | 격리 방식 |
|----------|--------|----------|
| Backend Agent | `refactor/backend` | git worktree |
| Frontend Agent | `refactor/frontend` | git worktree |
| Quality Agent | `refactor/phase4-2` | git worktree |
| Docs Agent | `refactor/docs` | git worktree |

### 에이전트 작업 규칙

1. **150줄 규칙** — 모든 .ts/.tsx 파일은 150줄 이하
2. **테스트 우선** — 파일 분리 전 기존 테스트 통과 확인, 새 모듈 테스트 먼저 작성
3. **shared 타입** — 프론트/백 간 타입은 `@clover/shared`에서만 import
4. **atomic 커밋** — 파일 분리 1건 = 커밋 1개
5. **기능 무결** — 동작 변경 없이 리팩토링만

### Phase C 통합 순서

1. `refactor/docs` → main (충돌 최소)
2. `refactor/backend` → main
3. `refactor/frontend` → main
4. `refactor/phase4-2` → main (분리된 컴포넌트 기반 작업)

## 5. 슈퍼파워 스킬 활용 맵

```
brainstorming (현재 — 설계 완료)
  → writing-plans (실행 계획 작성)
    → dispatching-parallel-agents (Phase B 병렬 에이전트 실행)
      → using-git-worktrees (각 에이전트 격리)
        → test-driven-development (파일 분리 시 TDD)
        → executing-plans (각 스트림 실행)
        → systematic-debugging (문제 발생 시)
      → verification-before-completion (각 스트림 완료 시)
    → finishing-a-development-branch (Phase C 머지)
    → requesting-code-review (최종 리뷰)
```

## 6. 성공 기준

### 정량적

| 지표 | 현재 | 목표 |
|------|------|------|
| 최대 파일 줄수 | 342줄 | ≤150줄 |
| 백엔드 커버리지 | 미측정 | 80%+ (CI 강제) |
| 프론트엔드 커버리지 | 미측정 | 80%+ (CI 강제) |
| E2E 플로우 | 3개 | 7개+ |
| 150줄 초과 파일 수 | 7+ | 0 |
| 공유 타입 | 없음 | @clover/shared 통합 |
| stale 문서 | 3+ | 0 |

### 정성적

- 새 에이전트가 CLAUDE.md만 읽고도 프로젝트 규칙을 이해할 수 있음
- 한 파일 수정 시 영향 범위가 해당 모듈 내로 한정
- API 계약 변경 시 양쪽에서 컴파일 에러로 감지
- 리팩토링 전후 기존 기능 동일 동작

### 완료 체크리스트

- [ ] `turbo run build` — 모든 앱/패키지 빌드 성공
- [ ] `turbo run test` — 모든 테스트 통과
- [ ] `turbo run lint` — lint 에러 0개
- [ ] 백엔드 커버리지 ≥ 80%
- [ ] 프론트엔드 커버리지 ≥ 80%
- [ ] 150줄 초과 .ts/.tsx 파일 0개
- [ ] Maestro E2E 7개+ 플로우 통과
- [ ] CLAUDE.md에 에이전트 규칙 명시
- [ ] 모든 문서가 현재 코드와 일치
- [ ] @clover/shared에서 타입 import 동작 확인
