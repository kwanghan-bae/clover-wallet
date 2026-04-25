# 코드베이스 리팩토링 설계 (2026-04-26)

## 개요

Clover Wallet 전체 코드베이스(Backend NestJS + Frontend React Native)의 안정성·유지보수성·가독성을 높이고, 적절한 모듈화를 달성하기 위한 5-Pass 리팩토링 계획.

**범위:** `apps/backend`, `apps/frontend`, `packages/shared`

---

## 접근 방식: 이슈 유형별 일괄 처리 (A)

각 Pass는 독립적으로 리뷰 가능한 단위로 구성되며, 순서대로 실행한다.

```
Pass 0 → Pass 1 → Pass 2 → Pass 3 → Pass 4
(Shared 타입) (타입안전성) (파일분리) (중복제거) (가독성)
```

---

## Pass 0: `@clover/shared` 단일 진실 공급원

### 목표

Backend ↔ Frontend 공유 가능한 타입/상수를 `packages/shared`로 통합하여 중복 정의를 제거한다.

### 현재 문제

- `packages/shared/src/types/lotto.ts`에 `LottoGame`, `LottoTicket` 정의가 존재함
- `apps/frontend/api/tickets.ts`에 같은 이름의 인터페이스가 **다른 형태로 중복 정의**됨
- `apps/frontend/api/types/spots.ts`의 `LottoSpot`, `WinningStoreHistory`가 shared에 이미 존재
- Backend는 `@clover/shared`를 **전혀 참조하지 않음**

### 조치 사항

#### `packages/shared`로 이전/통합

`LottoTicket`의 shared vs frontend 버전 간 차이 명시:

| 필드 | shared 버전 | frontend 버전 | 조치 |
|---|---|---|---|
| `status` | `string` | `'STASHED' \| 'WINNING' \| 'LOSING'` | shared를 narrower 타입으로 강화 |
| `url` | 없음 | `url?: string` | shared에 optional 추가 |
| `games` | `LottoGame[]` (required) | `LottoGame[]` (optional) | shared를 `games?: LottoGame[]`로 수정 |
| `createdAt` | `string` (optional) | `string` (required) | shared를 required로 변경 |

`LottoGame`의 차이:

| 필드 | shared 버전 | frontend 버전 | 조치 |
|---|---|---|---|
| `extractionMethod` | `string?` | 없음 | shared 유지 (backend 호환 필요) |
| `prizeAmount` | `number?` (optional) | `number` (required) | shared 유지 (항상 존재한다고 보장 못함) |

**frontend에서 로컬 정의 제거 대상:**
- `apps/frontend/api/tickets.ts`의 `LottoTicket`, `LottoGame` 인터페이스 → `@clover/shared` import로 교체

#### 프론트엔드 전용으로 유지

| 타입 | 이유 |
|---|---|
| `LottoRecord` | 프론트 정규화 포맷 (number1~6 → numbers[]) |
| `LottoGameResponse` | API 응답→프론트 변환 중간 타입 |

#### 백엔드 shared 참조 정렬

- 백엔드 응답 구조가 shared 타입과 일치하는지 검증
- class-validator DTO는 백엔드 전용 유지 (런타임 검증 데코레이터 포함)

### 성공 기준

- `frontend/api/tickets.ts`에 로컬 `LottoTicket`, `LottoGame` 정의 없음
- `frontend/api/types/spots.ts`에 로컬 spot 타입 정의 없음
- 타입 체크 통과 (`npm run typecheck` 또는 `tsc --noEmit`)

---

## Pass 1: 타입 안전성

### 목표

`any` 타입 누출 제거, 컴파일 타임 오류 감지 범위 확대.

### Backend

#### `apps/backend/src/lotto/lotto.service.ts`

```typescript
// 변경 전
await this.prisma.lottoGame.create({
  data: { ... } as any,
});

// 변경 후
import { Prisma } from '@prisma/client';
const data: Prisma.LottoGameCreateInput = { ... };
await this.prisma.lottoGame.create({ data });
```

- `getHistory` 반환 타입: `PageResponse<any>` → `PageResponse<LottoGame>`
  (`LottoGame`은 Prisma 생성 타입 `import type { LottoGame } from '@prisma/client'` 사용)
