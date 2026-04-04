# Phase 2: 기존 기능 완성도 (Feature Completion) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이미 존재하는 기능들을 실제 출시 수준으로 다듬어 유저가 스캔, 커뮤니티, 명당, 알림을 실제로 사용할 수 있게 만들기

**Architecture:** 프론트엔드 화면과 백엔드 API를 수직 슬라이스로 연결하여 각 기능이 End-to-End로 동작하도록 완성한다. 4개 서브시스템(스캔, 커뮤니티, 명당/여행, 알림)은 독립적이므로 병렬 진행 가능.

**Tech Stack:** React Native/Expo, expo-camera (barcode), NestJS, Prisma, FCM, expo-notifications, React Query

---

## File Structure

### Sub-system A: 스캔 고도화
| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/hooks/useScan.ts` | Modify | QR 바코드 스캔 모드 추가 |
| `frontend/app/scan.tsx` | Modify | QR/OCR 모드 전환 UI, 당첨 상태 표시 |
| `frontend/app/(tabs)/history.tsx` | Modify | 당첨 상태 뱃지 표시, 백엔드 연동 |
| `frontend/api/tickets.ts` | Create | 티켓 API 클라이언트 |
| `frontend/__tests__/api/tickets.test.ts` | Create | 티켓 API 테스트 |

### Sub-system B: 커뮤니티 강화
| File | Action | Responsibility |
|------|--------|---------------|
| `backend-node/prisma/schema.prisma` | Modify | Comment에 parentId 추가 |
| `backend-node/src/community/community.controller.ts` | Modify | DELETE post, GET user posts 추가 |
| `backend-node/src/community/community.service.ts` | Modify | deletePost, getUserPosts, nested comments |
| `backend-node/src/community/__tests__/community.service.spec.ts` | Modify | 새 기능 테스트 |
| `frontend/app/(tabs)/community.tsx` | Modify | 백엔드 연동, 실 데이터 표시 |
| `frontend/app/create-post.tsx` | Modify | 실제 API 호출 |
| `frontend/api/community.ts` | Modify | 누락 엔드포인트 추가 |

### Sub-system C: 명당 & 여행 완성
| File | Action | Responsibility |
|------|--------|---------------|
| `backend-node/src/travel/travel.service.ts` | Modify | 추천 로직 실제 구현 |
| `backend-node/src/travel/__tests__/travel.service.spec.ts` | Modify | 추천 로직 테스트 |
| `frontend/app/spot/[id].tsx` | Modify | 여행 플랜 통합 뷰 |
| `frontend/hooks/useSpotDetail.ts` | Modify | 여행 플랜 데이터 추가 |
| `frontend/api/travel.ts` | Create | 여행 API 클라이언트 |

### Sub-system D: 알림 시스템 연동
| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/hooks/useNotifications.ts` | Create | FCM 토큰 등록 + 알림 관리 훅 |
| `frontend/app/notifications.tsx` | Create | 알림 목록 화면 |
| `frontend/api/notifications.ts` | Create | 알림 API 클라이언트 |
| `frontend/app/_layout.tsx` | Modify | 앱 시작 시 FCM 토큰 등록 |
| `frontend/app/(tabs)/mypage.tsx` | Modify | 알림 진입점 + 뱃지 |
| `backend-node/src/lotto/winning-info-crawler.service.ts` | Modify | 추첨일 알림 Cron 추가 |
| `backend-node/src/notification/__tests__/notification.service.spec.ts` | Modify | Cron 알림 테스트 |

---

## Task 1: 티켓 API 클라이언트

