# Phase 4: 출시 전 마지막 개선 설계서

## 개요

Phase 1-3 구현 + 코드 리뷰 수정 완료 후, 출시 전 마지막 개선 라운드.
A(리뷰 보류) + B(UX 완성도) 병렬 진행 → C(테스트/품질) 순서.

### 제약 조건
- 무료 인프라 유지
- 모바일 우선, 웹 테스트용 유지
- 퀄리티 중심, 기한 없음

---

## Phase 4-1: 리뷰 보류 + UX 완성도 (병렬)

### A. 리뷰 보류 항목

**A-1. 다크모드 나머지 화면 (7개 일괄)**
- 대상: scan.tsx, login.tsx, statistics.tsx, notifications.tsx, spot/[id].tsx, number-generation.tsx, create-post.tsx
- 각 화면에 dark:bg-dark-bg, dark:bg-dark-surface, dark:text-dark-text, dark:text-dark-text-secondary 추가
- 패턴이 동일하므로 한 Task로 일괄 처리

**A-2. GlassCard props 타입 정리**
- GlassCardProps 인터페이스가 실제 파라미터(opacity, blur, borderRadius)와 불일치
- 인터페이스를 실제 구현에 맞게 수정

**A-3. 오프라인 캐시 영속화**
- @tanstack/react-query-persist-client 설치
- MMKV 기반 persister 생성
- _layout.tsx에서 QueryClientProvider → PersistQueryClientProvider 교체
- staleTime, gcTime 설정으로 오프라인 시 캐시된 데이터 유지

**A-4. History 화면 데이터 중복 제거**
- 백엔드 티켓과 로컬 레코드를 round + numbers 조합으로 dedup
- 백엔드 데이터 우선, 로컬 레코드는 백엔드에 없는 것만 표시

**A-5. victory-native 미사용 의존성 제거**
- npm uninstall victory-native
- 통계 화면은 이미 View 기반 바 차트 사용 중

### B. UX 완성도

**B-1. 마이페이지 실제 프로필 연동**
- useAuth의 user + usersApi.getMe()로 실제 닉네임, 이메일, 뱃지 표시
- usersApi.getMyStats()로 총 당첨금, 수익률 실 데이터
- 하드코딩된 "클로버님", MOCK_BADGES, 고정 통계 수치 제거

**B-2. 대댓글 UI 프론트엔드 구현**
- 댓글 목록에서 replies 배열을 들여쓰기하여 렌더링
- 각 댓글에 "답글" 버튼 → 클릭 시 parentId 포함하여 createComment 호출
- 답글 입력 UI: 기존 댓글 입력 필드 재사용, "@ 원댓글작성자" 프리픽스

**B-3. 게시글 삭제 UI**
- PostCard에 본인 게시글일 때만 삭제 아이콘(Trash2) 표시
- 클릭 시 Alert.alert 확인 → communityApi.deletePost(id) → 쿼리 무효화
- useAuth의 user.id와 post.userSummary.id 비교로 소유권 판단

**B-4. 유저 프로필 화면 신규**
- 새 화면: frontend/app/user/[id].tsx
- 상단: 아바타 + 닉네임 + 팔로워/팔로잉 수
- 팔로우/언팔로우 버튼 (토글)
- 하단: 해당 유저 게시글 FlatList (communityApi.getUserPosts)
- PostCard 아바타 클릭, 커뮤니티 댓글 닉네임 클릭 등에서 진입

**B-5. 커뮤니티 전체/팔로잉 탭**
- community.tsx 상단에 세그먼트 컨트롤 ("전체" / "팔로잉")
- 전체: 기존 communityApi.getPosts()
- 팔로잉: communityApi.getFeed() (새 API 메서드 추가)
- 각 탭별 별도 queryKey로 독립 캐싱

---

## Phase 4-2: 테스트 & 품질

### C-1. E2E 테스트 (Maestro)
- Maestro 채택: YAML 기반, 설정 간단, 크로스 플랫폼
- 핵심 플로우 3개:
  1. 로그인 → 홈 화면 진입
  2. 번호 생성 → 저장 확인
  3. 커뮤니티 게시글 작성 → 목록 반영
- .maestro/ 디렉토리에 플로우 파일 저장

### C-2. 성능 최적화
- npx expo-doctor로 의존성 이슈 스캔
- 번들 분석: expo export --dump-sourcemap → source-map-explorer
- React.memo 적용: PostCard, HistoryItem, SpotListItem (리스트 아이템 리렌더 방지)
- Google 로고 외부 URL → 로컬 에셋 번들 (오프라인 대응)

### C-3. 접근성
- 주요 인터랙티브 요소에 accessibilityLabel 추가 (버튼, 탭, 입력 필드)
- accessibilityRole 설정 (button, tab, header, image 등)
- 색상 대비: primary #4CAF50 on white는 WCAG AA 미달(3.5:1) → 텍스트용 primary를 #388E3C(4.5:1+)로 변경
- 터치 타깃 최소 44x44pt 확인

---

## 의존성 및 순서

```
Phase 4-1: A(1-5) ∥ B(1-5) → Phase 4-2: C(1-3)
```

- A와 B는 완전 병렬 (파일 충돌 없음)
- C는 A+B 완료 후 진행 (화면이 안정된 상태에서 E2E/성능/접근성 작업)

## 기술 선택 요약

| 영역 | 선택 | 이유 |
|------|------|------|
| 오프라인 캐시 | react-query-persist-client + MMKV | 기존 스택 자연 통합 |
| E2E 테스트 | Maestro | YAML 기반, 설정 간단, 무료 |
| 번들 분석 | source-map-explorer | Expo 호환, 표준 도구 |
| 접근성 대비 | #388E3C (primary text) | WCAG AA 4.5:1 충족 |
