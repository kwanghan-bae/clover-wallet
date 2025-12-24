# Session 0009: OCR Implementation & Image Recognition

## 📅 Date
2025-12-23

## 🎯 Goal
- **Phase 3**: 로또 용지 OCR 인식을 위한 카메라 연동 및 ML Kit 텍스트 추출 로직 구현.

## 📝 Activities
### 1. Library Installation
- `expo-camera`: 크로스 플랫폼 카메라 API.
- `@react-native-ml-kit/text-recognition`: Google ML Kit 기반 텍스트 인식.

### 2. OCR Utility
- `utils/ocr.ts`: 정규표현식(Regex)을 사용하여 인식된 텍스트에서 회차와 번호 6개를 추출하는 파서 구현.

### 3. Scan Screen Implementation
- `app/scan.tsx`: 카메라 미리보기, 스캔 가이드라인 오버레이, 촬영 버튼 및 결과 확인 모달 구현.

## 📈 Outcomes
- 카메라를 이용한 실물 로또 용지 인식 기능.
- 텍스트 데이터를 구조화된 로또 데이터로 변환하는 정교한 파서.

## ⏭️ Next Steps
- **Session 0010**: Push Notifications & Final Polish.
