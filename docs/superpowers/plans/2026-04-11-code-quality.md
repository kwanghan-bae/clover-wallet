# Code Quality Improvement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate 805 TypeScript errors and 51 ESLint warnings to achieve a clean build.

**Architecture:** (1) Fix monorepo type resolution by hoisting `react`/`@types/react` to root, eliminating 785 JSX errors. (2) Fix ~20 real TS code errors (import mismatches, implicit any, type mismatches). (3) Fix ESLint warnings (import/first in test files, display-name in mocks, exhaustive-deps).

**Tech Stack:** TypeScript 5.9, ESLint 9, React 19.2, React Native 0.81, Expo 54

---

## File Structure

**Modified files:**
- `package.json` (root) — add react/types devDependencies
- `apps/frontend/tsconfig.json` — verify clean after hoisting
- `apps/frontend/app/spot/[id].tsx` — fix GlassCard import
- `apps/frontend/components/home/HeroSection.tsx` — fix LuckyHeroIllustration import
- `apps/frontend/__tests__/components/ui/HistoryItem.test.tsx` — fix status value
- `apps/frontend/__tests__/screens/HomeScreen.test.tsx` — fix implicit any
- `apps/frontend/app/(tabs)/history.tsx` — fix implicit any + type comparison
- `apps/frontend/app/(tabs)/map.tsx` — fix implicit any
- `apps/frontend/app/notifications.tsx` — fix implicit any + overload
- `apps/frontend/app/user/[id].tsx` — fix implicit any
- `apps/frontend/components/profile/ProfileHeader.tsx` — fix pressed any
- `apps/frontend/api/client.ts` — fix AfterResponseHook type
- `apps/frontend/hooks/useNotifications.ts` — fix NotificationBehavior
- `apps/frontend/components/ui/HistoryItem.tsx` — fix id number→string
- `apps/frontend/components/ui/LottoBall.tsx` — fix withSpring config
- `apps/frontend/app/_layout.tsx` — fix MMKV import
- `apps/frontend/app/scan.tsx` — fix ScanResultData type
- `apps/frontend/.eslintrc.js` or test files — fix ESLint warnings

---

### Task 1: Hoist react/@types/react to Root for Type Resolution

**Root cause:** `react-native` is at root `node_modules/` but `react` is only in `apps/frontend/node_modules/`. TypeScript can't resolve `import React from 'react'` inside RN's type definitions.

**Files:**
- Modify: `package.json` (root)

- [ ] **Step 1: Add react and @types/react to root devDependencies**

In `/Users/joel/Desktop/git/clover-wallet/package.json`, add to `devDependencies`:

```json
{
  "devDependencies": {
    "turbo": "^2.5.0",
    "react": "19.2.3",
    "@types/react": "~19.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd /Users/joel/Desktop/git/clover-wallet && npm install`

- [ ] **Step 3: Verify react is now at root**

Run: `ls node_modules/react/package.json && echo "react at root: OK"`

Expected: File exists.

- [ ] **Step 4: Check TS error count**

Run: `cd apps/frontend && npx tsc --noEmit 2>&1 | grep -c "error TS"`

Expected: ~20 errors (down from 805). All TS2786/TS2607 JSX errors should be gone.

- [ ] **Step 5: Run tests**

Run: `npx jest --no-coverage 2>&1 | tail -5`

Expected: 52 passed, 256 tests.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: hoist react/@types/react to root for monorepo type resolution"
```

---

### Task 2: Fix Import Mismatches + Test Data Types

**Files:**
- Modify: `apps/frontend/app/spot/[id].tsx` — line 7
- Modify: `apps/frontend/components/home/HeroSection.tsx` — line 4
- Modify: `apps/frontend/__tests__/components/ui/HistoryItem.test.tsx`

- [ ] **Step 1: Fix GlassCard import in spot/[id].tsx**

Change line 7 from:
```ts
import GlassCard from '../../components/ui/GlassCard';
```
to:
```ts
import { GlassCard } from '../../components/ui/GlassCard';
```

- [ ] **Step 2: Fix LuckyHeroIllustration import in HeroSection.tsx**

Change line 4 from:
```ts
import LuckyHeroIllustration from '../ui/LuckyHeroIllustration';
```
to:
```ts
import { LuckyHeroIllustration } from '../ui/LuckyHeroIllustration';
```

- [ ] **Step 3: Fix HistoryItem.test.tsx — use valid LottoGameStatus**

Replace all occurrences of `status: 'CHECKED'` with `status: 'NOT_CHECKED'` (a valid `LottoGameStatus` value from `@clover/shared`).

- [ ] **Step 4: Verify**

Run: `cd apps/frontend && npx tsc --noEmit 2>&1 | grep "TS2613\|TS2322.*HistoryItem.test" | wc -l`

Expected: 0

- [ ] **Step 5: Run tests**

Run: `npx jest --no-coverage 2>&1 | tail -5`

Expected: 52 passed.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/app/spot/[id].tsx apps/frontend/components/home/HeroSection.tsx apps/frontend/__tests__/components/ui/HistoryItem.test.tsx
git commit -m "fix(frontend): import mismatches (default→named) + HistoryItem test status"
```

