# Phase 4-1: 리뷰 보류 + UX 완성도 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 코드 리뷰 보류 항목 정리 + UX 미완성 기능을 출시 수준으로 완성

**Architecture:** A(기술 정리)와 B(UX)를 병렬 진행. A는 기존 파일의 수정/정리, B는 새 화면 추가 + 기존 화면 연동. 파일 충돌 없는 구조.

**Tech Stack:** NativeWind dark mode, React Query, @tanstack/react-query-persist-client, MMKV, NestJS, Prisma

---

## File Structure

### A: 리뷰 보류 항목
| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/app/scan.tsx` | Modify | dark: 클래스 추가 |
| `frontend/app/login.tsx` | Modify | dark: 클래스 추가 |
| `frontend/app/notifications.tsx` | Modify | dark: 클래스 추가 |
| `frontend/app/spot/[id].tsx` | Modify | dark: 클래스 추가 |
| `frontend/app/number-generation.tsx` | Modify | dark: 클래스 추가 |
| `frontend/app/create-post.tsx` | Modify | dark: 클래스 추가 |
| `frontend/components/ui/GlassCard.tsx` | Modify | props 인터페이스 수정 |
| `frontend/app/_layout.tsx` | Modify | PersistQueryClientProvider |
| `frontend/app/(tabs)/history.tsx` | Modify | 데이터 중복 제거 |

### B: UX 완성도
| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/app/(tabs)/mypage.tsx` | Modify | 실제 프로필 연동 |
| `frontend/app/(tabs)/community.tsx` | Modify | 전체/팔로잉 탭 |
| `frontend/api/community.ts` | Modify | getFeed 추가 |
| `frontend/app/user/[id].tsx` | Create | 유저 프로필 화면 |
| `frontend/api/users.ts` | Modify | follow API 추가 |
| `frontend/components/ui/PostCard.tsx` | Modify | 삭제 버튼 + 유저 클릭 |
| `frontend/components/ui/CommentItem.tsx` | Create | 댓글 + 대댓글 컴포넌트 |

---

## Task 1: 다크모드 나머지 화면 일괄 적용 (6개)

**Files:**
- Modify: `frontend/app/scan.tsx`
- Modify: `frontend/app/login.tsx`
- Modify: `frontend/app/notifications.tsx`
- Modify: `frontend/app/spot/[id].tsx`
- Modify: `frontend/app/number-generation.tsx`
- Modify: `frontend/app/create-post.tsx`

- [ ] **Step 1: Read all 6 files**

Read each file to identify elements needing dark: variants.

- [ ] **Step 2: Apply dark: classes to notifications.tsx**

Key changes:
```
bg-background → bg-background dark:bg-dark-bg
bg-white → bg-white dark:bg-dark-surface
bg-green-50 → bg-green-50 dark:bg-green-900/20
text-text-dark → text-text-dark dark:text-dark-text
text-text-grey → text-text-grey dark:text-dark-text-secondary
```

- [ ] **Step 3: Apply dark: classes to spot/[id].tsx**

```
bg-[#F5F7FA] → bg-[#F5F7FA] dark:bg-dark-bg
bg-white → bg-white dark:bg-dark-surface
text-text-dark → text-text-dark dark:text-dark-text
text-text-grey → text-text-grey dark:text-dark-text-secondary
```

- [ ] **Step 4: Apply dark: classes to number-generation.tsx**

Same pattern — container bg, card bg, text colors.

- [ ] **Step 5: Apply dark: classes to create-post.tsx**

Same pattern — container bg, input bg, text colors.

- [ ] **Step 6: Apply dark: classes to scan.tsx**

Scan uses dark camera background already. Add dark: to:
- Mode toggle buttons (`bg-gray-200` → `bg-gray-200 dark:bg-dark-card`)
- Result overlay area
- Text elements

- [ ] **Step 7: Apply dark: classes to login.tsx**

Login uses gradient background. Add dark: to:
- GlassCard content text
- "또는" divider text
- Bottom link text

