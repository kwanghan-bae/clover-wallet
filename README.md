# Clover Wallet (Monorepo) v2.0

**Clover Wallet**은 NestJS 백엔드와 프리미엄 React Native 프론트엔드를 결합한 통합 로또 관리 플랫폼입니다.

---

## 프로젝트 구조

-   **/backend-node**: NestJS 11 + Prisma 7 기반 API 서버
-   **/frontend**: React Native + Expo 54 기반 크로스 플랫폼 앱
-   **/docs**: ADR, 로드맵, 개발 가이드 등 시스템 전반의 명세 관리
-   **/scripts**: 빌드 가드 및 배포 자동화 스크립트

---

## 핵심 기술 스택

### Backend
- **Runtime**: Node.js 20+
- **Framework**: NestJS 11
- **ORM**: Prisma 7 + PostgreSQL (Supabase)
- **Testing**: Jest (~192 tests)

### Frontend
- **Framework**: React Native (Expo SDK 54)
- **Styling**: NativeWind (Tailwind CSS) + Glassmorphism
- **Stability**: Jest + Zod (Runtime Validation) + Global Error Boundary
- **Icons**: Lucide React Native (Clover Theme)

---

## 인프라 및 배포
- **Hosting**: Render (싱가포르 리전)
  - **Backend**: [API Server](https://clover-wallet-api.onrender.com) (Docker)
  - **Frontend**: [Web App](https://clover-wallet-web.onrender.com/) (Static Web)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google SSO) + JWT Sync
- **CI**: GitHub Actions (lint + test + build)

---

## 품질 및 개발 규약
1. **No Spec, No Code**: 모든 로직 변경 전 문서는 항상 최신화되어야 함.
2. **Lint-Zero Policy**: 모든 린트 경고는 에러로 간주하여 차단함.
3. **Build Guard**: 커밋 전 로컬에서 전체 빌드 및 테스트(`pre_commit.sh`) 통과 필수.
4. **TDD 지향**: 구현 전 테스트 작성 우선, 커버리지 80% 목표.

---

## 빠른 시작
```bash
# 전체 빌드 검증
./scripts/pre_commit.sh

# 백엔드 실행
cd backend-node && npm run start:dev

# 프론트엔드 실행
cd frontend && npm start
```
