# CLAUDE.md - Clover Wallet Agent Rules

## Project Structure

Clover Wallet은 모노레포 구조의 로또 관리 플랫폼입니다.

```
clover-wallet/
  apps/
    backend/      # NestJS 11 + Prisma 7 API 서버
    frontend/    # Expo 54 + React Native 0.81 앱
  docs/          # ADR, 로드맵, 기술 명세
  scripts/       # 빌드 가드 및 자동화
  packages/      # 공유 패키지
```

## File Rules

- **150줄 제한**: 모든 소스 파일은 150줄을 초과하면 안 됩니다. 초과 시 모듈 분리 필수.
- **파일 네이밍**: kebab-case (예: `lotto-spot.service.ts`)
- **새 파일 생성 시**: 반드시 기존 파일 편집 우선. 불필요한 파일 생성 금지.
- **문서 파일**: 명시적 요청 없이 README.md 또는 *.md 파일 생성 금지.

## Code Style

### Backend (NestJS/TypeScript)
- NestJS 모듈 구조: `module > controller > service > repository`
- Prisma ORM 사용, raw SQL 금지
- DTO는 class-validator 데코레이터로 검증
- 환경 변수는 반드시 `@nestjs/config` ConfigService 통해 접근

### Frontend (React Native/Expo)
- Atomic Design: `components/ui` > `components/features` > `app/pages`
- NativeWind (Tailwind CSS) 스타일링
- 서버 상태: React Query, 로컬 상태: MMKV
- Zod로 API 응답 런타임 검증

## Testing Requirements

- **TDD 지향**: 구현 전 테스트 작성 우선
- **커버리지 목표**: 80% 이상
- **Backend**: Jest + Supertest (e2e)
- **Frontend**: Jest + React Native Testing Library
- **E2E**: Maestro (핵심 플로우)
- 테스트 실행: `cd apps/backend && npm test` / `cd apps/frontend && npm test`

## Build & Deploy

- **Backend**: Render (Docker, 싱가포르 리전)
  - 빌드: `npm install && npx prisma generate && npm run build`
  - 실행: `npm run start:prod`
- **Frontend**: Render (Static Web)
  - 빌드: `npx expo export --platform web`
- **DB**: Supabase PostgreSQL
- **Auth**: Supabase Auth (Google SSO) + JWT

## Local Development Mode

`npm run dev:local`로 백엔드 + 프론트 동시 실행 (OAuth 우회).

- **시드 dev 유저**: `dev1@local.test` ~ `dev3@local.test` (실 Supabase Postgres에 멱등 upsert)
- **자동 로그인**: `EXPO_PUBLIC_DEV_USER_EMAIL`로 지정된 유저로 부팅 시 자동
- **유저 전환**: `apps/frontend/.env`의 `EXPO_PUBLIC_DEV_USER_EMAIL` 변경 후 재시작
- **종료**: Ctrl-C 한 번 → 백엔드 + 프론트 + 가비지 모두 정리

옵션:
- `npm run dev:local -- --no-seed`: 시드 스킵 (재시작 빠르게)
- `npm run dev:local -- --remote-backend`: 로컬 백엔드 미기동, Render API 사용
- `npm run dev:local -- --help`: 사용법

자세한 사양: `docs/superpowers/specs/2026-05-09-local-dev-mode-design.md`

⚠️ **prod 사고 방지**: `EXPO_PUBLIC_DEV_AUTH_BYPASS`와 `DEV_AUTH_ENABLED`는 절대 prod 환경에 등록 금지. 4중 게이팅(NODE_ENV / DEV_AUTH_ENABLED / __DEV__ / pre-commit advisory)으로 다층 방어.

## Don'ts

- Kotlin, Spring Boot, Gradle 관련 코드 또는 참조 추가 금지 (이전 백엔드, 마이그레이션 완료됨)
- `any` 타입 사용 금지 (TypeScript strict mode)
- 하드코딩된 API URL 금지 (환경 변수 사용)
- `console.log` 프로덕션 코드에 남기기 금지 (Logger 사용)
- 테스트 없는 비즈니스 로직 커밋 금지
- `.env`, 인증키, 시크릿 파일 커밋 금지