- `getGamesByUserId` 매개변수 `userId: string | bigint` → 내부 타입 일관화

### Frontend

- `api/` 하위 암묵적 `any` 타입 명시화
- `history.tsx` 내 `flatMap` 콜백의 타입 인자 명시

### 성공 기준

- `tsc --strict --noEmit` 오류 없음 (신규 `any` 도입 없음)
- 기존 테스트 전체 통과

---

## Pass 2: 파일 분리 & 관심사 분리

### 목표

150줄 규칙 준수, 단일 책임 원칙 적용.

### Backend

#### `lotto-spot/lotto-winning-store.service.ts` (178줄 → ≤150줄)

파일을 실제로 분석한 결과:
- `parseRank1Stores`, `parseRank2Stores`가 거의 동일한 로직을 중복 구현
- `parseAllStores`, `fetchHtml` 내부에 `any[]` 타입 누출

**조치:**
1. `parseRank1Stores` + `parseRank2Stores` → `parseStoresByRank(rank: 1 | 2)` 단일 메서드로 통합
2. `any[]` → 인라인 타입 (`{ round: number; rank: 1 | 2; storeName: string; method: string | null; address: string }[]`) 또는 `WinningStoreInput` 인터페이스 정의
3. 두 조치로 약 20~25줄 감소, 150줄 이하 달성

#### `community/__tests__/post.service.spec.ts` (283줄 → 분리)

- `post.service.create.spec.ts`: 게시글 생성 관련 테스트
- `post.service.query.spec.ts`: 조회/검색 관련 테스트
- `post.service.delete.spec.ts`: 삭제 관련 테스트

### Frontend

#### `app/(tabs)/history.tsx` (146줄 → ≤100줄)

현재 한 파일에 혼재된 역할:
1. 로컬스토리지 데이터 로드
2. 백엔드 API 데이터 fetch
3. 두 데이터 소스 병합
4. UI 렌더링

**조치:** `hooks/useHistoryData.ts` 신규 생성

```typescript
// hooks/useHistoryData.ts
export function useHistoryData() {
  // 로컬스토리지 + API 데이터 병합 로직
  return { records, handleDelete, isLoading };
}

// history.tsx — 데이터 로직 제거, 훅 사용
const { records, handleDelete, isLoading } = useHistoryData();
```

#### `app/(tabs)/_layout.tsx` (132줄 → ≤100줄)

탭 메타데이터를 별도 파일로 분리:

```typescript
// constants/tab-config.ts (신규)
export const TAB_SCREENS = [
  { name: 'index', title: '홈', icon: ... },
  // ...
] as const;
```

#### `hooks/useAuth.ts` (103줄 → 역할 분리)

```
현재: AuthContext + AuthProvider + useAuth 한 파일
분리:
  context/AuthContext.ts — Context 정의 + Provider
  hooks/useAuth.ts       — useAuth 훅만
```

### 성공 기준

- 모든 소스 파일 150줄 이하
- 분리된 파일로 기존 import 경로 정상 동작
- 기존 테스트 전체 통과

---

## Pass 3: 중복 코드 제거

### 목표

불필요한 alias 메서드 제거, 코드 경로 단일화.

### Backend: `lotto.service.ts` alias 메서드 제거

```typescript
// 제거 대상 1 — saveGame()을 그대로 위임하는 wrapper
async saveGeneratedGame(dto: SaveGameDto) {
  return this.saveGame(String(dto.userId), dto);
}

// 제거 대상 2 — getHistory()에 page offset 조정만 하는 wrapper
async getGamesByUserId(userId: string | bigint, page = 0, size = 20) {
  return this.getHistory(String(userId), page + 1, size);
}
```

**조치:**
1. `lotto.controller.ts`가 `saveGame`, `getHistory`를 직접 호출하도록 수정
2. wrapper 메서드 삭제

### Frontend: 중복 타입 export 정리

- Pass 0 완료 후 `api/types/index.ts`의 re-export 경로 일관화
- 동일 타입이 여러 파일에서 정의되지 않도록 단일 진입점 유지