**Files:**
- Create: `frontend/api/tickets.ts`
- Create: `frontend/__tests__/api/tickets.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/__tests__/api/tickets.test.ts
jest.mock('../../api/client', () => ({
  apiClient: {
    get: jest.fn().mockReturnValue({
      json: jest.fn().mockResolvedValue({
        content: [{ id: 1, ordinal: 1100, status: 'STASHED' }],
        totalElements: 1,
      }),
    }),
    post: jest.fn().mockReturnValue({
      json: jest.fn().mockResolvedValue({ id: 1, ordinal: 1100, status: 'STASHED' }),
    }),
  },
}));

import { ticketsApi } from '../../api/tickets';

describe('ticketsApi', () => {
  it('should fetch user tickets', async () => {
    const result = await ticketsApi.getMyTickets(0, 20);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].status).toBe('STASHED');
  });

  it('should scan a ticket by URL', async () => {
    const result = await ticketsApi.scanTicket('https://m.dhlottery.co.kr/qr.do?method=...');
    expect(result.id).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npx jest __tests__/api/tickets.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../../api/tickets'`

- [ ] **Step 3: Implement tickets API**

```typescript
// frontend/api/tickets.ts
import { apiClient } from './client';

export interface LottoTicket {
  id: number;
  ordinal: number;
  status: 'STASHED' | 'WINNING' | 'LOSING';
  url?: string;
  games?: LottoGame[];
  createdAt: string;
}

export interface LottoGame {
  id: number;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  status: string;
  prizeAmount: number;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const ticketsApi = {
  getMyTickets: (page = 0, size = 20) =>
    apiClient.get(`tickets?page=${page}&size=${size}`).json<PageResponse<LottoTicket>>(),

  getTicketById: (id: number) =>
    apiClient.get(`tickets/${id}`).json<LottoTicket>(),

  scanTicket: (url: string) =>
    apiClient.post('tickets/scan', { json: { url } }).json<LottoTicket>(),
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npx jest __tests__/api/tickets.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/api/tickets.ts frontend/__tests__/api/tickets.test.ts
git commit -m "feat(frontend): 티켓 API 클라이언트 추가 (getMyTickets, scanTicket)"
```

---

## Task 2: 스캔 화면 QR 모드 추가

**Files:**
- Modify: `frontend/hooks/useScan.ts`
- Modify: `frontend/app/scan.tsx`

- [ ] **Step 1: Read current files**

```bash
# Read both files to understand current structure
```

- [ ] **Step 2: Add QR barcode scanning to useScan hook**

`frontend/hooks/useScan.ts` — barcode 콜백 추가:

```typescript
// ADD to imports:
import { ticketsApi } from '../api/tickets';

// ADD state:
const [scanMode, setScanMode] = useState<'ocr' | 'qr'>('qr');

// ADD QR handler:
const handleBarCodeScanned = useCallback(async (data: string) => {
  if (isProcessing) return;
  setIsProcessing(true);
  try {
    const ticket = await ticketsApi.scanTicket(data);
    setScanResult({
      numbers: ticket.games?.[0]
        ? [ticket.games[0].number1, ticket.games[0].number2, ticket.games[0].number3,
           ticket.games[0].number4, ticket.games[0].number5, ticket.games[0].number6]
        : [],
      round: ticket.ordinal,
      ticket,
    });
  } catch (error) {
    Alert.alert('스캔 실패', 'QR 코드를 인식할 수 없습니다. 다시 시도해주세요.');
  } finally {
    setIsProcessing(false);
  }
}, [isProcessing]);

// ADD to return:
// scanMode, setScanMode, handleBarCodeScanned
```

- [ ] **Step 3: Update scan.tsx for QR/OCR mode switching**

`frontend/app/scan.tsx` — 모드 전환 탭 추가:

```typescript
// ADD mode toggle UI above the camera view:
<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
  <Pressable
    onPress={() => setScanMode('qr')}
    className={`px-4 py-2 rounded-full ${scanMode === 'qr' ? 'bg-primary' : 'bg-gray-200'}`}
  >
    <Text className={scanMode === 'qr' ? 'text-white font-bold' : 'text-gray-600'}>QR 스캔</Text>
  </Pressable>
  <Pressable
    onPress={() => setScanMode('ocr')}
    className={`px-4 py-2 rounded-full ${scanMode === 'ocr' ? 'bg-primary' : 'bg-gray-200'}`}
  >
    <Text className={scanMode === 'ocr' ? 'text-white font-bold' : 'text-gray-600'}>OCR 스캔</Text>
  </Pressable>
</View>

// ADD barcode scanning props to CameraView:
// When scanMode === 'qr', add: onBarcodeScanned={handleBarCodeScanned} barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
// When scanMode === 'ocr', keep existing capture button behavior
```