- [ ] **Step 8: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add frontend/app/scan.tsx frontend/app/login.tsx frontend/app/notifications.tsx frontend/app/spot/\[id\].tsx frontend/app/number-generation.tsx frontend/app/create-post.tsx
git commit -m "fix(frontend): 다크모드 나머지 6개 화면 적용 (scan, login, notifications, spot, number-gen, create-post)"
```

---

## Task 2: GlassCard props 타입 정리

**Files:**
- Modify: `frontend/components/ui/GlassCard.tsx`

- [ ] **Step 1: Read GlassCard.tsx**

- [ ] **Step 2: Fix GlassCardProps interface**

Current interface has `intensity` and `delay` but actual params use `opacity`, `blur`, `borderRadius`. Replace:

```typescript
interface GlassCardProps extends ViewProps {
  opacity?: number;
  blur?: number;
  borderRadius?: number;
  className?: string;
  children: React.ReactNode;
}
```

- [ ] **Step 3: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/components/ui/GlassCard.tsx
git commit -m "fix(frontend): GlassCard props 인터페이스를 실제 파라미터와 일치시킴"
```

---

## Task 3: 오프라인 캐시 영속화

**Files:**
- Modify: `frontend/app/_layout.tsx`

- [ ] **Step 1: Install dependency**

```bash
cd frontend && npm install @tanstack/react-query-persist-client
```

- [ ] **Step 2: Read _layout.tsx**

- [ ] **Step 3: Add MMKV persister and replace provider**

```typescript
// ADD imports at top:
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { MMKV } from 'react-native-mmkv';

// CREATE persister outside component:
const queryStorage = new MMKV({ id: 'query-cache' });
const persister = {
  persistClient: (client: unknown) => {
    queryStorage.set('react-query-cache', JSON.stringify(client));
  },
  restoreClient: () => {
    const cache = queryStorage.getString('react-query-cache');
    return cache ? JSON.parse(cache) : undefined;
  },
  removeClient: () => {
    queryStorage.delete('react-query-cache');
  },
};

// UPDATE queryClient to include gcTime:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: 1000 * 60 * 60 * 24 }, // 24 hours
  },
});

// REPLACE <QueryClientProvider> with:
// <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
//   ...children...
// </PersistQueryClientProvider>
```

Note: If `@tanstack/react-query-persist-client` has compatibility issues with the current React Query version, implement a simpler approach using the `onSuccess` callback pattern with MMKV directly.

- [ ] **Step 4: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/app/_layout.tsx frontend/package.json frontend/package-lock.json
git commit -m "feat(frontend): 오프라인 캐시 영속화 (react-query-persist-client + MMKV)"
```

---

## Task 4: History 데이터 중복 제거

**Files:**
- Modify: `frontend/app/(tabs)/history.tsx`

- [ ] **Step 1: Read history.tsx**

- [ ] **Step 2: Add deduplication logic**

```typescript
// REPLACE naive concatenation with dedup:
const combinedHistory = useMemo(() => {
  const backendSet = new Set(
    backendRecords.map((r) => `${r.round}-${r.numbers.sort().join(',')}`),
  );
  const uniqueLocal = history.filter(
    (r) => !backendSet.has(`${r.round}-${r.numbers.sort().join(',')}`),
  );
  return [...backendRecords, ...uniqueLocal];
}, [backendRecords, history]);
```

- [ ] **Step 3: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/app/\(tabs\)/history.tsx
git commit -m "fix(frontend): History 화면 백엔드+로컬 데이터 중복 제거"
```

---

## Task 5: victory-native 미사용 의존성 제거

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Check if victory-native is installed**

```bash
cd frontend && cat package.json | grep victory
```

If not found, skip this task entirely.

- [ ] **Step 2: If found, uninstall**

```bash
cd frontend && npm uninstall victory-native
```

- [ ] **Step 3: Run tests**

```bash
cd frontend && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 4: Commit (if changes were made)**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore(frontend): victory-native 미사용 의존성 제거"
```

