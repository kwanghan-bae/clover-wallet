# 코드베이스 리팩토링 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 전체 코드베이스(Backend NestJS + Frontend React Native)의 안정성·유지보수성·가독성을 5-Pass 리팩토링으로 달성한다.

**Architecture:** 이슈 유형별 일괄 처리 방식(Pass 0→4 순서). 각 Pass는 독립적으로 커밋 가능하며, Pass 완료 후 전체 테스트 통과 확인. Service → PrismaService 직접 호출 패턴은 변경하지 않는다.

**Tech Stack:** NestJS 11, Prisma 7 (`@prisma/client`), React Native (Expo 54), TypeScript strict, Jest, `@clover/shared` 모노레포 패키지, `@tanstack/react-query`

---

## 파일 구조 변경 요약

| Pass | 파일 | 변경 |
|---|---|---|
| 0 | `packages/shared/src/types/lotto.ts` | 수정 — LottoTicket 필드 업데이트 |
| 0 | `apps/frontend/api/tickets.ts` | 수정 — 로컬 LottoTicket/LottoGame 제거, shared import |
| 1 | `apps/backend/src/lotto/lotto.service.ts` | 수정 — `as any` 제거, 반환 타입 명시 |
| 1 | `apps/backend/src/lotto-spot/lotto-winning-store.service.ts` | 수정 — `any[]` 제거 + parseRank 통합 |
| 2 | `apps/backend/src/community/__tests__/post.service.spec.ts` | **삭제** (분리) |
| 2 | `apps/backend/src/community/__tests__/post.service.query.spec.ts` | **신규** |
| 2 | `apps/backend/src/community/__tests__/post.service.write.spec.ts` | **신규** |
| 2 | `apps/frontend/hooks/useHistoryData.ts` | **신규** |
| 2 | `apps/frontend/app/(tabs)/history.tsx` | 수정 — 데이터 로직 훅으로 이동 |
| 2 | `apps/frontend/context/AuthContext.ts` | **신규** |
| 2 | `apps/frontend/hooks/useAuth.ts` | 수정 — useAuth 훅만 남김 |
| 3 | `apps/backend/src/lotto/lotto.service.ts` | 수정 — alias 메서드 제거 |
| 3 | `apps/backend/src/lotto/lotto.controller.ts` | 수정 — 직접 메서드 호출 |
| 4 | Backend service 파일 다수 | 수정 — 자명한 JSDoc 제거 |
| 4 | `apps/frontend/constants/lotto-status.ts` | **신규** |
| 4 | `apps/frontend/app/(tabs)/history.tsx` | 수정 — 인라인 함수 → import |

---

## Task 1: Pass 0 — @clover/shared LottoTicket 타입 통합

**Files:**
- Modify: `packages/shared/src/types/lotto.ts`
- Modify: `apps/frontend/api/tickets.ts`

- [ ] **Step 1: 베이스라인 타입 체크**

```bash
cd packages/shared && npx tsc --noEmit
cd apps/frontend && npx tsc --noEmit
```

Expected: 에러 없음 (베이스라인 확인)

- [ ] **Step 2: `packages/shared/src/types/lotto.ts` LottoTicket 필드 업데이트**

`status` 타입을 narrower로, `url` 추가, `games` optional, `createdAt` required로 변경:

```typescript
// packages/shared/src/types/lotto.ts — 파일 전체 교체
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
  status: 'STASHED' | 'WINNING' | 'LOSING';
  url?: string;
  games?: LottoGame[];
  createdAt: string;
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

- [ ] **Step 3: shared 빌드 확인**

```bash
cd packages/shared && npm run build
```

Expected: 에러 없이 `dist/` 생성

- [ ] **Step 4: `apps/frontend/api/tickets.ts` 로컬 타입 제거 후 shared import**

로컬 `LottoTicket`, `LottoGame` 인터페이스 정의를 제거하고 shared에서 import. 기존 consumer(`history.tsx` 등)가 이 파일을 통해 import하므로 re-export 포함:

```typescript
// apps/frontend/api/tickets.ts
import { apiClient } from './client';
import type { PageResponse, LottoTicket, LottoGame } from '@clover/shared';

export type { LottoTicket, LottoGame };

export const ticketsApi = {
  getMyTickets: (page = 0, size = 20) =>
    apiClient.get(`tickets?page=${page}&size=${size}`).json<PageResponse<LottoTicket>>(),

  getTicketById: (id: number) =>
    apiClient.get(`tickets/${id}`).json<LottoTicket>(),
};
```

- [ ] **Step 5: 프론트엔드 타입 체크**

```bash
cd apps/frontend && npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 6: 커밋**

```bash
git add packages/shared/src/types/lotto.ts apps/frontend/api/tickets.ts packages/shared/dist
git commit -m "refactor(shared): LottoTicket 타입 통합 — 프론트 중복 정의 제거

- LottoTicket: status narrower, url 추가, games optional, createdAt required
- frontend/api/tickets.ts 로컬 타입 제거 → @clover/shared import

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 2: Pass 1 Backend — lotto.service.ts `as any` 제거

**Files:**
- Modify: `apps/backend/src/lotto/lotto.service.ts`

- [ ] **Step 1: 베이스라인 테스트 및 타입 체크**

```bash
cd apps/backend && npm test -- --testPathPattern="lotto" --no-coverage
cd apps/backend && npx tsc --noEmit
```

Expected: 테스트 통과, tsc 에러 없음

- [ ] **Step 2: `saveGame`의 `as any` 제거 — Prisma 타입 사용**

`userId`를 직접 지정할 때는 `Prisma.LottoGameUncheckedCreateInput` 사용:

```typescript
// apps/backend/src/lotto/lotto.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, LottoGame } from '@prisma/client';
import { SaveGameDto } from './dto/save-game.dto';
import { PageResponse } from '../common/types/page-response';
import { BadgeService } from '../users/badge.service';

