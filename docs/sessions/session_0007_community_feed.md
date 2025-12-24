# Session 0007: Community Feed & FlashList Integration

## 📅 Date
2025-12-23

## 🎯 Goal
- **Phase 2**: 커뮤니티 게시물 피드 UI 구현 및 고성능 리스트(`FlashList`) 도입.

## 📝 Activities
### 1. Library Installation
- `@shopify/flash-list`: Shopify에서 만든 React Native용 고성능 리스트 컴포넌트.

### 2. API Integration (Community)
- `api/community.ts`: `getPosts`, `createPost` 함수 구현.
- `api/types/community.ts`: `Post` 인터페이스 정의.

### 3. Community UI Implementation
- `app/(tabs)/community.tsx`: `FlashList`를 사용하여 백엔드 데이터를 연동한 피드 구현.
- `components/ui/PostCard.tsx`: 피드 개별 카드 컴포넌트 추가.
- `app/create-post.tsx`: 게시물 작성 모달 또는 화면 구현.

## 📈 Outcomes
- 대량의 게시물도 부드럽게 스크롤되는 커뮤니티 인터페이스.
- 백엔드와 연동된 실시간 데이터 로드.

## ⏭️ Next Steps
- **Session 0008**: Lucky Spot Map Integration (react-native-maps).
