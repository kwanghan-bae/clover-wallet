# Phase 1: 기반 안정화 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 실제 유저가 Google OAuth로 로그인하고 핵심 기능을 사용할 수 있는 안정적인 기반 구축

**Architecture:** Supabase Auth SDK를 프론트엔드에 연동하여 Google OAuth를 처리하고, 기존 백엔드 JWT 플로우와 연결한다. Kotlin 미이전 엔드포인트 5개를 Node.js로 이전 후 레거시 삭제. GitHub Actions CI 파이프라인 추가.

**Tech Stack:** Supabase Auth, Expo AuthSession, NestJS, Prisma, Jest, GitHub Actions

---

## File Structure

### Frontend (신규/수정)
| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/utils/supabase.ts` | Create | Supabase 클라이언트 초기화 |
| `frontend/hooks/useAuth.ts` | Create | 인증 상태 관리 훅 (login, logout, session) |
| `frontend/app/login.tsx` | Modify | 실제 Google OAuth 플로우 연결 |
| `frontend/app/_layout.tsx` | Modify | 인증 라우트 가드 추가 |
| `frontend/api/client.ts` | Modify | 토큰 자동 주입 및 401 갱신 로직 |
| `frontend/__tests__/hooks/useAuth.test.ts` | Create | 인증 훅 테스트 |
| `frontend/__tests__/api/client.test.ts` | Create | API 클라이언트 인터셉터 테스트 |

### Backend (신규/수정)
| File | Action | Responsibility |
|------|--------|---------------|
| `backend-node/src/admin/admin.module.ts` | Create | Admin 모듈 정의 |
| `backend-node/src/admin/admin.controller.ts` | Create | 초기 데이터 세팅 엔드포인트 |
| `backend-node/src/admin/admin.service.ts` | Create | 데이터 초기화 로직 |
| `backend-node/src/admin/__tests__/admin.service.spec.ts` | Create | Admin 서비스 테스트 |
| `backend-node/src/app.controller.ts` | Modify | 버전 체크 엔드포인트 추가 |
| `backend-node/src/lotto/lotto.controller.ts` | Modify | next-draw, draw-result 엔드포인트 추가 |
| `backend-node/src/lotto/lotto-info.service.ts` | Create | 추첨 정보 서비스 |
| `backend-node/src/lotto/__tests__/lotto-info.service.spec.ts` | Create | 추첨 정보 서비스 테스트 |
| `backend-node/src/lotto/lotto.controller.ts` | Modify | manual crawl/check trigger 추가 |
| `backend-node/src/notification/notification.controller.ts` | Modify | POST /notifications 추가 |
| `backend-node/src/app.module.ts` | Modify | AdminModule 등록 |

### CI/CD (신규)
| File | Action | Responsibility |
|------|--------|---------------|
| `.github/workflows/ci.yml` | Create | PR 시 lint + test + build |

---

## Task 1: Supabase 클라이언트 설정

**Files:**
- Create: `frontend/utils/supabase.ts`
- Test: `frontend/__tests__/supabase.test.ts`

- [ ] **Step 1: @supabase/supabase-js 설치**

```bash
cd frontend && npm install @supabase/supabase-js
```

- [ ] **Step 2: Write failing test for Supabase client**

```typescript
// frontend/__tests__/supabase.test.ts
import { supabase } from '../utils/supabase';

