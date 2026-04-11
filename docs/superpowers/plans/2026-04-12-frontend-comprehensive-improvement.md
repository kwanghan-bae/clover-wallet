# Frontend Comprehensive Improvement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all Critical issues (broken routes, dark mode, fake features) and high-impact Important issues (follow state, any types, console removal, optimization) from the code review audit.

**Architecture:** 8 independent tasks ordered by priority. Each task is independently committable and testable. Critical fixes first (Tasks 1-4), then Important improvements (Tasks 5-8).

**Tech Stack:** Expo 54, React Native 0.81, React Query, NativeWind, MMKV, ky

---

## File Structure

**Modified files:**
- `apps/frontend/app/(tabs)/index.tsx` — real drawInfo + refresh + route fix
- `apps/frontend/app/(tabs)/_layout.tsx` — dark mode tab bar
- `apps/frontend/app/(tabs)/community.tsx` — search icon dark mode
- `apps/frontend/app/number-generation.tsx` — real save logic
- `apps/frontend/app/user/[id].tsx` — follow state + post route
- `apps/frontend/components/home/QuickActions.tsx` — fix /travel route
- `apps/frontend/components/profile/ProfileHeader.tsx` — follow button state
- `apps/frontend/components/mypage/MenuSection.tsx` — stub cleanup
- `apps/frontend/api/spots.ts` — remove any type
- `apps/frontend/hooks/useAuth.ts` — remove any + console
- `apps/frontend/hooks/useNotifications.ts` — remove duplicate handler
- `apps/frontend/utils/notifications.ts` — single notification handler
- `apps/frontend/app/(tabs)/history.tsx` — useMemo optimization
- `apps/frontend/app/notifications.tsx` — icon dark mode

**Created files:**
- `apps/frontend/utils/logger.ts` — Logger utility replacing console.*

---

### Task 1: Fix Broken Routes

**Critical:** 4 navigation paths crash at runtime because target pages don't exist.

**Files:**
- Modify: `apps/frontend/app/(tabs)/index.tsx`
- Modify: `apps/frontend/components/home/QuickActions.tsx`
- Modify: `apps/frontend/components/mypage/MenuSection.tsx`
- Modify: `apps/frontend/app/user/[id].tsx`

- [ ] **Step 1: Fix /notification → /notifications in index.tsx**

Find the bell icon `onPress` handler and change the route:

```ts
// BEFORE
onPress={() => router.push('/notification')}
// AFTER
onPress={() => router.push('/notifications')}
```

- [ ] **Step 2: Fix /travel → /statistics in QuickActions.tsx**

The "여행 코스" quick action navigates to `/travel` which doesn't exist. Change to `/statistics` (which exists and is the closest feature):

```ts
// BEFORE
{ icon: Map, label: '여행 코스', onPress: () => onNavigate('/travel') },
// AFTER
{ icon: Map, label: '명당 지도', onPress: () => onNavigate('/(tabs)/map') },
```

Also update the label to match the actual destination.

- [ ] **Step 3: Fix /privacy-policy in MenuSection.tsx**

Replace the navigation with an alert since the page doesn't exist yet:

```ts
// BEFORE
onPress={() => onNavigatePrivacy?.()}
// AFTER
onPress={() => Alert.alert('개인정보 처리방침', '준비 중입니다.')}
```

Remove the `onNavigatePrivacy` prop from the component's interface and from `mypage.tsx`.

- [ ] **Step 4: Fix /community/${postId} in user/[id].tsx**

Remove the non-functional post detail navigation. Show the post inline without navigation:

```ts
// BEFORE
onPress={(postId) => router.push(`/community/${postId}` as any)}
// AFTER  
onPress={() => {}}
```

Remove the `as any` cast as well.

- [ ] **Step 5: Verify + commit**

Run: `cd apps/frontend && npx jest --no-coverage 2>&1 | tail -5`
Expected: All tests pass.

```bash
git add apps/frontend/
git commit -m "fix(frontend): 깨진 라우트 4개 수정 (notifications, travel, privacy-policy, community detail)"
```

