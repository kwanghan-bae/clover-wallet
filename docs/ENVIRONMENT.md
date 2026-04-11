# Project Environment & Tooling: Clover Wallet

---

## 1. Core Stack Versions
- **Node.js**: 20+ (Backend & Frontend)
- **NestJS**: 11
- **Prisma**: 7
- **React Native (Expo)**: SDK 54
- **TypeScript**: 5.x (Backend & Frontend)

## 2. Infrastructure
- **Database**: PostgreSQL (Supabase)
- **Backend Server**: Docker on Render (싱가포르 리전)
- **Frontend Server**: Static hosting on Render
- **CI**: GitHub Actions (lint + test + build)

## 3. Tooling Constraints
- 모든 코드는 `pre_commit.sh` 빌드 가드를 통과해야 함.
- Expo Web Export 환경의 호환성을 항상 고려해야 함.
- 백엔드는 NestJS CLI 기반 빌드 (`nest build`).
- DB 스키마 변경은 Prisma 마이그레이션으로 관리.