- [ ] **Step 4: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/hooks/useScan.ts frontend/app/scan.tsx
git commit -m "feat(frontend): 스캔 화면 QR 바코드 모드 추가 (QR/OCR 전환)"
```

---

## Task 3: History 화면 백엔드 연동 및 당첨 상태 표시

**Files:**
- Modify: `frontend/app/(tabs)/history.tsx`

- [ ] **Step 1: Read current history.tsx**

- [ ] **Step 2: Connect history to backend API**

`frontend/app/(tabs)/history.tsx` — 로컬 스토리지 대신 React Query + 백엔드 연동:

```typescript
// REPLACE storage-based loading with React Query:
import { useQuery } from '@tanstack/react-query';
import { ticketsApi, LottoTicket } from '../../api/tickets';

// Inside component:
const { data: ticketData, isLoading, refetch } = useQuery({
  queryKey: ['myTickets'],
  queryFn: () => ticketsApi.getMyTickets(0, 100),
});

const tickets = ticketData?.content ?? [];

// KEEP existing local records as fallback for offline generated numbers
// Merge both sources in the FlatList
```

- [ ] **Step 3: Add status badge to history items**

각 티켓 아이템에 당첨 상태 뱃지 추가:

```typescript
// In the FlatList renderItem, add status badge:
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'WINNING': return { label: '당첨', color: '#4CAF50', bg: '#E8F5E9' };
    case 'LOSING': return { label: '미당첨', color: '#757575', bg: '#F5F5F5' };
    default: return { label: '확인중', color: '#FFC107', bg: '#FFF8E1' };
  }
};

// Render badge next to each ticket:
// <View style={{ backgroundColor: badge.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
//   <Text style={{ color: badge.color, fontSize: 12, fontWeight: '600' }}>{badge.label}</Text>
// </View>
```

- [ ] **Step 4: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/app/\(tabs\)/history.tsx
git commit -m "feat(frontend): History 화면 백엔드 연동 및 당첨 상태 뱃지 표시"
```

---

## Task 4: 커뮤니티 — 대댓글 스키마 + 게시글 삭제 백엔드

**Files:**
- Modify: `backend-node/prisma/schema.prisma`
- Modify: `backend-node/src/community/community.controller.ts`
- Modify: `backend-node/src/community/community.service.ts`
- Create/Modify: `backend-node/src/community/__tests__/community.service.spec.ts`

- [ ] **Step 1: Add parentId to Comment model in schema.prisma**

```prisma
// In the Comment model, ADD:
  parentId  BigInt?   @map("parent_id")
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   Comment[] @relation("CommentReplies")
```

- [ ] **Step 2: Generate migration**

```bash
cd backend-node && npx prisma migrate dev --name add-comment-parent-id
```

- [ ] **Step 3: Write failing test for deletePost**

```typescript
// backend-node/src/community/__tests__/community.service.spec.ts — ADD:
describe('deletePost', () => {
  it('should delete post owned by user', async () => {
    mockPrisma.post.findUnique.mockResolvedValue({ id: BigInt(1), userId: BigInt(1) });
    mockPrisma.post.delete.mockResolvedValue({ id: BigInt(1) });
    await service.deletePost(BigInt(1), BigInt(1));
    expect(mockPrisma.post.delete).toHaveBeenCalledWith({ where: { id: BigInt(1) } });
  });

  it('should throw ForbiddenException if not owner', async () => {
    mockPrisma.post.findUnique.mockResolvedValue({ id: BigInt(1), userId: BigInt(2) });
    await expect(service.deletePost(BigInt(1), BigInt(1))).rejects.toThrow();
  });
});

describe('getUserPosts', () => {
  it('should return posts by user', async () => {
    mockPrisma.post.findMany.mockResolvedValue([{ id: BigInt(1), title: 'Test' }]);
    mockPrisma.post.count.mockResolvedValue(1);
    const result = await service.getUserPosts(BigInt(1), 0, 10);
    expect(result.content).toHaveLength(1);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

```bash
cd backend-node && npx jest src/community/__tests__/community.service.spec.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 5: Implement deletePost and getUserPosts in community.service.ts**