---

### Task 2: Tab Bar + Icon Dark Mode Support

**Critical:** Tab bar background is always white, icons hardcoded to dark colors — broken in dark mode.

**Files:**
- Modify: `apps/frontend/app/(tabs)/_layout.tsx`
- Modify: `apps/frontend/app/(tabs)/index.tsx` (bell icon)
- Modify: `apps/frontend/app/(tabs)/community.tsx` (search icon)
- Modify: `apps/frontend/app/(tabs)/history.tsx` (QR icon)
- Modify: `apps/frontend/app/notifications.tsx` (icon colors)

- [ ] **Step 1: Add useTheme to tab layout**

In `app/(tabs)/_layout.tsx`, import and use the theme hook:

```ts
import { useTheme } from '../../hooks/useTheme';
// Inside component:
const { isDark } = useTheme();
```

Update `tabBarStyle`:
```ts
tabBarStyle: {
  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: isDark ? '#333333' : '#F0F0F0',
  height: 65,
  paddingTop: 5,
},
```

Update `tabBarActiveTintColor` and `tabBarInactiveTintColor`:
```ts
tabBarActiveTintColor: '#4CAF50',
tabBarInactiveTintColor: isDark ? '#888888' : '#999999',
```

- [ ] **Step 2: Fix hardcoded icon colors in index.tsx**

Change bell icon color from `"#1A1A1A"` to theme-aware:

```ts
const { isDark } = useTheme();
// ...
<Bell size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
```

- [ ] **Step 3: Fix icon colors in community.tsx and history.tsx**

Same pattern — replace hardcoded `"#1A1A1A"` with `isDark ? '#FFFFFF' : '#1A1A1A'` for Search and QR icons.

- [ ] **Step 4: Verify visually + commit**

Run tests, then verify dark mode in dev server if possible.

```bash
git add apps/frontend/
git commit -m "feat(frontend): 다크모드 탭바 + 아이콘 색상 대응"
```

---

### Task 3: Home Screen — Real Draw Info + Working Refresh

**Critical:** Draw info is hardcoded, refresh does nothing, recent history is fake.

**Files:**
- Modify: `apps/frontend/app/(tabs)/index.tsx`

- [ ] **Step 1: Replace hardcoded drawInfo with React Query**

Remove the `useState` for drawInfo and use React Query to fetch from the backend:

```ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

interface DrawInfo {
  currentRound: number;
  nextDrawDate: string;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  estimatedJackpot: string;
}

// Inside component:
const { data: drawInfo, refetch: refetchDraw } = useQuery<DrawInfo>({
  queryKey: ['nextDraw'],
  queryFn: () => apiClient.get('lotto/next-draw').json<DrawInfo>(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

Update the HeroSection to handle loading state:
```ts
<HeroSection
  currentRound={drawInfo?.currentRound ?? 0}
  daysLeft={drawInfo?.daysLeft ?? 0}
  hoursLeft={drawInfo?.hoursLeft ?? 0}
  minutesLeft={drawInfo?.minutesLeft ?? 0}
  onGenerate={() => router.push('/number-generation')}
/>
```

- [ ] **Step 2: Fix pull-to-refresh**

Replace the fake refresh with actual query invalidation:

```ts
const queryClient = useQueryClient();

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await queryClient.invalidateQueries({ queryKey: ['nextDraw'] });
  setRefreshing(false);
}, [queryClient]);
```

- [ ] **Step 3: Verify + commit**

Run: `npx jest --no-coverage 2>&1 | tail -5`

```bash
git add apps/frontend/app/(tabs)/index.tsx
git commit -m "feat(frontend): 홈 화면 실제 추첨 정보 API 연동 + pull-to-refresh"
```

---

### Task 4: Number Generation — Real Save

**Critical:** handleSave pretends to save but doesn't persist data.

**Files:**
- Modify: `apps/frontend/app/number-generation.tsx`

- [ ] **Step 1: Implement real save using storage utils**

Replace the fake `setTimeout` with actual persistence:

```ts
import { appendToItemArray } from '../utils/storage';

