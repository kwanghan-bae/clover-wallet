# Frontend Enhancement Remaining Tasks — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 23 failing frontend test suites, consolidate types with @clover/shared, achieve 80% coverage threshold.

**Architecture:** Three sequential workstreams — (1) Jest infrastructure fix, (2) @clover/shared type consolidation, (3) coverage threshold. Each produces independently testable, committable results.

**Tech Stack:** Jest 30 + ts-jest, @testing-library/react-native 13, @clover/shared (TypeScript package), Turborepo monorepo

---

## File Structure

**Modified files:**
- `apps/frontend/jest.config.js` — fix moduleNameMapper + add modulePaths
- `apps/frontend/__tests__/hooks/*.test.ts` (7 files) — add jest.unmock for hook tests
- `packages/shared/src/types/*.ts` (7 files) — bigint → number
- `packages/shared/src/index.ts` — add new exports
- `apps/frontend/api/types/*.ts` (4 files) — re-export from @clover/shared
- `apps/frontend/api/tickets.ts` — remove inline types, import from api/types
- `apps/frontend/api/community.ts` — remove inline types, import from api/types
- `apps/frontend/api/notifications.ts` — remove inline types, import from api/types
- `apps/frontend/api/users.ts` — remove inline types, import from api/types
- `apps/frontend/api/spots.ts` — already imports from api/types (no change)

---

### Task 1: Fix jest.config.js — React Native Mapping + Monorepo Resolution

**Files:**
- Modify: `apps/frontend/jest.config.js`

**Root cause:** Two issues — (A) `react-native` mapped to `react-native-web` which doesn't exist at `<rootDir>/node_modules/`, (B) `react-test-renderer` in local `node_modules/` unreachable by hoisted `@testing-library/react-native`.

- [ ] **Step 1: Update jest.config.js**

Replace the full config:

```js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
    }],
    '^.+\\.js$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(ky)/)',
  ],
  modulePaths: ['<rootDir>/node_modules'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__tests__/mocks/react-native.js',
    '^expo-router$': '<rootDir>/__tests__/mocks/expo-router.js',
    '^react-native-mmkv$': '<rootDir>/__tests__/mocks/react-native-mmkv.js',
    '^expo-notifications$': '<rootDir>/__tests__/mocks/expo-notifications.js',
    '^expo-device$': '<rootDir>/__tests__/mocks/expo-device.js',
    '^expo-constants$': '<rootDir>/__tests__/mocks/expo-constants.js',
    '^expo-linear-gradient$': '<rootDir>/__tests__/mocks/expo-linear-gradient.js',
    '^expo-camera$': '<rootDir>/__tests__/mocks/expo-camera.js',
    '^@shopify/flash-list$': '<rootDir>/__tests__/mocks/flash-list.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'utils/**/*.ts',
    'hooks/**/*.ts',
    'api/**/*.ts',
    'components/**/*.tsx',
    '!components/**/*.test.tsx',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
};
```

Changes from original:
1. `'^react-native$'` mapped to `'<rootDir>/__tests__/mocks/react-native.js'` (was `react-native-web`)
2. Added `modulePaths: ['<rootDir>/node_modules']` for monorepo peer dep resolution

- [ ] **Step 2: Run tests to verify infrastructure fix**

Run: `cd apps/frontend && npx jest --no-coverage 2>&1 | tail -10`

Expected: No more `Could not locate module react-native` or `Missing dev dependency "react-test-renderer@null"` errors. Suites should RUN (some test cases may fail due to mock logic — addressed in Task 2).

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/jest.config.js
git commit -m "fix(frontend): jest config — react-native mock mapping + monorepo modulePaths"
```

---

### Task 2: Fix Hook Tests — Unmock Global Setup Mocks

**Context:** `jest.setup.js` mocks hooks globally (`useAuth`, `useTheme`, `useNotifications`, `useScan`) for component tests. Hook test files need the REAL implementation, so they must call `jest.unmock()` at file top.

**Files:**
- Modify: `apps/frontend/__tests__/hooks/useTheme.test.ts`
- Modify: `apps/frontend/__tests__/hooks/useAuth.test.ts`
- Modify: `apps/frontend/__tests__/hooks/useNotifications.test.ts`

- [ ] **Step 1: Fix useTheme.test.ts**

```ts
jest.unmock('../../hooks/useTheme');

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useColorScheme: jest.fn().mockReturnValue('light'),
}));

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

import { renderHook, act } from '@testing-library/react-native';
import { useTheme } from '../../hooks/useTheme';