```typescript
// ADD to CommunityService:
async deletePost(postId: bigint, userId: bigint): Promise<void> {
  await this.validatePostOwnership(postId, userId);
  await this.prisma.post.delete({ where: { id: postId } });
}

async getUserPosts(userId: bigint, page: number, size: number) {
  const [posts, total] = await Promise.all([
    this.prisma.post.findMany({
      where: { userId },
      skip: page * size,
      take: size,
      orderBy: { createdAt: 'desc' },
      include: { user: true, _count: { select: { comments: true } } },
    }),
    this.prisma.post.count({ where: { userId } }),
  ]);

  return {
    content: posts.map((p) => this.transformPost(p, new Set())),
    pageNumber: page,
    pageSize: size,
    totalElements: total,
    totalPages: Math.ceil(total / size),
  };
}
```

- [ ] **Step 6: Add endpoints to community.controller.ts**

```typescript
// ADD to CommunityController:
@Delete('posts/:id')
@UseGuards(AuthGuard('jwt'))
async deletePost(@Param('id', ParseBigIntPipe) id: bigint, @Req() req) {
  await this.communityService.deletePost(id, req.user.id);
  return { message: 'Post deleted' };
}

@Get('users/:userId/posts')
async getUserPosts(
  @Param('userId', ParseBigIntPipe) userId: bigint,
  @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  @Query('size', new ParseIntPipe({ optional: true })) size?: number,
) {
  return this.communityService.getUserPosts(userId, page ?? 0, size ?? 10);
}
```

- [ ] **Step 7: Update getCommentsByPostId for nested comments**

```typescript
// MODIFY getCommentsByPostId in community.service.ts:
// Add parentId filter and include replies:
const comments = await this.prisma.comment.findMany({
  where: { postId, parentId: null }, // only top-level
  skip: page * size,
  take: size,
  orderBy: { createdAt: 'asc' },
  include: {
    user: true,
    replies: {
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    },
  },
});
```

- [ ] **Step 8: Run tests**

```bash
cd backend-node && npx jest --no-coverage
```

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add backend-node/prisma/ backend-node/src/community/
git commit -m "feat(backend): 커뮤니티 대댓글 스키마, 게시글 삭제, 유저별 게시글 조회 추가"
```

---

## Task 5: 커뮤니티 프론트엔드 백엔드 연동

**Files:**
- Modify: `frontend/api/community.ts`
- Modify: `frontend/app/(tabs)/community.tsx`
- Modify: `frontend/app/create-post.tsx`

- [ ] **Step 1: Read existing api/community.ts**

- [ ] **Step 2: Add missing endpoints to community API**

```typescript
// frontend/api/community.ts — ADD or REPLACE:
import { apiClient } from './client';

export interface Post {
  id: number;
  title: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  userSummary: { id: number; nickname: string; badges: string[] };
  _count?: { comments: number };
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const communityApi = {
  getPosts: (page = 0, size = 10) =>
    apiClient.get(`community/posts?page=${page}&size=${size}`).json<PageResponse<Post>>(),

  getPostById: (id: number) =>
    apiClient.get(`community/posts/${id}`).json<Post>(),

  createPost: (title: string, content: string) =>
    apiClient.post('community/posts', { json: { title, content } }).json<Post>(),

  deletePost: (id: number) =>
    apiClient.delete(`community/posts/${id}`),

  likePost: (id: number) =>
    apiClient.post(`community/posts/${id}/like`).json<{ liked: boolean; likes: number }>(),

  getComments: (postId: number, page = 0, size = 20) =>
    apiClient.get(`community/posts/${postId}/comments?page=${page}&size=${size}`).json<PageResponse<Comment>>(),

  createComment: (postId: number, content: string, parentId?: number) =>
    apiClient.post('community/comments', { json: { postId, content, parentId } }).json<Comment>(),
};
```

- [ ] **Step 3: Connect community screen to backend**

`frontend/app/(tabs)/community.tsx` — 하드코딩 데이터를 React Query로 교체:

```typescript
// REPLACE mock posts with React Query:
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi, Post } from '../../api/community';