---

## Task 6: 마이페이지 실제 프로필 연동

**Files:**
- Modify: `frontend/app/(tabs)/mypage.tsx`
- Modify: `frontend/api/users.ts`

- [ ] **Step 1: Read mypage.tsx and api/users.ts**

- [ ] **Step 2: Add getUserBadges helper to users API if needed**

Read existing `usersApi` in `frontend/api/users.ts`. It should already have `getMe()` and `getMyStats()`. Verify.

- [ ] **Step 3: Replace hardcoded data in mypage.tsx**

```typescript
// REMOVE hardcoded user object and MOCK_BADGES

// ADD imports:
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api/users';

// Inside component:
const { user, logout } = useAuth();
const { data: stats } = useQuery({
  queryKey: ['myStats'],
  queryFn: () => usersApi.getMyStats(),
  enabled: !!user,
});

// REPLACE hardcoded display:
// Name: user?.nickname ?? user?.email?.split('@')[0] ?? '사용자'
// Email: user?.email ?? ''
// Total winnings: stats?.totalWinnings?.toLocaleString('ko-KR') + '원' ?? '-'
// ROI: stats?.roi ? `${stats.roi > 0 ? '+' : ''}${stats.roi.toFixed(1)}%` : '-'

// REPLACE MOCK_BADGES with actual badges from profile:
// Parse user badges from backend (comma-separated string) into display array
```

- [ ] **Step 4: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/app/\(tabs\)/mypage.tsx frontend/api/users.ts
git commit -m "feat(frontend): 마이페이지 실제 유저 프로필 및 통계 연동 (하드코딩 제거)"
```

---

## Task 7: 대댓글 UI 컴포넌트

**Files:**
- Create: `frontend/components/ui/CommentItem.tsx`

- [ ] **Step 1: Create CommentItem component**

```typescript
// frontend/components/ui/CommentItem.tsx
import { View, Text, Pressable } from 'react-native';
import { Reply, User } from 'lucide-react-native';

interface CommentData {
  id: number;
  content: string;
  likes: number;
  createdAt: string;
  user?: { id: number; ssoQualifier: string };
  replies?: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  isReply?: boolean;
  onReply: (parentId: number) => void;
  onUserPress: (userId: number) => void;
}

export function CommentItem({ comment, isReply = false, onReply, onUserPress }: CommentItemProps) {
  const nickname = comment.user?.ssoQualifier?.split('@')[0] ?? '익명';
  const date = new Date(comment.createdAt).toLocaleDateString('ko-KR');

  return (
    <View className={`${isReply ? 'ml-8 border-l-2 border-gray-200 dark:border-dark-card pl-3' : ''} mb-3`}>
      <View className="flex-row items-center gap-2 mb-1">
        <Pressable onPress={() => comment.user && onUserPress(comment.user.id)}>
          <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
            <Text className="text-white text-xs font-bold">{nickname[0]}</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => comment.user && onUserPress(comment.user.id)}>
          <Text className="text-sm font-bold text-text-dark dark:text-dark-text">{nickname}</Text>
        </Pressable>
        <Text className="text-xs text-text-grey dark:text-dark-text-secondary">{date}</Text>
      </View>
      <Text className="text-sm text-text-dark dark:text-dark-text ml-8">{comment.content}</Text>
      {!isReply && (
        <Pressable onPress={() => onReply(comment.id)} className="flex-row items-center gap-1 ml-8 mt-1">
          <Reply size={14} color="#757575" />
          <Text className="text-xs text-text-grey dark:text-dark-text-secondary">답글</Text>
        </Pressable>
      )}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id.toString()}
          comment={reply}
          isReply={true}
          onReply={onReply}
          onUserPress={onUserPress}
        />
      ))}
    </View>
  );
}
```

- [ ] **Step 2: Run lint**

```bash
cd frontend && npm run lint
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/components/ui/CommentItem.tsx
git commit -m "feat(frontend): CommentItem 대댓글 컴포넌트 구현 (들여쓰기 + 답글 버튼)"
```

---

## Task 8: 게시글 삭제 UI + 유저 프로필 링크

**Files:**
- Modify: `frontend/components/ui/PostCard.tsx`

- [ ] **Step 1: Read PostCard.tsx**

- [ ] **Step 2: Add delete button and user navigation**

```typescript
// ADD imports:
import { Trash2 } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { communityApi } from '../../api/community';
import { useQueryClient } from '@tanstack/react-query';

