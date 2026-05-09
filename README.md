# Clover Wallet (Monorepo) v2.0

**Clover Wallet**은 NestJS 백엔드와 프리미엄 React Native 프론트엔드를 결합한 통합 로또 관리 플랫폼입니다.

---

## 프로젝트 구조

```
clover-wallet/
├── apps/
│   ├── backend/        # NestJS 11 + Prisma 7 API 서버
│   └── frontend/       # React Native + Expo 54 앱 (iOS/Android/Web)
├── packages/           # 공유 패키지
├── docs/               # ADR, 로드맵, 가이드, 명세
├── scripts/            # 빌드 가드 + 통합 실행 스크립트
└── turbo.json          # Turborepo 파이프라인 설정
```

---

## 핵심 기술 스택

### Backend (`apps/backend`)
- **Runtime**: Node.js 20+
- **Framework**: NestJS 11
- **ORM**: Prisma 7 + PostgreSQL (Supabase, PrismaPg adapter)
- **Auth**: Supabase Google OAuth → 자체 JWT 발급 (access 1h / refresh 7d)
- **Testing**: Jest (233 tests)

### Frontend (`apps/frontend`)
- **Framework**: React Native (Expo SDK 54)
- **Styling**: NativeWind (Tailwind CSS)
- **State**: React Query (서버) + MMKV (로컬)
- **Validation**: Zod (런타임)
- **Testing**: Jest + React Native Testing Library (272 tests)

---

## 인프라 및 배포
- **Hosting**: Render (싱가포르 리전)
  - **Backend**: Docker, `npm run start:prod` (`node dist/src/main`)
  - **Frontend**: Static Web (`npx expo export --platform web`)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (Google SSO) + 자체 JWT
- **CI**: GitHub Actions + `scripts/pre_commit.sh` (lint + test + build + dev-leak guard)

---

## 빠른 시작

### 사전 준비
```bash
# 의존성 설치 (모노레포 전체)
npm install

# 환경 변수 셋업
cp apps/frontend/.env.example apps/frontend/.env
cp apps/backend/.env.example apps/backend/.env
# 두 파일을 열어 실제 값 입력 (DATABASE_URL, JWT_SECRET 등)
```

### 로컬 개발 (OAuth 우회)
```bash
npm run dev:local
```
한 명령으로 백엔드 + 프론트 동시 기동. 로그인 화면 거치지 않고 자동으로 dev 유저로 진입. **Ctrl-C 한 번**으로 모두 정리. 자세한 내용: [`docs/guides/LOCAL_DEV_MODE.md`](docs/guides/LOCAL_DEV_MODE.md)

### 개별 실행
```bash
npm run dev:backend     # 백엔드만 (turbo)
npm run dev:frontend    # 프론트만 (turbo)
```

### 테스트 / 린트 / 빌드
```bash
npm run test            # 모든 워크스페이스 테스트
npm run lint            # 모든 워크스페이스 린트
npm run build           # 모든 워크스페이스 빌드

# 또는 개별
cd apps/backend && npm test
cd apps/frontend && npm test
```

### 커밋 전 검증
```bash
./scripts/pre_commit.sh    # lint + test + build + dev-leak guard 한 번에
```

---

## 품질 규약
- **TDD 지향**: 구현 전 테스트 작성 우선, 커버리지 80% 목표
- **Lint-Zero**: 모든 린트 경고는 에러로 간주
- **150줄 룰**: 모든 소스 파일 150 LOC 이하 유지
- **Build Guard**: 커밋 전 `pre_commit.sh` 통과 필수
- **No Console**: 프로덕션 코드는 `Logger` 사용 (`console.log` 금지)

---

## 추가 문서
- [`docs/guides/LOCAL_DEV_MODE.md`](docs/guides/LOCAL_DEV_MODE.md) — 로컬 개발 모드 사용법
- [`docs/guides/DEPLOYMENT.md`](docs/guides/DEPLOYMENT.md) — 배포 절차
- [`docs/guides/DESIGN_GUIDE.md`](docs/guides/DESIGN_GUIDE.md) — UI/UX 가이드라인
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) — 환경 / 도구 버전
- [`docs/RULES.md`](docs/RULES.md) — 개발 룰
- [`CLAUDE.md`](CLAUDE.md) — AI 에이전트 작업 규칙
