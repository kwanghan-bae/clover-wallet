# Session 0011: TDD & Quality Assurance (Jest Setup)

## 📅 Date
2025-12-23

## 🎯 Goal
- **Phase 4**: Jest 테스트 환경 구축 및 핵심 유틸리티(`lotto.ts`, `ocr.ts`) 단위 테스트 100% 달성.

## 📝 Activities
### 1. Test Environment Setup
- `jest`, `@testing-library/react-native`, `jest-expo` 설치.
- `package.json` 테스트 스크립트 추가.

### 2. Lotto Logic Testing
- `__tests__/lotto.test.ts`: 
    - 중복 없는 6개 숫자 생성 검증.
    - 숫자 범위(1-45) 검증.
    - 정렬 상태 검증.
    - 당첨 번호 비교 로직 검증.

### 3. OCR Parser Testing
- `__tests__/ocr.test.ts`:
    - 다양한 텍스트 노이즈 섞인 환경에서의 번호 추출 검증.
    - 회차 정보 추출 검증.

### 4. Component Testing
- `components/ui/__tests__/PrimaryButton.test.tsx`: 라벨 렌더링 및 클릭 이벤트 호출 검증.

## 📈 Outcomes
- "No Test, No Code" 원칙을 준수하는 견고한 코드베이스.
- 코드 변경 시 결함을 즉시 감지할 수 있는 안전망 확보.

## ⏭️ Next Steps
- **Session 0012**: Backend API Real-link & Error Handling.