const handleSave = async () => {
  if (generatedNumbers.length === 0) return;
  setIsSaving(true);
  try {
    const record = {
      id: Date.now(),
      numbers: generatedNumbers,
      method: selectedMethod,
      createdAt: new Date().toISOString(),
    };
    appendToItemArray('saved-numbers', record);
    Alert.alert('성공', '번호가 저장되었습니다! 내역 탭에서 확인하세요.');
  } finally {
    setIsSaving(false);
  }
};
```

- [ ] **Step 2: Verify + commit**

Run tests. Verify the save works by checking storage after save.

```bash
git add apps/frontend/app/number-generation.tsx
git commit -m "feat(frontend): 번호 생성 실제 저장 로직 구현 (MMKV storage)"
```

---

### Task 5: Follow Button State

**Important:** Follow button always shows "팔로우", never reflects actual following state.

**Files:**
- Modify: `apps/frontend/components/profile/ProfileHeader.tsx`
- Modify: `apps/frontend/app/user/[id].tsx`

- [ ] **Step 1: Add isFollowing prop to ProfileHeader**

Update the component to accept and display follow state:

```ts
interface ProfileHeaderProps {
  // ... existing props
  isFollowing?: boolean;
}

// In the button text:
<Text ...>
  {isFollowPending ? '처리 중...' : isFollowing ? '팔로우 취소' : '팔로우'}
</Text>
```

Change button style based on state:
```ts
className={`py-2.5 rounded-full items-center border ${
  isFollowing ? 'border-gray-300 bg-gray-100' : 'border-[#4CAF50]'
}`}
```

- [ ] **Step 2: Track follow state in user/[id].tsx**

Add local state that toggles on mutation success:

```ts
const [isFollowing, setIsFollowing] = useState(false);

const followMutation = useMutation({
  mutationFn: () => usersApi.toggleFollow(userId),
  onSuccess: (data) => {
    setIsFollowing(data.following);
    queryClient.invalidateQueries({ queryKey: ['followCounts', userId] });
  },
});
```

Pass to ProfileHeader:
```ts
<ProfileHeader
  isFollowing={isFollowing}
  onFollowToggle={() => followMutation.mutate()}
  isFollowPending={followMutation.isPending}
  // ... other props
/>
```

- [ ] **Step 3: Verify + commit**

```bash
git add apps/frontend/
git commit -m "feat(frontend): 팔로우 버튼 상태 반영 (팔로우/팔로우 취소)"
```

---

### Task 6: Create Logger Utility + Remove console.* and any Types

**Important:** 9 `console.*` calls and 6 `any` types in production code violate CLAUDE.md rules.

**Files:**
- Create: `apps/frontend/utils/logger.ts`
- Modify: `apps/frontend/hooks/useAuth.ts`
- Modify: `apps/frontend/hooks/useScan.ts` (if console.error exists)
- Modify: `apps/frontend/components/ErrorBoundary.tsx`
- Modify: `apps/frontend/app/create-post.tsx`
- Modify: `apps/frontend/app/(tabs)/community.tsx`
- Modify: `apps/frontend/utils/notifications.ts`
- Modify: `apps/frontend/api/spots.ts`
- Modify: `apps/frontend/utils/storage.ts`

- [ ] **Step 1: Create logger utility**

Create `apps/frontend/utils/logger.ts`:

```ts
const isDev = __DEV__;