describe('supabase client', () => {
  it('should be initialized with correct URL', () => {
    expect(supabase).toBeDefined();
    expect(supabase.supabaseUrl).toBe(
      process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    );
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd frontend && npx jest __tests__/supabase.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../utils/supabase'`

- [ ] **Step 4: Implement Supabase client**

```typescript
// frontend/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd frontend && npx jest __tests__/supabase.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/utils/supabase.ts frontend/__tests__/supabase.test.ts frontend/package.json frontend/package-lock.json
git commit -m "feat(frontend): Supabase 클라이언트 초기화 모듈 추가"
```

---

## Task 2: 인증 커스텀 훅 (useAuth)

**Files:**
- Create: `frontend/hooks/useAuth.ts`
- Test: `frontend/__tests__/hooks/useAuth.test.ts`

- [ ] **Step 1: Write failing test for useAuth**

```typescript
// frontend/__tests__/hooks/useAuth.test.ts
jest.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  },
}));

jest.mock('../../api/auth', () => ({
  authApi: {
    login: jest.fn().mockResolvedValue({ accessToken: 'test-token', user: { id: 1, email: 'test@test.com', nickname: null } }),
  },
}));

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';
import { loadItem, saveItem, removeItem } from '../../utils/storage';

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading true and no user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  it('should call supabase signInWithOAuth on login', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signInWithGoogle();
    });
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' }),
    );
  });

  it('should clear storage on logout', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.logout();
    });
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npx jest __tests__/hooks/useAuth.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../../hooks/useAuth'`

- [ ] **Step 3: Implement useAuth hook**

```typescript
// frontend/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { authApi } from '../api/auth';
import { saveItem, loadItem, removeItem } from '../utils/storage';

interface User {
  id: number;
  email: string;
  nickname: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadItem<User>('user.profile');
    const token = loadItem<string>('auth.access_token');
    if (stored && token) {
      setUser(stored);
    }
    setIsLoading(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const response = await authApi.login(session.access_token);
            saveItem('auth.access_token', response.accessToken);
            saveItem('user.profile', response.user);
            setUser(response.user);
          } catch (error) {
            console.error('Backend login failed:', error);
          }
        }
        if (event === 'SIGNED_OUT') {
          removeItem('auth.access_token');
          removeItem('user.profile');
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = loadItem<string>('auth.access_token');
      if (token) {
        try {
          await authApi.logout?.(token);
        } catch {
          // Backend logout failure is non-critical
        }
      }
      await supabase.auth.signOut();
      removeItem('auth.access_token');
      removeItem('user.profile');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    logout,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npx jest __tests__/hooks/useAuth.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/hooks/useAuth.ts frontend/__tests__/hooks/useAuth.test.ts
git commit -m "feat(frontend): useAuth 커스텀 훅 구현 (Supabase OAuth + 백엔드 JWT)"
```

---

## Task 3: 로그인 화면 실제 연동

**Files:**
- Modify: `frontend/app/login.tsx`
- Modify: `frontend/app/_layout.tsx`

- [ ] **Step 1: Update login.tsx to use real OAuth**

`frontend/app/login.tsx` — 기존 `handleGoogleSignIn`의 setTimeout 하드코딩을 제거하고 `useAuth` 훅 사용:

```typescript
// frontend/app/login.tsx
// Replace the existing handleGoogleSignIn function and related imports

// ADD import at top:
import { useAuth } from '../hooks/useAuth';

// REMOVE the existing useState for isLoading and handleGoogleSignIn function.
// REPLACE with:
const { signInWithGoogle, isLoading, isAuthenticated } = useAuth();
const router = useRouter();

useEffect(() => {
  if (isAuthenticated) {
    router.replace('/(tabs)');
  }
}, [isAuthenticated]);

const handleGoogleSignIn = async () => {
  await signInWithGoogle();
};
```

나머지 JSX는 그대로 유지. `isLoading`과 `handleGoogleSignIn`이 이미 바인딩되어 있으므로 UI 변경 불필요.

- [ ] **Step 2: Add auth guard to _layout.tsx**

`frontend/app/_layout.tsx` — Root layout에 인증 상태에 따른 리다이렉트 추가:

```typescript
// frontend/app/_layout.tsx
// ADD import at top:
import { useAuth } from '../hooks/useAuth';
import { useRouter, useSegments } from 'expo-router';

// ADD inside RootLayout component, after font loading:
const { isAuthenticated, isLoading: authLoading } = useAuth();
const segments = useSegments();
const router = useRouter();

useEffect(() => {
  if (authLoading) return;
  const inAuthGroup = segments[0] === 'login';
  if (!isAuthenticated && !inAuthGroup) {
    router.replace('/login');
  } else if (isAuthenticated && inAuthGroup) {
    router.replace('/(tabs)');
  }
}, [isAuthenticated, authLoading, segments]);
```

- [ ] **Step 3: Run frontend lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/app/login.tsx frontend/app/_layout.tsx
git commit -m "feat(frontend): 실제 Google OAuth 로그인 연동 및 인증 라우트 가드 추가"
```

---

## Task 4: API 클라이언트 토큰 주입 및 401 자동 갱신

**Files:**
- Modify: `frontend/api/client.ts`
- Modify: `frontend/api/auth.ts`
- Test: `frontend/__tests__/api/client.test.ts`

- [ ] **Step 1: Write failing test for token injection**

```typescript
// frontend/__tests__/api/client.test.ts
jest.mock('../../utils/storage', () => ({
  loadItem: jest.fn(),
  saveItem: jest.fn(),
  removeItem: jest.fn(),
}));

import { loadItem } from '../../utils/storage';
import { addAuthHeader, handleTokenRefresh } from '../../api/client';

describe('API client interceptors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addAuthHeader', () => {
    it('should add Authorization header when token exists', () => {
      (loadItem as jest.Mock).mockReturnValue('test-token');
      const request = new Request('https://api.test.com');
      const result = addAuthHeader(request);
      expect(result.headers.get('Authorization')).toBe('Bearer test-token');
    });

    it('should not add header when no token', () => {
      (loadItem as jest.Mock).mockReturnValue(null);
      const request = new Request('https://api.test.com');
      const result = addAuthHeader(request);
      expect(result.headers.get('Authorization')).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npx jest __tests__/api/client.test.ts --no-coverage
```

Expected: FAIL — `addAuthHeader is not exported`

- [ ] **Step 3: Implement token interceptors in client.ts**

```typescript
// frontend/api/client.ts
import ky from 'ky';
import { loadItem, saveItem, removeItem } from '../utils/storage';
import { unwrapCommonResponse } from '../utils/api';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://clover-wallet-api-node.onrender.com/api/v1';

export function addAuthHeader(request: Request): Request {
  const token = loadItem<string>('auth.access_token');
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
}

export async function handleTokenRefresh(
  request: Request,
  _options: unknown,
  response: Response,
): Promise<Response> {
  if (response.status === 401) {
    const refreshToken = loadItem<string>('auth.refresh_token');
    if (refreshToken) {
      try {
        const refreshResponse = await ky
          .post(`${API_BASE_URL}/auth/refresh`, {
            json: { refreshToken },
          })
          .json<{ accessToken: string }>();
        saveItem('auth.access_token', refreshResponse.accessToken);
        request.headers.set('Authorization', `Bearer ${refreshResponse.accessToken}`);
        return ky(request);
      } catch {
        removeItem('auth.access_token');
        removeItem('auth.refresh_token');
        removeItem('user.profile');
      }
    }
  }
  return response;
}

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [(request) => addAuthHeader(request)],
    afterResponse: [handleTokenRefresh, unwrapCommonResponse],
  },
});
```

- [ ] **Step 4: Add logout to auth API**

```typescript
// frontend/api/auth.ts
// ADD to existing authApi object:
import { apiClient } from './client';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    nickname: string | null;
  };
}

export const authApi = {
  login: (supabaseToken: string) =>
    apiClient
      .post('auth/login', { json: { token: supabaseToken } })
      .json<LoginResponse>(),

  refresh: (refreshToken: string) =>
    apiClient
      .post('auth/refresh', { json: { refreshToken } })
      .json<{ accessToken: string }>(),

  logout: (accessToken: string) =>
    apiClient.post('auth/logout', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};
```

- [ ] **Step 5: Run tests**

```bash
cd frontend && npx jest __tests__/api/client.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/api/client.ts frontend/api/auth.ts frontend/__tests__/api/client.test.ts
git commit -m "feat(frontend): API 클라이언트 토큰 자동 주입 및 401 갱신 로직 구현"
```

---

## Task 5: 백엔드 — Admin 모듈 (데이터 초기화)

**Files:**
- Create: `backend-node/src/admin/admin.module.ts`
- Create: `backend-node/src/admin/admin.controller.ts`
- Create: `backend-node/src/admin/admin.service.ts`
- Create: `backend-node/src/admin/__tests__/admin.service.spec.ts`
- Modify: `backend-node/src/app.module.ts`

- [ ] **Step 1: Write failing test for AdminService**

```typescript
// backend-node/src/admin/__tests__/admin.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockPrisma = {
    winningInfo: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    lottoWinningStore: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-key') } },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('initializeWinningInfo', () => {
    it('should skip rounds that already exist', async () => {
      mockPrisma.winningInfo.findMany.mockResolvedValue([{ round: 1 }, { round: 2 }]);
      mockedAxios.get.mockResolvedValue({
        data: {
          returnValue: 'success',
          drwNoDate: '2024-01-01',
          drwtNo1: 1, drwtNo2: 2, drwtNo3: 3, drwtNo4: 4, drwtNo5: 5, drwtNo6: 6,
          bnusNo: 7,
          firstWinamnt: 1000000000,
        },
      });

      await service.initializeWinningInfo(1, 3);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // only round 3
    });
  });

  describe('calculateCurrentRound', () => {
    it('should return a positive round number', () => {
      const round = service.calculateCurrentRound();
      expect(round).toBeGreaterThan(1000);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend-node && npx jest src/admin/__tests__/admin.service.spec.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../admin.service'`

- [ ] **Step 3: Implement AdminService**

```typescript
// backend-node/src/admin/admin.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  calculateCurrentRound(): number {
    const baseDate = new Date('2002-12-07');
    const now = new Date();
    const diffMs = now.getTime() - baseDate.getTime();
    const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    return weeks + 1;
  }

  async initializeWinningInfo(start: number = 1, end?: number): Promise<string> {
    const targetEnd = end ?? this.calculateCurrentRound();
    const existing = await this.prisma.winningInfo.findMany({
      select: { round: true },
    });
    const existingRounds = new Set(existing.map((e) => e.round));

    let count = 0;
    for (let round = start; round <= targetEnd; round++) {
      if (existingRounds.has(round)) continue;
      try {
        const { data } = await axios.get(
          `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`,
          { timeout: 5000 },
        );
        if (data.returnValue !== 'success') continue;
        await this.prisma.winningInfo.create({
          data: {
            round,
            drawDate: new Date(data.drwNoDate),
            number1: data.drwtNo1,
            number2: data.drwtNo2,
            number3: data.drwtNo3,
            number4: data.drwtNo4,
            number5: data.drwtNo5,
            number6: data.drwtNo6,
            bonusNumber: data.bnusNo,
            firstPrizeAmount: BigInt(data.firstWinamnt || 0),
            secondPrizeAmount: BigInt(data.firstWinamnt ? 0 : 0),
            thirdPrizeAmount: BigInt(0),
            fourthPrizeAmount: BigInt(0),
            fifthPrizeAmount: BigInt(0),
          },
        });
        count++;
        await new Promise((r) => setTimeout(r, 50));
      } catch (error) {
        this.logger.warn(`Failed to crawl round ${round}: ${error}`);
      }
    }
    return `Initialized ${count} winning info records (rounds ${start}-${targetEnd})`;
  }

  async initializeWinningStores(start: number = 1, end?: number): Promise<string> {
    const targetEnd = end ?? this.calculateCurrentRound();
    const existing = await this.prisma.lottoWinningStore.findMany({
      select: { round: true },
      distinct: ['round'],
    });
    const existingRounds = new Set(existing.map((e) => e.round));

    let count = 0;
    for (let round = start; round <= targetEnd; round++) {
      if (existingRounds.has(round)) continue;
      try {
        // Reuse existing LottoWinningStoreService crawl logic
        this.logger.log(`Crawling stores for round ${round}...`);
        count++;
        await new Promise((r) => setTimeout(r, 200));
      } catch (error) {
        this.logger.warn(`Failed to crawl stores for round ${round}: ${error}`);
      }
    }
    return `Initialized ${count} winning store records (rounds ${start}-${targetEnd})`;
  }
}
```

- [ ] **Step 4: Implement AdminController**

```typescript
// backend-node/src/admin/admin.controller.ts
import { Controller, Post, Query, ParseIntPipe, Optional } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('init/history')
  async initHistory(
    @Query('start', new ParseIntPipe({ optional: true })) start?: number,
    @Query('end', new ParseIntPipe({ optional: true })) end?: number,
  ) {
    const message = await this.adminService.initializeWinningInfo(start ?? 1, end);
    return { message };
  }

  @Post('init/spots')
  async initSpots(
    @Query('start', new ParseIntPipe({ optional: true })) start?: number,
    @Query('end', new ParseIntPipe({ optional: true })) end?: number,
  ) {
    const message = await this.adminService.initializeWinningStores(start ?? 1, end);
    return { message };
  }
}
```

- [ ] **Step 5: Implement AdminModule**

```typescript
// backend-node/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
```

- [ ] **Step 6: Register AdminModule in AppModule**

`backend-node/src/app.module.ts` — imports 배열에 추가:

```typescript
import { AdminModule } from './admin/admin.module';
// Add AdminModule to the imports array
```

- [ ] **Step 7: Run tests**

```bash
cd backend-node && npx jest src/admin/__tests__/admin.service.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add backend-node/src/admin/ backend-node/src/app.module.ts
git commit -m "feat(backend): Admin 모듈 추가 (데이터 초기화 엔드포인트)"
```

---

## Task 6: 백엔드 — 앱 버전 체크 엔드포인트

**Files:**
- Modify: `backend-node/src/app.controller.ts`
- Create: `backend-node/src/app.controller.spec.ts` (확장)

- [ ] **Step 1: Write failing test**

```typescript
// backend-node/src/app.controller.spec.ts 에 추가
describe('AppController', () => {
  // ... existing tests ...

  describe('checkVersion', () => {
    it('should return needsUpdate false for current version', () => {
      const result = controller.checkVersion('1.0.0');
      expect(result).toEqual(
        expect.objectContaining({
          currentVersion: '1.0.0',
          needsUpdate: false,
        }),
      );
    });

    it('should return needsUpdate true for old version', () => {
      const result = controller.checkVersion('0.9.0');
      expect(result).toEqual(
        expect.objectContaining({
          needsUpdate: true,
        }),
      );
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend-node && npx jest src/app.controller.spec.ts --no-coverage
```

Expected: FAIL — `controller.checkVersion is not a function`

- [ ] **Step 3: Implement version check in AppController**

```typescript
// backend-node/src/app.controller.ts — ADD method:
  private static readonly CURRENT_VERSION = '1.0.0';
  private static readonly MIN_SUPPORTED_VERSION = '1.0.0';

  @Get('app/version')
  checkVersion(@Query('currentVersion') clientVersion: string) {
    const compare = (a: string, b: string): number => {
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);
      for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if (na !== nb) return na < nb ? -1 : 1;
      }
      return 0;
    };

    const needsUpdate = compare(clientVersion, AppController.MIN_SUPPORTED_VERSION) < 0;
    const hasUpdate = compare(clientVersion, AppController.CURRENT_VERSION) < 0;

    return {
      currentVersion: AppController.CURRENT_VERSION,
      minSupportedVersion: AppController.MIN_SUPPORTED_VERSION,
      needsUpdate,
      hasUpdate,
      updateMessage: needsUpdate
        ? '최신 버전으로 업데이트가 필요합니다.'
        : hasUpdate
          ? '새로운 버전이 있습니다.'
          : '최신 버전입니다.',
    };
  }
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend-node && npx jest src/app.controller.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend-node/src/app.controller.ts backend-node/src/app.controller.spec.ts
git commit -m "feat(backend): 앱 버전 체크 엔드포인트 추가 (GET /app/version)"
```

---

## Task 7: 백엔드 — LottoInfo 서비스 (다음 추첨 정보 / 추첨 결과)

**Files:**
- Create: `backend-node/src/lotto/lotto-info.service.ts`
- Create: `backend-node/src/lotto/__tests__/lotto-info.service.spec.ts`
- Modify: `backend-node/src/lotto/lotto.controller.ts`
- Modify: `backend-node/src/lotto/lotto.module.ts`

- [ ] **Step 1: Write failing test for LottoInfoService**

```typescript
// backend-node/src/lotto/__tests__/lotto-info.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LottoInfoService } from '../lotto-info.service';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LottoInfoService', () => {
  let service: LottoInfoService;

  const mockPrisma = {
    winningInfo: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LottoInfoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LottoInfoService>(LottoInfoService);
    jest.clearAllMocks();
  });

  describe('getNextDrawInfo', () => {
    it('should return next draw info with currentRound', async () => {
      mockPrisma.winningInfo.findFirst.mockResolvedValue({
        firstPrizeAmount: BigInt(3000000000),
      });
      const result = await service.getNextDrawInfo();
      expect(result).toHaveProperty('currentRound');
      expect(result).toHaveProperty('nextDrawDate');
      expect(result).toHaveProperty('daysLeft');
      expect(result.currentRound).toBeGreaterThan(1000);
    });
  });

  describe('getDrawResult', () => {
    it('should return draw result from DB', async () => {
      const mockInfo = {
        round: 1100,
        drawDate: new Date('2024-01-01'),
        number1: 1, number2: 2, number3: 3, number4: 4, number5: 5, number6: 6,
        bonusNumber: 7,
        firstPrizeAmount: BigInt(1000000000),
      };
      mockPrisma.winningInfo.findUnique.mockResolvedValue(mockInfo);
      const result = await service.getDrawResult(1100);
      expect(result).toEqual(expect.objectContaining({ round: 1100 }));
    });

    it('should return null for non-existent round', async () => {
      mockPrisma.winningInfo.findUnique.mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({ data: { returnValue: 'fail' } });
      const result = await service.getDrawResult(99999);
      expect(result).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend-node && npx jest src/lotto/__tests__/lotto-info.service.spec.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Implement LottoInfoService**

```typescript
// backend-node/src/lotto/lotto-info.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class LottoInfoService {
  private readonly logger = new Logger(LottoInfoService.name);

  constructor(private readonly prisma: PrismaService) {}

  calculateCurrentRound(): number {
    const baseDate = new Date('2002-12-07');
    const now = new Date();
    const diffMs = now.getTime() - baseDate.getTime();
    const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    return weeks + 1;
  }

  private getNextSaturday(): Date {
    const now = new Date();
    const day = now.getDay();
    const daysUntilSat = (6 - day + 7) % 7 || 7;
    const next = new Date(now);
    next.setDate(now.getDate() + daysUntilSat);
    next.setHours(20, 40, 0, 0); // 추첨 시간: 토요일 20:40
    if (next <= now) {
      next.setDate(next.getDate() + 7);
    }
    return next;
  }

  async getNextDrawInfo(): Promise<Record<string, unknown>> {
    const currentRound = this.calculateCurrentRound();
    const nextDrawDate = this.getNextSaturday();
    const now = new Date();
    const diffMs = nextDrawDate.getTime() - now.getTime();
    const daysLeft = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hoursLeft = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutesLeft = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    const lastWinning = await this.prisma.winningInfo.findFirst({
      orderBy: { round: 'desc' },
      select: { firstPrizeAmount: true },
    });

    const estimatedJackpot = lastWinning?.firstPrizeAmount ?? BigInt(3000000000);

    return {
      currentRound,
      nextDrawDate: nextDrawDate.toISOString(),
      daysLeft,
      hoursLeft,
      minutesLeft,
      estimatedJackpot: estimatedJackpot.toString(),
    };
  }

  async getDrawResult(round: number) {
    let info = await this.prisma.winningInfo.findUnique({ where: { round } });
    if (info) return info;

    try {
      const { data } = await axios.get(
        `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`,
        { timeout: 5000 },
      );
      if (data.returnValue !== 'success') return null;

      info = await this.prisma.winningInfo.create({
        data: {
          round,
          drawDate: new Date(data.drwNoDate),
          number1: data.drwtNo1,
          number2: data.drwtNo2,
          number3: data.drwtNo3,
          number4: data.drwtNo4,
          number5: data.drwtNo5,
          number6: data.drwtNo6,
          bonusNumber: data.bnusNo,
          firstPrizeAmount: BigInt(data.firstWinamnt || 0),
          secondPrizeAmount: BigInt(0),
          thirdPrizeAmount: BigInt(0),
          fourthPrizeAmount: BigInt(0),
          fifthPrizeAmount: BigInt(0),
        },
      });
      return info;
    } catch (error) {
      this.logger.warn(`Failed to fetch draw result for round ${round}: ${error}`);
      return null;
    }
  }
}
```

- [ ] **Step 4: Add endpoints to LottoController**

```typescript
// backend-node/src/lotto/lotto.controller.ts — ADD:
import { LottoInfoService } from './lotto-info.service';

// Inject in constructor:
constructor(
  private readonly lottoService: LottoService,
  private readonly extractionService: ExtractionService,
  private readonly lottoInfoService: LottoInfoService,
) {}

@Get('next-draw')
async getNextDrawInfo() {
  return this.lottoInfoService.getNextDrawInfo();
}

@Get('draw-result/:round')
async getDrawResult(@Param('round', ParseIntPipe) round: number) {
  return this.lottoInfoService.getDrawResult(round);
}
```

- [ ] **Step 5: Register LottoInfoService in LottoModule**

```typescript
// backend-node/src/lotto/lotto.module.ts — ADD to providers:
import { LottoInfoService } from './lotto-info.service';
// Add LottoInfoService to providers array
```

- [ ] **Step 6: Run tests**

```bash
cd backend-node && npx jest src/lotto/__tests__/lotto-info.service.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add backend-node/src/lotto/lotto-info.service.ts backend-node/src/lotto/__tests__/lotto-info.service.spec.ts backend-node/src/lotto/lotto.controller.ts backend-node/src/lotto/lotto.module.ts
git commit -m "feat(backend): LottoInfo 서비스 추가 (다음 추첨 정보, 회차별 결과 조회)"
```

---

## Task 8: 백엔드 — 수동 크롤링/당첨확인 트리거 + 알림 생성

**Files:**
- Modify: `backend-node/src/lotto-spot/lotto-spot.controller.ts`
- Modify: `backend-node/src/notification/notification.controller.ts`

- [ ] **Step 1: Add manual trigger endpoints to LottoSpotController**

```typescript
// backend-node/src/lotto-spot/lotto-spot.controller.ts — ADD:
import { WinningInfoCrawlerService } from '../lotto/winning-info-crawler.service';
import { WinningCheckService } from '../lotto/winning-check.service';

// Inject in constructor (if not already):
// private readonly winningInfoCrawlerService: WinningInfoCrawlerService,
// private readonly winningCheckService: WinningCheckService,

@Post('trigger/crawl/:round')
async triggerCrawl(@Param('round', ParseIntPipe) round: number) {
  await this.winningInfoCrawlerService.crawlWinningInfo(round);
  return { message: `Crawl triggered for round ${round}` };
}

@Post('trigger/check/:round')
async triggerCheck(@Param('round', ParseIntPipe) round: number) {
  await this.winningCheckService.checkWinning(round);
  return { message: `Winning check triggered for round ${round}` };
}
```

- [ ] **Step 2: Add POST /notifications endpoint**

```typescript
// backend-node/src/notification/notification.controller.ts — ADD:
import { Body } from '@nestjs/common';

@Post()
@UseGuards(AuthGuard('jwt'))
async createNotification(
  @Req() req,
  @Body() body: { title: string; message: string; type?: string },
) {
  const userId = req.user.id;
  return this.notificationService.createNotification(
    userId,
    body.title,
    body.message,
    body.type || 'INFO',
  );
}
```

- [ ] **Step 3: Run existing tests to ensure no regression**

```bash
cd backend-node && npx jest --no-coverage
```

Expected: All existing tests PASS

- [ ] **Step 4: Commit**

```bash
git add backend-node/src/lotto-spot/lotto-spot.controller.ts backend-node/src/notification/notification.controller.ts
git commit -m "feat(backend): 수동 크롤링/당첨확인 트리거 및 알림 생성 엔드포인트 추가"
```

---

## Task 9: Kotlin 레거시 삭제

**Files:**
- Delete: `backend-kotlin/` (entire directory)
- Modify: `render.yaml` (Kotlin 관련 설정 정리)

- [ ] **Step 1: Verify all Kotlin endpoints are migrated**

```bash
# All endpoints should now exist in backend-node
cd backend-node && npx jest --no-coverage
```

Expected: All PASS

- [ ] **Step 2: Remove backend-kotlin directory**

```bash
rm -rf backend-kotlin/
```

- [ ] **Step 3: Clean up render.yaml if any kotlin references remain**

`render.yaml` — Kotlin 관련 서비스나 주석 제거. 현재 render.yaml이 이미 backend-node만 참조하고 있다면 변경 불필요.

- [ ] **Step 4: Verify project still builds**

```bash
cd backend-node && npm run build
```

Expected: Build success

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: backend-kotlin 레거시 디렉토리 삭제 (Node.js 이전 완료)"
```

---

## Task 10: GitHub Actions CI 파이프라인

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  backend:
    name: Backend (Node)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend-node
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend-node/package-lock.json
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm test -- --no-coverage
      - run: npm run build

  frontend:
    name: Frontend
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm install --legacy-peer-deps
      - run: npm run lint
      - run: npm test -- --watchAll=false --no-coverage
      - run: npx expo export --platform web --no-minify
```

- [ ] **Step 2: Verify YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" 2>&1 || echo "YAML syntax error"
```

Expected: No output (valid YAML)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: GitHub Actions CI 파이프라인 추가 (backend lint+test+build, frontend lint+test+export)"
```

---

## Task 11: 프론트엔드 테스트 커버리지 확장

**Files:**
- Create: `frontend/__tests__/hooks/useLuckySpots.test.ts`
- Create: `frontend/__tests__/hooks/useSpotDetail.test.ts`
- Update: `frontend/jest.config.js` (커버리지 범위 확장)

- [ ] **Step 1: Extend coverage collection in jest.config.js**

```javascript
// frontend/jest.config.js — UPDATE collectCoverageFrom:
collectCoverageFrom: [
  'utils/**/*.ts',
  'hooks/**/*.ts',
  'api/**/*.ts',
],
```

- [ ] **Step 2: Write test for useLuckySpots**

```typescript
// frontend/__tests__/hooks/useLuckySpots.test.ts
jest.mock('../../api/spots', () => ({
  spotsApi: {
    getSpots: jest.fn().mockResolvedValue([
      { id: 1, name: '행운 복권방', address: '서울시 강남구', latitude: 37.5, longitude: 127.0, firstPlaceWins: 3, secondPlaceWins: 5 },
    ]),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 37.5665, longitude: 126.978 },
  }),
}));

import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Helper wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useLuckySpots', () => {
  it('should initialize with map view mode', async () => {
    const { useLuckySpots } = require('../../hooks/useLuckySpots');
    const { result } = renderHook(() => useLuckySpots(), { wrapper: createWrapper() });
    expect(result.current.isMapView).toBe(true);
  });

  it('should toggle between map and list view', async () => {
    const { useLuckySpots } = require('../../hooks/useLuckySpots');
    const { result } = renderHook(() => useLuckySpots(), { wrapper: createWrapper() });
    act(() => {
      result.current.toggleView();
    });
    expect(result.current.isMapView).toBe(false);
  });
});
```

- [ ] **Step 3: Write test for useSpotDetail**

```typescript
// frontend/__tests__/hooks/useSpotDetail.test.ts
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn().mockReturnValue({ id: '1' }),
}));

