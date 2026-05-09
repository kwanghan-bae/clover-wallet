# 로또 번호 다중 생성 설계 (Multi-Game Generation)

- **작성일**: 2026-05-09
- **작성자**: kwanghan-bae (with Claude)
- **상태**: Approved (구현 대기)

## 1. 배경 및 목적

현재 번호 생성 화면은 한 번에 6개 번호 한 세트만 생성한다. 실제 사용자는 5천원치(5게임) 또는 만원치(10게임) 단위로 로또를 구매하므로, 한 번에 N세트를 받는 흐름이 자연스럽다. 매번 같은 메서드를 N번 누르는 마찰을 제거한다.

**목표**: "1게임 / 5게임 / 10게임" 세그먼트 토글로 카운트를 선택하고, 추첨 메서드 클릭 시 N세트를 한 번에 생성·표시·저장·공유할 수 있게 한다. 결정론 메서드(꿈해몽, 사주팔자, 의미있는 숫자)도 N세트 모두 다른 번호를 보장한다. 1게임 모드 사용자에게는 회귀가 없어야 한다.

**비목표**:
- 자유 입력 게임 수 (1~20 등). 95% 사용 패턴인 1/5/10만 커버
- 백엔드 동기화 (`/lotto/games` POST). 로컬 저장만. 별도 spec
- 카드 펼침/캐러셀 같은 고급 결과 레이아웃. YAGNI
- 묶음 단위 종합 당첨 표시 (예: "5게임 중 4등 1개"). 기존 단일 status 표시 유지

## 2. 핵심 결정 사항

| 결정 | 선택 | 비고 |
|------|------|------|
| 게임 수 옵션 | 고정 3버튼 (1 / 5 / 10) | 천원/5천원/만원치 멘탈 모델 직격 |
| 토글 위치 | 화면 상단 sticky | 메서드 카드 위. 메서드 여러 번 시도하면서 카운트 유지 |
| 결정론 메서드 다양성 | N세트 모두 다른 번호 | 시드에 인덱스 mix → 결정론 보존하면서 다양화 |
| 저장 구조 | 1 묶음 레코드 with `games[]` | 백엔드 ticket 구조와 일치. 한 번에 저장/삭제 |
| 공유 포맷 | 1 게시글에 N세트 모두 포함 | 피드 노이즈 방지 |

## 3. 아키텍처 개요

### 3.1 데이터 모델

`apps/frontend/api/types/lotto.ts`에 추가:

```typescript
/**
 * 한 번에 생성한 N세트 묶음. 5게임 = games.length === 5.
 * 1게임 모드도 동일 구조 (games.length === 1).
 */
export interface LottoSetRecord {
  id: number;            // Date.now() — 묶음 단위 고유
  method: string;        // 'DREAM', 'SAJU', etc.
  param?: string;        // 사용자 입력 (꿈, 생년월일 등). 디버깅/재생성용
  createdAt: string;     // ISO
  games: GameSet[];
}

export interface GameSet {
  numbers: number[];     // 6 numbers, 1~45, sorted
}
```

기존 `LottoRecord`(단일 numbers) 타입은 그대로 두고 마이그레이션은 read 시점 lazy 변환.

### 3.2 시드 다양화 전략

`utils/lotto/generator.ts`에 `generateLottoGames` 추가:

```typescript
export const generateLottoGames = (
  methodId: string,
  count: number,
  param?: string,
): number[][] => {
  if (count === 1) {
    return [generateLottoNumbersWithSeed(methodId, param)];
  }
  return Array.from({ length: count }, (_, i) => {
    const variantParam = param !== undefined ? `${param}-${i}` : undefined;
    return generateLottoNumbersWithSeed(methodId, variantParam);
  });
};
```

다양성 보장:
- **랜덤 메서드** (param 없음): 매 호출마다 `Math.random()`이 달라 자연 다양화
- **결정론 메서드** (param 있음): `'사주'` → `'사주-0'`, `'사주-1'`, … char codes 합이 모두 달라 시드 다름 → 번호 다름. 같은 사용자가 같은 입력으로 5게임 다시 생성해도 5세트 동일 (결정론 보존)
- **1게임 모드** (count===1): 인덱스 suffix 안 붙여 기존 결과 보존

