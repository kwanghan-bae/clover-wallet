# Session 0004: Auth Flow & Local Storage (mmKV)

## 📅 Date
2025-12-23

## 🎯 Goal
- **Phase 1 (Final)**: 사용자 인증(로그인) UI 구현 및 `react-native-mmkv` 기반 로컬 저장소 구축.

## 📝 Activities
### 1. Library Installation
- `react-native-mmkv`: 고성능 로컬 키-밸류 저장소.

### 2. Local Storage Setup
- `utils/storage.ts`: mmKV 인스턴스 초기화 및 범용 헬퍼 함수 (`save`, `load`, `remove`) 구현.

### 3. Authentication UI
- `app/login.tsx`: 디자인 가이드 기반의 프리미엄 로그인 화면 구현 (NativeWind).
- `components/ui/Input.tsx`: 공통 입력 필드 컴포넌트 추가.

### 4. API Integration (Auth)
- `api/auth.ts`: 로그인/회원가입 요청 함수 작성.

## 📈 Outcomes
- 토큰 및 사용자 설정을 영구 저장할 수 있는 기반 마련.
- 완성도 높은 로그인 진입점 확보.

## ⏭️ Next Steps
- **Session 0005**: Home Screen Logic & Lotto Generation.