export const Logger = {
  error: (tag: string, message: string, error?: unknown) => {
    if (isDev) {
      console.error(`[${tag}]`, message, error);
    }
  },
  warn: (tag: string, message: string) => {
    if (isDev) {
      console.warn(`[${tag}]`, message);
    }
  },
  info: (tag: string, message: string) => {
    if (isDev) {
      console.log(`[${tag}]`, message);
    }
  },
};
```

- [ ] **Step 2: Replace all console.* with Logger**

In each file, replace `console.error(...)` with `Logger.error('Tag', ...)`. Example for `useAuth.ts`:

```ts
// BEFORE
console.error('Backend login failed:', error);
// AFTER
Logger.error('useAuth', 'Backend login failed', error);
```

- [ ] **Step 3: Fix any types**

For each `any` usage:

`api/spots.ts:18` — `Promise<any[]>` → import WinningHistory type:
```ts
import type { WinningHistory } from './types/spots';
getSpotHistory: async (spotId: number): Promise<WinningHistory[]> => { ... }
```

`hooks/useAuth.ts:76` — `(authApi as any).logout` → proper optional chaining:
```ts
await authApi.logout(token);
```

`app/user/[id].tsx:45` — `postsData as any` → proper typing:
```ts
const posts: Post[] = (postsData as { content: Post[] })?.content ?? [];
```

`utils/storage.ts:21` — `value: any` → `value: unknown`:
```ts
export function saveItem(key: string, value: unknown): void {
```

- [ ] **Step 4: Verify TS + tests + commit**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"` → 0
Run: `npx jest --no-coverage 2>&1 | tail -5` → all pass

```bash
git add apps/frontend/
git commit -m "refactor(frontend): Logger 도입 + console.* 제거 + any 타입 제거"
```

---

### Task 7: Fix Duplicate Notification Handler + Auth Token Sync

**Important:** Notification handler registered twice with different settings. Auth token expiry doesn't sync with React context.

**Files:**
- Modify: `apps/frontend/hooks/useNotifications.ts`
- Modify: `apps/frontend/utils/notifications.ts`
- Modify: `apps/frontend/hooks/useAuth.ts`

- [ ] **Step 1: Remove duplicate notification handler**

Remove `Notifications.setNotificationHandler` from `hooks/useNotifications.ts` (keep only the one in `utils/notifications.ts`).

- [ ] **Step 2: Fix auth token expiry → context sync**

In `api/client.ts`, when token refresh fails (the catch block around lines 36-41), dispatch an event or call a callback to clear the auth state:

In `hooks/useAuth.ts`, add a listener for auth state changes from storage:
```ts
// In the useEffect that sets up auth
const checkToken = () => {
  const token = loadItem<string>('auth.access_token');
  if (!token && user) {
    setUser(null);
  }
};
```

Or simpler: make the client's refresh failure trigger Supabase signOut which the auth hook already listens to.

- [ ] **Step 3: Verify + commit**

```bash
git add apps/frontend/
git commit -m "fix(frontend): 알림 핸들러 중복 제거 + auth 토큰 만료 동기화"
```

---

### Task 8: Performance Optimization — useMemo + Query Keys

**Important:** History screen recalculates records every render. Query key invalidation inconsistent.

**Files:**
- Modify: `apps/frontend/app/(tabs)/history.tsx`
- Modify: `apps/frontend/components/ui/PostCardMenu.tsx`

- [ ] **Step 1: Wrap backendRecords in useMemo**

In `history.tsx`, wrap the `backendRecords` computation:

```ts
const backendRecords = useMemo(() => {
  return (ticketData?.content ?? []).flatMap((ticket: LottoTicket) =>
    (ticket.games ?? []).map((game) => ({
      id: game.id,
      status: game.status as LottoRecord['status'],
      numbers: [game.number1, game.number2, game.number3, game.number4, game.number5, game.number6],
      createdAt: ticket.createdAt,
      round: ticket.ordinal,
      prizeAmount: game.prizeAmount,
    }))
  );
}, [ticketData]);
```

- [ ] **Step 2: Fix query key consistency in PostCardMenu**

In `PostCardMenu.tsx`, when invalidating after delete, include the feedType variable:

```ts
// BEFORE
queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
// AFTER
queryClient.invalidateQueries({ queryKey: ['communityPosts'], exact: false });
```

Using `exact: false` ensures all variants (with/without feedType) are invalidated.

- [ ] **Step 3: Verify + commit**

```bash
git add apps/frontend/
git commit -m "perf(frontend): history useMemo 최적화 + query key 일관성 수정"
```