LCG 시드 분석: 슬롯 간 시드 차이 1 → 첫 번호 약 1.8 차이 → 6번호 채우면서 분기 → 우연 일치 확률 사실상 0.

### 3.3 마이그레이션 전략 — Read 시점 lazy 변환

기존 `saved-numbers` 키에 단일 레코드 형태 데이터가 있을 수 있음. 일괄 데이터 다시 쓰기 대신 read 시 즉석 변환:

```typescript
// utils/lotto/history-migration.ts
export const toSetRecord = (raw: unknown): LottoSetRecord => {
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.games)) {
    return r as unknown as LottoSetRecord;
  }
  return {
    id: r.id as number,
    method: r.method as string,
    createdAt: r.createdAt as string,
    games: [{ numbers: r.numbers as number[] }],
  };
};
```

`useHistoryData`가 `loadItem<unknown[]>('saved-numbers').map(toSetRecord)` 호출. 사용자가 다시 저장하면 신규 형태로 자연 마이그레이션.

### 3.4 컴포넌트 구조

| 컴포넌트 | 역할 |
|---------|------|
| `GameCountToggle` | 1/5/10 세그먼트 컨트롤. 화면 상단 sticky |
| `GenerationResultCard` | 단일 게임 카드 (라벨 + 6번호) |
| `GenerationResultCards` | N개 카드 묶음 + 저장/공유 버튼 (기존 `GenerationResult` 대체) |

### 3.5 데이터 흐름

```
[화면 진입]
   ↓ gameCount=1 (default)
[GameCountToggle: 1/5/10 선택]
   ↓
[MethodSelector: 메서드 카드 클릭]
   ├─ 입력 X 메서드 → 즉시 generateLottoGames(method, count) 호출
   └─ 꿈/사주/의미 → GenerationInputModal → 입력 후 generateLottoGames(method, count, param)
   ↓
[generatedGames: number[][] 상태 갱신]
   ↓
[GenerationResultCards]
   ├─ length===0 → 빈 상태
   ├─ length===1 → 라벨 없는 단일 카드 (기존과 동일)
   └─ length>1 → 세로 스택 + 라벨 'A'~'J'
   ↓
[하단 버튼]
   ├─ 저장 → saveLottoSet({method, param, games}) → '5게임 저장 완료'
   └─ 공유 → /create-post prefillContent에 N세트 텍스트
   ↓
[카운트 토글 변경 시]
   → 같은 메서드+같은 param으로 즉시 재생성 (memo: lastParam)
```

## 4. 컴포넌트 명세

### 4.1 `GameCountToggle.tsx` (신규, ~30 LOC)

```tsx
interface GameCountToggleProps {
  value: 1 | 5 | 10;
  onChange: (count: 1 | 5 | 10) => void;
}
```

- 흰 배경 카드 안에 3 버튼
- 선택된 버튼만 primary 색 배경 + 흰 텍스트
- 라벨: "1게임", "5게임 (5천원)", "10게임 (만원)" — 가격 힌트

### 4.2 `GenerationResultCard.tsx` (신규, ~45 LOC)

```tsx
interface GenerationResultCardProps {
  numbers: number[];
  label?: string;          // 'A', 'B', ... — 다중 게임일 때만
  scaleAnim: Animated.Value;
  delay?: number;          // index × 80ms
}
```

- 라벨 있으면 카드 좌상단 배지
- 6번호 ball을 가로 (`getNumberColor` 사용, 기존 디자인)
- delay만큼 늦춰서 fade-in/scale (cascade 등장)

### 4.3 `GenerationResultCards.tsx` (신규, ~80 LOC, 기존 `GenerationResult.tsx` 대체)

```tsx
interface GenerationResultCardsProps {
  games: number[][];
  methodTitle?: string;
  isSaving: boolean;
  onSave: () => void;
  onShare: () => void;
}
```

- 빈/단일/다중 분기 렌더
- 저장/공유 버튼은 카드 묶음 **하단에 한 쌍만** (묶음 단위 액션)

### 4.4 `number-generation.tsx` (수정)