describe('useTheme', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should default to system theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.themePreference).toBe('system');
    expect(result.current.isDark).toBe(false);
  });

  it('should toggle to dark', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setThemePreference('dark'));
    expect(result.current.isDark).toBe(true);
  });

  it('should toggle to light', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setThemePreference('light'));
    expect(result.current.isDark).toBe(false);
  });
});
```

- [ ] **Step 2: Fix useAuth.test.ts — add jest.unmock at top**

Add as first line:
```ts
jest.unmock('../../hooks/useAuth');
```

- [ ] **Step 3: Fix useNotifications.test.ts — add jest.unmock at top**

Add as first line:
```ts
jest.unmock('../../hooks/useNotifications');
```

- [ ] **Step 4: Run hook tests to verify**

Run: `cd apps/frontend && npx jest --no-coverage __tests__/hooks/ 2>&1 | tail -15`

Expected: Hook tests run with real implementations. Fix any remaining assertion mismatches.

- [ ] **Step 5: Run full test suite**

Run: `cd apps/frontend && npx jest --no-coverage 2>&1 | tail -10`

Expected: `33 passed, 33 total` (or close to it — any remaining failures addressed inline)

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/__tests__/hooks/
git commit -m "fix(frontend): hook tests — unmock global setup mocks for real implementation testing"
```

---

### Task 3: Update @clover/shared Types — bigint to number

**Context:** Shared types use `bigint` (Prisma-aligned) but JSON serialization produces `number`. Frontend needs `number` types. Neither app currently imports from shared, so this change is safe.

**Files:**
- Modify: `packages/shared/src/types/user.ts`
- Modify: `packages/shared/src/types/lotto.ts`
- Modify: `packages/shared/src/types/community.ts`
- Modify: `packages/shared/src/types/spot.ts`
- Modify: `packages/shared/src/types/notification.ts`
- Modify: `packages/shared/src/types/ticket.ts`
- Modify: `packages/shared/src/types/api.ts` (no changes needed)

- [ ] **Step 1: Update user.ts**

```ts
export interface UserSummary {
  id: number;
  nickname: string;
  badges: string[];
}

export interface UserDetail extends UserSummary {
  email?: string;
  age: number;
  locale: string;
  createdAt?: string;
}

export interface UserStats {
  totalWinnings: number;
  roi: number;
  totalGames: number;
  winCount: number;
}

export interface FollowCounts {
  followers: number;
  following: number;
}
```

- [ ] **Step 2: Update lotto.ts**

```ts
export type LottoGameStatus =
  | 'NOT_CHECKED'
  | 'WINNING_1'
  | 'WINNING_2'
  | 'WINNING_3'
  | 'WINNING_4'
  | 'WINNING_5'
  | 'LOSING'
  | 'STASHED'
  | 'WINNING';

export interface LottoGame {
  id: number;
  status: LottoGameStatus;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  extractionMethod?: string;
  prizeAmount?: number;
  createdAt?: string;
}

export interface LottoTicket {
  id: number;
  userId: number;
  ordinal: number;
  status: string;
  games: LottoGame[];
  createdAt?: string;
}

export interface WinningInfo {
  round: number;
  drawDate: string;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  bonusNumber: number;
  firstPrizeAmount: number;
  secondPrizeAmount: number;
  thirdPrizeAmount: number;
  fourthPrizeAmount: number;
  fifthPrizeAmount: number;
}

export interface PrizeAmountMap {
  WINNING_1: number;
  WINNING_2: number;
  WINNING_3: number;
  WINNING_4: number;
  WINNING_5: number;
}
```

- [ ] **Step 3: Update community.ts**

```ts
import type { UserSummary } from './user.js';

export interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  likes: number;
  isLiked: boolean;
  userSummary: UserSummary | null;
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  likes: number;
  parentId?: number;
  userSummary: UserSummary | null;
  replies?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface CreateCommentRequest {
  postId: number;
  content: string;
  parentId?: number;
}
```

- [ ] **Step 4: Update spot.ts**

```ts
export interface LottoSpot {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  firstPlaceWins: number;
  secondPlaceWins: number;
}

export interface WinningStoreHistory {
  round: number;
  rank: number;
  storeName: string;
  address: string;
  method?: string;
}
```

- [ ] **Step 5: Update notification.ts**

```ts
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  type: 'INFO' | 'WINNING' | 'SYSTEM';
  createdAt?: string;
}
```

- [ ] **Step 6: Update ticket.ts — add ScanResult.id**

```ts
export interface ScanResult {
  round?: number;
  numbers: number[];
}

export type ExtractionMethod =
  | 'DREAM'
  | 'SAJU'
  | 'PERSONAL_SIGNIFICANCE'
  | 'AUTO'
  | 'RANDOM'
  | 'STATISTICS';
```

- [ ] **Step 7: Verify shared package builds**