// Inside PostCard component:
const { user: currentUser } = useAuth();
const router = useRouter();
const queryClient = useQueryClient();

const isOwner = currentUser?.id === post.userSummary?.id;

const handleDelete = () => {
  Alert.alert('게시글 삭제', '정말 삭제하시겠습니까?', [
    { text: '취소', style: 'cancel' },
    {
      text: '삭제',
      style: 'destructive',
      onPress: async () => {
        await communityApi.deletePost(post.id);
        queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      },
    },
  ]);
};

const handleUserPress = () => {
  router.push(`/user/${post.userSummary.id}`);
};

// ADD to avatar/nickname area: onPress={handleUserPress}
// ADD delete icon (conditionally): 
// {isOwner && <Pressable onPress={handleDelete}><Trash2 size={16} color="#E53935" /></Pressable>}
```

- [ ] **Step 3: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/components/ui/PostCard.tsx
git commit -m "feat(frontend): 게시글 삭제 UI + 유저 프로필 네비게이션"
```

---

## Task 9: 유저 프로필 화면

**Files:**
- Create: `frontend/app/user/[id].tsx`
- Modify: `frontend/api/users.ts`

- [ ] **Step 1: Add follow API methods to users.ts**

```typescript
// ADD to frontend/api/users.ts:
export const usersApi = {
  // ... existing methods ...
  
  toggleFollow: (userId: number) =>
    apiClient.post(`users/${userId}/follow`).json<{ following: boolean }>(),

  getFollowCounts: (userId: number) =>
    apiClient.get(`users/${userId}/follow-counts`).json<{ followers: number; following: number }>(),

  getUserPosts: (userId: number, page = 0, size = 10) =>
    apiClient.get(`community/users/${userId}/posts?page=${page}&size=${size}`).json(),
};
```

- [ ] **Step 2: Create user profile screen**

```typescript
// frontend/app/user/[id].tsx
import { View, Text, FlatList, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserMinus } from 'lucide-react-native';
import { usersApi } from '../../api/users';
import { useAuth } from '../../hooks/useAuth';
import { PostCard } from '../../components/ui/PostCard';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const isMe = currentUser?.id === userId;

  const { data: profile } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => usersApi.getUserById(userId),
    enabled: !!userId,
  });

  const { data: followCounts } = useQuery({
    queryKey: ['followCounts', userId],
    queryFn: () => usersApi.getFollowCounts(userId),
    enabled: !!userId,
  });

  const { data: postsData } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => usersApi.getUserPosts(userId, 0, 20),
    enabled: !!userId,
  });

  const followMutation = useMutation({
    mutationFn: () => usersApi.toggleFollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followCounts', userId] });
    },
  });

  const nickname = profile?.nickname ?? profile?.email?.split('@')[0] ?? '사용자';
  const posts = postsData?.content ?? [];

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <Stack.Screen options={{ title: nickname, headerShown: true }} />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View className="items-center py-6 border-b border-gray-200 dark:border-dark-card">
            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mb-3">
              <Text className="text-white text-2xl font-bold">{nickname[0]}</Text>
            </View>
            <Text className="text-xl font-bold text-text-dark dark:text-dark-text">{nickname}</Text>
            <View className="flex-row gap-6 mt-3">
              <View className="items-center">
                <Text className="text-lg font-bold text-text-dark dark:text-dark-text">{followCounts?.followers ?? 0}</Text>
                <Text className="text-xs text-text-grey dark:text-dark-text-secondary">팔로워</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-text-dark dark:text-dark-text">{followCounts?.following ?? 0}</Text>
                <Text className="text-xs text-text-grey dark:text-dark-text-secondary">팔로잉</Text>
              </View>
            </View>
            {!isMe && (
              <Pressable
                onPress={() => followMutation.mutate()}
                className="mt-4 px-6 py-2 rounded-full bg-primary"
              >
                <Text className="text-white font-bold">
                  {followMutation.data?.following === false ? '팔로우' : '팔로잉'}
                </Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <PostCard post={item} onLike={() => {}} onShare={() => {}} />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text className="text-center text-text-grey dark:text-dark-text-secondary py-10">
            아직 게시글이 없습니다
          </Text>
        }
      />
    </View>
  );
}
```