State 변경:
```tsx
const [gameCount, setGameCount] = useState<1 | 5 | 10>(1);
const [generatedGames, setGeneratedGames] = useState<number[][]>([]);
const [lastParam, setLastParam] = useState<string | undefined>();
```

핵심 핸들러:
- `handleGenerate(methodId, param?)` — `generateLottoGames` 호출, lastParam 저장
- `handleCountChange(newCount)` — count 변경 시 같은 메서드+param으로 즉시 재생성
- `handleSave()` — `saveLottoSet({method, param, games})` 호출
- `handleShare()` — N세트를 `A: ..., B: ..., ...` 포맷으로 prefillContent 빌드

레이아웃 (위→아래):
1. Header (변경 없음)
2. **`<GameCountToggle>` (신규)**
3. `<GenerationResultCards>` (변경)
4. `<MethodSelector>` (그대로)
5. `<GenerationInputModal>` (그대로)
6. Tip Section (그대로)

### 4.5 `HistoryItem.tsx` (수정)

`record.numbers` → `record.games[]` 처리:
- `games.length === 1` → 기존 6번호 한 줄 (라벨 없음, 기존 디자인 보존)
- `games.length > 1` → "N게임 묶음" 헤더 + 세로 스택 + 'A', 'B', … 라벨

배지(status)는 첫 게임 기준 (YAGNI — 종합 표시는 별도 task).

### 4.6 헬퍼 — `labels.ts`

```typescript
export const labelOf = (index: number): string =>
  String.fromCharCode(65 + index);
```

10게임 max라 'A'~'J'. 26 초과 시 'AA' 자동 처리.

## 5. 변경/추가 파일 목록

| 파일 | 종류 | LOC |
|------|------|-----|
| `apps/frontend/api/types/lotto.ts` | 수정 | +20 |
| `apps/frontend/utils/lotto/generator.ts` | 수정 | +20 |
| `apps/frontend/utils/lotto/history.ts` | 신규 | ~25 |
| `apps/frontend/utils/lotto/history-migration.ts` | 신규 | ~20 |
| `apps/frontend/utils/lotto/labels.ts` | 신규 | ~10 |
| `apps/frontend/components/generation/GameCountToggle.tsx` | 신규 | ~30 |
| `apps/frontend/components/generation/GenerationResultCard.tsx` | 신규 | ~45 |
| `apps/frontend/components/generation/GenerationResultCards.tsx` | 신규 | ~80 |
| `apps/frontend/components/generation/GenerationResult.tsx` | 삭제 | -79 |
| `apps/frontend/app/number-generation.tsx` | 수정 | +30, -10 |
| `apps/frontend/hooks/useHistoryData.ts` | 수정 | +10 |
| `apps/frontend/components/ui/HistoryItem.tsx` | 수정 | +20 |
| `apps/frontend/__tests__/...` | 신규 5+ 수정 1 | ~250 |

신규 파일 모두 150 LOC 룰 준수.

## 6. 테스트 전략

### 6.1 유틸 (Jest)

- `__tests__/utils/lotto/generator.test.ts` — `generateLottoGames` 추가 케이스
  - count=1, param='X' → `generateLottoNumbersWithSeed('X')`와 동일 결과 (1게임 호환)
  - count=5, param='1990-01-01' → 길이 5, 모두 다른 set, 두 번 호출 = 동일 (결정론)
  - count=5, param=undefined → 길이 5, 모두 다른 set
  - 모든 set: 6 unique 1~45, 정렬됨
- `__tests__/utils/lotto/history-migration.test.ts` (신규)
  - 레거시 단일 → `games:[{numbers}]` 변환
  - 신규 묶음 → 그대로
  - 잘못된 입력 → graceful (실패 시 throw 명시)
- `__tests__/utils/lotto/history.test.ts` (신규)
  - `saveLottoSet` 호출 시 `appendToItemArray('saved-numbers', ...)` 호출되는지

### 6.2 컴포넌트 (RNTL)

- `__tests__/components/generation/GameCountToggle.test.tsx`
  - 3개 버튼 렌더, 선택 상태 스타일, onChange 콜백