### 성공 기준

- `lotto.service.ts`에 `saveGeneratedGame`, `getGamesByUserId` 없음
- 컨트롤러 테스트 포함 전체 테스트 통과

---

## Pass 4: 가독성 개선

### 목표

노이즈 제거, 의미 있는 주석만 유지, 매직 상수 추출.

### Backend: JSDoc 주석 정리

**제거 대상 (자명한 주석):**
```typescript
// 제거
/** Prisma 서비스를 주입받습니다. */
constructor(private prisma: PrismaService) {}

// 제거
/** LottoService 생성자 */
constructor(...) {}
```

**유지 대상 (WHY를 설명하는 주석):**
```typescript
// 유지 — 비즈니스 규칙 설명
// 이메일이 변경되었거나 새로 추가된 경우 업데이트
if (email && existingUser.email !== email) { ... }
```

**원칙:** 코드로 표현할 수 없는 맥락(WHY)만 주석으로 남긴다.

### Frontend: 매직 상수 추출

```typescript
// 현재 — history.tsx 내부에 인라인 함수
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'WINNING': return { label: '당첨', color: '#4CAF50', bg: '#E8F5E9' };
    case 'LOSING': return { label: '미당첨', ... };
    ...
  }
};

// 변경 후 — utils/lotto-status.ts 또는 constants/lotto-status.ts
export const STATUS_BADGE_MAP: Record<LottoGameStatus, StatusBadge> = {
  WINNING: { label: '당첨', color: '#4CAF50', bg: '#E8F5E9' },
  LOSING: { label: '미당첨', color: '#757575', bg: '#F5F5F5' },
  // ...
};
```

### 성공 기준

- 각 파일에서 자명한 JSDoc 제거 확인
- `STATUS_BADGE_MAP` 등 매직 상수가 `constants/` 또는 `utils/`에 위치
- 기존 테스트 전체 통과

---

## 아키텍처 결정 사항

| 결정 | 내용 |
|---|---|
| 데이터 접근 패턴 | Service → PrismaService 직접 호출 유지 (Repository 레이어 추가 없음) |
| Shared 모듈 범위 | 런타임 검증 불필요한 순수 타입/상수만 공유 (class-validator DTO 제외) |
| 파일 크기 한계 | 150줄 (CLAUDE.md 규칙 준수) |
| 테스트 전략 | 각 Pass 후 `npm test` 전체 통과 확인 필수 |

---

## 변경 파일 예상 목록

| Pass | 파일 | 변경 유형 |
|---|---|---|
| 0 | `packages/shared/src/types/lotto.ts` | 수정 (통합) |
| 0 | `apps/frontend/api/tickets.ts` | 수정 (로컬 타입 제거) |
| 0 | `apps/frontend/api/types/spots.ts` | 수정 (shared import로 교체) |
| 1 | `apps/backend/src/lotto/lotto.service.ts` | 수정 |
| 1 | `apps/frontend/api/` 하위 파일들 | 수정 |
| 2 | `apps/backend/src/lotto-winning-store.service.ts` | 수정 |
| 2 | `apps/backend/src/community/__tests__/post.service.spec.ts` | 분리 (신규 2~3개) |
| 2 | `apps/frontend/app/(tabs)/history.tsx` | 수정 |
| 2 | `apps/frontend/hooks/useHistoryData.ts` | 신규 |
| 2 | `apps/frontend/app/(tabs)/_layout.tsx` | 수정 |
| 2 | `apps/frontend/constants/tab-config.ts` | 신규 |
| 2 | `apps/frontend/hooks/useAuth.ts` | 수정 |
| 2 | `apps/frontend/context/AuthContext.ts` | 신규 |
| 3 | `apps/backend/src/lotto/lotto.service.ts` | 수정 |
| 3 | `apps/backend/src/lotto/lotto.controller.ts` | 수정 |
| 4 | Backend service 파일 다수 | 수정 (주석 정리) |
| 4 | `apps/frontend/app/(tabs)/history.tsx` | 수정 |
| 4 | `apps/frontend/constants/lotto-status.ts` | 신규 |
