# 📘 CLOVER WALLET — 캐노니컬 카탈로그 스펙

**Document Role**
이 문서는 **Clover Wallet(Lotto 통합 앱)이 무엇인지, 왜 존재하는지, 무엇을 제공하는지**를 정의하는 **최상위 기준 스펙 문서**입니다.

---

## 1. 시스템 정체성 (System Identity)

### 1.1 Clover Wallet이란?
**Clover Wallet은 안정적인 지갑 관리 기능을 기반으로 로또 경험을 혁신하는 통합 로또 관리 플랫폼입니다.**
번호 추첨, 당첨 확인, 명당 탐색, 커뮤니티 소통을 하나의 앱에서 제공하여 사용자에게 행운과 즐거움을 전달합니다.

### 1.2 핵심 철학 (Core Philosophy)
*   **Trust & Hope**: 신뢰할 수 있는 데이터와 희망적인 사용자 경험 제공.
*   **Intuitive**: 복잡한 당첨 확인 절차를 OCR과 자동 알림으로 단순화.
*   **Community-Driven**: 실제 구매 인증 기반의 신뢰도 높은 커뮤니티 형성.
*   **Value Expansion**: 단순 로또 구매를 넘어 명당 여행 등 새로운 가치 제안.

---

## 2. 핵심 기능 카탈로그 (Core Features)

### 2.1 로또 번호 관리
*   **다중 알고리즘 추첨**: 랜덤, 통계 기반, 미신 기반 등 다양한 번호 생성.
*   **수동 입력 및 조합 관리**: 사용자 선호 번호의 영속적 관리.

### 2.2 스마트 관리 시스템
*   **OCR 티켓 스캔**: 카메라를 통한 로또 용지 자동 인식 및 저장 (ML Kit).
*   **자동 당첨 고지**: 추첨 후 스크래핑을 통한 자동 당첨 확인 및 푸시 알림.

### 2.3 명당 및 여행 (Lotto Spot & Travel)
*   **명당 탐색**: 전국 1등 배출점 지도 기반 검색 및 정보 제공.
*   **여행 플랜 추천**: 명당과 주변 관광지, 맛집을 연계한 맞춤형 코스 제안.

### 2.4 커뮤니티 및 인증
*   **뱃지 시스템**: 구매/당첨 내역 기반의 신뢰도 등급 부여.
*   **자유 게시판**: 정보 공유 및 당첨 후기 소통.

---

## 3. 기술 스택 및 아키텍처 요약

*   **Frontend**: React Native (TypeScript) - Premium Aesthetics & Glassmorphism.
*   **Backend**: Kotlin with Spring Boot - Multi-module Architecture.
*   **Database**: PostgreSQL (Production) / H2 (Dev).
*   **Infrastructure**: Render (Server), Supabase (DB), Firebase (FCM/Auth).

---

## 4. 참조 문서
*   `docs/TECHNICAL_SPEC.md`: 구체적 기술 명세
*   `docs/RULES.md`: 프로젝트 하드 규칙
*   `docs/WORKFLOW.md`: 개발 워크플로우
*   `docs/ROADMAP.md`: 개발 로드맵 및 현황
