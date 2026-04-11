# Stream 1: Infrastructure Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turborepo 모노레포 구조 전환, shared 타입 패키지 생성, CI 파이프라인 강화

**Architecture:** root에 Turborepo를 설정하고, apps/backend + apps/frontend + packages/shared 3개 워크스페이스로 구성. Prisma 스키마에서 공유 타입을 자동 생성하여 @clover/shared로 양쪽에서 import.

**Tech Stack:** Turborepo, npm workspaces, TypeScript, Prisma, GitHub Actions

---

## Task 1: Root Turborepo 설정

**Files:**
- Create: `package.json` (root)
- Create: `turbo.json`
- Create: `.npmrc`

- [ ] **Step 1: root package.json 생성**

```json
{
  "name": "clover-wallet",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "dev:backend": "turbo run dev --filter=@clover/backend",
    "dev:frontend": "turbo run dev --filter=@clover/frontend",
    "generate:types": "turbo run generate:types --filter=@clover/shared"
  },
  "devDependencies": {
    "turbo": "^2.5.0"
  }
}
```

- [ ] **Step 2: turbo.json 파이프라인 설정**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "generate:types": {
      "outputs": ["src/**"]
    }
  }
}
```

- [ ] **Step 3: .npmrc 생성**

```
auto-install-peers=true
```

- [ ] **Step 4: Turborepo 설치 확인**

Run: `npm install`
Expected: turbo가 node_modules/.bin/turbo에 설치됨

- [ ] **Step 5: Commit**

```bash
git add package.json turbo.json .npmrc
git commit -m "build: Turborepo 모노레포 초기 설정"
```

---

## Task 2: 디렉토리 이동 (backend-node → apps/backend)

**Files:**
- Move: `backend-node/` → `apps/backend/`
- Modify: `apps/backend/package.json`

- [ ] **Step 1: apps 디렉토리 생성 및 이동**

```bash
mkdir -p apps
git mv backend-node apps/backend
```

- [ ] **Step 2: apps/backend/package.json name 변경**

`apps/backend/package.json`의 name 필드를 업데이트:

```json
{
  "name": "@clover/backend",
  ...
}
```

- [ ] **Step 3: backend scripts에 typecheck 추가**

`apps/backend/package.json`의 scripts에 추가:

```json
{
  "scripts": {
    ...existing scripts...
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 4: 빌드 확인**

Run: `cd apps/backend && npm run build`
Expected: 빌드 성공

- [ ] **Step 5: 테스트 확인**

Run: `cd apps/backend && npm test -- --no-coverage`
Expected: 모든 테스트 통과

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "build: backend-node → apps/backend 이동"
```

---

## Task 3: 디렉토리 이동 (frontend → apps/frontend)

**Files:**
- Move: `frontend/` → `apps/frontend/`
- Modify: `apps/frontend/package.json`

- [ ] **Step 1: frontend 이동**

```bash
git mv frontend apps/frontend
```

- [ ] **Step 2: apps/frontend/package.json name 변경**

```json
{
  "name": "@clover/frontend",
  ...
}
```

- [ ] **Step 3: 빌드 확인**

Run: `cd apps/frontend && npm test -- --watchAll=false --no-coverage`
Expected: 모든 테스트 통과

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "build: frontend → apps/frontend 이동"
```

---

## Task 4: shared 패키지 생성

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types/api.ts`
- Create: `packages/shared/src/types/user.ts`
- Create: `packages/shared/src/types/lotto.ts`
- Create: `packages/shared/src/types/community.ts`
- Create: `packages/shared/src/types/ticket.ts`
- Create: `packages/shared/src/types/notification.ts`
- Create: `packages/shared/src/types/spot.ts`
- Create: `packages/shared/src/constants/lotto.ts`

- [ ] **Step 1: package.json 생성**

`packages/shared/package.json`:

```json
{
  "name": "@clover/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "lint": "echo 'no lint configured'"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

- [ ] **Step 2: tsconfig.json 생성**

`packages/shared/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: 공통 API 타입 생성**

`packages/shared/src/types/api.ts`:

```typescript
/** 페이지네이션 응답 래퍼 */
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

/** API 에러 응답 */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
```

- [ ] **Step 4: User 타입 생성**

`packages/shared/src/types/user.ts`:

```typescript
/** 사용자 요약 정보 (게시글/댓글에서 사용) */
export interface UserSummary {
  id: bigint;
  nickname: string;
  badges: string[];
}

/** 사용자 상세 정보 */
export interface UserDetail extends UserSummary {
  email?: string;
  age: number;
  locale: string;
  createdAt?: string;
}

/** 사용자 프로필 통계 */
export interface UserStats {
  totalWinnings: number;
  roi: number;
  totalGames: number;
  winCount: number;
}

/** 팔로우 카운트 */
export interface FollowCounts {
  followers: number;
  following: number;
}
```

- [ ] **Step 5: Lotto 타입 생성**

`packages/shared/src/types/lotto.ts`:

```typescript
/** 로또 게임 상태 */
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

/** 로또 게임 (6개 번호 세트) */
export interface LottoGame {
  id: bigint;
  status: LottoGameStatus;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  extractionMethod?: string;
  prizeAmount?: bigint;
}

/** 로또 티켓 (게임 묶음) */
export interface LottoTicket {
  id: bigint;
  userId: bigint;
  ordinal: number;
  status: string;
  games: LottoGame[];
  createdAt?: string;
}

/** 당첨 정보 */
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
  firstPrizeAmount: bigint;
  secondPrizeAmount: bigint;
  thirdPrizeAmount: bigint;
  fourthPrizeAmount: bigint;
  fifthPrizeAmount: bigint;
}

/** 등수별 당첨금 맵 */
export interface PrizeAmountMap {
  WINNING_1: bigint;
  WINNING_2: bigint;
  WINNING_3: bigint;
  WINNING_4: bigint;
  WINNING_5: bigint;
}
```

- [ ] **Step 6: Community 타입 생성**

`packages/shared/src/types/community.ts`:

```typescript
import type { UserSummary } from './user';

/** 게시글 */
export interface Post {
  id: bigint;
  userId: bigint;
  title: string;
  content: string;
  likes: number;
  isLiked: boolean;
  userSummary: UserSummary | null;
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** 댓글 */
export interface Comment {
  id: bigint;
  postId: bigint;
  userId: bigint;
  content: string;
  likes: number;
  parentId?: bigint;
  userSummary: UserSummary | null;
  replies?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}

/** 게시글 생성 요청 */
export interface CreatePostRequest {
  title: string;
  content: string;
}

/** 게시글 수정 요청 */
export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

/** 댓글 생성 요청 */
export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentId?: string;
}
```

- [ ] **Step 7: 나머지 타입 파일 생성**

`packages/shared/src/types/ticket.ts`:

```typescript
/** 티켓 스캔 결과 */
export interface ScanResult {
  round?: number;
  numbers: number[];
}

/** 번호 추출 방식 */
export type ExtractionMethod =
  | 'DREAM'
  | 'SAJU'
  | 'PERSONAL_SIGNIFICANCE'
  | 'AUTO'
  | 'RANDOM'
  | 'STATISTICS';
```

`packages/shared/src/types/notification.ts`:

```typescript
/** 알림 */
export interface Notification {
  id: bigint;
  userId: bigint;
  title: string;
  message: string;
  isRead: boolean;
  type: 'INFO' | 'WINNING' | 'SYSTEM';
  createdAt?: string;
}
```

`packages/shared/src/types/spot.ts`:

```typescript
/** 로또 판매점 */
export interface LottoSpot {
  id: bigint;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  firstPlaceWins: number;
  secondPlaceWins: number;
}

/** 당첨 판매점 이력 */
export interface WinningStoreHistory {
  round: number;
  rank: number;
  storeName: string;
  address: string;
  method?: string;
}
```

- [ ] **Step 8: 공유 상수 생성**

`packages/shared/src/constants/lotto.ts`:

```typescript
/** 로또 번호 최솟값 */
export const LOTTO_MIN = 1;

/** 로또 번호 최댓값 */
export const LOTTO_MAX = 45;

/** 한 게임당 번호 수 */
export const NUMBERS_PER_GAME = 6;

/** 한 티켓당 최대 게임 수 */
export const MAX_GAMES_PER_TICKET = 5;

/** 번호 색상 범위 */
export const NUMBER_COLOR_RANGES = [
  { min: 1, max: 10, color: '#FFC107' },
  { min: 11, max: 20, color: '#2196F3' },
  { min: 21, max: 30, color: '#FF5252' },
  { min: 31, max: 40, color: '#9E9E9E' },
  { min: 41, max: 45, color: '#4CAF50' },
] as const;
```

- [ ] **Step 9: barrel export 생성**

`packages/shared/src/index.ts`:

```typescript
// Types
export type { PageResponse, ApiError } from './types/api';
export type {
  UserSummary,
  UserDetail,
  UserStats,
  FollowCounts,
} from './types/user';
export type {
  LottoGameStatus,
  LottoGame,
  LottoTicket,
  WinningInfo,
  PrizeAmountMap,
} from './types/lotto';
export type {
  Post,
  Comment,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
} from './types/community';
export type { ScanResult, ExtractionMethod } from './types/ticket';
export type { Notification } from './types/notification';
export type { LottoSpot, WinningStoreHistory } from './types/spot';

// Constants
export {
  LOTTO_MIN,
  LOTTO_MAX,
  NUMBERS_PER_GAME,
  MAX_GAMES_PER_TICKET,
  NUMBER_COLOR_RANGES,
} from './constants/lotto';
```

- [ ] **Step 10: 타입체크 확인**

Run: `cd packages/shared && npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 11: Commit**

```bash
git add packages/shared/
git commit -m "feat: @clover/shared 공유 타입 패키지 생성"
```

---

## Task 5: 앱에서 shared 패키지 의존성 연결

**Files:**
- Modify: `apps/backend/package.json`
- Modify: `apps/frontend/package.json`

- [ ] **Step 1: backend에 shared 의존성 추가**

`apps/backend/package.json`의 dependencies에 추가:

```json
{
  "dependencies": {
    "@clover/shared": "*",
    ...existing deps...
  }
}
```

- [ ] **Step 2: frontend에 shared 의존성 추가**

`apps/frontend/package.json`의 dependencies에 추가:

```json
{
  "dependencies": {
    "@clover/shared": "*",
    ...existing deps...
  }
}
```

- [ ] **Step 3: root에서 npm install**

Run: `npm install`
Expected: 워크스페이스 심볼릭 링크 생성됨

- [ ] **Step 4: import 동작 확인 — backend**

`apps/backend`에서 임시로 테스트:

Run: `cd apps/backend && node -e "const s = require('@clover/shared'); console.log(Object.keys(s))"`
Expected: 상수들이 출력됨

- [ ] **Step 5: Commit**

```bash
git add apps/backend/package.json apps/frontend/package.json package-lock.json
git commit -m "build: @clover/shared 의존성 연결"
```

---

## Task 6: CI 파이프라인 강화

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Turborepo 기반 CI로 전환**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build-and-test:
    name: Build & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx prisma generate
        working-directory: apps/backend
      - run: npx turbo run lint
      - name: Test with coverage
        run: |
          npx turbo run test -- --coverage \
            --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
      - run: npx turbo run build
```

- [ ] **Step 2: CI 문법 확인**

Run: `cat .github/workflows/ci.yml | head -30`
Expected: YAML 문법 올바름

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: Turborepo 기반 CI 파이프라인 전환 + 80% 커버리지 강제"
```

---

## Task 7: render.yaml 경로 업데이트

**Files:**
- Modify: `render.yaml`

- [ ] **Step 1: render.yaml 경로 수정**

```yaml
services:
  - type: web
    name: clover-wallet-api
    runtime: node
    region: singapore
    plan: free
    rootDir: apps/backend
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm run start:prod
    buildFilter:
      paths:
        - apps/backend/**
        - packages/shared/**
        - render.yaml
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: SUPABASE_JWT_SECRET
        sync: false
      - key: FIREBASE_KEY_PATH
        value: ./firebase-key.json
    healthCheckPath: /api/v1
    autoDeploy: true

  - type: static
    name: clover-wallet-web
    env: static
    region: singapore
    plan: free
    rootDir: apps/frontend
    buildFilter:
      paths:
        - apps/frontend/**
        - packages/shared/**
        - render.yaml
    buildCommand: npm install --legacy-peer-deps && npx expo export --platform web
    publishPath: dist
    autoDeploy: true
    envVars:
      - key: EXPO_PUBLIC_API_URL
        value: https://clover-wallet-api.onrender.com/api/v1
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

- [ ] **Step 2: Commit**

```bash
git add render.yaml
git commit -m "build: render.yaml 경로를 apps/ 구조에 맞게 업데이트"
```

---

## Task 8: pre_commit.sh 정리

**Files:**
- Modify: `scripts/pre_commit.sh`

- [ ] **Step 1: Kotlin/Gradle 로직 제거 + 경로 업데이트**

`scripts/pre_commit.sh`에서 섹션 3.2 (Kotlin) 전체를 제거하고, frontend 경로를 apps/frontend로 변경:

- 50행: `if echo "$STAGED_ALL" | grep -q "frontend/"` → `if echo "$STAGED_ALL" | grep -q "apps/frontend/"`
- 52행: `cd frontend` → `cd apps/frontend`
- 79~83행 (섹션 3.2 Kotlin 전체 블록) 삭제

- [ ] **Step 2: pre-commit 실행 확인**

Run: `bash scripts/pre_commit.sh`
Expected: Guard 감사 성공

- [ ] **Step 3: Commit**

```bash
git add scripts/pre_commit.sh
git commit -m "build: pre_commit.sh에서 Kotlin 로직 제거 + apps/ 경로 반영"
```

---

## Task 9: Dockerfile 경로 업데이트

**Files:**
- Modify: `.Dockerfile` (또는 `Dockerfile` — 존재하는 파일)

- [ ] **Step 1: Dockerfile WORKDIR 및 COPY 경로 업데이트**

Dockerfile의 경로를 apps/backend 기준으로 수정. COPY 및 WORKDIR를 `apps/backend`로 변경.

- [ ] **Step 2: Commit**

```bash
git add .Dockerfile
git commit -m "build: Dockerfile 경로를 apps/backend에 맞게 업데이트"
```

---

## Task 10: 전체 통합 검증

- [ ] **Step 1: root에서 turbo build**

Run: `npx turbo run build`
Expected: 모든 워크스페이스 빌드 성공

- [ ] **Step 2: root에서 turbo test**

Run: `npx turbo run test -- --no-coverage`
Expected: 모든 테스트 통과

- [ ] **Step 3: root에서 turbo lint**

Run: `npx turbo run lint`
Expected: lint 에러 없음

- [ ] **Step 4: shared import 확인**

`@clover/shared`에서 타입을 import하는 임시 파일을 만들어 TypeScript 컴파일 확인 후 삭제.

- [ ] **Step 5: 최종 커밋**

```bash
git add -A
git commit -m "build: Stream 1 인프라 완료 — Turborepo + shared + CI 강화"
```
