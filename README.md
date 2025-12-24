# 🍀 Clover Wallet (Monorepo) v1.1

**Clover Wallet**은 안정적인 Kotlin 백엔드와 프리미엄 React Native 프론트엔드를 결합한 통합 로또 관리 플랫폼입니다.

---

## 🏗 프로젝트 구조

-   **/backend**: Kotlin + Spring Boot (WebFlux/R2DBC) 기반의 고성능 비동기 API 서버
-   **/frontend**: React Native + Expo 기반의 프리미엄 미학을 지향하는 크로스 플랫폼 앱
-   **/docs**: ADR, 로드맵, 개발 가이드 등 시스템 전반의 명세 관리
-   **/scripts**: 빌드 가드 및 배포 자동화 스크립트

---

## 🚀 핵심 기술 스택

### Backend
- **Language**: Kotlin 1.9
- **Framework**: Spring Boot 3.2 (WebFlux)
- **Persistence**: Spring Data R2DBC + PostgreSQL (Supabase)
- **Stability**: JUnit5 + MockK (TDD 지향)

### Frontend
- **Framework**: React Native (Expo SDK 54)
- **Styling**: NativeWind (Tailwind CSS) + Glassmorphism
- **Stability**: Jest + Zod (Runtime Validation) + Global Error Boundary
- **Icons**: Lucide React Native (Clover Theme)

---

## ☁️ 인프라 및 배포
- **Hosting**: Render (Backend: Docker / Frontend: Static Web)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google SSO) + JWT Sync

---

## 🛡 품질 및 개발 규약
본 프로젝트는 **"인지적 무결성"**을 최우선으로 하며 다음 규칙을 하드웨어적으로 강제합니다.
1. **No Spec, No Code**: 모든 로직 변경 전 문서는 항상 최신화되어야 함.
2. **Lint-Zero Policy**: 모든 린트 경고는 에러로 간주하여 차단함.
3. **Build Guard**: 커밋 전 로컬에서 전체 빌드 및 테스트(`pre_commit.sh`) 통과 필수.

---

## 🏁 빠른 시작
```bash
# 전체 빌드 검증
./scripts/pre_commit.sh

# 백엔드 실행
cd backend && ./gradlew bootRun

# 프론트엔드 실행
cd frontend && npm start
```