- [ ] **Step 3: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/app/user/\[id\].tsx frontend/api/users.ts
git commit -m "feat(frontend): 유저 프로필 화면 구현 (팔로우, 게시글 목록, 팔로워/팔로잉 수)"
```

---

## Task 10: 커뮤니티 전체/팔로잉 탭

**Files:**
- Modify: `frontend/api/community.ts`
- Modify: `frontend/app/(tabs)/community.tsx`

- [ ] **Step 1: Add getFeed to community API**

```typescript
// ADD to frontend/api/community.ts:
getFeed: (page = 0, size = 10) =>
  apiClient.get(`community/posts/feed?page=${page}&size=${size}`).json<PageResponse<Post>>(),
```

- [ ] **Step 2: Read community.tsx**

- [ ] **Step 3: Add tab filter to community screen**

```typescript
// ADD state:
const [feedType, setFeedType] = useState<'all' | 'following'>('all');

// REPLACE single query with conditional:
const { data: postData, isLoading } = useQuery({
  queryKey: ['communityPosts', feedType],
  queryFn: () => feedType === 'all'
    ? communityApi.getPosts(0, 20)
    : communityApi.getFeed(0, 20),
});

// ADD tab UI above FlashList:
<View className="flex-row mx-4 mb-3 bg-gray-100 dark:bg-dark-card rounded-xl p-1">
  <Pressable
    onPress={() => setFeedType('all')}
    className={`flex-1 py-2 rounded-lg items-center ${feedType === 'all' ? 'bg-white dark:bg-dark-surface' : ''}`}
  >
    <Text className={`text-sm font-bold ${feedType === 'all' ? 'text-primary' : 'text-text-grey dark:text-dark-text-secondary'}`}>전체</Text>
  </Pressable>
  <Pressable
    onPress={() => setFeedType('following')}
    className={`flex-1 py-2 rounded-lg items-center ${feedType === 'following' ? 'bg-white dark:bg-dark-surface' : ''}`}
  >
    <Text className={`text-sm font-bold ${feedType === 'following' ? 'text-primary' : 'text-text-grey dark:text-dark-text-secondary'}`}>팔로잉</Text>
  </Pressable>
</View>
```

- [ ] **Step 4: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/api/community.ts frontend/app/\(tabs\)/community.tsx
git commit -m "feat(frontend): 커뮤니티 전체/팔로잉 탭 필터 구현"
```

---

## Summary

| Task | Description | Sub-system | Dependencies |
|------|-------------|-----------|-------------|
| 1 | 다크모드 나머지 6개 화면 | A | None |
| 2 | GlassCard props 정리 | A | None |
| 3 | 오프라인 캐시 영속화 | A | None |
| 4 | History 중복 제거 | A | None |
| 5 | victory-native 제거 | A | None |
| 6 | 마이페이지 프로필 연동 | B | None |
| 7 | 대댓글 UI 컴포넌트 | B | None |
| 8 | 게시글 삭제 + 유저 링크 | B | None |
| 9 | 유저 프로필 화면 | B | Task 8 |
| 10 | 커뮤니티 전체/팔로잉 탭 | B | None |

**병렬 실행 가능:** A(1-5) 전부 독립 ∥ B(6,7,8,10) 독립, B(9)는 B(8) 의존
