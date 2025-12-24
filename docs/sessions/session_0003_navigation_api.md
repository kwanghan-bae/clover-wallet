# Session 0003: Navigation & API Client Setup

## 📅 Date
2025-12-23

## 🎯 Goal
- **Phase 1 (Final) & Phase 2 (Start)**: Expo Router 하단 탭 구조 구축 및 `ky` 기반 API 클라이언트 설정.

## 📝 Activities
### 1. Library Installation
- `ky`: 모던 HTTP 클라이언트.
- `lucide-react-native`: 아이콘 라이브러리.
- `expo-router` 의존성 확인.

### 2. Navigation Structure (Expo Router)
- `app/_layout.tsx`: Root 레이아웃 설정.
- `app/(tabs)/_layout.tsx`: 하단 탭 (Home, History, Map, Community) 구성.
- 각 탭별 엔트리 포인트 생성 (`index.tsx`, `history.tsx`, `map.tsx`, `community.tsx`).

### 3. API Client Implementation
- `api/client.ts`: `ky` 인스턴스 생성 및 공통 인터셉터(JWT 준비) 설정.

## 📈 Outcomes
- 하단 네비게이션이 작동하는 앱 골격.
- 중앙 집중식 API 통신 모듈.

## ⏭️ Next Steps
- **Session 0004**: Auth Logic & Login Screen Implementation.