const queryClient = useQueryClient();

const { data: postData, isLoading } = useQuery({
  queryKey: ['communityPosts'],
  queryFn: () => communityApi.getPosts(0, 20),
});

const posts = postData?.content ?? [];

const likeMutation = useMutation({
  mutationFn: (postId: number) => communityApi.likePost(postId),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communityPosts'] }),
});

const handleLike = (postId: number) => likeMutation.mutate(postId);
```

- [ ] **Step 4: Connect create-post to backend**

`frontend/app/create-post.tsx` — 실제 API 호출:

```typescript
// REPLACE simulated submit with:
import { communityApi } from '../api/community';

const handleSubmit = async () => {
  if (!title.trim() || !content.trim()) {
    Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
    return;
  }
  try {
    await communityApi.createPost(title.trim(), content.trim());
    router.back();
  } catch (error) {
    Alert.alert('오류', '게시글 작성에 실패했습니다.');
  }
};
```

- [ ] **Step 5: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/api/community.ts frontend/app/\(tabs\)/community.tsx frontend/app/create-post.tsx
git commit -m "feat(frontend): 커뮤니티 화면 백엔드 실 연동 (게시글 조회/작성/좋아요)"
```

---

## Task 6: 여행 추천 로직 구현

**Files:**
- Modify: `backend-node/src/travel/travel.service.ts`
- Create/Modify: `backend-node/src/travel/__tests__/travel.service.spec.ts`

- [ ] **Step 1: Write failing test for recommendation logic**

