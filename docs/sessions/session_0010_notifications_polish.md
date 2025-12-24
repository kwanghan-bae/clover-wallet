# Session 0010: Push Notifications & App Polish

## 📅 Date
2025-12-23

## 🎯 Goal
- **Phase 3**: 푸시 알림(`expo-notifications`) 연동 기반 마련 및 UI 애니메이션(Reanimated) 강화.

## 📝 Activities
### 1. Push Notification Setup
- `expo-notifications`, `expo-device`, `expo-constants` 설치.
- `utils/notifications.ts`: FCM 토큰 획득 및 알림 핸들러 구현.

### 2. UI Polish (Reanimated)
- `components/ui/PrimaryButton.tsx`: 터치 시 스케일 애니메이션 추가.
- `components/ui/GlassCard.tsx`: 등장 시 페이드인 애니메이션 추가.
- `app/(tabs)/index.tsx`: 번호 생성 시 공들이 하나씩 튀어나오는 애니메이션 구현.

### 3. TDD Checklist Check
- 핵심 유틸리티(`lotto.ts`, `ocr.ts`)에 대한 테스트 코드 작성을 위한 기반 마련.

## 📈 Outcomes
- 사용자 참여를 유도할 수 있는 알림 인프라.
- React Native 특유의 부드러움을 재현한 고품질 RN UI.

## ⏭️ Next Steps
- **Session 0011**: TDD & Quality Assurance (Jest Setup).