Run: `cd packages/shared && npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add packages/shared/
git commit -m "refactor(shared): bigint → number for JSON-serializable API contract types"
```

---

### Task 4: Frontend api/types/ Re-export from @clover/shared

**Context:** Frontend `api/types/` defines local types that duplicate shared. Re-export from shared where types match, keep frontend-only types (LottoRecord, Region) local.

**Files:**
- Modify: `apps/frontend/api/types/user.ts`
- Modify: `apps/frontend/api/types/lotto.ts`
- Modify: `apps/frontend/api/types/community.ts`
- Modify: `apps/frontend/api/types/spots.ts`

- [ ] **Step 1: Update api/types/user.ts**

Shared `UserSummary` lacks `profileImageUrl` — extend it.

```ts
import type { UserSummary as SharedUserSummary, UserDetail } from '@clover/shared';

export interface UserSummary extends SharedUserSummary {
  profileImageUrl?: string;
}

export type { UserDetail };
```

- [ ] **Step 2: Update api/types/lotto.ts**

Re-export `LottoGameStatus` from shared. Keep `LottoRecord` and `LottoGameResponse` local (frontend-specific).

```ts
import type { LottoGameStatus } from '@clover/shared';

export type { LottoGameStatus };

/** Frontend-normalized format: backend number1~6 → numbers array */
export interface LottoRecord {
  id: number;
  status: LottoGameStatus;
  numbers: number[];
  createdAt: string;
  round?: number;
  prizeAmount?: number;
}

/** Raw backend DTO before normalization */
export interface LottoGameResponse {
  id: number;
  status: LottoGameStatus;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  createdAt: string;
}
```

- [ ] **Step 3: Update api/types/community.ts**

Keep `Post` local — field names differ from shared (`user` vs `userSummary`, `likeCount` vs `likes`, no `title`). Import `UserSummary` from local user.ts.

```ts
import type { UserSummary } from './user';

export interface Post {
  id: number;
  user: UserSummary;
  content: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  content: string;
}
```

Note: `Post` stays local because frontend uses `user: UserSummary` (not `userSummary`), `likeCount` (not `likes`), and omits `title`. Aligning these requires UI component changes — tracked as future work.

- [ ] **Step 4: Update api/types/spots.ts**

Extend shared `LottoSpot` with `isFavorite`. Re-export `WinningStoreHistory` as `WinningHistory`.

```ts
import type { LottoSpot as SharedLottoSpot } from '@clover/shared';

export interface LottoSpot extends SharedLottoSpot {
  isFavorite?: boolean;
}

export type { WinningStoreHistory as WinningHistory } from '@clover/shared';

/** Frontend-only: map viewport region */
export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
```

- [ ] **Step 5: Verify frontend TypeScript compiles**

Run: `cd apps/frontend && npx tsc --noEmit 2>&1 | head -20`

Expected: No type errors (or only pre-existing ones unrelated to this change). Fix any import mismatches.

- [ ] **Step 6: Run tests**

Run: `cd apps/frontend && npx jest --no-coverage 2>&1 | tail -5`

Expected: Same pass count as after Task 2.

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/api/types/
git commit -m "refactor(frontend): api/types → @clover/shared re-export"
```

---

### Task 5: Consolidate API Service Inline Types

**Context:** `api/tickets.ts`, `api/community.ts`, `api/notifications.ts`, `api/users.ts` define inline types duplicating `api/types/`. Remove inline definitions, import from `api/types/` or `@clover/shared`.

**Files:**
- Modify: `apps/frontend/api/tickets.ts`
- Modify: `apps/frontend/api/community.ts`
- Modify: `apps/frontend/api/notifications.ts`
- Modify: `apps/frontend/api/users.ts`

- [ ] **Step 1: Update api/tickets.ts**

```ts
import { apiClient } from './client';
import type { LottoTicket, LottoGame, PageResponse } from '@clover/shared';

export type { LottoTicket, LottoGame };

export const ticketsApi = {
  getMyTickets: (page = 0, size = 20) =>
    apiClient.get(`tickets?page=${page}&size=${size}`).json<PageResponse<LottoTicket>>(),

  getTicketById: (id: number) =>
    apiClient.get(`tickets/${id}`).json<LottoTicket>(),

  scanTicket: (url: string) =>
    apiClient.post('tickets/scan', { json: { url } }).json<LottoTicket>(),
};
```

- [ ] **Step 2: Update api/community.ts**

Import `Post` and `PageResponse` from shared (these match the actual backend response shape — `userSummary`, `likes`, `title`).

```ts
import { apiClient } from './client';
import type { Post, PageResponse } from '@clover/shared';

export type { Post };