/** 로또 게임 저장, 내역 조회, 통계 계산을 처리하는 서비스입니다. */
@Injectable()
export class LottoService {
  constructor(
    private prisma: PrismaService,
    private badgeService: BadgeService,
  ) {}

  async saveGame(userId: string, dto: SaveGameDto): Promise<LottoGame> {
    const userIdBig = BigInt(userId);
    const data: Prisma.LottoGameUncheckedCreateInput = {
      userId: userIdBig,
      status: 'STASHED',
      number1: dto.numbers[0],
      number2: dto.numbers[1],
      number3: dto.numbers[2],
      number4: dto.numbers[3],
      number5: dto.numbers[4],
      number6: dto.numbers[5],
      extractionMethod: dto.extractionMethod,
    };
    const game = await this.prisma.lottoGame.create({ data });
    // 번호 생성 뱃지 체크
    await this.badgeService.updateUserBadges(userIdBig);
    return game;
  }

  /** @deprecated Pass 3에서 제거 예정 */
  async saveGeneratedGame(dto: SaveGameDto) {
    return this.saveGame(String(dto.userId), dto);
  }

  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PageResponse<LottoGame>> {
    const userIdBig = BigInt(userId);
    const skip = (page - 1) * limit;
    const [content, totalElements] = await Promise.all([
      this.prisma.lottoGame.findMany({
        where: { userId: userIdBig },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.lottoGame.count({ where: { userId: userIdBig } }),
    ]);
    return {
      content,
      pageNumber: page,
      pageSize: limit,
      totalElements,
      totalPages: Math.ceil(totalElements / limit),
    };
  }

  /** @deprecated Pass 3에서 제거 예정 */
  async getGamesByUserId(
    userId: string | bigint,
    page: number = 0,
    size: number = 20,
  ): Promise<PageResponse<LottoGame>> {
    return this.getHistory(String(userId), page + 1, size);
  }

  async getStatistics(userId: string) {
    const userIdBig = BigInt(userId);
    const games = await this.prisma.lottoGame.findMany({
      where: { userId: userIdBig },
      select: { status: true },
    });
    return {
      total: games.length,
      winCount: games.filter((g) => g.status.startsWith('WINNING')).length,
      loseCount: games.filter((g) => g.status === 'LOSING').length,
    };
  }
}
```

- [ ] **Step 3: 타입 체크 및 테스트 실행**

```bash
cd apps/backend && npx tsc --noEmit
cd apps/backend && npm test -- --testPathPattern="lotto" --no-coverage
```

Expected: tsc 에러 없음, 테스트 통과

- [ ] **Step 4: 커밋**

```bash
git add apps/backend/src/lotto/lotto.service.ts
git commit -m "refactor(backend): lotto.service any 타입 제거 (Prisma.LottoGameUncheckedCreateInput)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 3: Pass 1+2 Backend — lotto-winning-store.service.ts 타입 정리 및 parseRank 통합

**Files:**
- Modify: `apps/backend/src/lotto-spot/lotto-winning-store.service.ts`

- [ ] **Step 1: 베이스라인 테스트 실행**

```bash
cd apps/backend && npm test -- --testPathPattern="lotto-winning-store" --no-coverage
```

Expected: 테스트 통과

- [ ] **Step 2: 파일 전체 교체 — WinningStoreInput 인터페이스 정의 + parseStoresByRank로 통합**

`parseRank1Stores` + `parseRank2Stores`를 `parseStoresByRank(rank: 1 | 2)`로 통합, `any[]` 제거:

```typescript
// apps/backend/src/lotto-spot/lotto-winning-store.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';

interface WinningStoreInput {
  round: number;
  rank: 1 | 2;
  storeName: string;
  method: string | null;
  address: string;
}

@Injectable()
export class LottoWinningStoreService {
  private readonly logger = new Logger(LottoWinningStoreService.name);
  private readonly winningStoreUrl =
    'https://www.dhlottery.co.kr/store.do?method=topStore&drwNo=';

  constructor(private readonly prisma: PrismaService) {}

  async crawlWinningStores(
    round: number,
  ): Promise<{ count: number; message: string }> {
    if (await this.isAlreadyCrawled(round)) {
      this.logger.log(
        `${round} 회차 당첨 판매점 데이터가 이미 존재합니다. 건너뜁니다.`,
      );
      return { count: 0, message: 'Already exists' };
    }

    this.logger.log(`${round} 회차 판매점 크롤링 시작`);

    try {
      const $ = await this.fetchHtml(round);
      const storesToSave = this.parseAllStores($, round);

      if (storesToSave.length > 0) {
        await this.saveStoresToDb(storesToSave);
        this.logger.log(
          `${round} 회차 당첨 판매점 ${storesToSave.length}개 저장 성공`,
        );
        return { count: storesToSave.length, message: 'Saved' };
      }

      this.logger.warn(`${round} 회차 당첨 판매점을 찾을 수 없습니다`);
      return { count: 0, message: 'No stores found' };
    } catch (error) {
      this.logger.error(
        `${round} 회차 당첨 판매점 크롤링 실패`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  private async isAlreadyCrawled(round: number): Promise<boolean> {
    const existing = await this.prisma.lottoWinningStore.findFirst({
      where: { round },
    });
    return !!existing;
  }

  private async fetchHtml(round: number): Promise<cheerio.CheerioAPI> {
    const url = `${this.winningStoreUrl}${round}`;
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });
    const decodedData = iconv.decode(Buffer.from(response.data), 'EUC-KR');
    return cheerio.load(decodedData);
  }

  private parseAllStores(
    $: cheerio.CheerioAPI,
    round: number,
  ): WinningStoreInput[] {
    const tables = $('table.tbl_data');
    return [
      ...(tables.length >= 1
        ? this.parseStoresByRank($, tables[0] as cheerio.Element, round, 1)
        : []),
      ...(tables.length >= 2
        ? this.parseStoresByRank($, tables[1] as cheerio.Element, round, 2)
        : []),
    ];
  }

  private parseStoresByRank(
    $: cheerio.CheerioAPI,
    table: cheerio.Element,
    round: number,
    rank: 1 | 2,
  ): WinningStoreInput[] {
    const minCols = rank === 1 ? 4 : 3;
    const stores: WinningStoreInput[] = [];
    $(table)
      .find('tbody tr')
      .each((_, element) => {
        const tds = $(element).find('td');
        if (
          tds.length >= minCols &&
          !$(tds[0]).text().includes('조회 결과가 없습니다')
        ) {
          stores.push({
            round,
            rank,
            storeName: $(tds[1]).text().trim(),
            method: rank === 1 ? $(tds[2]).text().trim() : null,
            address: $(tds[rank === 1 ? 3 : 2]).text().trim(),
          });
        }
      });
    return stores;
  }

  private async saveStoresToDb(
    storesToSave: WinningStoreInput[],
  ): Promise<void> {
    await this.prisma.$transaction(
      storesToSave.map((store) =>
        this.prisma.lottoWinningStore.create({
          data: { ...store, createdAt: new Date() },
        }),
      ),
    );
  }

  async getWinningStores(round: number) {
    return this.prisma.lottoWinningStore.findMany({
      where: { round },
      orderBy: { rank: 'asc' },
    });
  }

  async getWinningHistoryByName(storeName: string) {
    return this.prisma.lottoWinningStore.findMany({
      where: { storeName },
      orderBy: { round: 'desc' },
    });
  }
}
```

- [ ] **Step 3: 줄 수 및 타입 체크**

```bash
wc -l apps/backend/src/lotto-spot/lotto-winning-store.service.ts
cd apps/backend && npx tsc --noEmit
```

Expected: 150줄 이하, tsc 에러 없음

- [ ] **Step 4: 테스트 실행**

```bash
cd apps/backend && npm test -- --testPathPattern="lotto-winning-store" --no-coverage
```

Expected: 테스트 통과

- [ ] **Step 5: 커밋**

```bash
git add apps/backend/src/lotto-spot/lotto-winning-store.service.ts
git commit -m "refactor(backend): lotto-winning-store parseRank 통합 및 any 타입 제거

- parseRank1Stores + parseRank2Stores → parseStoresByRank(rank: 1 | 2)
- any[] → WinningStoreInput 인터페이스
- 178줄 → 150줄 이하

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 4: Pass 2 Backend — post.service.spec.ts 분리

**Files:**
- Delete: `apps/backend/src/community/__tests__/post.service.spec.ts`
- Create: `apps/backend/src/community/__tests__/post.service.query.spec.ts`
- Create: `apps/backend/src/community/__tests__/post.service.write.spec.ts`

분리 기준:
- **query**: `getAllPosts`, `getPostById`, `getUserPosts`, `transformPost`, `mapToUserSummary`, `getLikedPostIds` (읽기 + 헬퍼)
- **write**: `createPost`, `updatePost`, `deletePost`, `validatePostOwnership` (쓰기 + 검증)

- [ ] **Step 1: 베이스라인 테스트 실행 및 테스트 수 확인**

```bash
cd apps/backend && npm test -- --testPathPattern="post.service" --no-coverage --verbose 2>&1 | grep -E "✓|✗|PASS|FAIL|Tests:"
```

Expected: 전체 통과, 테스트 수 메모 (분리 후 동일 수 확인용)

- [ ] **Step 2: `post.service.query.spec.ts` 생성**

```typescript
// apps/backend/src/community/__tests__/post.service.query.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../post.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PostService — 읽기/조회', () => {
  let service: PostService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            postLike: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getAllPosts', () => {
    it('게시글 목록을 페이징하여 반환해야 한다', async () => {
      const mockPosts = [
        {
          id: BigInt(1),
          user: { id: BigInt(10), ssoQualifier: 'user@test.com', badges: 'A,B' },
        },
      ];
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(15);

      const result = await service.getAllPosts(0, 10);

      expect(result.content).toHaveLength(1);
      expect(result.totalPages).toBe(2);
      expect(result.content[0].userSummary.nickname).toBe('user');
    });

    it('로그인한 사용자의 경우 좋아요 여부를 포함해야 한다', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([{ id: BigInt(1) }]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);
      (prisma.postLike.findMany as jest.Mock).mockResolvedValue([
        { postId: BigInt(1) },
      ]);

      const result = await service.getAllPosts(0, 10, BigInt(100));
      expect(result.content[0].isLiked).toBe(true);
    });
  });

  describe('getPostById', () => {
    it('게시글 상세 정보를 반환해야 한다', async () => {
      const mockPost = {
        id: BigInt(1),
        user: { id: BigInt(10), ssoQualifier: 'u@t.c', badges: '' },
      };
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);

      const result = await service.getPostById(BigInt(1));
      expect(result.id).toBe(BigInt(1));
      expect(result.userSummary).toBeDefined();
    });

    it('존재하지 않는 게시글 조회 시 NotFoundException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getPostById(BigInt(99))).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserPosts', () => {
    it('사용자가 작성한 게시글 목록을 페이징하여 반환해야 한다', async () => {
      const mockPosts = [
        {
          id: BigInt(1),
          userId: BigInt(10),
          user: {
            id: BigInt(10),
            ssoQualifier: 'user@test.com',
            email: 'user@test.com',
            badges: 'A,B',
          },
          _count: { comments: 3 },
        },
      ];
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(25);

      const result = await service.getUserPosts(BigInt(10), 0, 10);

      expect(result.content).toHaveLength(1);
      expect(result.totalPages).toBe(3);
      expect(result.pageNumber).toBe(0);
      expect(result.pageSize).toBe(10);
      expect(result.totalElements).toBe(25);
    });

    it('게시글이 없을 경우 빈 목록을 반환해야 한다', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.post.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getUserPosts(BigInt(99), 0, 10);

      expect(result.content).toHaveLength(0);
      expect(result.totalPages).toBe(0);
      expect(result.totalElements).toBe(0);
    });
  });

  describe('transformPost', () => {
    it('게시글 데이터를 API 응답 형식으로 변환해야 한다', () => {
      const post = {
        id: BigInt(1),
        user: { id: BigInt(10), ssoQualifier: 'nick@t.c', badges: 'A' },
      };
      const result = service.transformPost(post, true);
      expect(result.isLiked).toBe(true);
      expect(result.userSummary.nickname).toBe('nick');
    });
  });

  describe('mapToUserSummary', () => {
    it('사용자 요약 정보를 생성해야 한다', () => {
      const user = { id: BigInt(1), ssoQualifier: 'test@a.b', badges: 'X,Y' };
      const result = service.mapToUserSummary(user);
      expect(result).toEqual({ id: BigInt(1), nickname: 'test', badges: ['X', 'Y'] });
    });

    it('user가 null인 경우 null을 반환해야 한다', () => {
      expect(service.mapToUserSummary(null)).toBeNull();
    });

    it('badges가 없는 경우 빈 배열을 반환해야 한다', () => {
      const user = { id: BigInt(1), ssoQualifier: 'u@a.b', badges: undefined };
      const result = service.mapToUserSummary(user);
      expect(result!.badges).toEqual([]);
    });
  });

  describe('getLikedPostIds', () => {
    it('좋아요를 누른 게시글 ID Set을 반환해야 한다', async () => {
      (prisma.postLike.findMany as jest.Mock).mockResolvedValue([
        { postId: BigInt(1) },
        { postId: BigInt(3) },
      ]);

      const result = await service.getLikedPostIds(
        [BigInt(1), BigInt(2), BigInt(3)],
        BigInt(100),
      );
      expect(result.has('1')).toBe(true);
      expect(result.has('2')).toBe(false);
      expect(result.has('3')).toBe(true);
    });

    it('userId가 없으면 빈 Set을 반환해야 한다', async () => {
      const result = await service.getLikedPostIds([BigInt(1)]);
      expect(result.size).toBe(0);
    });

    it('postIds가 비어있으면 빈 Set을 반환해야 한다', async () => {
      const result = await service.getLikedPostIds([], BigInt(1));
      expect(result.size).toBe(0);
    });
  });
});
```

- [ ] **Step 3: `post.service.write.spec.ts` 생성**

```typescript
// apps/backend/src/community/__tests__/post.service.write.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../post.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PostService — 쓰기/검증', () => {
  let service: PostService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            postLike: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createPost', () => {
    it('새 게시글을 생성해야 한다', async () => {
      const dto = { title: 'T', content: 'C' };
      (prisma.post.create as jest.Mock).mockResolvedValue({ id: BigInt(1) });
      await service.createPost(BigInt(1), dto);
      expect(prisma.post.create).toHaveBeenCalled();
    });
  });

  describe('updatePost', () => {
    it('작성자일 경우 게시글을 수정해야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
      });
      await service.updatePost(BigInt(1), BigInt(1), { title: 'U' });
      expect(prisma.post.update).toHaveBeenCalled();
    });

    it('작성자가 아닐 경우 ForbiddenException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });
      await expect(
        service.updatePost(BigInt(1), BigInt(1), { title: 'U' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deletePost', () => {
    it('작성자일 경우 게시글을 삭제해야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
      });
      (prisma.post.delete as jest.Mock).mockResolvedValue({ id: BigInt(1) });

      await service.deletePost(BigInt(1), BigInt(1));

      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it('게시글이 없을 경우 NotFoundException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.deletePost(BigInt(99), BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('작성자가 아닐 경우 ForbiddenException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });
      await expect(service.deletePost(BigInt(1), BigInt(1))).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('validatePostOwnership', () => {
    it('작성자일 경우 게시글을 반환해야 한다', async () => {
      const post = { id: BigInt(1), userId: BigInt(1) };
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(post);
      const result = await service.validatePostOwnership(BigInt(1), BigInt(1));
      expect(result).toEqual(post);
    });

    it('게시글이 없으면 NotFoundException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.validatePostOwnership(BigInt(1), BigInt(1)),
      ).rejects.toThrow(NotFoundException);
    });

    it('작성자가 아니면 ForbiddenException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });
      await expect(
        service.validatePostOwnership(BigInt(1), BigInt(1)),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
```

- [ ] **Step 4: 기존 파일 삭제**

```bash
rm apps/backend/src/community/__tests__/post.service.spec.ts
```

- [ ] **Step 5: 분리된 테스트 실행 확인**

```bash
cd apps/backend && npm test -- --testPathPattern="post.service" --no-coverage --verbose
```

Expected: query.spec.ts와 write.spec.ts 모두 PASS, 원본과 동일한 테스트 수

- [ ] **Step 6: 커밋**

```bash
git add apps/backend/src/community/__tests__/
git commit -m "refactor(backend): post.service 테스트 파일 분리 (query/write)

- 283줄 단일 파일 → post.service.query.spec.ts + post.service.write.spec.ts
- 읽기/헬퍼 테스트와 쓰기/검증 테스트 그룹 분리

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 5: Pass 2 Frontend — useHistoryData 훅 추출

**Files:**
- Create: `apps/frontend/hooks/useHistoryData.ts`
- Modify: `apps/frontend/app/(tabs)/history.tsx`

- [ ] **Step 1: `hooks/useHistoryData.ts` 생성**

`history.tsx`의 데이터 로직 전부 이동:

```typescript
// apps/frontend/hooks/useHistoryData.ts
import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import type { LottoTicket } from '../api/tickets';
import { loadItem, StorageKeys, removeFromItemArray } from '../utils/storage';
import type { LottoRecord } from '../api/types/lotto';

export interface HistoryRecord extends LottoRecord {
  _ticketStatus?: string;
}

export function useHistoryData() {
  const [localHistory, setLocalHistory] = useState<LottoRecord[]>([]);

  const { data: ticketData } = useQuery({
    queryKey: ['myTickets'],
    queryFn: () => ticketsApi.getMyTickets(0, 100),
  });

  const loadLocalHistory = useCallback(() => {
    const data = loadItem<LottoRecord[]>(StorageKeys.SAVED_NUMBERS) || [];
    setLocalHistory(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLocalHistory();
    }, [loadLocalHistory]),
  );

  const handleDelete = useCallback(
    (id: number) => {
      removeFromItemArray<LottoRecord>(
        StorageKeys.SAVED_NUMBERS,
        (item) => item.id === id,
      );
      loadLocalHistory();
    },
    [loadLocalHistory],
  );

  const backendRecords = useMemo<HistoryRecord[]>(() => {
    return (ticketData?.content ?? []).flatMap((ticket: LottoTicket) =>
      (ticket.games ?? []).map((game) => ({
        id: game.id,
        status: game.status as LottoRecord['status'],
        numbers: [
          game.number1,
          game.number2,
          game.number3,
          game.number4,
          game.number5,
          game.number6,
        ],
        createdAt: ticket.createdAt,
        round: ticket.ordinal,
        prizeAmount: game.prizeAmount,
        _ticketStatus: ticket.status,
      })),
    );
  }, [ticketData]);

  const records = useMemo<HistoryRecord[]>(() => {
    const backendSet = new Set(
      backendRecords.map(
        (r) =>
          `${r.round}-${[...r.numbers].sort((a, b) => a - b).join(',')}`,
      ),
    );
    const uniqueLocal = localHistory.filter(
      (r) =>
        !backendSet.has(
          `${r.round}-${[...r.numbers].sort((a, b) => a - b).join(',')}`,
        ),
    );
    return [...backendRecords, ...uniqueLocal];
  }, [backendRecords, localHistory]);

  return { records, handleDelete };
}
```

- [ ] **Step 2: `history.tsx` 데이터 로직 제거 후 훅으로 교체**

Note: `getStatusBadge`는 Task 9에서 `constants/lotto-status.ts`로 이동 예정. 이 Task에서는 인라인 함수 유지.

```typescript
// apps/frontend/app/(tabs)/history.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HistoryItem } from '../../components/ui/HistoryItem';
import { QrCode, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import {
  useHistoryData,
  HistoryRecord,
} from '../../hooks/useHistoryData';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'WINNING':
      return { label: '당첨', color: '#4CAF50', bg: '#E8F5E9' };
    case 'LOSING':
      return { label: '미당첨', color: '#757575', bg: '#F5F5F5' };
    default:
      return { label: '확인중', color: '#FFC107', bg: '#FFF8E1' };
  }
};

const HistoryScreen = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { records, handleDelete } = useHistoryData();

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      <View className="flex-row justify-between items-center px-5 py-4 bg-transparent dark:bg-dark-bg">
        <Text
          style={{ fontFamily: 'NotoSansKR_700Bold' }}
          className="text-xl text-[#1A1A1A] dark:text-dark-text"
        >
          내 로또 내역
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/scan')}
          accessibilityLabel="QR 스캔"
          accessibilityRole="button"
        >
          <QrCode size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <FlatList
          data={records}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }: { item: HistoryRecord }) => {
            const badge = item._ticketStatus
              ? getStatusBadge(item._ticketStatus)
              : null;
            return (
              <View>
                {badge && (
                  <View
                    className="self-start mb-1 px-3 py-1 rounded-full"
                    style={{ backgroundColor: badge.bg }}
                  >
                    <Text
                      style={{
                        fontFamily: 'NotoSansKR_700Bold',
                        color: badge.color,
                        fontSize: 12,
                      }}
                    >
                      {badge.label}
                    </Text>
                  </View>
                )}
                <HistoryItem record={item} onDelete={handleDelete} />
              </View>
            );
          }}
          ListEmptyComponent={
            <View
              className="items-center justify-center py-32"
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <View className="w-24 h-24 bg-[#BDBDBD]/10 rounded-full items-center justify-center mb-8">
                <Plus size={48} color="rgba(189, 189, 189, 0.4)" />
              </View>
              <Text
                style={{ fontFamily: 'NotoSansKR_700Bold' }}
                className="text-lg text-[#1A1A1A] dark:text-dark-text"
              >
                저장된 로또 내역이 없습니다
              </Text>
              <Text
                style={{ fontFamily: 'NotoSansKR_400Regular' }}
                className="text-[#BDBDBD] dark:text-dark-text-secondary mt-2 text-center"
              >
                번호를 생성하고 저장해보세요!
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/number-generation')}
                activeOpacity={0.8}
                className="mt-10"
                accessibilityLabel="번호 생성하기"
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  className="px-8 py-3.5 rounded-full shadow-lg"
                >
                  <View className="flex-row items-center">
                    <Plus size={20} color="white" />
                    <Text
                      style={{ fontFamily: 'NotoSansKR_700Bold' }}
                      className="text-white text-base ml-2"
                    >
                      번호 생성하기
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;
```

- [ ] **Step 3: 줄 수 및 타입 체크**

```bash
wc -l apps/frontend/app/(tabs)/history.tsx apps/frontend/hooks/useHistoryData.ts
cd apps/frontend && npx tsc --noEmit
```

Expected: 각각 100줄 이하, tsc 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add apps/frontend/hooks/useHistoryData.ts apps/frontend/app/(tabs)/history.tsx
git commit -m "refactor(frontend): useHistoryData 훅 추출 (history.tsx 관심사 분리)

- 데이터 병합 로직 → hooks/useHistoryData.ts
- history.tsx: UI 렌더링만 담당

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 6: Pass 2 Frontend — useAuth.ts 분리 (AuthContext + useAuth)

**Files:**
- Create: `apps/frontend/context/AuthContext.ts`
- Modify: `apps/frontend/hooks/useAuth.ts`

- [ ] **Step 1: `context/` 디렉토리 확인**

```bash
ls apps/frontend/context 2>/dev/null || echo "디렉토리 없음 — mkdir 필요"
mkdir -p apps/frontend/context
```

- [ ] **Step 2: `context/AuthContext.ts` 생성**

AuthContext 정의, AuthProvider 컴포넌트, 관련 인터페이스를 이동:

```typescript
// apps/frontend/context/AuthContext.ts
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  createElement,
  ReactNode,
} from 'react';
import { supabase } from '../utils/supabase';
import { authApi } from '../api/auth';
import { saveItem, loadItem, removeItem } from '../utils/storage';
import { Logger } from '../utils/logger';

export interface AuthUser {
  id: number;
  email: string;
  nickname: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadItem<AuthUser>('user.profile');
    const token = loadItem<string>('auth.access_token');
    if (stored && token) {
      setUser(stored);
    }
    setIsLoading(false);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const response = await authApi.login(session.access_token);
          saveItem('auth.access_token', response.accessToken);
          if (response.refreshToken) {
            saveItem('auth.refresh_token', response.refreshToken);
          }
          saveItem('user.profile', response.user);
          setUser(response.user);
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
    });

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
          await authApi.logout(token);
        } catch {
          // Backend logout failure is non-critical
        }
      }
      await supabase.auth.signOut();
      removeItem('auth.access_token');
      removeItem('auth.refresh_token');
      removeItem('user.profile');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { user, isLoading, isAuthenticated: !!user, signInWithGoogle, logout } },
    children,
  );
}
```

- [ ] **Step 3: `hooks/useAuth.ts` — useAuth 훅만 남기고 backward-compat re-export 추가**

기존 `useAuth.ts`를 import하는 `app/_layout.tsx` 등이 깨지지 않도록 re-export 포함:

```typescript
// apps/frontend/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AuthState } from '../context/AuthContext';

export { AuthContext, AuthProvider } from '../context/AuthContext';
export type { AuthUser, AuthState } from '../context/AuthContext';

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

- [ ] **Step 4: 줄 수 확인 및 타입 체크**

```bash
wc -l apps/frontend/context/AuthContext.ts apps/frontend/hooks/useAuth.ts
cd apps/frontend && npx tsc --noEmit
```

Expected: context/AuthContext.ts ≤ 85줄, hooks/useAuth.ts ≤ 15줄, tsc 에러 없음

- [ ] **Step 5: 커밋**

```bash
git add apps/frontend/context/AuthContext.ts apps/frontend/hooks/useAuth.ts
git commit -m "refactor(frontend): AuthContext/Provider 분리 (context/AuthContext.ts)

- context/AuthContext.ts: AuthContext, AuthProvider, AuthUser, AuthState
- hooks/useAuth.ts: useAuth 훅 + backward-compat re-export

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 7: Pass 3 Backend — alias 메서드 제거

**Files:**
- Modify: `apps/backend/src/lotto/lotto.service.ts`
- Modify: `apps/backend/src/lotto/lotto.controller.ts`

- [ ] **Step 1: 베이스라인 테스트 실행**

```bash
cd apps/backend && npm test -- --testPathPattern="lotto" --no-coverage
```

Expected: 모든 테스트 통과

- [ ] **Step 2: alias 메서드를 참조하는 파일 확인**

```bash
grep -rn "saveGeneratedGame\|getGamesByUserId" apps/backend/src --include="*.ts"
```

표시된 모든 파일 목록을 메모한다.

- [ ] **Step 3: `lotto.controller.ts` 직접 호출로 전환**

`getGamesByUserId`(0-indexed page) → `getHistory`(1-indexed page)로 변환:

```typescript
// apps/backend/src/lotto/lotto.controller.ts 의 해당 메서드 교체

@UseGuards(AuthGuard('jwt'))
@Get('games')
async getMyGames(
  @Request() req: { user: { id: string } },
  @Query('page') page = 0,
  @Query('size') size = 20,
) {
  // 컨트롤러 page는 0-indexed, getHistory는 1-indexed
  return this.lottoService.getHistory(String(req.user.id), +page + 1, +size);
}

@UseGuards(AuthGuard('jwt'))
@Post('games')
async saveGame(
  @Request() req: { user: { id: string } },
  @Body() dto: SaveGameDto,
) {
  dto.userId = req.user.id.toString();
  return this.lottoService.saveGame(dto.userId, dto);
}
```

- [ ] **Step 4: `lotto.service.ts` — alias 메서드(`saveGeneratedGame`, `getGamesByUserId`) 제거**

두 메서드를 삭제한 최종 `lotto.service.ts`:

```typescript
// apps/backend/src/lotto/lotto.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, LottoGame } from '@prisma/client';
import { SaveGameDto } from './dto/save-game.dto';
import { PageResponse } from '../common/types/page-response';
import { BadgeService } from '../users/badge.service';

/** 로또 게임 저장, 내역 조회, 통계 계산을 처리하는 서비스입니다. */
@Injectable()
export class LottoService {
  constructor(
    private prisma: PrismaService,
    private badgeService: BadgeService,
  ) {}

  async saveGame(userId: string, dto: SaveGameDto): Promise<LottoGame> {
    const userIdBig = BigInt(userId);
    const data: Prisma.LottoGameUncheckedCreateInput = {
      userId: userIdBig,
      status: 'STASHED',
      number1: dto.numbers[0],
      number2: dto.numbers[1],
      number3: dto.numbers[2],
      number4: dto.numbers[3],
      number5: dto.numbers[4],
      number6: dto.numbers[5],
      extractionMethod: dto.extractionMethod,
    };
    const game = await this.prisma.lottoGame.create({ data });
    // 번호 생성 뱃지 체크
    await this.badgeService.updateUserBadges(userIdBig);
    return game;
  }

  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PageResponse<LottoGame>> {
    const userIdBig = BigInt(userId);
    const skip = (page - 1) * limit;
    const [content, totalElements] = await Promise.all([
      this.prisma.lottoGame.findMany({
        where: { userId: userIdBig },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.lottoGame.count({ where: { userId: userIdBig } }),
    ]);
    return {
      content,
      pageNumber: page,
      pageSize: limit,
      totalElements,
      totalPages: Math.ceil(totalElements / limit),
    };
  }

  async getStatistics(userId: string) {
    const userIdBig = BigInt(userId);
    const games = await this.prisma.lottoGame.findMany({
      where: { userId: userIdBig },
      select: { status: true },
    });
    return {
      total: games.length,
      winCount: games.filter((g) => g.status.startsWith('WINNING')).length,
      loseCount: games.filter((g) => g.status === 'LOSING').length,
    };
  }
}
```

- [ ] **Step 5: alias 메서드를 참조하던 테스트 파일 수정**

Step 2에서 확인한 테스트 파일에서 `saveGeneratedGame` → `saveGame`, `getGamesByUserId` → `getHistory`로 변경. 각 테스트 파일을 열어 해당 메서드명을 교체한다.

- [ ] **Step 6: 타입 체크 및 전체 테스트 실행**

```bash
cd apps/backend && npx tsc --noEmit
cd apps/backend && npm test -- --no-coverage
```

Expected: tsc 에러 없음, 모든 테스트 통과

- [ ] **Step 7: 커밋**

```bash
git add apps/backend/src/lotto/
git commit -m "refactor(backend): lotto alias 메서드 제거 (saveGeneratedGame, getGamesByUserId)

- 컨트롤러가 saveGame/getHistory 직접 호출
- 불필요한 wrapper 메서드 2개 제거

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 8: Pass 4 Backend — 자명한 JSDoc 주석 정리

**Files:**
- Modify: `apps/backend/src/users/users.service.ts`
- Modify: `apps/backend/src/lotto/lotto.controller.ts`
- Modify: 기타 service/controller 파일 (아래 scan 명령으로 식별)

**원칙:**
- 제거: constructor/단순 param 설명, 메서드 이름과 동일한 설명, 과거 마이그레이션 흔적
- 유지: 비즈니스 규칙, 예외 처리 이유, 복잡한 알고리즘

- [ ] **Step 1: JSDoc 보유 파일 목록 확인**

```bash
grep -rl "/\*\*" apps/backend/src --include="*.ts" | grep -v ".spec.ts" | grep -v "node_modules" | sort
```

이 목록의 각 파일을 순서대로 처리한다.

- [ ] **Step 2: 각 파일에서 제거할 패턴 일괄 처리**

각 파일을 열어 아래 패턴의 주석 블록을 제거한다:

```typescript
// 제거 대상 패턴 예시
/**
 * XxxService 생성자
 * @param prisma 데이터베이스 접근 서비스
 */
constructor(private prisma: PrismaService) {}

/** 특정 ID를 가진 사용자를 조회합니다. */  // 메서드 이름과 동일
async findUser(id: bigint) { ... }

/**
 * @param id 사용자 ID  // 변수명이 자명한 param
 */

// 제거 대상: Kotlin 마이그레이션 흔적
/** Kotlin LottoController 로직을 이식함. */
```

```typescript
// 유지 대상 패턴 예시
// 이메일이 변경되었거나 새로 추가된 경우 업데이트
if (email && existingUser.email !== email) { ... }

// Backend logout failure is non-critical
```

- [ ] **Step 3: 전체 백엔드 테스트 및 타입 체크**

```bash
cd apps/backend && npx tsc --noEmit
cd apps/backend && npm test -- --no-coverage
```

Expected: 에러 없음, 모든 테스트 통과

- [ ] **Step 4: 커밋**

```bash
git add apps/backend/src/
git commit -m "refactor(backend): 자명한 JSDoc 제거 (WHY 주석만 유지)

- constructor param 설명, 메서드명 반복 주석, 마이그레이션 흔적 제거
- 비즈니스 규칙, 예외 처리 이유 주석은 유지

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 9: Pass 4 Frontend — STATUS_BADGE_MAP 상수 추출

**Files:**
- Create: `apps/frontend/constants/lotto-status.ts`
- Modify: `apps/frontend/app/(tabs)/history.tsx`

- [ ] **Step 1: `constants/lotto-status.ts` 생성**

모든 `LottoGameStatus` 값에 대응하는 배지 정보 정의:

```typescript
// apps/frontend/constants/lotto-status.ts
import type { LottoGameStatus } from '@clover/shared';

export interface StatusBadge {
  label: string;
  color: string;
  bg: string;
}

const DEFAULT_BADGE: StatusBadge = {
  label: '확인중',
  color: '#FFC107',
  bg: '#FFF8E1',
};

export const STATUS_BADGE_MAP: Record<LottoGameStatus, StatusBadge> = {
  WINNING: { label: '당첨', color: '#4CAF50', bg: '#E8F5E9' },
  WINNING_1: { label: '1등', color: '#F44336', bg: '#FFEBEE' },
  WINNING_2: { label: '2등', color: '#FF9800', bg: '#FFF3E0' },
  WINNING_3: { label: '3등', color: '#FF9800', bg: '#FFF3E0' },
  WINNING_4: { label: '4등', color: '#2196F3', bg: '#E3F2FD' },
  WINNING_5: { label: '5등', color: '#2196F3', bg: '#E3F2FD' },
  LOSING: { label: '미당첨', color: '#757575', bg: '#F5F5F5' },
  STASHED: DEFAULT_BADGE,
  NOT_CHECKED: DEFAULT_BADGE,
};

export function getStatusBadge(status: string): StatusBadge {
  return STATUS_BADGE_MAP[status as LottoGameStatus] ?? DEFAULT_BADGE;
}
```

- [ ] **Step 2: `history.tsx` 인라인 `getStatusBadge` 제거 후 import로 교체**

`history.tsx` 상단의 인라인 `getStatusBadge` 함수 삭제 후 import 추가:

```typescript
// history.tsx 상단에서 인라인 함수 제거 후 아래 import 추가
import { getStatusBadge } from '../../constants/lotto-status';
```

(Task 5에서 추가된 인라인 `getStatusBadge` 함수 블록 전체 삭제)

- [ ] **Step 3: 타입 체크**

```bash
cd apps/frontend && npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add apps/frontend/constants/lotto-status.ts apps/frontend/app/(tabs)/history.tsx
git commit -m "refactor(frontend): STATUS_BADGE_MAP 상수 추출 (constants/lotto-status.ts)

- 인라인 getStatusBadge → constants/lotto-status.ts
- 모든 LottoGameStatus 값 명시적 매핑

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## 최종 검증

- [ ] **전체 백엔드 테스트**

```bash
cd apps/backend && npm test -- --no-coverage
```

Expected: 모든 테스트 PASS

- [ ] **전체 프론트엔드 테스트**

```bash
cd apps/frontend && npm test -- --no-coverage
```

Expected: 모든 테스트 PASS

- [ ] **전체 타입 체크**

```bash
cd packages/shared && npm run build
cd apps/backend && npx tsc --noEmit
cd apps/frontend && npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **파일 크기 최종 확인**

```bash
find apps/backend/src apps/frontend/app apps/frontend/hooks apps/frontend/context apps/frontend/constants \
  \( -name "*.ts" -o -name "*.tsx" \) | xargs wc -l | sort -rn | head -20
```

Expected: 150줄 초과 파일 없음 (spec 파일 제외)

- [ ] **최종 커밋 (필요 시 — 정리되지 않은 변경사항이 있을 경우)**

```bash
git add -A
git commit -m "refactor: 코드베이스 리팩토링 완료 (5-Pass)

Pass 0: @clover/shared 타입 통합
Pass 1: any 타입 제거 (타입 안전성)
Pass 2: 파일 분리 및 관심사 분리
Pass 3: alias 메서드 제거
Pass 4: JSDoc 정리 및 상수 추출

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```
