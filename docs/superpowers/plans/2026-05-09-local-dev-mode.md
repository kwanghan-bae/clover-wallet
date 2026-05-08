# 로컬 개발 모드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** OAuth 우회로 로그인 없이 앱 기능을 테스트할 수 있는 로컬 개발 모드를 추가한다 (`npm run dev:local` 한 명령으로 백엔드 + 프론트 동시 기동, Ctrl-C로 일괄 종료).

**Architecture:** 3개 컴포넌트 — (1) `NODE_ENV !== 'production' && DEV_AUTH_ENABLED=true`일 때만 등록되는 백엔드 `POST /auth/dev-login` 엔드포인트, (2) `__DEV__ && EXPO_PUBLIC_DEV_AUTH_BYPASS=true`일 때 자동 로그인하는 프론트 부트 분기, (3) 가비지 정리 + 자식 그룹 트랩으로 클린 종료하는 `scripts/dev-local.sh`. 4중 게이팅(NODE_ENV / DEV_AUTH_ENABLED / __DEV__ / 빌드 가드)으로 prod 사고 방지.

**Tech Stack:** NestJS 11 / Prisma 7 / Jest (backend), Expo 54 / React Native 0.81 / Jest + RNTL (frontend), bash + lsof + pkill (script).

**Reference spec:** `docs/superpowers/specs/2026-05-09-local-dev-mode-design.md`

---

## File Structure

| 파일 | 책임 | 종류 |
|------|------|------|
| `apps/backend/src/auth/dev-auth.controller.ts` | dev-only 로그인 엔드포인트 | 신규 |
| `apps/backend/src/auth/__tests__/dev-auth.controller.spec.ts` | DevAuthController 단위 테스트 | 신규 |
| `apps/backend/src/auth/auth.module.ts` | 조건부 컨트롤러 등록 | 수정 |
| `apps/backend/src/auth/auth.module.spec.ts` | 게이팅 매트릭스 검증 | 수정 |
| `apps/backend/prisma/seed.ts` | dev 유저 3명 멱등 upsert | 신규 |
| `apps/backend/package.json` | `prisma.seed` 스크립트 등록 | 수정 |
| `apps/frontend/utils/dev-auth.ts` | 게이트 단일 진입점 (`isDevAuthBypass`, `getDevUserEmail`) | 신규 |
| `apps/frontend/__tests__/utils/dev-auth.test.ts` | 게이트 4-케이스 매트릭스 | 신규 |
| `apps/frontend/api/auth.ts` | `devLogin(email)` 메서드 | 수정 |
| `apps/frontend/__tests__/api/auth.test.ts` | devLogin 호출 검증 | 수정 |
| `apps/frontend/context/AuthContext.ts` | 부팅 시 dev 분기 | 수정 |
| `apps/frontend/__tests__/hooks/useAuth.test.ts` | dev/prod 분기 회귀 테스트 | 수정 |
| `apps/frontend/app/_layout.tsx` | dev 모드 리다이렉트 가드 | 수정 |
| `scripts/dev-local.sh` | 통합 실행 스크립트 | 신규 |
| `package.json` (루트) | `dev:local` npm 스크립트 | 수정 |
| `apps/frontend/.env.example` | dev 변수 안내 | 수정 (없으면 신규) |
| `apps/backend/.env.example` | dev 변수 안내 | 수정 (없으면 신규) |
| `scripts/pre_commit.sh` | prod 빌드 산출물에 dev 문자열 누출 검사 | 수정 |
| `CLAUDE.md` | 로컬 실행 섹션 | 수정 |

모든 신규 파일 150 LOC 룰 준수.

---

## Phase 1 — 백엔드 dev 엔드포인트

### Task 1.1: `DevAuthController.devLogin` 실패 테스트 작성

**Files:**
- Create: `apps/backend/src/auth/__tests__/dev-auth.controller.spec.ts`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// apps/backend/src/auth/__tests__/dev-auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DevAuthController } from '../dev-auth.controller';
import { AuthService } from '../auth.service';

/**
 * @description DevAuthController 단위 테스트.
 * 이메일 → ssoQualifier 변환 후 AuthService.login 호출되는지 검증.
 */