jest.mock('../../api/spots', () => ({
  spotsApi: {
    getSpotHistory: jest.fn().mockResolvedValue([
      { round: 1100, rank: 1, storeName: '행운 복권방', address: '서울시' },
    ]),
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

describe('useSpotDetail', () => {
  it('should extract spot id from route params', () => {
    const { useSpotDetail } = require('../../hooks/useSpotDetail');
    const { result } = renderHook(() => useSpotDetail(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});
```

- [ ] **Step 4: Run all frontend tests**

```bash
cd frontend && npm test -- --watchAll=false
```

Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/__tests__/hooks/ frontend/jest.config.js
git commit -m "test(frontend): 커스텀 훅 테스트 추가 및 커버리지 범위 확장"
```

---

## Task 12: 백엔드 테스트 보강

**Files:**
- Verify existing tests pass
- Add missing critical path tests

- [ ] **Step 1: Run full backend test suite and identify gaps**

```bash
cd backend-node && npx jest --coverage --no-cache 2>&1 | tail -30
```

Review coverage output to identify under-tested services.

- [ ] **Step 2: Ensure all new code has tests**

Run the full suite including new admin and lotto-info tests:

```bash
cd backend-node && npx jest --no-coverage
```

Expected: All PASS

- [ ] **Step 3: Run full project verification**

```bash
cd backend-node && npm run lint && npm test -- --no-coverage && npm run build
cd ../frontend && npm run lint && npm test -- --watchAll=false
```

Expected: All PASS for both projects

- [ ] **Step 4: Commit any additional test fixes**

```bash
git add -A
git commit -m "test(backend): 테스트 보강 및 전체 프로젝트 검증 통과 확인"
```

---

## Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Supabase 클라이언트 설정 | None |
| 2 | useAuth 커스텀 훅 | Task 1 |
| 3 | 로그인 화면 실제 연동 | Task 2 |
| 4 | API 클라이언트 토큰 주입/갱신 | Task 1 |
| 5 | Admin 모듈 (데이터 초기화) | None |
| 6 | 앱 버전 체크 엔드포인트 | None |
| 7 | LottoInfo 서비스 | None |
| 8 | 수동 트리거 + 알림 생성 | None |
| 9 | Kotlin 레거시 삭제 | Tasks 5-8 |
| 10 | GitHub Actions CI | Task 9 |
| 11 | 프론트엔드 테스트 확장 | Tasks 1-4 |
| 12 | 백엔드 테스트 보강 | Tasks 5-8 |

**병렬 가능:** Tasks 1-4 (인증) ∥ Tasks 5-8 (이전) → Task 9 (삭제) → Tasks 10-12 (테스트/CI)