```typescript
// backend-node/src/travel/__tests__/travel.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TravelService } from '../travel.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TravelService', () => {
  let service: TravelService;

  const mockPrisma = {
    travelPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    lottoSpot: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TravelService>(TravelService);
    jest.clearAllMocks();
  });

  describe('getRecommendedTravelPlans', () => {
    it('should return plans near given coordinates', async () => {
      mockPrisma.lottoSpot.findMany.mockResolvedValue([
        { id: BigInt(1), latitude: 37.5, longitude: 127.0, name: 'Spot A' },
      ]);
      mockPrisma.travelPlan.findMany.mockResolvedValue([
        { id: BigInt(1), spotId: BigInt(1), title: 'Plan A', spot: { name: 'Spot A' } },
      ]);

      const result = await service.getRecommendedTravelPlans(37.5665, 126.978);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Plan A');
    });

    it('should return empty array when no spots nearby', async () => {
      mockPrisma.lottoSpot.findMany.mockResolvedValue([]);
      const result = await service.getRecommendedTravelPlans(0, 0);
      expect(result).toHaveLength(0);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend-node && npx jest src/travel/__tests__/travel.service.spec.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Implement recommendation logic**

```typescript
// backend-node/src/travel/travel.service.ts — REPLACE getRecommendedTravelPlans:
async getRecommendedTravelPlans(latitude?: number, longitude?: number) {
  if (!latitude || !longitude) return [];

  // Find spots within approximately 10km radius
  const deltaLat = 0.09; // ~10km
  const deltaLng = 0.11; // ~10km at 37°N
  const nearbySpots = await this.prisma.lottoSpot.findMany({
    where: {
      latitude: { gte: latitude - deltaLat, lte: latitude + deltaLat },
      longitude: { gte: longitude - deltaLng, lte: longitude + deltaLng },
    },
    select: { id: true },
  });

  if (nearbySpots.length === 0) return [];

  const spotIds = nearbySpots.map((s) => s.id);
  return this.prisma.travelPlan.findMany({
    where: { spotId: { in: spotIds } },
    include: { spot: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}
```

- [ ] **Step 4: Update controller to pass coordinates**

```typescript
// backend-node/src/travel/travel.controller.ts — MODIFY getRecommendedTravelPlans:
@Get('recommended')
@UseGuards(AuthGuard('jwt'))
async getRecommendedTravelPlans(
  @Query('latitude', new ParseFloatPipe({ optional: true })) latitude?: number,
  @Query('longitude', new ParseFloatPipe({ optional: true })) longitude?: number,
) {
  return this.travelService.getRecommendedTravelPlans(latitude, longitude);
}
```

- [ ] **Step 5: Run tests**

```bash
cd backend-node && npx jest src/travel/__tests__/travel.service.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend-node/src/travel/
git commit -m "feat(backend): 여행 추천 로직 구현 (위치 기반 10km 반경 명당 매칭)"
```

---

## Task 7: 명당 상세 화면에 여행 플랜 통합

**Files:**
- Create: `frontend/api/travel.ts`
- Modify: `frontend/hooks/useSpotDetail.ts`
- Modify: `frontend/app/spot/[id].tsx`

- [ ] **Step 1: Create travel API client**

```typescript
// frontend/api/travel.ts
import { apiClient } from './client';

export interface TravelPlan {
  id: number;
  title: string;
  description: string;
  places: string;
  theme: string;
  estimatedHours: number;
  spot: {
    id: number;
    name: string;
  };
}

export const travelApi = {
  getBySpot: (spotId: number) =>
    apiClient.get(`travel-plans/spot/${spotId}`).json<TravelPlan[]>(),

  getById: (id: number) =>
    apiClient.get(`travel-plans/${id}`).json<TravelPlan>(),

  getRecommended: (latitude: number, longitude: number) =>
    apiClient
      .get(`travel-plans/recommended?latitude=${latitude}&longitude=${longitude}`)
      .json<TravelPlan[]>(),
};
```

- [ ] **Step 2: Add travel plans to useSpotDetail hook**

```typescript
// frontend/hooks/useSpotDetail.ts — ADD:
import { travelApi, TravelPlan } from '../api/travel';

// ADD second query:
const { data: travelPlans = [] } = useQuery({
  queryKey: ['spotTravelPlans', id],
  queryFn: () => travelApi.getBySpot(Number(id)),
  enabled: !!id,
});

// ADD to return:
// travelPlans
```

- [ ] **Step 3: Add travel plan section to spot detail screen**

`frontend/app/spot/[id].tsx` — 당첨 이력 아래에 여행 플랜 섹션 추가:

```typescript
// ADD after winning history section:
{travelPlans.length > 0 && (
  <View className="mt-6">
    <Text className="text-lg font-bold text-text-dark mb-3">🗺️ 주변 여행 코스</Text>
    {travelPlans.map((plan) => (
      <Pressable
        key={plan.id.toString()}
        className="bg-white rounded-2xl p-4 mb-3"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
      >
        <Text className="text-base font-bold text-text-dark">{plan.title}</Text>
        <Text className="text-sm text-text-grey mt-1" numberOfLines={2}>{plan.description}</Text>
        <View className="flex-row items-center mt-2 gap-3">
          <Text className="text-xs text-primary">🏷️ {plan.theme}</Text>
          <Text className="text-xs text-text-grey">⏱️ 약 {plan.estimatedHours}시간</Text>
        </View>
      </Pressable>
    ))}
  </View>
)}
```

- [ ] **Step 4: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/api/travel.ts frontend/hooks/useSpotDetail.ts frontend/app/spot/\[id\].tsx
git commit -m "feat(frontend): 명당 상세 화면에 여행 플랜 통합 뷰 추가"
```

---

## Task 8: 알림 API 클라이언트 및 훅

**Files:**
- Create: `frontend/api/notifications.ts`
- Create: `frontend/hooks/useNotifications.ts`
- Create: `frontend/__tests__/hooks/useNotifications.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/__tests__/hooks/useNotifications.test.ts
jest.mock('../../api/notifications', () => ({
  notificationsApi: {
    getMyNotifications: jest.fn().mockResolvedValue({ content: [], totalElements: 0 }),
    getUnreadCount: jest.fn().mockResolvedValue({ count: 3 }),
    registerFcmToken: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExponentPushToken[xxx]' }),
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

jest.mock('expo-device', () => ({ isDevice: true }));
jest.mock('expo-constants', () => ({ default: { expoConfig: { extra: { eas: { projectId: 'test' } } } } }));

import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useNotifications', () => {
  it('should be defined', () => {
    const { useNotifications } = require('../../hooks/useNotifications');
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('unreadCount');
    expect(result.current).toHaveProperty('registerToken');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npx jest __tests__/hooks/useNotifications.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Create notifications API**

```typescript
// frontend/api/notifications.ts
import { apiClient } from './client';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'WINNING' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

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

- [ ] **Step 4: Create useNotifications hook**

```typescript
// frontend/hooks/useNotifications.ts
import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { notificationsApi } from '../api/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 60000, // poll every minute
  });

  const unreadCount = unreadData?.count ?? 0;

  const registerToken = useCallback(async () => {
    if (!Device.isDevice) return;
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      finalStatus = newStatus;
    }
    if (finalStatus !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    await notificationsApi.registerFcmToken(tokenData.data);
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    await notificationsApi.markAsRead(id);
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  return { unreadCount, registerToken, markAsRead };
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd frontend && npx jest __tests__/hooks/useNotifications.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/api/notifications.ts frontend/hooks/useNotifications.ts frontend/__tests__/hooks/useNotifications.test.ts
git commit -m "feat(frontend): 알림 API 클라이언트 및 useNotifications 훅 구현"
```

---

## Task 9: 알림 목록 화면

**Files:**
- Create: `frontend/app/notifications.tsx`
- Modify: `frontend/app/(tabs)/mypage.tsx`

- [ ] **Step 1: Create notifications screen**

```typescript
// frontend/app/notifications.tsx
import { View, Text, FlatList, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle, Trophy, Info } from 'lucide-react-native';
import { notificationsApi, Notification } from '../api/notifications';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsScreen() {
  const { markAsRead } = useNotifications();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getMyNotifications(0, 50),
  });

  const notifications = data?.content ?? [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'WINNING': return <Trophy size={20} color="#4CAF50" />;
      case 'SYSTEM': return <Info size={20} color="#2196F3" />;
      default: return <Bell size={20} color="#757575" />;
    }
  };

  const handlePress = async (item: Notification) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: '알림', headerShown: true }} />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handlePress(item)}
            className={`flex-row items-start gap-3 p-4 mb-2 rounded-2xl ${item.isRead ? 'bg-white' : 'bg-primary-light'}`}
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 }}
          >
            <View className="mt-1">{getIcon(item.type)}</View>
            <View className="flex-1">
              <Text className="text-base font-bold text-text-dark">{item.title}</Text>
              <Text className="text-sm text-text-grey mt-1">{item.message}</Text>
              <Text className="text-xs text-text-grey mt-2">
                {new Date(item.createdAt).toLocaleDateString('ko-KR')}
              </Text>
            </View>
            {!item.isRead && <View className="w-2 h-2 rounded-full bg-primary mt-2" />}
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Bell size={48} color="#ccc" />
            <Text className="text-text-grey mt-4">알림이 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}
```

- [ ] **Step 2: Add notification entry in mypage.tsx**

`frontend/app/(tabs)/mypage.tsx` — 알림 메뉴 항목 추가 및 뱃지 표시:

```typescript
// ADD import:
import { useNotifications } from '../../hooks/useNotifications';

// Inside component:
const { unreadCount } = useNotifications();

// ADD menu item before "계정 설정":
<MyPageMenuItem
  icon={<Bell size={20} color="#333" />}
  label={`알림${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
  onPress={() => router.push('/notifications')}
/>
```

- [ ] **Step 3: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/app/notifications.tsx frontend/app/\(tabs\)/mypage.tsx
git commit -m "feat(frontend): 알림 목록 화면 및 마이페이지 알림 뱃지 추가"
```

---

## Task 10: 앱 시작 시 FCM 토큰 등록 + 추첨일 알림 Cron

**Files:**
- Modify: `frontend/app/_layout.tsx`
- Modify: `backend-node/src/lotto/winning-info-crawler.service.ts`

- [ ] **Step 1: Add FCM token registration to app layout**

`frontend/app/_layout.tsx` — 인증 후 FCM 토큰 자동 등록:

```typescript
// ADD import:
import { useNotifications } from '../hooks/useNotifications';

// Inside RootLayout, after auth guard logic:
const { registerToken } = useNotifications();

useEffect(() => {
  if (isAuthenticated) {
    registerToken().catch(console.error);
  }
}, [isAuthenticated]);
```

- [ ] **Step 2: Read winning-info-crawler.service.ts**

```bash
# Read the file first to understand current cron setup
```

- [ ] **Step 3: Add draw day reminder cron**

`backend-node/src/lotto/winning-info-crawler.service.ts` — 추첨일 알림 Cron 추가:

```typescript
// ADD import:
import { FcmService } from '../notification/fcm.service';

// ADD to constructor:
// private readonly fcmService: FcmService

// ADD new cron method:
@Cron('0 10 * * 6') // Every Saturday at 10:00 AM
async sendDrawDayReminder() {
  this.logger.log('Sending draw day reminder notifications...');
  try {
    const users = await this.prisma.user.findMany({
      where: { fcmToken: { not: null } },
      select: { fcmToken: true },
    });
    const tokens = users.map((u) => u.fcmToken).filter(Boolean) as string[];
    if (tokens.length > 0) {
      await this.fcmService.sendBroadcastNotification(
        tokens,
        '🍀 오늘은 추첨일!',
        '오늘 저녁 8시 45분, 로또 추첨이 진행됩니다. 행운을 빕니다!',
      );
    }
    this.logger.log(`Draw day reminder sent to ${tokens.length} users`);
  } catch (error) {
    this.logger.error(`Failed to send draw day reminder: ${error}`);
  }
}
```

- [ ] **Step 4: Ensure FcmService is available in LottoModule**

Check `backend-node/src/lotto/lotto.module.ts` and add NotificationModule import if FcmService is not accessible. If NotificationModule exports FcmService, add it to imports.

- [ ] **Step 5: Run backend tests**

```bash
cd backend-node && npx jest --no-coverage && npm run build
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/app/_layout.tsx backend-node/src/lotto/ backend-node/src/notification/
git commit -m "feat: 앱 시작 시 FCM 토큰 등록 + 추첨일 알림 Cron 추가"
```

---

## Summary

| Task | Description | Sub-system | Dependencies |
|------|-------------|-----------|-------------|
| 1 | 티켓 API 클라이언트 | A (스캔) | None |
| 2 | 스캔 QR 모드 추가 | A (스캔) | Task 1 |
| 3 | History 백엔드 연동 + 상태 뱃지 | A (스캔) | Task 1 |
| 4 | 커뮤니티 대댓글/삭제 백엔드 | B (커뮤니티) | None |
| 5 | 커뮤니티 프론트 연동 | B (커뮤니티) | Task 4 |
| 6 | 여행 추천 로직 | C (명당) | None |
| 7 | 명당 상세 + 여행 통합 | C (명당) | Task 6 |
| 8 | 알림 API + 훅 | D (알림) | None |
| 9 | 알림 목록 화면 | D (알림) | Task 8 |
| 10 | FCM 등록 + 추첨일 Cron | D (알림) | Task 8 |

**병렬 실행 가능:** A(1→2,3) ∥ B(4→5) ∥ C(6→7) ∥ D(8→9,10)