export const communityApi = {
  getPosts: (page = 0, size = 10) =>
    apiClient.get(`community/posts?page=${page}&size=${size}`).json<PageResponse<Post>>(),

  getFeed: (page = 0, size = 10) =>
    apiClient.get(`community/posts/feed?page=${page}&size=${size}`).json<PageResponse<Post>>(),

  getPostById: (id: number) =>
    apiClient.get(`community/posts/${id}`).json<Post>(),

  createPost: (title: string, content: string) =>
    apiClient.post('community/posts', { json: { title, content } }).json<Post>(),

  deletePost: (id: number) =>
    apiClient.delete(`community/posts/${id}`),

  likePost: (id: number) =>
    apiClient.post(`community/posts/${id}/like`).json<{ liked: boolean; likes: number }>(),

  getComments: (postId: number, page = 0, size = 20) =>
    apiClient.get(`community/posts/${postId}/comments?page=${page}&size=${size}`).json(),

  createComment: (postId: number, content: string, parentId?: number) =>
    apiClient.post('community/comments', { json: { postId, content, parentId } }).json(),
};
```

Note: `api/community.ts` uses shared `Post` (matches backend response). `api/types/community.ts` keeps a frontend-adapted `Post` (with `user`, `likeCount`) for UI components. These two `Post` types serve different layers — resolve in a future UI alignment task.

- [ ] **Step 3: Update api/notifications.ts**

```ts
import { apiClient } from './client';
import type { Notification, PageResponse } from '@clover/shared';

export type { Notification };

export const notificationsApi = {
  getMyNotifications: (page = 0, size = 20) =>
    apiClient.get(`notifications?page=${page}&size=${size}`).json<PageResponse<Notification>>(),

  markAsRead: (id: number) =>
    apiClient.put(`notifications/${id}/read`).json(),

  getUnreadCount: () =>
    apiClient.get('notifications/unread-count').json<{ count: number }>(),

  registerFcmToken: (token: string) =>
    apiClient.post('notifications/fcm-token', { json: { token } }).json(),
};
```

- [ ] **Step 4: Update api/users.ts**

```ts
import { apiClient } from './client';
import type { UserStats, FollowCounts } from '@clover/shared';

export type { UserStats };

export interface UserProfile {
  id: number;
  email: string;
  nickname: string | null;
  badges: string;
}

export const usersApi = {
  getMe: () => apiClient.get('users/me').json<UserProfile>(),
  getMyStats: () => apiClient.get('users/me/stats').json<UserStats>(),
  getUserById: (id: number) => apiClient.get(`users/${id}`).json<UserProfile>(),
  getUserStats: (id: number) => apiClient.get(`users/${id}/stats`).json<UserStats>(),

  toggleFollow: (userId: number) =>
    apiClient.post(`users/${userId}/follow`).json<{ following: boolean }>(),

  getFollowCounts: (userId: number) =>
    apiClient.get(`users/${userId}/follow-counts`).json<FollowCounts>(),

  getUserPosts: (userId: number, page = 0, size = 10) =>
    apiClient.get(`community/users/${userId}/posts?page=${page}&size=${size}`).json(),
};
```

- [ ] **Step 5: Verify TypeScript + tests**

Run: `cd apps/frontend && npx tsc --noEmit && npx jest --no-coverage 2>&1 | tail -5`

Expected: No type errors. Same test pass count.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/api/
git commit -m "refactor(frontend): API service inline types → @clover/shared imports"
```

---

### Task 6: Coverage 80% Threshold + Gap Tests

**Files:**
- Modify: `apps/frontend/jest.config.js` (add coverageThreshold)
- Potentially create: new test files for coverage gaps

- [ ] **Step 1: Measure current coverage**

Run: `cd apps/frontend && npx jest 2>&1 | grep -A 10 "Coverage summary"`

Record the coverage percentages for Statements, Branches, Functions, Lines.

- [ ] **Step 2: Add coverage threshold to jest.config.js**

Add to jest.config.js:

```js
coverageThreshold: {
  global: {
    statements: 80,
    branches: 70,
    functions: 80,
    lines: 80,
  },
},
```

- [ ] **Step 3: Run tests with threshold**

Run: `cd apps/frontend && npx jest 2>&1 | tail -20`

If threshold passes: done. If not: identify gaps from coverage report and add tests (see Step 4).

- [ ] **Step 4: Add tests for coverage gaps (if needed)**

Check `coverage/lcov-report/index.html` for uncovered files. Priority:
1. `utils/` — pure functions, easy to test
2. `hooks/` — renderHook tests
3. `api/` — mock apiClient calls
4. `components/` — render + assertion tests

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/jest.config.js apps/frontend/__tests__/
git commit -m "test(frontend): coverage 80% threshold + gap tests"
```
