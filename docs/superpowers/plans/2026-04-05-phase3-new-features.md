# Phase 3: 새 기능 추가 (New Features) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 다크모드, 통계 대시보드, 소셜 기능(팔로우/공유), 오프라인 지원을 추가하여 앱 차별화

**Architecture:** 4개 독립 서브시스템으로 구성. 다크모드는 NativeWind dark: 클래스 활용, 통계는 victory-native 차트, 소셜은 Follow 모델 + 피드 필터, 오프라인은 React Query persist + NetInfo.

**Tech Stack:** NativeWind dark mode, victory-native, react-native-svg, @react-native-community/netinfo, @tanstack/react-query-persist-client, Prisma

---

## File Structure

### Sub-system A: 다크모드
| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/tailwind.config.js` | Modify | 다크 팔레트 추가 |
| `frontend/hooks/useTheme.ts` | Create | 테마 상태 관리 (시스템/라이트/다크) |
| `frontend/app/_layout.tsx` | Modify | 테마 프로바이더 적용 |
| `frontend/app/(tabs)/mypage.tsx` | Modify | 테마 설정 토글 |
| `frontend/app/(tabs)/index.tsx` | Modify | dark: 클래스 적용 |
| `frontend/app/(tabs)/community.tsx` | Modify | dark: 클래스 적용 |
| `frontend/app/(tabs)/history.tsx` | Modify | dark: 클래스 적용 |
| `frontend/app/(tabs)/map.tsx` | Modify | dark: 클래스 적용 |
| `frontend/components/ui/GlassCard.tsx` | Modify | 다크 틴트 |
| `frontend/__tests__/hooks/useTheme.test.ts` | Create | 테마 훅 테스트 |

### Sub-system B: 통계 대시보드
| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/app/statistics.tsx` | Create | 통계 대시보드 화면 |
| `frontend/hooks/useStatistics.ts` | Create | 통계 데이터 훅 |
| `frontend/api/users.ts` | Create | 유저 API (stats 엔드포인트) |
| `frontend/__tests__/hooks/useStatistics.test.ts` | Create | 통계 훅 테스트 |

### Sub-system C: 소셜 기능
| File | Action | Responsibility |
|------|--------|---------------|
| `backend-node/prisma/schema.prisma` | Modify | Follow 모델 추가 |
| `backend-node/src/users/follow.service.ts` | Create | 팔로우 비즈니스 로직 |
| `backend-node/src/users/users.controller.ts` | Modify | 팔로우 엔드포인트 |
| `backend-node/src/users/__tests__/follow.service.spec.ts` | Create | 팔로우 서비스 테스트 |
| `backend-node/src/community/community.controller.ts` | Modify | 피드 필터 엔드포인트 |
| `backend-node/src/community/community.service.ts` | Modify | 팔로잉 피드 쿼리 |
| `frontend/app/number-generation.tsx` | Modify | 커뮤니티 공유 버튼 |

### Sub-system D: 오프라인 지원
| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/hooks/useOffline.ts` | Create | 네트워크 상태 감지 + 배너 |
| `frontend/app/_layout.tsx` | Modify | 오프라인 배너 + persist 설정 |
| `frontend/__tests__/hooks/useOffline.test.ts` | Create | 오프라인 훅 테스트 |

---

## Task 1: 테마 훅 (useTheme)

**Files:**
- Create: `frontend/hooks/useTheme.ts`
- Create: `frontend/__tests__/hooks/useTheme.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/__tests__/hooks/useTheme.test.ts
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useColorScheme: jest.fn().mockReturnValue('light'),
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

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npx jest __tests__/hooks/useTheme.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Implement useTheme hook**

```typescript
// frontend/hooks/useTheme.ts
import { useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { saveItem, loadItem } from '../utils/storage';

export type ThemePreference = 'system' | 'light' | 'dark';

export function useTheme() {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePref] = useState<ThemePreference>(
    () => loadItem<ThemePreference>('app.theme') ?? 'system',
  );

  const isDark = useMemo(() => {
    if (themePreference === 'system') return systemScheme === 'dark';
    return themePreference === 'dark';
  }, [themePreference, systemScheme]);

  const setThemePreference = useCallback((pref: ThemePreference) => {
    setThemePref(pref);
    saveItem('app.theme', pref);
  }, []);

  return { themePreference, isDark, setThemePreference };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npx jest __tests__/hooks/useTheme.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/hooks/useTheme.ts frontend/__tests__/hooks/useTheme.test.ts
git commit -m "feat(frontend): useTheme 훅 구현 (시스템/라이트/다크 테마 전환)"
```