describe('DevAuthController', () => {
  let controller: DevAuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevAuthController],
      providers: [
        {
          provide: AuthService,
          useValue: { login: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<DevAuthController>(DevAuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('devLogin', () => {
    it('이메일을 ssoQualifier로 변환해 AuthService.login 호출', async () => {
      const expected = {
        accessToken: 'at',
        refreshToken: 'rt',
        user: { id: BigInt(1) },
      };
      (service.login as jest.Mock).mockResolvedValue(expected);

      const result = await controller.devLogin({ email: 'dev1@local.test' });

      expect(service.login).toHaveBeenCalledWith(
        'dev1@local.test',
        'dev1@local.test',
      );
      expect(result).toEqual(expected);
    });

    it('빈 이메일이면 BadRequest 던짐', async () => {
      await expect(controller.devLogin({ email: '' })).rejects.toThrow();
    });
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `cd apps/backend && npm test -- --testPathPattern=dev-auth.controller`
Expected: FAIL — "Cannot find module '../dev-auth.controller'"

- [ ] **Step 3: 커밋**

```bash
git add apps/backend/src/auth/__tests__/dev-auth.controller.spec.ts
git commit -m "test(auth): add failing tests for DevAuthController"
```

---

### Task 1.2: `DevAuthController` 구현

**Files:**
- Create: `apps/backend/src/auth/dev-auth.controller.ts`

ssoQualifier로 이메일 그대로 사용 (post.service.ts:120의 `ssoQualifier.split('@')[0]` 닉네임 도출 로직과 호환).

- [ ] **Step 1: 컨트롤러 작성**

```typescript
// apps/backend/src/auth/dev-auth.controller.ts
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * @description 로컬 개발 전용 로그인 컨트롤러.
 * NODE_ENV !== 'production' && DEV_AUTH_ENABLED='true'일 때만 AuthModule에 등록됨.
 * Supabase OAuth 우회 후 이메일로 user 찾기/생성 → 자체 JWT 발급.
 */
@Controller('auth')
export class DevAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('dev-login')
  async devLogin(@Body() body: { email: string }) {
    if (!body?.email) {
      throw new BadRequestException('email이 필요합니다');
    }
    return await this.authService.login(body.email, body.email);
  }
}
```

- [ ] **Step 2: 테스트 통과 확인**

Run: `cd apps/backend && npm test -- --testPathPattern=dev-auth.controller`
Expected: PASS — 3 tests pass

- [ ] **Step 3: 커밋**

```bash
git add apps/backend/src/auth/dev-auth.controller.ts
git commit -m "feat(auth): add DevAuthController for local dev login"
```

---

### Task 1.3: `AuthModule` 조건부 등록

**Files:**
- Modify: `apps/backend/src/auth/auth.module.ts`
- Modify: `apps/backend/src/auth/auth.module.spec.ts`

- [ ] **Step 1: AuthModule 게이팅 추가**

`apps/backend/src/auth/auth.module.ts`를 다음으로 교체:

```typescript
import { Logger, Module, Type } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DevAuthController } from './dev-auth.controller';
import { SupabaseStrategy } from './supabase.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

const isDevAuthEnabled =
  process.env.NODE_ENV !== 'production' &&
  process.env.DEV_AUTH_ENABLED === 'true';

const controllers: Type[] = [AuthController];
if (isDevAuthEnabled) {
  controllers.push(DevAuthController);
  Logger.warn(
    '⚠️ DEV AUTH BYPASS ENABLED — never deploy with DEV_AUTH_ENABLED=true on prod',
    'AuthModule',
  );
}

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    UsersModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'defaultSecret',
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers,
  providers: [AuthService, SupabaseStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

- [ ] **Step 2: 게이팅 매트릭스 테스트 추가**

`apps/backend/src/auth/auth.module.spec.ts`를 다음으로 교체:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * @description AuthModule 정의 + dev 컨트롤러 게이팅 검증.
 */
describe('AuthModule', () => {
  // 모듈 캐시 초기화 헬퍼
  const loadModule = async () => {
    jest.resetModules();
    const { AuthModule } = await import('./auth.module');
    return Test.createTestingModule({ imports: [AuthModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(JwtService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({ get: jest.fn().mockReturnValue('test-secret') })
      .compile();
  };

  const restoreEnv = (original: NodeJS.ProcessEnv) => {
    process.env = original;
  };

  describe('dev controller registration', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      restoreEnv(originalEnv);
    });

    it('NODE_ENV=production이면 DevAuthController 미등록', async () => {
      process.env.NODE_ENV = 'production';
      process.env.DEV_AUTH_ENABLED = 'true';
      const module = await loadModule();
      const { DevAuthController } = await import('./dev-auth.controller');
      expect(() => module.get<typeof DevAuthController>(DevAuthController)).toThrow();
    });

    it('DEV_AUTH_ENABLED !== "true"이면 DevAuthController 미등록', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.DEV_AUTH_ENABLED;
      const module = await loadModule();
      const { DevAuthController } = await import('./dev-auth.controller');
      expect(() => module.get<typeof DevAuthController>(DevAuthController)).toThrow();
    });

    it('두 조건 모두 충족 시 DevAuthController 등록', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DEV_AUTH_ENABLED = 'true';
      const module = await loadModule();
      const { DevAuthController } = await import('./dev-auth.controller');
      expect(module.get<typeof DevAuthController>(DevAuthController)).toBeDefined();
    });
  });
});
```

- [ ] **Step 3: 테스트 실행**

Run: `cd apps/backend && npm test -- --testPathPattern=auth.module`
Expected: PASS — 3 게이팅 케이스 + 기존 "should be defined" 테스트 모두 통과

- [ ] **Step 4: 전체 백엔드 테스트 회귀 확인**

Run: `cd apps/backend && npm test`
Expected: 모두 PASS

- [ ] **Step 5: 커밋**

```bash
git add apps/backend/src/auth/auth.module.ts apps/backend/src/auth/auth.module.spec.ts
git commit -m "feat(auth): conditionally register DevAuthController based on env"
```

---

### Task 1.4: Prisma seed 스크립트

**Files:**
- Create: `apps/backend/prisma/seed.ts`
- Modify: `apps/backend/package.json`

- [ ] **Step 1: seed 스크립트 작성**

```typescript
// apps/backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

/**
 * @description 로컬 개발 모드용 dev 유저 시드.
 * ssoQualifier = email 형태로 멱등 upsert. 이메일 도메인이 .test라 prod와 충돌 없음.
 */
const prisma = new PrismaClient();

const DEV_EMAILS = [
  'dev1@local.test',
  'dev2@local.test',
  'dev3@local.test',
];

async function main() {
  for (const email of DEV_EMAILS) {
    const user = await prisma.user.upsert({
      where: { ssoQualifier: email },
      create: { ssoQualifier: email, email, age: 0, locale: 'ko' },
      update: {},
    });
    console.log(`[seed] dev user ready: id=${user.id} email=${email}`);
  }
}

main()
  .catch((e) => {
    console.error('[seed] failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: package.json에 seed 등록**

`apps/backend/package.json`의 최상위 객체에 다음 추가 (scripts 블록 아래, dependencies 블록 위 권장):

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

- [ ] **Step 3: seed 실행으로 검증**

Run: `cd apps/backend && DEV_AUTH_ENABLED=true npx prisma db seed`
Expected: `[seed] dev user ready: id=… email=dev1@local.test` × 3

- [ ] **Step 4: 두 번째 실행해서 멱등성 확인**

Run: `cd apps/backend && DEV_AUTH_ENABLED=true npx prisma db seed`
Expected: 동일 출력, DB에 중복 row 없음 (id가 동일)

- [ ] **Step 5: 커밋**

```bash
git add apps/backend/prisma/seed.ts apps/backend/package.json
git commit -m "feat(prisma): add idempotent seed for dev users"
```

---

### Task 1.5: 백엔드 단독 manual smoke test

- [ ] **Step 1: 백엔드 dev 모드로 기동**

Run:
```bash
cd apps/backend && \
  NODE_ENV=development DEV_AUTH_ENABLED=true npm run start:dev
```
Expected: 시작 로그에 `⚠️ DEV AUTH BYPASS ENABLED` 경고 + `Listening on … 3000` (또는 환경의 PORT)

- [ ] **Step 2: 다른 터미널에서 curl로 dev-login 호출**

Run:
```bash
curl -X POST http://localhost:3000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev1@local.test"}'
```
Expected: `{"accessToken":"...","refreshToken":"...","user":{...}}` JSON 응답. user.email === "dev1@local.test"

- [ ] **Step 3: NODE_ENV=production일 때 404 확인**

백엔드 종료 후:
```bash
cd apps/backend && \
  NODE_ENV=production DEV_AUTH_ENABLED=true npm run start:prod  # 빌드 산출물 필요. dist 없으면 npm run build 먼저
```
다른 터미널:
```bash
curl -i -X POST http://localhost:3000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" -d '{"email":"dev1@local.test"}'
```
Expected: HTTP 404 (라우트 미등록)

- [ ] **Step 4: 백엔드 종료, Phase 1 완료 commit**

(이미 Phase 내 커밋들 누적되어 있음. 추가 커밋 없음.)

---

## Phase 2 — 프론트 dev 부트

### Task 2.1: `utils/dev-auth.ts` + 단위 테스트

**Files:**
- Create: `apps/frontend/utils/dev-auth.ts`
- Create: `apps/frontend/__tests__/utils/dev-auth.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// apps/frontend/__tests__/utils/dev-auth.test.ts
/**
 * @description dev 인증 우회 게이트 4-케이스 매트릭스 검증.
 * __DEV__와 EXPO_PUBLIC_DEV_AUTH_BYPASS 둘 다 true일 때만 활성.
 */
describe('dev-auth gate', () => {
  const ORIG_ENV = process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS;
  const ORIG_EMAIL_ENV = process.env.EXPO_PUBLIC_DEV_USER_EMAIL;
  const ORIG_DEV = (global as any).__DEV__;

  afterEach(() => {
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = ORIG_ENV;
    process.env.EXPO_PUBLIC_DEV_USER_EMAIL = ORIG_EMAIL_ENV;
    (global as any).__DEV__ = ORIG_DEV;
    jest.resetModules();
  });

  const load = () => require('../../utils/dev-auth');

  it('__DEV__=true & env=true → ON', () => {
    (global as any).__DEV__ = true;
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = 'true';
    expect(load().isDevAuthBypass()).toBe(true);
  });

  it('__DEV__=true & env=false → OFF', () => {
    (global as any).__DEV__ = true;
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = 'false';
    expect(load().isDevAuthBypass()).toBe(false);
  });

  it('__DEV__=false & env=true → OFF', () => {
    (global as any).__DEV__ = false;
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS = 'true';
    expect(load().isDevAuthBypass()).toBe(false);
  });

  it('__DEV__=false & env=undefined → OFF', () => {
    (global as any).__DEV__ = false;
    delete process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS;
    expect(load().isDevAuthBypass()).toBe(false);
  });

  it('getDevUserEmail은 env값을 반환, 없으면 dev1@local.test fallback', () => {
    process.env.EXPO_PUBLIC_DEV_USER_EMAIL = 'dev2@local.test';
    expect(load().getDevUserEmail()).toBe('dev2@local.test');

    delete process.env.EXPO_PUBLIC_DEV_USER_EMAIL;
    jest.resetModules();
    expect(load().getDevUserEmail()).toBe('dev1@local.test');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd apps/frontend && npm test -- dev-auth.test`
Expected: FAIL — module not found

- [ ] **Step 3: 구현**

```typescript
// apps/frontend/utils/dev-auth.ts
/**
 * @description 로컬 개발 모드 인증 우회 게이트.
 * 모든 dev 분기는 이 두 함수를 통해서만 결정 → 게이트 일원화로 prod 사고 방지.
 * __DEV__ 빌드 플래그 + env 동시 충족 시에만 활성.
 */
export function isDevAuthBypass(): boolean {
  return (
    typeof __DEV__ !== 'undefined' &&
    __DEV__ === true &&
    process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS === 'true'
  );
}

export function getDevUserEmail(): string {
  return process.env.EXPO_PUBLIC_DEV_USER_EMAIL ?? 'dev1@local.test';
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd apps/frontend && npm test -- dev-auth.test`
Expected: PASS — 5 tests pass

- [ ] **Step 5: 커밋**

```bash
git add apps/frontend/utils/dev-auth.ts apps/frontend/__tests__/utils/dev-auth.test.ts
git commit -m "feat(auth): add dev-auth gate utility with __DEV__ + env guard"
```

---

### Task 2.2: `api/auth.ts`에 `devLogin` 추가

**Files:**
- Modify: `apps/frontend/api/auth.ts`
- Modify: `apps/frontend/__tests__/api/auth.test.ts`

- [ ] **Step 1: 실패 테스트 추가**

`apps/frontend/__tests__/api/auth.test.ts` 파일의 `describe('logout', ...)` 블록 **아래**에 다음 describe 블록 추가:

```typescript
  describe('devLogin', () => {
    it('posts to auth/dev-login with email', async () => {
      const mockResponse = {
        accessToken: 'dev-at',
        refreshToken: 'dev-rt',
        user: { id: 1, email: 'dev1@local.test', nickname: null },
      };
      const mockJson = jest.fn().mockResolvedValue(mockResponse);
      (apiClient.post as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await authApi.devLogin('dev1@local.test');

      expect(apiClient.post).toHaveBeenCalledWith('auth/dev-login', {
        json: { email: 'dev1@local.test' },
      });
      expect(result).toEqual(mockResponse);
    });
  });
```

- [ ] **Step 2: 실패 확인**

Run: `cd apps/frontend && npm test -- api/auth.test`
Expected: FAIL — `authApi.devLogin is not a function`

- [ ] **Step 3: `api/auth.ts`에 메서드 추가**

`apps/frontend/api/auth.ts`의 `authApi` 객체 안에 `logout` 다음 메서드로 추가 (마지막 `}` 직전, logout 뒤에 콤마):

```typescript
  devLogin: (email: string) =>
    apiClient
      .post('auth/dev-login', { json: { email } })
      .json<LoginResponse>(),
```

전체 파일은 다음과 같아야 함:

```typescript
// frontend/api/auth.ts
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

  devLogin: (email: string) =>
    apiClient
      .post('auth/dev-login', { json: { email } })
      .json<LoginResponse>(),
};
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd apps/frontend && npm test -- api/auth.test`
Expected: PASS — devLogin 테스트 + 기존 테스트 모두 통과

- [ ] **Step 5: 커밋**

```bash
git add apps/frontend/api/auth.ts apps/frontend/__tests__/api/auth.test.ts
git commit -m "feat(api): add devLogin endpoint client"
```

---

### Task 2.3: `AuthContext` dev 부트 분기

**Files:**
- Modify: `apps/frontend/context/AuthContext.ts`

`useAuth.test.ts`가 이미 존재함 (frontend/__tests__/hooks/useAuth.test.ts). 현재는 단순 hook 테스트로 보임. AuthProvider의 useEffect를 테스트하기 어렵기 때문에 회귀 방지는 manual smoke로 보강하고, 코드 변경은 보수적으로 추가.

- [ ] **Step 1: `AuthContext.ts`의 useEffect 수정**

`apps/frontend/context/AuthContext.ts` 상단 import에 추가:

```typescript
import { authApi } from '../api/auth';
import { isDevAuthBypass, getDevUserEmail } from '../utils/dev-auth';
```

(authApi는 이미 import 되어있을 가능성 — 중복 추가 X)

`AuthProvider` 함수 내부에 헬퍼 함수 + useEffect 수정. 기존 useEffect를 다음으로 교체:

```typescript
  const persistAndSetUser = useCallback((response: {
    accessToken: string;
    refreshToken?: string;
    user: AuthUser;
  }) => {
    saveItem('auth.access_token', response.accessToken);
    if (response.refreshToken) {
      saveItem('auth.refresh_token', response.refreshToken);
    }
    saveItem('user.profile', response.user);
    setUser(response.user);
  }, []);

  useEffect(() => {
    const stored = loadItem<AuthUser>('user.profile');
    const token = loadItem<string>('auth.access_token');
    if (stored && token) {
      setUser(stored);
      setIsLoading(false);
      return;
    }

    if (isDevAuthBypass()) {
      authApi
        .devLogin(getDevUserEmail())
        .then((response) => {
          persistAndSetUser({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: response.user,
          });
        })
        .catch((error) => {
          Logger.error('AuthProvider', 'Dev login failed:', error);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    setIsLoading(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const response = await authApi.login(session.access_token);
            persistAndSetUser({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              user: response.user,
            });
          } catch (error) {
            Logger.error('AuthProvider', 'Backend login failed:', error);
          }
        }
        if (event === 'SIGNED_OUT') {
          removeItem('auth.access_token');
          removeItem('auth.refresh_token');
          removeItem('user.profile');
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

`useState` 이후 `useCallback` import 누락 시 import 추가. 파일 상단 import:

```typescript
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  createElement,
  ReactNode,
} from 'react';
```

(이미 useCallback이 있으면 변경 불필요.)

- [ ] **Step 2: 타입 체크**

Run: `cd apps/frontend && npx tsc --noEmit`
Expected: 에러 없음 (또는 프로젝트의 기존 lint 룰 통과)

- [ ] **Step 3: 기존 테스트 회귀 확인**

Run: `cd apps/frontend && npm test`
Expected: 모두 PASS (특히 hooks/useAuth.test.ts와 supabase.test.ts)

- [ ] **Step 4: 커밋**

```bash
git add apps/frontend/context/AuthContext.ts
git commit -m "feat(auth): add dev-mode auto login branch in AuthProvider"
```

---

### Task 2.4: `_layout.tsx` 리다이렉트 가드

**Files:**
- Modify: `apps/frontend/app/_layout.tsx`

기존 useEffect (라인 65-74)는 dev 모드에서도 정상 동작함:
- dev 모드 부팅 중: `authLoading=true`라 리다이렉트 보류 ✓
- devLogin 성공: `setUser` → `isAuthenticated=true` → `inAuthGroup=false`이면 그대로 머무름 ✓
- 부팅 시 segments[0]가 'login'이 아니라 '(tabs)'이면 리다이렉트 발생 X ✓

따라서 추가 변경은 **불필요**. 단, 명시적 의도 표현을 위해 dev 모드 정보 콘솔 로그 1줄 추가.

- [ ] **Step 1: `_layout.tsx` import에 dev-auth 추가**

`apps/frontend/app/_layout.tsx` 기존 import 블록에 추가:

```typescript
import { isDevAuthBypass } from '../utils/dev-auth';
```

- [ ] **Step 2: `AppContent` 함수 시작 부분에 dev 모드 알림 1회 출력**

`function AppContent() {` 줄 아래, `const { isAuthenticated, … }` 위에:

```typescript
function AppContent() {
  useEffect(() => {
    if (isDevAuthBypass()) {
      // eslint-disable-next-line no-console
      console.warn('[DEV] Auth bypass active. Auto-logging in as', process.env.EXPO_PUBLIC_DEV_USER_EMAIL ?? 'dev1@local.test');
    }
  }, []);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
```

(파일 상단 `useEffect` import는 이미 존재함.)

- [ ] **Step 3: 빌드 검증**

Run: `cd apps/frontend && npm run lint`
Expected: 0 errors (warnings 무관)

Run: `cd apps/frontend && npx expo export --platform web --no-minify > /tmp/expo_smoke.txt 2>&1 && echo OK || cat /tmp/expo_smoke.txt`
Expected: `OK`

- [ ] **Step 4: 커밋**

```bash
git add apps/frontend/app/_layout.tsx
git commit -m "feat(layout): log dev-mode auto-login intent"
```

---

### Task 2.5: 프론트 + 백엔드 통합 manual smoke

- [ ] **Step 1: `apps/frontend/.env`에 dev 변수 추가**

다음 두 줄 추가 (.env가 git ignored라 직접 편집):

```
EXPO_PUBLIC_DEV_AUTH_BYPASS=true
EXPO_PUBLIC_DEV_USER_EMAIL=dev1@local.test
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

- [ ] **Step 2: 백엔드 기동 (별도 터미널)**

Run: `cd apps/backend && NODE_ENV=development DEV_AUTH_ENABLED=true npm run start:dev`
Expected: `⚠️ DEV AUTH BYPASS ENABLED` 로그 + 서버 listening

- [ ] **Step 3: 프론트 기동 (또 다른 터미널)**

Run: `cd apps/frontend && npm run web`
Expected: 브라우저 자동 오픈, 로그인 화면 안 거치고 홈 직행. 콘솔에 `[DEV] Auth bypass active...` 출력

- [ ] **Step 4: 두 프로세스 종료**

Ctrl-C 두 번 (각 터미널에서). 다음 단계 셸 스크립트가 이걸 자동화함.

---

## Phase 3 — 통합 셸 스크립트

### Task 3.1: `scripts/dev-local.sh` 스켈레톤 + 가비지 정리

**Files:**
- Create: `scripts/dev-local.sh`

- [ ] **Step 1: 파일 작성**

```bash
#!/usr/bin/env bash
# scripts/dev-local.sh
# 로컬 개발 모드: 백엔드 + 프론트엔드 동시 기동, Ctrl-C 일괄 종료, 가비지 정리.

set -euo pipefail

# ─────────────────────────────────────────────────────────
# 색상 / 로깅
# ─────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[dev-local]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[dev-local]${NC} $*"; }
log_error() { echo -e "${RED}[dev-local]${NC} $*" >&2; }

# ─────────────────────────────────────────────────────────
# 옵션 파싱
# ─────────────────────────────────────────────────────────
SKIP_SEED=false
REMOTE_BACKEND=false
for arg in "$@"; do
  case "$arg" in
    --no-seed)        SKIP_SEED=true ;;
    --remote-backend) REMOTE_BACKEND=true ;;
    -h|--help)
      cat <<EOF
사용법: npm run dev:local [-- --no-seed] [-- --remote-backend]

옵션:
  --no-seed         prisma db seed 건너뛰기 (재시작 빠르게)
  --remote-backend  로컬 백엔드 미기동, 프론트만 띄움 (Render API 사용)
EOF
      exit 0 ;;
    *)
      log_error "알 수 없는 옵션: $arg"
      exit 1 ;;
  esac
done

# ─────────────────────────────────────────────────────────
# 가비지 프로세스 정리
# ─────────────────────────────────────────────────────────
cleanup_port() {
  local port=$1
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    log_warn "포트 $port 잔존 프로세스 종료: $pids"
    kill -TERM $pids 2>/dev/null || true
    sleep 1
    pids=$(lsof -ti:"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      kill -KILL $pids 2>/dev/null || true
    fi
  fi
}

log_info "가비지 프로세스 정리 중..."
if ! $REMOTE_BACKEND; then
  cleanup_port 3000
fi
cleanup_port 8081
cleanup_port 19000
cleanup_port 19001
cleanup_port 19002

# (이후 단계에서 spawn + trap 추가 예정)
log_info "가비지 정리 완료. (Phase 3 Task 3.2에서 spawn 로직 추가)"
```

- [ ] **Step 2: 실행 권한 부여**

Run: `chmod +x scripts/dev-local.sh`

- [ ] **Step 3: 단독 실행 테스트**

Run: `bash scripts/dev-local.sh --help`
Expected: 사용법 출력

Run: `bash scripts/dev-local.sh`
Expected: "가비지 정리 완료" 메시지. 살아있는 프로세스 없으면 정리 로그 없음, 있으면 PID 출력 후 종료.

- [ ] **Step 4: 커밋**

```bash
git add scripts/dev-local.sh
git commit -m "feat(scripts): add dev-local.sh skeleton with port cleanup"
```

---

### Task 3.2: 백엔드 + 프론트 spawn + 로그 prefix

**Files:**
- Modify: `scripts/dev-local.sh`

- [ ] **Step 1: spawn 섹션 추가**

`scripts/dev-local.sh` 마지막 `log_info "가비지 정리 완료..."` 줄을 다음 블록으로 교체:

```bash
log_info "가비지 정리 완료."

# ─────────────────────────────────────────────────────────
# Pre-flight 검사
# ─────────────────────────────────────────────────────────
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -f "$ROOT_DIR/apps/frontend/.env" ]; then
  log_error "apps/frontend/.env 누락. .env.example 참고해서 만들어주세요."
  exit 1
fi
if ! $REMOTE_BACKEND && [ ! -f "$ROOT_DIR/apps/backend/.env" ]; then
  log_error "apps/backend/.env 누락. .env.example 참고해서 만들어주세요."
  exit 1
fi
if [ ! -d "$ROOT_DIR/apps/frontend/node_modules" ] || [ ! -d "$ROOT_DIR/apps/backend/node_modules" ]; then
  log_error "node_modules 누락. 루트에서 'npm install' 먼저 실행하세요."
  exit 1
fi

# ─────────────────────────────────────────────────────────
# DB 시드
# ─────────────────────────────────────────────────────────
if ! $SKIP_SEED && ! $REMOTE_BACKEND; then
  log_info "Prisma seed 실행..."
  ( cd "$ROOT_DIR/apps/backend" && DEV_AUTH_ENABLED=true npx prisma db seed )
fi

# ─────────────────────────────────────────────────────────
# spawn helpers
# ─────────────────────────────────────────────────────────
set -m  # job control 활성화 (자식이 새 process group)
CHILD_PIDS=()

prefix_logs() {
  local label=$1
  local color=$2
  sed -u "s/^/$(printf "${color}[${label}]${NC} ")/"
}

# ─────────────────────────────────────────────────────────
# 백엔드 spawn (옵션에 따라)
# ─────────────────────────────────────────────────────────
if ! $REMOTE_BACKEND; then
  log_info "백엔드 기동 (apps/backend)..."
  (
    cd "$ROOT_DIR/apps/backend" && \
    NODE_ENV=development DEV_AUTH_ENABLED=true npm run start:dev 2>&1 \
      | prefix_logs "backend" "$GREEN"
  ) &
  BACKEND_PID=$!
  CHILD_PIDS+=("$BACKEND_PID")
else
  log_warn "--remote-backend: 로컬 백엔드 미기동. EXPO_PUBLIC_API_URL이 Render를 가리키는지 확인."
fi

# ─────────────────────────────────────────────────────────
# 프론트 spawn
# ─────────────────────────────────────────────────────────
log_info "프론트엔드 기동 (apps/frontend)..."
(
  cd "$ROOT_DIR/apps/frontend" && \
  npm start 2>&1 \
    | prefix_logs "frontend" "$BLUE"
) &
FRONTEND_PID=$!
CHILD_PIDS+=("$FRONTEND_PID")

log_info "기동 완료. 종료하려면 Ctrl-C."
log_info "  백엔드 PID: ${BACKEND_PID:-(skipped)}"
log_info "  프론트 PID: $FRONTEND_PID"

# (Task 3.3에서 트랩 + wait 추가)
wait
```

- [ ] **Step 2: 단독 실행 — 백엔드만 5초 기동되는지 확인 (수동 Ctrl-C 필요)**

Run: `bash scripts/dev-local.sh`
Expected: 시드 실행 → 백엔드 + 프론트 prefix 색상 로그 → 두 서비스 listening
**Manual 검증 후**: Ctrl-C 한 번. **현 단계에서는 트랩 없으므로 자식 프로세스가 살아있을 수 있음** — 다음 task에서 수정.

검증 후 잔존 프로세스 정리:
```bash
lsof -ti:3000,8081 | xargs kill -9 2>/dev/null || true
```

- [ ] **Step 3: 커밋**

```bash
git add scripts/dev-local.sh
git commit -m "feat(scripts): spawn backend + frontend with prefixed logs"
```

---

### Task 3.3: 시그널 트랩으로 클린 종료

**Files:**
- Modify: `scripts/dev-local.sh`

- [ ] **Step 1: trap 추가**

`scripts/dev-local.sh`의 spawn 섹션 **위**에 (set -m 직후) 다음 trap 정의 블록 삽입:

```bash
EXIT_CODE=0

cleanup() {
  local rc=$?
  trap '' INT TERM EXIT  # 중복 호출 방지

  log_info "shutdown: 자식 프로세스 정리 중..."
  for pid in "${CHILD_PIDS[@]:-}"; do
    [ -z "$pid" ] && continue
    kill -TERM "$pid" 2>/dev/null || true
    pkill -P "$pid" 2>/dev/null || true
  done

  sleep 2
  for pid in "${CHILD_PIDS[@]:-}"; do
    [ -z "$pid" ] && continue
    kill -KILL "$pid" 2>/dev/null || true
    pkill -9 -P "$pid" 2>/dev/null || true
  done

  # 남아있을 수 있는 자식 프로세스도 lsof로 한 번 더 정리
  cleanup_port 3000 || true
  cleanup_port 8081 || true

  log_info "shutdown 완료. exit=${EXIT_CODE:-$rc}"
  exit "${EXIT_CODE:-$rc}"
}

trap cleanup INT TERM EXIT
```

마지막 `wait` 줄을 다음으로 교체:

```bash
# 첫 번째로 죽는 자식의 종료 코드를 기억
wait -n "${CHILD_PIDS[@]}" 2>/dev/null || EXIT_CODE=$?
log_warn "자식 중 하나가 종료됨. 정리 중..."
# trap이 cleanup()을 호출함
exit "$EXIT_CODE"
```

- [ ] **Step 2: 트랩 동작 검증 — Ctrl-C 일괄 종료**

Run: `bash scripts/dev-local.sh`
- 두 서비스 listening 확인
- Ctrl-C 한 번
Expected: `shutdown: 자식 프로세스 정리 중...` 후 `shutdown 완료`. 셸 프롬프트 복귀.

- [ ] **Step 3: 종료 후 포트 free 확인**

Run: `lsof -ti:3000,8081`
Expected: 출력 없음 (포트 free)

- [ ] **Step 4: 가비지 정리 시나리오 — 강제 종료 후 재실행**

Run: `bash scripts/dev-local.sh` (백그라운드 실행)
잠시 후 다른 터미널에서:
```bash
ps aux | grep -E "nest|expo" | grep -v grep | awk '{print $2}' | head -2 | xargs kill -9
```
이러면 셸은 자식이 죽었음을 감지하고 `wait -n` 반환 → cleanup 호출 → exit.

다시 실행:
Run: `bash scripts/dev-local.sh`
Expected: `포트 3000 잔존 프로세스 종료: ...` (또는 잔존 없으면 그냥 진행) → 정상 기동

- [ ] **Step 5: 커밋**

```bash
git add scripts/dev-local.sh
git commit -m "feat(scripts): clean teardown via SIGINT/TERM/EXIT trap"
```

---

### Task 3.4: 루트 `package.json`에 npm 스크립트 등록

**Files:**
- Modify: `package.json` (루트)

- [ ] **Step 1: `dev:local` 스크립트 추가**

루트 `package.json`의 `scripts` 블록에 다음 추가:

```json
"dev:local": "bash scripts/dev-local.sh"
```

전체 scripts 블록은 다음과 같이 됨:

```json
"scripts": {
  "build": "turbo run build",
  "test": "turbo run test",
  "lint": "turbo run lint",
  "typecheck": "turbo run typecheck",
  "dev:backend": "turbo run dev --filter=@clover/backend",
  "dev:frontend": "turbo run dev --filter=@clover/frontend",
  "dev:local": "bash scripts/dev-local.sh"
}
```

- [ ] **Step 2: npm 통합 검증**

Run: `npm run dev:local -- --help`
Expected: 사용법 출력

- [ ] **Step 3: 풀 사이클 manual smoke**

Run: `npm run dev:local`
Expected: 시드 → 백엔드 + 프론트 기동 → 브라우저(또는 Expo) 진입 시 자동 로그인 → Ctrl-C 한 번에 모두 종료 → 포트 free

- [ ] **Step 4: 커밋**

```bash
git add package.json
git commit -m "feat(scripts): wire npm run dev:local"
```

---

## Phase 4 — 하드닝

### Task 4.1: `.env.example` 정비

**Files:**
- Create or modify: `apps/frontend/.env.example`
- Create or modify: `apps/backend/.env.example`

- [ ] **Step 1: 기존 .env.example 존재 확인**

Run: `ls apps/frontend/.env.example apps/backend/.env.example 2>/dev/null || echo "없음"`

- [ ] **Step 2: `apps/frontend/.env.example` 작성/보강**

기존 변수가 있으면 보존하고 다음 블록만 추가 (없으면 신규 생성):

```bash
# apps/frontend/.env.example

# 백엔드 API 베이스 URL
# 로컬: http://localhost:3000/api/v1
# Render: https://clover-wallet-api-node.onrender.com/api/v1
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1

# Supabase (prod 로그인용)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# ─────────────────────────────────────
# 로컬 개발 모드 (OAuth 우회)
# 반드시 __DEV__ 빌드에서만 켜질 것 — release 빌드에선 무시됨
# 자세한 사양: docs/superpowers/specs/2026-05-09-local-dev-mode-design.md
# ─────────────────────────────────────
EXPO_PUBLIC_DEV_AUTH_BYPASS=true
EXPO_PUBLIC_DEV_USER_EMAIL=dev1@local.test
```

- [ ] **Step 3: `apps/backend/.env.example` 작성/보강**

```bash
# apps/backend/.env.example

# Supabase Postgres (Prisma DATABASE_URL)
DATABASE_URL=

# JWT 비밀키
JWT_SECRET=

# Supabase JWT 검증용 (있으면 사용)
SUPABASE_JWT_SECRET=

# ─────────────────────────────────────
# 로컬 개발 모드 (POST /auth/dev-login 활성화)
# 반드시 NODE_ENV !== 'production'에서만 의미 있음
# Render prod 환경엔 절대 등록 금지
# ─────────────────────────────────────
DEV_AUTH_ENABLED=true
```

- [ ] **Step 4: 커밋**

```bash
git add apps/frontend/.env.example apps/backend/.env.example
git commit -m "docs(env): add dev-mode variables to .env.example with caveats"
```

---

### Task 4.2: prod 빌드 산출물에 dev 문자열 누출 검사

**Files:**
- Modify: `scripts/pre_commit.sh`

- [ ] **Step 1: 가드 추가**

`scripts/pre_commit.sh`에서 `Verifying Full Build (Expo Export)...` 직후 빌드 성공 후에 검사 추가. 즉 `if ! npx expo export ... fi` 블록 **다음**, `cd ../..` **이전**에 다음 삽입:

```bash
    # 4. dev 산출물 누출 검사 — prod 빌드에 dev 우회 코드 포함되면 fail
    if [ -d "dist" ] && grep -rq "dev-login\|EXPO_PUBLIC_DEV_AUTH_BYPASS" dist 2>/dev/null; then
        echo -e "${RED}[BUILD FAILURE] dev artifacts leaked into production build (dev-login or DEV_AUTH_BYPASS string in dist/)${NC}"
        exit 1
    fi
```

(`dist/`가 expo의 web export 디렉토리. 다른 디렉토리면 그에 맞게 조정.)

- [ ] **Step 2: 가드 동작 검증 — false positive 없는지**

Run: `cd apps/frontend && npx expo export --platform web --no-minify > /tmp/check.txt 2>&1`
Run: `grep -rq "dev-login\|EXPO_PUBLIC_DEV_AUTH_BYPASS" apps/frontend/dist 2>/dev/null && echo "LEAK" || echo "CLEAN"`
Expected: `CLEAN` (개발 빌드라도 minify되면 식별 어려움. 검증 단계에선 `--no-minify`라 grep 잘 됨)

만약 `LEAK`라면: 프론트 코드에서 dev-login 호출이 `__DEV__` 가드 안에서만 실행되도록 했는지 재확인. release 빌드면 `__DEV__=false`라 dead code elimination이 일어나야 정상.

- [ ] **Step 3: pre-commit 직접 실행 시뮬레이션**

Run: `bash scripts/pre_commit.sh`
Expected: 정상 통과 (변경 없으면 빠르게 끝남)

- [ ] **Step 4: 커밋**

```bash
git add scripts/pre_commit.sh
git commit -m "feat(guard): block dev artifacts leaking into prod build"
```

---

### Task 4.3: `CLAUDE.md`에 로컬 실행 섹션 추가

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 섹션 추가**

`CLAUDE.md`의 `## Build & Deploy` 섹션 **다음**, `## Don'ts` **이전**에 다음 섹션 삽입:

```markdown
## Local Development Mode

`npm run dev:local`로 백엔드 + 프론트 동시 실행 (OAuth 우회).

- **시드 dev 유저**: `dev1@local.test` ~ `dev3@local.test` (실 Supabase Postgres에 멱등 upsert)
- **자동 로그인**: `EXPO_PUBLIC_DEV_USER_EMAIL`로 지정된 유저로 부팅 시 자동
- **유저 전환**: `apps/frontend/.env`의 `EXPO_PUBLIC_DEV_USER_EMAIL` 변경 후 재시작
- **종료**: Ctrl-C 한 번 → 백엔드 + 프론트 + 가비지 모두 정리

옵션:
- `npm run dev:local -- --no-seed`: 시드 스킵 (재시작 빠르게)
- `npm run dev:local -- --remote-backend`: 로컬 백엔드 미기동, Render API 사용

자세한 사양: `docs/superpowers/specs/2026-05-09-local-dev-mode-design.md`

⚠️ **prod 사고 방지**: `EXPO_PUBLIC_DEV_AUTH_BYPASS`와 `DEV_AUTH_ENABLED`는 절대 prod 환경에 등록 금지. 빌드 가드(`scripts/pre_commit.sh`)가 prod 빌드 산출물에 dev 문자열 누출되면 빌드를 실패시킴.
```

- [ ] **Step 2: 커밋**

```bash
git add CLAUDE.md
git commit -m "docs: add local dev mode section to CLAUDE.md"
```

---

### Task 4.4: 최종 회귀 테스트 — 전체 사이클

- [ ] **Step 1: 백엔드 전체 테스트**

Run: `cd apps/backend && npm test`
Expected: 모두 PASS

- [ ] **Step 2: 프론트 전체 테스트**

Run: `cd apps/frontend && npm test`
Expected: 모두 PASS

- [ ] **Step 3: turbo 통합 빌드**

Run: `npm run build && npm run lint && npm run typecheck`
Expected: 모두 통과

- [ ] **Step 4: dev 모드 풀 사이클**

Run: `npm run dev:local`
- 시드 → 기동 → 자동 로그인 확인
- 임의 기능 사용 (번호 생성, 저장 등)
- Ctrl-C → 정리 확인

- [ ] **Step 5: prod 모드 회귀**

`apps/frontend/.env`의 `EXPO_PUBLIC_DEV_AUTH_BYPASS=false`로 변경 후:
Run: `cd apps/frontend && npm run web`
Expected: 로그인 화면 표시 (prod 흐름 정상 동작)

원복: `EXPO_PUBLIC_DEV_AUTH_BYPASS=true`

- [ ] **Step 6: Phase 4 완료 (추가 커밋 없음)**

---

## Manual Test Checklist (최종 체크)

Phase 4 완료 후 다음을 모두 통과해야 함:

- [ ] `npm run dev:local` → 백엔드 + 프론트 동시 기동, 로그 색상 prefix 정상
- [ ] 로그인 화면 안 보이고 홈 직행 (콘솔에 `[DEV] Auth bypass active...` 출력)
- [ ] `EXPO_PUBLIC_DEV_USER_EMAIL=dev2@local.test`로 변경 후 재시작 → 다른 user로 로그인됨
- [ ] Ctrl-C 한 번으로 두 프로세스 종료, `lsof -ti:3000,8081` 결과 없음
- [ ] `kill -9`로 강제 종료 후 재실행 → 가비지 정리 로그 출력 후 정상 기동
- [ ] `EXPO_PUBLIC_DEV_AUTH_BYPASS=false`로 변경 시 로그인 화면 표시 (prod 회귀 통과)
- [ ] `cd apps/frontend && npx expo export --platform web` 후 `grep -r "dev-login" dist` 결과 없음 (release 빌드는 `__DEV__=false`라 dead code 제거됨)

---

## 변경 파일 최종 목록 (확정)

| 파일 | 종류 | 예상 LOC |
|------|------|----------|
| `apps/backend/src/auth/dev-auth.controller.ts` | 신규 | ~25 |
| `apps/backend/src/auth/__tests__/dev-auth.controller.spec.ts` | 신규 | ~50 |
| `apps/backend/src/auth/auth.module.ts` | 수정 | +20, -2 |
| `apps/backend/src/auth/auth.module.spec.ts` | 수정 | +60 |
| `apps/backend/prisma/seed.ts` | 신규 | ~30 |
| `apps/backend/package.json` | 수정 | +3 |
| `apps/frontend/utils/dev-auth.ts` | 신규 | ~15 |
| `apps/frontend/__tests__/utils/dev-auth.test.ts` | 신규 | ~50 |
| `apps/frontend/api/auth.ts` | 수정 | +5 |
| `apps/frontend/__tests__/api/auth.test.ts` | 수정 | +18 |
| `apps/frontend/context/AuthContext.ts` | 수정 | +30, -10 |
| `apps/frontend/app/_layout.tsx` | 수정 | +8 |
| `scripts/dev-local.sh` | 신규 | ~140 |
| `package.json` (루트) | 수정 | +1 |
| `apps/frontend/.env.example` | 수정 | +10 |
| `apps/backend/.env.example` | 수정 | +6 |
| `scripts/pre_commit.sh` | 수정 | +5 |
| `CLAUDE.md` | 수정 | +18 |

`dev-local.sh`만 140 LOC로 한도 근접 — 필요 시 helpers를 별도 파일로 분리 가능 (현재는 단일 파일이 더 명료).

---

## 자체 검토 (Self-review)

**1. Spec 커버리지**
- §3.1 백엔드 dev 엔드포인트 → Task 1.1, 1.2, 1.3 ✓
- §3.2 프론트 dev 부트 → Task 2.1, 2.2, 2.3, 2.4 ✓
- §3.3 셸 스크립트 → Task 3.1, 3.2, 3.3, 3.4 ✓
- §3.4 데이터 흐름 → Task 1.5 / 2.5 / 3.4의 manual smoke로 검증 ✓
- §4 보안 게이팅 (4중) → Task 1.3 (백엔드), 2.1 (프론트), 4.2 (빌드 가드) ✓
- §5 셸 동작 사양 → Task 3.1-3.4 ✓
- §6 변경 파일 → 최종 파일 목록 위 표와 일치 ✓
- §7 테스트 전략 → Task 1.1, 1.3, 2.1, 2.2 + manual checklist ✓
- §8 롤아웃 순서 → Phase 1→4 그대로 매핑 ✓
- §9 위험 요소 → 4중 게이팅 + cleanup_port fallback + pkill -P로 손주 정리 모두 plan에 반영 ✓

**2. Placeholder 스캔**: TBD/TODO/"위와 비슷" 등 없음. 모든 step에 실제 코드/명령 포함 ✓

**3. 타입 일관성**:
- `LoginResponse` 인터페이스 (frontend `api/auth.ts`): `{ accessToken, refreshToken?, user: { id, email, nickname } }` — Task 2.2 응답 mock과 일치 ✓
- `AuthService.login(ssoQualifier, email?)`: Task 1.2의 `controller.devLogin`이 `email, email` 두 인자 전달 — 시그니처 일치 ✓
- `isDevAuthBypass()` / `getDevUserEmail()`: Task 2.1에서 정의, Task 2.3 + 2.4에서 호출 — 일관됨 ✓
- `persistAndSetUser` 헬퍼: Task 2.3에서 정의, dev/prod 분기 모두에서 동일 호출 — 일관됨 ✓