- `__tests__/components/generation/GenerationResultCards.test.tsx`
  - 빈/단일/다중 렌더 분기
  - 저장/공유 버튼 1쌍만 (카드 카운트 무관)
- `__tests__/components/generation/GenerationResultCard.test.tsx`
  - 6번호 렌더, 라벨 props 처리

### 6.3 훅 (RNTL)

- `__tests__/hooks/useHistoryData.test.ts` 보강
  - 레거시+신규 mix 데이터 로드 시 모두 `LottoSetRecord` 형태로 반환

### 6.4 Manual smoke

- [ ] 1/5/10 토글 즉시 반영, 카드 카운트 변경
- [ ] 사주 같은 생일 5게임 → 5세트 모두 다름
- [ ] 같은 생일로 두 번 5게임 → 두 번 모두 같은 5세트 (결정론 보존)
- [ ] 저장 후 history 탭 진입 → "5게임 묶음" 카드, 펼치면 5세트
- [ ] 공유 → /create-post prefillContent 5세트 줄바꿈 포맷
- [ ] 1게임 모드 회귀 — 기존 사용자 결과 동일

## 7. 롤아웃 순서 (Phase별 독립 가치)

### Phase 1 — 데이터 모델 + 시드
1. `LottoSetRecord`/`GameSet` 타입 정의
2. `generateLottoGames` + 단위 테스트 (TDD)
3. `saveLottoSet`/`toSetRecord` + 단위 테스트
4. `labelOf` 헬퍼 + 단위 테스트

**완료 시 가치**: 함수 단독으로 N세트 생성 + 저장 가능 (UI 없이)

### Phase 2 — 컴포넌트 신규 (조립 전)
5. `GameCountToggle` + 테스트
6. `GenerationResultCard` + 테스트
7. `GenerationResultCards` + 테스트

**완료 시 가치**: 컴포넌트 단독 단위 테스트 통과

### Phase 3 — 화면 통합
8. `number-generation.tsx` state+handlers 수정 + 토글/카드들 wiring
9. `useHistoryData` 마이그레이션 적용
10. `HistoryItem` 묶음 표시 수정
11. 기존 `GenerationResult.tsx` 삭제

**완료 시 가치**: end-to-end 동작 (토글 → 생성 → 저장 → history 확인)

### Phase 4 — Manual smoke + 회귀
12. Manual checklist 6개 통과
13. 기존 frontend 테스트 회귀 통과 (272 + 신규 테스트만큼)

각 Phase는 독립 PR로 끊을 수 있음. Phase 1~3까지가 핵심 가치.

## 8. 위험 요소 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| 시드 인덱스 mix가 우연히 동일 시드 만들어 두 게임 같음 | Low | LCG 분기로 1차 시드 차이 1 → 출력 1.8 차이 → 6번호 채우면서 발산. 우연 1~2 겹쳐도 자연스러움 |
| 레거시 단일 레코드 마이그레이션 실패 | Medium | `toSetRecord`에 try/catch + invalid 레코드 skip. 단위 테스트로 corner case 커버 |
| 10게임 카드 너무 길어 스크롤 불편 | Medium | 일단 그대로. 사용자 피드백 나오면 펼침/캐러셀 별도 PR |
| HistoryItem 묶음 표시 변경이 기존 단일 레코드 디자인 깸 | Low | `games.length===1` 분기로 기존 디자인 보존 |
| 공유 텍스트 너무 길어 게시글 입력 한도 초과 | Low | 10게임 × 30자 ≈ 300자 + 헤더. 게시글 한도 보통 1000+ |
| 카운트 토글 변경 시 결과 깜빡임 | Low | scaleAnim 재시작. 100ms 이내 체감 |

## 9. 성공 지표

- 1게임 모드 사용자가 변화를 느끼지 못할 것 (회귀 0)
- 5/10게임 모드에서 N세트 모두 다른 번호 (사주 같은 결정론 메서드 포함)
- 카운트 토글 → 재생성까지 100ms 이내 체감
- 저장 후 history에서 "N게임 묶음" 카드로 즉시 확인
- 공유된 게시글에 N세트가 가독성 있게 표시
