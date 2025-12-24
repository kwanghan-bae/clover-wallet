# Session 0005: Home Screen Logic & Lotto Generation

## 📅 Date
2025-12-23

## 🎯 Goal
- **Phase 2**: 로또 번호 생성 알고리즘 이식 및 홈 화면 UI 연동.

## 📝 Activities
### 1. Lotto Logic Implementation
- `utils/lotto.ts`: 중복 없는 6개 번호를 생성하고 정렬하는 `generateLottoNumbers` 함수 구현.

### 2. UI Components
- `components/ui/BallRow.tsx`: 6개의 공을 가로로 정렬하여 보여주는 재사용 가능한 컴포넌트 추가.

### 3. Home Screen Integration
- `app/(tabs)/index.tsx`: 상태 관리(`useState`)를 통해 생성된 번호를 화면에 반영.
- 버튼 클릭 시 번호가 순차적으로 나타나는 듯한 연출 준비.

## 📈 Outcomes
- 앱의 핵심 기능인 번호 생성기 작동.
- 사용자 인터랙션에 따른 동적 UI 변화 확인.

## ⏭️ Next Steps
- **Session 0006**: My Lotto History & Persistence (mmKV Integration).
