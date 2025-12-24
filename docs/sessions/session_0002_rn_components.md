# Session 0002: Common UI Components Implementation

## 📅 Date
2025-12-23

## 🎯 Goal
- **Phase 1 (Continued)**: 앱 전반에서 재사용될 핵심 UI 컴포넌트(`GlassCard`, `PrimaryButton`, `LottoBall`)를 구현하고 검증한다.

## 📝 Activities
### 1. Library Installation
- `expo-blur`: Glassmorphism 효과 (Android/iOS).
- `expo-linear-gradient`: 버튼 및 배경 그라데이션.
- `clsx`, `tailwind-merge`: 조건부 스타일링 유틸리티.

### 2. Component Development
- **`GlassCard`**: `BlurView`를 래핑하여 반투명한 유리 질감 컨테이너 구현. Android 호환성 고려 (투명도 조절).
- **`PrimaryButton`**: `LinearGradient`를 활용한 Clover Green 그라데이션 버튼. 터치 시 `activeOpacity` 반응.
- **`LottoBall`**: 로또 번호(1~45)에 따라 `DESIGN_GUIDE.md`의 색상 규칙을 자동 적용하는 원형 컴포넌트.

### 3. Verification (Showcase)
- `app/index.tsx` (또는 `App.tsx`)를 수정하여 구현된 컴포넌트들을 한 화면에 띄워 시각적 정합성을 확인.

## 📈 Outcomes
- `backend-rn/components/ui/GlassCard.tsx`
- `backend-rn/components/ui/PrimaryButton.tsx`
- `backend-rn/components/ui/LottoBall.tsx`

## ⏭️ Next Steps
- **Session 0003**: Navigation Structure & Screen Scaffolding (Expo Router).
