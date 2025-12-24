# Session 0012: Performance & Final Polish

## 📅 Date
2025-12-23

## 🎯 Goal
- **Phase 5**: `expo-image` 도입 및 `app.json` 설정을 통한 배포 준비 완료.

## 📝 Activities
### 1. High Performance Image
- `expo-image` 설치 및 설정.
- `PostCard` 등 주요 컴포넌트의 이미지 렌더링 최적화.

### 2. App Configuration
- `app.json`:
    - `bundleIdentifier` / `package` 설정.
    - `splash`, `icon`, `adaptiveIcon` 경로 확인.
    - `plugins` (Camera, Notifications) 설정 검증.

### 3. API Client Hardening
- `api/client.ts`: 네트워크 불안정 시 자동 재시도(`retry`) 로직 추가.

## 📈 Outcomes
- 빠르고 부드러운 이미지 로딩 경험.
- 스토어 배포가 가능한 수준의 앱 메타데이터 설정.

## ⏭️ Next Steps
- **Session 0013**: Project Wrap-up & Archive.