---

## Task 2: 다크모드 Tailwind 설정 + 주요 화면 적용

**Files:**
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/app/_layout.tsx`
- Modify: `frontend/app/(tabs)/mypage.tsx`
- Modify: `frontend/app/(tabs)/index.tsx`
- Modify: `frontend/components/ui/GlassCard.tsx`

- [ ] **Step 1: Read all files first**

- [ ] **Step 2: Add dark palette to tailwind.config.js**

```javascript
// frontend/tailwind.config.js — extend colors:
'dark-bg': '#121212',
'dark-surface': '#1E1E1E',
'dark-card': '#2C2C2C',
'dark-text': '#E0E0E0',
'dark-text-secondary': '#A0A0A0',
```

- [ ] **Step 3: Add theme provider to _layout.tsx**

```typescript
// ADD import:
import { useTheme } from '../hooks/useTheme';
import { View } from 'react-native';

// Inside RootLayout, wrap content with dark mode class:
const { isDark } = useTheme();

// Wrap the outer View with:
// className={isDark ? 'dark' : ''}
// style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#F5F7FA' }}
```

- [ ] **Step 4: Add theme toggle to mypage.tsx**

```typescript
// ADD import:
import { useTheme, ThemePreference } from '../../hooks/useTheme';
import { Sun, Moon, Smartphone } from 'lucide-react-native';

// Inside component:
const { themePreference, setThemePreference, isDark } = useTheme();

// ADD theme selector section after badges, before menu:
<View className="bg-white dark:bg-dark-surface rounded-2xl p-4 mb-4">
  <Text className="text-base font-bold text-text-dark dark:text-dark-text mb-3">테마 설정</Text>
  <View className="flex-row gap-2">
    {([
      { key: 'system', label: '시스템', icon: Smartphone },
      { key: 'light', label: '라이트', icon: Sun },
      { key: 'dark', label: '다크', icon: Moon },
    ] as const).map(({ key, label, icon: Icon }) => (
      <Pressable
        key={key}
        onPress={() => setThemePreference(key)}
        className={`flex-1 items-center py-3 rounded-xl ${
          themePreference === key ? 'bg-primary' : 'bg-gray-100 dark:bg-dark-card'
        }`}
      >
        <Icon size={20} color={themePreference === key ? '#fff' : isDark ? '#A0A0A0' : '#757575'} />
        <Text className={`text-xs mt-1 ${
          themePreference === key ? 'text-white font-bold' : 'text-text-grey dark:text-dark-text-secondary'
        }`}>{label}</Text>
      </Pressable>
    ))}
  </View>