---

### Task 3: Fix Implicit Any Types

**Files:**
- Modify: `apps/frontend/__tests__/screens/HomeScreen.test.tsx` — line 16
- Modify: `apps/frontend/app/(tabs)/history.tsx` — lines 86, 88
- Modify: `apps/frontend/app/(tabs)/map.tsx` — lines 88, 90
- Modify: `apps/frontend/app/notifications.tsx` — lines 132, 133
- Modify: `apps/frontend/app/user/[id].tsx` — lines 61, 62
- Modify: `apps/frontend/components/profile/ProfileHeader.tsx` — line 51

- [ ] **Step 1: Fix HomeScreen.test.tsx — type the proxy handler**

Change the lucide mock's proxy handler from:
```ts
get: (_target, name) => (props) => React.createElement('View', { ...props, testID: String(name) }),
```
to:
```ts
get: (_target: object, name: string | symbol) => (props: Record<string, unknown>) => React.createElement('View', { ...props, testID: String(name) }),
```

- [ ] **Step 2: Fix history.tsx — type FlatList renderItem**

For the `renderItem` callback around line 86, add explicit types:
```ts
renderItem={({ item }: { item: LottoRecord & { _ticketStatus?: string } }) => (
```
And for `keyExtractor`:
```ts
keyExtractor={(item: LottoRecord, index: number) => `${item.id}-${index}`}
```

- [ ] **Step 3: Fix map.tsx — type FlatList renderItem**

Around line 88, add explicit types:
```ts
keyExtractor={(item: LottoSpot) => item.id.toString()}
```
And:
```ts
renderItem={({ item }: { item: LottoSpot }) => (
```

- [ ] **Step 4: Fix notifications.tsx — type FlatList renderItem**

Around line 132:
```ts
renderItem={({ item }: { item: Notification }) => (
```

- [ ] **Step 5: Fix user/[id].tsx — type FlatList renderItem**

Around line 61:
```ts
renderItem={({ item }: { item: Post }) => (
```

- [ ] **Step 6: Fix ProfileHeader.tsx — type pressed callback**

Line 51, change:
```ts
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
```
to:
```ts
style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 })}
```

- [ ] **Step 7: Verify**

Run: `cd apps/frontend && npx tsc --noEmit 2>&1 | grep "TS7006\|TS7031" | wc -l`

Expected: 0

- [ ] **Step 8: Run tests + commit**

```bash
npx jest --no-coverage 2>&1 | tail -5
git add apps/frontend/
git commit -m "fix(frontend): implicit any 타입 명시적 선언"
```

---

### Task 4: Fix Type Mismatches

**Files:**
- Modify: `apps/frontend/api/client.ts` — line 57
- Modify: `apps/frontend/hooks/useNotifications.ts` — line 9
- Modify: `apps/frontend/components/ui/HistoryItem.tsx` — line 42
- Modify: `apps/frontend/components/ui/LottoBall.tsx` — lines 23-24
- Modify: `apps/frontend/app/_layout.tsx` — line 24
- Modify: `apps/frontend/app/scan.tsx` — line 100
- Modify: `apps/frontend/app/(tabs)/history.tsx` — line 45
- Modify: `apps/frontend/app/notifications.tsx` — line 76

Read each file to understand the exact context, then fix:

- [ ] **Step 1: Fix api/client.ts — AfterResponseHook signature**

The `unwrapCommonResponse` in afterResponse hook needs correct ky signature. Read `utils/api.ts` to check the function signature. If it doesn't match `AfterResponseHook`, cast it:
```ts
afterResponse: [handleTokenRefresh, unwrapCommonResponse as unknown as import('ky').AfterResponseHook],
```
Or fix the function signature in `utils/api.ts` to match ky's `AfterResponseHook`.

- [ ] **Step 2: Fix useNotifications.ts — NotificationBehavior**

