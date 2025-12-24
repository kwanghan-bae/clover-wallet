# 📝 AI Thinking Scratchpad - Community UI Data Binding

## [Current Goal]: 변경된 Post 데이터 모델에 맞춰 커뮤니티 피드 UI 수정 및 정상 렌더링 확보

### 1. 설계 고려 사항
- **Title 제거**: 백엔드 DTO에 `title`이 없으므로, UI에서 제목 영역을 제거하고 본문(`content`) 위주의 피드 레이아웃으로 변경.
- **User 정보 바인딩**: `authorNickname` 대신 `user.nickname` 객체 참조로 변경.
- **포맷팅**: `createdAt` 문자열을 사용자 친화적인 날짜 형식으로 변환하는 로직 점검.

### 2. 수정 대상 파일
- `frontend/app/(tabs)/community.tsx`: 전체 리스트 로직.
- `frontend/components/ui/PostCard.tsx`: 개별 게시글 카드 컴포넌트.

### 3. 작업 순서
- **Step 1**: `PostCard.tsx` 분석 및 필드 참조 수정 (title 제거, user.nickname 적용).
- **Step 2**: `community.tsx` 내의 더미 데이터나 상태 처리 로직 업데이트.
- **Step 3**: 자율 검증 및 커밋.