</View>
```

- [ ] **Step 5: Apply dark: classes to home screen (index.tsx)**

Key changes to `frontend/app/(tabs)/index.tsx`:
- Background: `bg-[#F5F7FA]` → `bg-[#F5F7FA] dark:bg-dark-bg`
- Cards: `bg-white` → `bg-white dark:bg-dark-surface`
- Text: `text-text-dark` → `text-text-dark dark:text-dark-text`
- Secondary text: `text-text-grey` → `text-text-grey dark:text-dark-text-secondary`

- [ ] **Step 6: Update GlassCard for dark mode**

```typescript
// frontend/components/ui/GlassCard.tsx — modify tint:
// Change tint from 'light' to isDark ? 'dark' : 'light'
// Adjust background opacity for dark mode
```

- [ ] **Step 7: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add frontend/tailwind.config.js frontend/app/_layout.tsx frontend/app/\(tabs\)/mypage.tsx frontend/app/\(tabs\)/index.tsx frontend/components/ui/GlassCard.tsx
git commit -m "feat(frontend): 다크모드 구현 (Tailwind dark 팔레트, 테마 토글, 주요 화면 적용)"
```

---

## Task 3: 유저 통계 API + 훅

**Files:**
- Create: `frontend/api/users.ts`
- Create: `frontend/hooks/useStatistics.ts`
- Create: `frontend/__tests__/hooks/useStatistics.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/__tests__/hooks/useStatistics.test.ts
jest.mock('../../api/users', () => ({
  usersApi: {
    getMyStats: jest.fn().mockResolvedValue({
      totalGames: 50,
      totalWinnings: 125000,
      totalSpent: 50000,
      roi: 150,
    }),
  },
}));

import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useStatistics', () => {
  it('should provide stats and local number frequency', () => {
    const { useStatistics } = require('../../hooks/useStatistics');
    const { result } = renderHook(() => useStatistics(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('stats');
    expect(result.current).toHaveProperty('numberFrequency');
    expect(result.current).toHaveProperty('isLoading');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npx jest __tests__/hooks/useStatistics.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Create users API**

```typescript
// frontend/api/users.ts
import { apiClient } from './client';

export interface UserStats {
  totalGames: number;
  totalWinnings: number;
  totalSpent: number;
  roi: number;
}

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
};
```

- [ ] **Step 4: Create useStatistics hook**

```typescript
// frontend/hooks/useStatistics.ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { loadItem } from '../utils/storage';
import { calculateNumberFrequency } from '../utils/statistics';

interface LottoRecord {
  numbers: number[];
}

export function useStatistics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['myStats'],
    queryFn: () => usersApi.getMyStats(),
  });

  const numberFrequency = useMemo(() => {
    const records = loadItem<LottoRecord[]>('lotto.saved_numbers') ?? [];
    return calculateNumberFrequency(records.map((r) => ({
      numbers: r.numbers,
      prize: 0,
      cost: 1000,
    })));
  }, []);

  return { stats: stats ?? null, numberFrequency, isLoading };
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd frontend && npx jest __tests__/hooks/useStatistics.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/api/users.ts frontend/hooks/useStatistics.ts frontend/__tests__/hooks/useStatistics.test.ts
git commit -m "feat(frontend): 유저 통계 API 및 useStatistics 훅 구현"
```

---

## Task 4: 통계 대시보드 화면

**Files:**
- Create: `frontend/app/statistics.tsx`

- [ ] **Step 1: Install chart library**

```bash
cd frontend && npm install victory-native react-native-svg
```

- [ ] **Step 2: Create statistics screen**

```typescript
// frontend/app/statistics.tsx
import { View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useStatistics } from '../hooks/useStatistics';
import { TrendingUp, Hash, Target } from 'lucide-react-native';

export default function StatisticsScreen() {
  const { stats, numberFrequency, isLoading } = useStatistics();

  const formatCurrency = (n: number) =>
    n.toLocaleString('ko-KR') + '원';

  const topNumbers = Object.entries(numberFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-bg">
      <Stack.Screen options={{ title: '번호 분석', headerShown: true }} />
      <View className="p-4 gap-4">
        {/* Summary Cards */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-white dark:bg-dark-surface rounded-2xl p-4 items-center">
            <Target size={24} color="#4CAF50" />
            <Text className="text-2xl font-bold text-text-dark dark:text-dark-text mt-2">
              {stats?.totalGames ?? 0}
            </Text>
            <Text className="text-xs text-text-grey dark:text-dark-text-secondary">총 게임</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-dark-surface rounded-2xl p-4 items-center">
            <TrendingUp size={24} color={stats?.roi && stats.roi > 0 ? '#4CAF50' : '#E53935'} />
            <Text className="text-2xl font-bold text-text-dark dark:text-dark-text mt-2">
              {stats?.roi ? `${stats.roi > 0 ? '+' : ''}${stats.roi.toFixed(1)}%` : '0%'}
            </Text>
            <Text className="text-xs text-text-grey dark:text-dark-text-secondary">수익률</Text>
          </View>
        </View>

        {/* Winnings Card */}
        <View className="bg-white dark:bg-dark-surface rounded-2xl p-4">
          <Text className="text-base font-bold text-text-dark dark:text-dark-text mb-2">당첨 현황</Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs text-text-grey dark:text-dark-text-secondary">총 당첨금</Text>
              <Text className="text-lg font-bold text-primary">{formatCurrency(stats?.totalWinnings ?? 0)}</Text>
            </View>
            <View>
              <Text className="text-xs text-text-grey dark:text-dark-text-secondary">총 투자</Text>
              <Text className="text-lg font-bold text-text-dark dark:text-dark-text">{formatCurrency(stats?.totalSpent ?? 0)}</Text>
            </View>
          </View>
        </View>

        {/* Number Frequency */}
        <View className="bg-white dark:bg-dark-surface rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Hash size={20} color="#4CAF50" />
            <Text className="text-base font-bold text-text-dark dark:text-dark-text">자주 나온 번호 TOP 10</Text>
          </View>
          {topNumbers.length > 0 ? (
            topNumbers.map(([num, count]) => (
              <View key={num} className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
                  <Text className="text-white font-bold text-sm">{num}</Text>
                </View>
                <View className="flex-1 h-6 bg-gray-100 dark:bg-dark-card rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min((count / (topNumbers[0]?.[1] || 1)) * 100, 100)}%` }}
                  />
                </View>
                <Text className="text-sm text-text-grey dark:text-dark-text-secondary ml-2 w-8 text-right">{count}회</Text>
              </View>
            ))
          ) : (
            <Text className="text-text-grey dark:text-dark-text-secondary text-center py-4">
              아직 데이터가 없습니다. 번호를 생성해보세요!
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
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
git add frontend/app/statistics.tsx frontend/package.json frontend/package-lock.json
git commit -m "feat(frontend): 통계 대시보드 화면 구현 (수익률, 당첨 현황, 번호 빈도 TOP 10)"
```

---

## Task 5: Follow 모델 + 팔로우 서비스 (백엔드)

**Files:**
- Modify: `backend-node/prisma/schema.prisma`
- Create: `backend-node/src/users/follow.service.ts`
- Create: `backend-node/src/users/__tests__/follow.service.spec.ts`
- Modify: `backend-node/src/users/users.controller.ts`
- Modify: `backend-node/src/users/users.module.ts`

- [ ] **Step 1: Add Follow model to schema.prisma**

```prisma
model Follow {
  id          BigInt   @id @default(autoincrement())
  followerId  BigInt   @map("follower_id")
  followingId BigInt   @map("following_id")
  createdAt   DateTime @default(now()) @map("created_at")

  follower  User @relation("Followers", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("Following", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follow")
}
```

Also add to User model:
```prisma
  followers  Follow[] @relation("Following")
  following  Follow[] @relation("Followers")
```

- [ ] **Step 2: Generate migration**

```bash
cd backend-node && npx prisma migrate dev --name add-follow-model --create-only && npx prisma generate
```

- [ ] **Step 3: Write failing test for FollowService**

```typescript
// backend-node/src/users/__tests__/follow.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FollowService } from '../follow.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('FollowService', () => {
  let service: FollowService;

  const mockPrisma = {
    follow: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<FollowService>(FollowService);
    jest.clearAllMocks();
  });

  describe('toggleFollow', () => {
    it('should follow when not following', async () => {
      mockPrisma.follow.findUnique.mockResolvedValue(null);
      mockPrisma.follow.create.mockResolvedValue({ id: BigInt(1) });
      const result = await service.toggleFollow(BigInt(1), BigInt(2));
      expect(result.following).toBe(true);
      expect(mockPrisma.follow.create).toHaveBeenCalled();
    });

    it('should unfollow when already following', async () => {
      mockPrisma.follow.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPrisma.follow.delete.mockResolvedValue({});
      const result = await service.toggleFollow(BigInt(1), BigInt(2));
      expect(result.following).toBe(false);
      expect(mockPrisma.follow.delete).toHaveBeenCalled();
    });
  });

  describe('getFollowerCount', () => {
    it('should return counts', async () => {
      mockPrisma.follow.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);
      const result = await service.getCounts(BigInt(1));
      expect(result).toEqual({ followers: 10, following: 5 });
    });
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

```bash
cd backend-node && npx jest src/users/__tests__/follow.service.spec.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 5: Implement FollowService**

```typescript
// backend-node/src/users/follow.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleFollow(followerId: bigint, followingId: bigint) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      await this.prisma.follow.delete({ where: { id: existing.id } });
      return { following: false };
    }

    await this.prisma.follow.create({ data: { followerId, followingId } });
    return { following: true };
  }

  async getCounts(userId: bigint) {
    const [followers, following] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { followers, following };
  }

  async getFollowers(userId: bigint, page: number, size: number) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      skip: page * size,
      take: size,
      include: { follower: { select: { id: true, ssoQualifier: true, badges: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFollowing(userId: bigint, page: number, size: number) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      skip: page * size,
      take: size,
      include: { following: { select: { id: true, ssoQualifier: true, badges: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isFollowing(followerId: bigint, followingId: bigint): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!follow;
  }

  async getFollowingIds(userId: bigint): Promise<bigint[]> {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    return follows.map((f) => f.followingId);
  }
}
```

- [ ] **Step 6: Add follow endpoints to UsersController**

```typescript
// ADD to backend-node/src/users/users.controller.ts:
import { FollowService } from './follow.service';

// Inject in constructor:
// private readonly followService: FollowService

@Post(':id/follow')
@UseGuards(AuthGuard('jwt'))
async toggleFollow(@Param('id', ParseIntPipe) id: number, @Req() req) {
  return this.followService.toggleFollow(req.user.id, BigInt(id));
}

@Get(':id/followers')
async getFollowers(
  @Param('id', ParseIntPipe) id: number,
  @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  @Query('size', new ParseIntPipe({ optional: true })) size?: number,
) {
  return this.followService.getFollowers(BigInt(id), page ?? 0, size ?? 20);
}

@Get(':id/following')
async getFollowing(
  @Param('id', ParseIntPipe) id: number,
  @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  @Query('size', new ParseIntPipe({ optional: true })) size?: number,
) {
  return this.followService.getFollowing(BigInt(id), page ?? 0, size ?? 20);
}

@Get(':id/follow-counts')
async getFollowCounts(@Param('id', ParseIntPipe) id: number) {
  return this.followService.getCounts(BigInt(id));
}
```

- [ ] **Step 7: Register FollowService in UsersModule**

```typescript
// backend-node/src/users/users.module.ts — ADD to providers:
import { FollowService } from './follow.service';
// Add FollowService to providers and exports arrays
```

- [ ] **Step 8: Run tests**

```bash
cd backend-node && npx jest --no-coverage
```

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add backend-node/prisma/ backend-node/src/users/
git commit -m "feat(backend): Follow 모델 및 팔로우 서비스 구현 (toggle, counts, followers/following)"
```

---

## Task 6: 팔로잉 피드 + 번호 공유

**Files:**
- Modify: `backend-node/src/community/community.controller.ts`
- Modify: `backend-node/src/community/community.service.ts`
- Modify: `frontend/app/number-generation.tsx`

- [ ] **Step 1: Read existing files**

- [ ] **Step 2: Add following feed endpoint to community controller**

```typescript
// ADD to community.controller.ts:
@Get('posts/feed')
@UseGuards(AuthGuard('jwt'))
async getFeed(
  @Req() req,
  @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  @Query('size', new ParseIntPipe({ optional: true })) size?: number,
) {
  return this.communityService.getFollowingFeed(req.user.id, page ?? 0, size ?? 10);
}
```

- [ ] **Step 3: Implement getFollowingFeed in community service**

```typescript
// ADD to community.service.ts:
// Inject FollowService or import directly
async getFollowingFeed(userId: bigint, page: number, size: number) {
  const followingIds = await this.getFollowingUserIds(userId);
  if (followingIds.length === 0) return { content: [], pageNumber: page, pageSize: size, totalElements: 0, totalPages: 0 };

  const [posts, total] = await Promise.all([
    this.prisma.post.findMany({
      where: { userId: { in: followingIds } },
      skip: page * size,
      take: size,
      orderBy: { createdAt: 'desc' },
      include: { user: true, _count: { select: { comments: true } } },
    }),
    this.prisma.post.count({ where: { userId: { in: followingIds } } }),
  ]);

  const likedIds = await this.getLikedPostIds(posts.map((p) => p.id), userId);
  return {
    content: posts.map((p) => this.transformPost(p, likedIds)),
    pageNumber: page, pageSize: size, totalElements: total, totalPages: Math.ceil(total / size),
  };
}

private async getFollowingUserIds(userId: bigint): Promise<bigint[]> {
  const follows = await this.prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  return follows.map((f) => f.followingId);
}
```

Note: This requires `follow` to be accessible from PrismaService, which it already is since it's in the schema.

- [ ] **Step 4: Read number-generation.tsx, then add share button**

```typescript
// frontend/app/number-generation.tsx — ADD after save functionality:
// Add a "커뮤니티에 공유" button that navigates to create-post with pre-filled content
import { useRouter } from 'expo-router';

// After number generation result:
const handleShare = () => {
  const numbersStr = generatedNumbers.join(', ');
  router.push({
    pathname: '/create-post',
    params: {
      prefillTitle: `🍀 오늘의 로또 번호`,
      prefillContent: `추천 번호: ${numbersStr}\n\n${selectedMethod?.title} 방식으로 생성했습니다!`,
    },
  });
};

// Add share button next to save button
```

- [ ] **Step 5: Update create-post.tsx to accept prefill params**

```typescript
// frontend/app/create-post.tsx — ADD:
import { useLocalSearchParams } from 'expo-router';

// Inside component:
const { prefillTitle, prefillContent } = useLocalSearchParams<{
  prefillTitle?: string;
  prefillContent?: string;
}>();

// Initialize state with prefill:
const [title, setTitle] = useState(prefillTitle ?? '');
const [content, setContent] = useState(prefillContent ?? '');
```

- [ ] **Step 6: Run all tests**

```bash
cd backend-node && npx jest --no-coverage
cd ../frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add backend-node/src/community/ frontend/app/number-generation.tsx frontend/app/create-post.tsx
git commit -m "feat: 팔로잉 피드 엔드포인트 + 번호 생성 결과 커뮤니티 공유 기능"
```

---

## Task 7: 오프라인 지원

**Files:**
- Create: `frontend/hooks/useOffline.ts`
- Create: `frontend/__tests__/hooks/useOffline.test.ts`
- Modify: `frontend/app/_layout.tsx`

- [ ] **Step 1: Install dependencies**

```bash
cd frontend && npm install @react-native-community/netinfo @tanstack/react-query-persist-client
```

- [ ] **Step 2: Write failing test**

```typescript
// frontend/__tests__/hooks/useOffline.test.ts
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn().mockReturnValue({ isConnected: true, isInternetReachable: true }),
  addEventListener: jest.fn().mockReturnValue(jest.fn()),
}));

import { renderHook } from '@testing-library/react-native';
import { useOffline } from '../../hooks/useOffline';

describe('useOffline', () => {
  it('should report online when connected', () => {
    const { result } = renderHook(() => useOffline());
    expect(result.current.isOffline).toBe(false);
  });

  it('should report offline when disconnected', () => {
    const { useNetInfo } = require('@react-native-community/netinfo');
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: false, isInternetReachable: false });
    const { result } = renderHook(() => useOffline());
    expect(result.current.isOffline).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd frontend && npx jest __tests__/hooks/useOffline.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 4: Implement useOffline hook**

```typescript
// frontend/hooks/useOffline.ts
import { useNetInfo } from '@react-native-community/netinfo';

export function useOffline() {
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;

  return { isOffline, netInfo };
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd frontend && npx jest __tests__/hooks/useOffline.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 6: Add offline banner and query persistence to _layout.tsx**

```typescript
// frontend/app/_layout.tsx — ADD:
import { useOffline } from '../hooks/useOffline';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { MMKV } from 'react-native-mmkv';

// Create persister outside component:
const storage = new MMKV({ id: 'query-cache' });
const persister = createSyncStoragePersister({
  storage: {
    getItem: (key: string) => storage.getString(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

// Inside RootLayout:
const { isOffline } = useOffline();

// Replace QueryClientProvider with PersistQueryClientProvider:
// <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>

// Add offline banner before Stack:
{isOffline && (
  <View className="bg-yellow-500 px-4 py-2">
    <Text className="text-white text-center text-sm font-bold">📡 오프라인 모드 — 캐시된 데이터를 표시합니다</Text>
  </View>
)}
```

- [ ] **Step 7: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add frontend/hooks/useOffline.ts frontend/__tests__/hooks/useOffline.test.ts frontend/app/_layout.tsx frontend/package.json frontend/package-lock.json
git commit -m "feat(frontend): 오프라인 지원 (쿼리 캐시 영속화, 오프라인 배너, NetInfo 감지)"
```

---

## Summary

| Task | Description | Sub-system | Dependencies |
|------|-------------|-----------|-------------|
| 1 | useTheme 훅 | A (다크모드) | None |
| 2 | 다크모드 Tailwind + 화면 적용 | A (다크모드) | Task 1 |
| 3 | 유저 통계 API + 훅 | B (통계) | None |
| 4 | 통계 대시보드 화면 | B (통계) | Task 3 |
| 5 | Follow 모델 + 서비스 | C (소셜) | None |
| 6 | 팔로잉 피드 + 번호 공유 | C (소셜) | Task 5 |
| 7 | 오프라인 지원 | D (오프라인) | None |

**병렬 실행 가능:** A(1→2) ∥ B(3→4) ∥ C(5→6) ∥ D(7)