Line 9, add explicit return type or add `priority` field if required:
```ts
handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
  shouldShowAlert: true,
  shouldPlaySound: true,
  shouldSetBadge: true,
}),
```

- [ ] **Step 3: Fix HistoryItem.tsx — id type**

Line 42, `onDelete(record.id)` passes number but expects string. Fix the `onDelete` prop type from `(id: string) => void` to `(id: number) => void`. Or convert: `onDelete(String(record.id))`.

- [ ] **Step 4: Fix LottoBall.tsx — withSpring config**

Lines 23-24, remove invalid `restDisplacementThreshold` and `restSpeedThreshold` from `withSpring` config (not valid in reanimated v4):
```ts
scale.value = withDelay(delay, withSpring(1, {
  damping: 12,
  mass: 0.8,
  stiffness: 100,
  overshootClamping: false,
}));
```

- [ ] **Step 5: Fix _layout.tsx — MMKV import**

Line 24, if `MMKV` is imported as a type, change to value import:
```ts
import { MMKV } from 'react-native-mmkv';
```
Ensure it's not `import type { MMKV }`.

- [ ] **Step 6: Fix scan.tsx — ScanResultData type**

Line 100, the `scanResult` has `round: number | null` but the type expects `round: number | undefined` or similar. Add a type assertion or fix the hook return type to match.

- [ ] **Step 7: Fix history.tsx — type comparison**

Line 45, there's a comparison between `number` and `string` types. Ensure consistent types (likely need `String(value)` or `Number(value)` conversion).

- [ ] **Step 8: Fix notifications.tsx — toLocaleDateString overload**

Line 76, use `toLocaleString` instead of `toLocaleDateString` when mixing date+time options:
```ts
{new Date(item.createdAt).toLocaleString('ko-KR', {
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})}
```

- [ ] **Step 9: Verify all TS errors resolved**

Run: `cd apps/frontend && npx tsc --noEmit 2>&1 | grep -c "error TS"`

Expected: 0

- [ ] **Step 10: Run tests + commit**

```bash
npx jest --no-coverage 2>&1 | tail -5
git add apps/frontend/
git commit -m "fix(frontend): 타입 불일치 수정 (AfterResponseHook, NotificationBehavior 등)"
```

---

### Task 5: Fix ESLint Warnings

**51 warnings in 3 categories:**
- 39x `import/first` — test files have `jest.mock()` before `import` (required by Jest)
- 9x `react/display-name` — anonymous components in mock files
- 3x `react-hooks/exhaustive-deps` — _layout.tsx, login.tsx

- [ ] **Step 1: Fix import/first in test files**

Add `/* eslint-disable import/first */` at the top of each test file that has `jest.mock()` before imports. Files:

- `__tests__/api/client.test.ts`
- `__tests__/api/tickets.test.ts`
- `__tests__/hooks/useAuth.test.ts`
- `__tests__/hooks/useLuckySpots.test.ts`
- `__tests__/hooks/useNotifications.test.ts`
- `__tests__/hooks/useOffline.test.ts`
- `__tests__/hooks/useSpotDetail.test.ts`
- `__tests__/hooks/useStatistics.test.ts`
- `__tests__/hooks/useTheme.test.ts`

Add as first line of each file:
```ts
/* eslint-disable import/first */
```

- [ ] **Step 2: Fix display-name in mock files**

In `__tests__/mocks/expo-camera.js`, `__tests__/mocks/flash-list.js`, and `jest.setup.js`, add display names or disable the rule per-file:

For mock files, add at top:
```js
/* eslint-disable react/display-name */
```

- [ ] **Step 3: Fix exhaustive-deps in _layout.tsx and login.tsx**

For `app/_layout.tsx` lines 61, 67 — add the missing deps to the dependency arrays or wrap with `useCallback`:

```ts
// eslint-disable-next-line react-hooks/exhaustive-deps
```

Use the `eslint-disable-next-line` comment only if adding the dep would cause infinite re-renders (likely the case for `router` and `registerToken` refs).

For `app/login.tsx` line 27 — same pattern.

- [ ] **Step 4: Verify zero ESLint warnings**

Run: `cd apps/frontend && npx eslint . 2>&1 | tail -5`

Expected: `0 problems (0 errors, 0 warnings)` or close to it.

- [ ] **Step 5: Run tests + commit**

```bash
npx jest --no-coverage 2>&1 | tail -5
git add apps/frontend/
git commit -m "fix(frontend): ESLint warning 전체 해결 (import/first, display-name, exhaustive-deps)"
```
