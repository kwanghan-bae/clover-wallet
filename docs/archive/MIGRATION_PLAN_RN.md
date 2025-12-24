# ⚛️ Clover Wallet: Flutter to React Native Migration Plan

## 1. 개요 (Executive Summary)
본 문서는 기존 **Flutter** 기반의 Clover Wallet 앱을 **React Native (Expo)** 환경으로 전환하기 위한 전략적 로드맵입니다. 단순한 포팅을 넘어, **TypeScript**의 안정성과 **React** 생태계의 풍부한 라이브러리를 활용하여 유지보수성을 극대화하는 것을 목표로 합니다.

---

## 2. 기술 스택 매핑 (Tech Stack Mapping)

| 구분 | Flutter (AS-IS) | React Native (TO-BE) | 선정 근거 |
| :--- | :--- | :--- | :--- |
| **언어** | Dart | **TypeScript** | 정적 타입 시스템 및 광범위한 생태계 |
| **프레임워크** | Flutter SDK | **Expo (SDK 50+)** | 파일 기반 라우팅, OTA 업데이트, 설정 간소화 |
| **상태 관리** | Provider | **Zustand** (Global) + **TanStack Query** (Server) | 보일러플레이트 최소화 및 서버 상태 분리 |
| **네비게이션** | GoRouter | **Expo Router** | 웹 표준 URL 기반 라우팅 및 딥링킹 용이성 |
| **스타일링** | Widget Props | **NativeWind (Tailwind CSS)** | 일관된 디자인 시스템 및 빠른 개발 속도 |
| **네트워크** | Http / Dio | **Ky** (or Axios) | 가볍고 모던한 HTTP 클라이언트 |
| **로컬 DB** | Shared Preferences | **mmKV** | 압도적인 읽기/쓰기 성능 |
| **테스트** | flutter_test | **Jest** + **RNTL** (React Native Testing Library) | 표준화된 JS/TS 테스트 도구 |

---

## 3. 마이그레이션 전략 (Phased Strategy)

### Phase 0: 기반 구축 (Foundation)
*   [x] **Repo Setup**: Expo + TypeScript + NativeWind 템플릿으로 프로젝트 초기화.
*   [ ] **CI/CD & Lint**: GitHub Actions 설정, ESLint/Prettier, **Husky (Pre-commit hook)** 설정.
*   [ ] **TDD 환경**: Jest 및 RNTL 설정 완료. 샘플 테스트 작성.

### Phase 1: 핵심 로직 및 디자인 시스템 (Core)
*   [x] **Design Token**: `tailwind.config.js`에 Clover Wallet 컬러 팔레트 및 폰트 정의.
*   [x] **Common Components**: 버튼, 카드, 인풋 등 기본 UI 컴포넌트 구현 (Storybook 활용 권장).
*   [x] **API Client**: 백엔드 통신을 위한 Ky 인스턴스 설정 및 인터셉터 구현.
*   [x] **Auth**: 로그인/회원가입 로직 및 JWT 핸들링 구현.

### Phase 2: 주요 기능 이식 (Feature Parity)
*   [x] **홈/번호생성**: 랜덤/알고리즘 번호 생성 로직 이식.
*   [x] **내 번호/기록**: mmKV를 이용한 로컬 저장소 로직 및 UI 구현.
*   [x] **커뮤니티**: 게시판 CRUD 및 무한 스크롤 구현 (FlashList 활용).
*   [x] **명당/지도**: `react-native-maps` 연동 및 마커 클러스터링.

### Phase 3: 고급 기능 및 최적화 (Advanced)
*   [x] **OCR 스캔**: `expo-camera` 및 ML Kit (`@react-native-ml-kit/text-recognition`) 연동.
*   [x] **Push Notification**: `expo-notifications` 설정 (FCM).
*   [x] **Performance**: 렌더링 최적화, 이미지 캐싱 (`expo-image`), 번들 사이즈 분석.

### Phase 4: TDD & Quality Assurance
*   [x] **Test Environment**: Jest, ts-jest, React Native Testing Library 설정.
*   [x] **Logic Tests**: 번호 생성 및 OCR 파싱 로직 단위 테스트 완료 (100% Pass).

---

## 4. TDD 전략 (Test Driven Migration)

**"테스트가 없으면 마이그레이션도 없다."**

*   **Business Logic**: 순수 함수(번호 생성 알고리즘, 데이터 가공 등)는 `Jest`로 **100% 커버리지**를 달성해야 합니다.
*   **Components**: 모든 공통 컴포넌트와 주요 화면은 `RNTL`을 사용하여 렌더링 및 인터랙션 테스트를 작성합니다.
*   **Hooks**: 커스텀 훅(useAuth, useLottoGen 등)은 `renderHook`을 사용하여 상태 변화를 검증합니다.
*   **Integration**: 주요 사용자 시나리오(로그인 -> 홈 -> 번호 생성)에 대한 통합 테스트를 작성합니다.

---

## 5. 리스크 관리 (Risk Management)

*   **OCR 성능**: Flutter의 ML Kit 래퍼와 RN 라이브러리 간 인식률 차이 비교 분석 필요.
*   **애니메이션**: Flutter의 부드러운 애니메이션을 `react-native-reanimated`로 재구현 시 러닝 커브 존재.
*   **복잡한 UI**: 글래스모피즘(Blur) 효과가 안드로이드 구형 기기에서 성능 저하를 일으킬 수 있으므로 최적화 필요.