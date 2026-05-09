# 다중 게임 번호 생성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1/5/10게임 토글로 N세트 번호를 한 번에 생성·표시·저장·공유할 수 있는 기능을 추가한다 (결정론 메서드 N세트도 모두 다른 번호 보장).

**Architecture:** 시드에 인덱스 mix(`${param}-${i}`)로 결정론 메서드도 다양화. 저장은 `LottoSetRecord{games[]}` 묶음 단위(백엔드 ticket 구조와 동일). UI는 GameCountToggle + GenerationResultCard×N + 묶음 단위 저장/공유 버튼. 1게임 모드는 기존과 동일 결과(회귀 0).

**Tech Stack:** React Native (Expo SDK 54) / NativeWind / React Query / Jest + RNTL / TypeScript strict.

**Reference spec:** `docs/superpowers/specs/2026-05-09-multi-game-generation-design.md`

---

## File Structure

| 파일 | 책임 | 종류 |
|------|------|------|
| `apps/frontend/api/types/lotto.ts` | `LottoSetRecord`/`GameSet` 타입 추가 | 수정 |
| `apps/frontend/utils/lotto/generator.ts` | `generateLottoGames(methodId, count, param?)` 추가 | 수정 |
| `apps/frontend/utils/lotto/labels.ts` | `labelOf(index)` — index → 'A'/'B'… | 신규 |
| `apps/frontend/utils/lotto/history-migration.ts` | 레거시 단일 레코드 → `LottoSetRecord` 변환 | 신규 |
| `apps/frontend/utils/lotto/history.ts` | `saveLottoSet({method, param, games})` | 신규 |
| `apps/frontend/utils/lotto.ts` | 위 새 모듈 re-export | 수정 |
| `apps/frontend/components/generation/GameCountToggle.tsx` | 1/5/10 세그먼트 컨트롤 | 신규 |
| `apps/frontend/components/generation/GenerationResultCard.tsx` | 단일 게임 카드 (라벨 + 6번호) | 신규 |
| `apps/frontend/components/generation/GenerationResultCards.tsx` | N카드 묶음 + 저장/공유 버튼 1쌍 | 신규 |
| `apps/frontend/components/generation/GenerationResult.tsx` | 기존 단일 결과 컴포넌트 — 삭제 | 삭제 |
| `apps/frontend/__tests__/components/ui/GenerationResult.test.ts` | 위 컴포넌트 테스트 — 삭제 | 삭제 |
| `apps/frontend/app/number-generation.tsx` | state, handlers, 신규 컴포넌트 wiring | 수정 |
| `apps/frontend/hooks/useHistoryData.ts` | `LottoSetRecord` 반환으로 변경 + 마이그레이션 적용 | 수정 |
| `apps/frontend/components/ui/HistoryItem.tsx` | `games[]` 처리 (1/N 분기 렌더) | 수정 |
| `apps/frontend/__tests__/lotto.test.ts` | `generateLottoGames` 테스트 추가 | 수정 |
| `apps/frontend/__tests__/utils/lotto/labels.test.ts` | labelOf 테스트 | 신규 |
| `apps/frontend/__tests__/utils/lotto/history-migration.test.ts` | toSetRecord 테스트 | 신규 |
| `apps/frontend/__tests__/utils/lotto/history.test.ts` | saveLottoSet 테스트 | 신규 |
| `apps/frontend/__tests__/components/generation/GameCountToggle.test.tsx` | 신규 | 신규 |
| `apps/frontend/__tests__/components/generation/GenerationResultCard.test.tsx` | 신규 | 신규 |
| `apps/frontend/__tests__/components/generation/GenerationResultCards.test.tsx` | 신규 | 신규 |

모든 신규 파일 150 LOC 룰 준수.

---

## Phase 1 — 데이터 모델 + 유틸리티

### Task 1.1: `LottoSetRecord`/`GameSet` 타입 추가

**Files:**
- Modify: `apps/frontend/api/types/lotto.ts`

- [ ] **Step 1: 타입 추가**

`apps/frontend/api/types/lotto.ts`의 기존 export 끝에 다음 추가:

```typescript
/**
 * @description 한 번에 생성한 N세트 묶음 (1게임은 games.length===1).
 * 로컬 저장(saved-numbers) 및 향후 백엔드 ticket 매핑에 사용.
 */
export interface LottoSetRecord {
  id: number;
  method: string;
  param?: string;
  createdAt: string;
  games: GameSet[];
  /** 백엔드 ticket 매핑 시 사용. 로컬 저장 시 undefined. */
  round?: number;
}

export interface GameSet {
  numbers: number[];
}
```

`LottoRecord`는 변경 없이 유지 (다른 곳에서 사용 중).

- [ ] **Step 2: 타입체크**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npx tsc --noEmit
```

Expected: 에러 없음 (또는 사전 존재 에러만, 신규 발생 X)

- [ ] **Step 3: 커밋**

```bash
git add apps/frontend/api/types/lotto.ts
git commit -m "feat(types): add LottoSetRecord and GameSet types for multi-game"
```

---

### Task 1.2: `generateLottoGames` (TDD)

**Files:**
- Modify: `apps/frontend/utils/lotto/generator.ts`
- Modify: `apps/frontend/__tests__/lotto.test.ts`

- [ ] **Step 1: 실패 테스트 추가**

`apps/frontend/__tests__/lotto.test.ts` 파일 끝(`describe('Lotto Logic', ...)` 블록 안 마지막에) 추가:

```typescript
  describe('generateLottoGames', () => {
    test('count=1, no param → 단일 set 반환', () => {
      const result = generateLottoGames('STATISTICS_HOT', 1);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(6);
      expect(new Set(result[0]).size).toBe(6);
    });

    test('count=5, no param → 5개 set, 모두 다름', () => {
      const result = generateLottoGames('STATISTICS_HOT', 5);
      expect(result).toHaveLength(5);
      const keys = result.map((set) => set.join(','));
      expect(new Set(keys).size).toBe(5);
    });

    test('count=5, param 있음 → 5개 set 모두 다름 (인덱스 다양화)', () => {
      const result = generateLottoGames('SAJU', 5, '1990-01-01');
      expect(result).toHaveLength(5);
      const keys = result.map((set) => set.join(','));
      expect(new Set(keys).size).toBe(5);
    });

    test('같은 method+param 두 번 호출 → 결정론 보존 (5세트 동일)', () => {
      const a = generateLottoGames('SAJU', 5, '1990-01-01');
      const b = generateLottoGames('SAJU', 5, '1990-01-01');
      expect(a).toEqual(b);
    });

    test('count=1, param 있음 → 기존 단일 시드 함수와 동일 결과 (1게임 호환)', () => {
      const single = generateLottoNumbersWithSeed('SAJU', '1990-01-01');
      const multi = generateLottoGames('SAJU', 1, '1990-01-01');
      expect(multi[0]).toEqual(single);
    });

    test('각 set은 6개 unique 1~45, 정렬됨', () => {
      const result = generateLottoGames('SAJU', 5, '1990-01-01');
      result.forEach((set) => {
        expect(set).toHaveLength(6);
        expect(new Set(set).size).toBe(6);
        set.forEach((n) => {
          expect(n).toBeGreaterThanOrEqual(1);
          expect(n).toBeLessThanOrEqual(45);
        });
        const sorted = [...set].sort((a, b) => a - b);
        expect(set).toEqual(sorted);
      });
    });
  });
```

파일 상단 `import { generateLottoNumbers, compareNumbers, calculateLottoRank } from '../utils/lotto';` 라인에 `generateLottoGames`, `generateLottoNumbersWithSeed` 추가:

```typescript
import {
  generateLottoNumbers,
  generateLottoNumbersWithSeed,
  generateLottoGames,
  compareNumbers,
  calculateLottoRank,
} from '../utils/lotto';
```

- [ ] **Step 2: 실패 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- lotto.test
```

Expected: FAIL — `generateLottoGames is not a function` 또는 `is not exported`.

- [ ] **Step 3: 함수 추가**

`apps/frontend/utils/lotto/generator.ts` 파일 끝에 추가:

```typescript
/**
 * @description N개 게임 한 번에 생성. 같은 메서드+같은 입력에서도 N개 모두 다른 번호 보장.
 *  - 결정론 메서드 (param 있음): index를 param에 섞어 시드 다양화
 *  - 랜덤 메서드 (param 없음): Math.random()이 매 호출마다 달라 자연 다양화
 *  - count===1 인 경우 generateLottoNumbersWithSeed와 동일 결과 → 1게임 모드 호환
 */
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

- [ ] **Step 4: 테스트 통과 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- lotto.test
```

Expected: PASS — 6 새 테스트 + 기존 테스트 모두 통과.

- [ ] **Step 5: 전체 frontend 회귀 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test
```

Expected: 기존 272개 + 신규 6개 = 278 PASS.

- [ ] **Step 6: 커밋**

```bash
git add apps/frontend/utils/lotto/generator.ts apps/frontend/__tests__/lotto.test.ts
git commit -m "feat(lotto): add generateLottoGames for multi-game generation"
```

---

### Task 1.3: `labelOf` 헬퍼 (TDD)

**Files:**
- Create: `apps/frontend/utils/lotto/labels.ts`
- Create: `apps/frontend/__tests__/utils/lotto/labels.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// apps/frontend/__tests__/utils/lotto/labels.test.ts
import { labelOf } from '../../../utils/lotto/labels';

/**
 * @description 다중 게임 카드 라벨 헬퍼 테스트.
 */
describe('labelOf', () => {
  test('0 → A', () => {
    expect(labelOf(0)).toBe('A');
  });

  test('1 → B', () => {
    expect(labelOf(1)).toBe('B');
  });

  test('9 → J (10게임 max)', () => {
    expect(labelOf(9)).toBe('J');
  });

  test('25 → Z', () => {
    expect(labelOf(25)).toBe('Z');
  });
});
```

- [ ] **Step 2: 실패 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- labels.test
```

Expected: FAIL — `Cannot find module '../../../utils/lotto/labels'`.

- [ ] **Step 3: 구현**

```typescript
// apps/frontend/utils/lotto/labels.ts
/**
 * @description 게임 인덱스를 알파벳 라벨로 변환 (0 → 'A', 1 → 'B', ...).
 * 10게임 max 사용 환경이라 'A'~'J'까지가 실제 사용 범위.
 */
export const labelOf = (index: number): string => {
  return String.fromCharCode(65 + index);
};
```

- [ ] **Step 4: 통과 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- labels.test
```

Expected: PASS — 4 tests.

- [ ] **Step 5: 커밋**

```bash
git add apps/frontend/utils/lotto/labels.ts apps/frontend/__tests__/utils/lotto/labels.test.ts
git commit -m "feat(lotto): add labelOf helper for game card labels"
```

---

### Task 1.4: `toSetRecord` 마이그레이션 (TDD)

**Files:**
- Create: `apps/frontend/utils/lotto/history-migration.ts`
- Create: `apps/frontend/__tests__/utils/lotto/history-migration.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// apps/frontend/__tests__/utils/lotto/history-migration.test.ts
import { toSetRecord } from '../../../utils/lotto/history-migration';

/**
 * @description 레거시 단일 레코드 → LottoSetRecord 변환 테스트.
 */
describe('toSetRecord', () => {
  test('레거시 단일 numbers → games:[{numbers}] 변환', () => {
    const legacy = {
      id: 123,
      method: 'SAJU',
      numbers: [3, 7, 12, 19, 28, 41],
      createdAt: '2026-05-09T00:00:00.000Z',
    };
    const result = toSetRecord(legacy);
    expect(result).toEqual({
      id: 123,
      method: 'SAJU',
      createdAt: '2026-05-09T00:00:00.000Z',
      games: [{ numbers: [3, 7, 12, 19, 28, 41] }],
    });
  });

  test('이미 games[]이 있으면 그대로 반환', () => {
    const newer = {
      id: 456,
      method: 'DREAM',
      param: '용꿈',
      createdAt: '2026-05-09T01:00:00.000Z',
      games: [
        { numbers: [1, 2, 3, 4, 5, 6] },
        { numbers: [7, 8, 9, 10, 11, 12] },
      ],
    };
    const result = toSetRecord(newer);
    expect(result).toEqual(newer);
  });

  test('legacy + param 필드 → 보존', () => {
    const legacy = {
      id: 789,
      method: 'DREAM',
      param: '돼지꿈',
      numbers: [5, 10, 15, 20, 25, 30],
      createdAt: '2026-05-09T02:00:00.000Z',
    };
    const result = toSetRecord(legacy);
    expect(result.param).toBe('돼지꿈');
    expect(result.games).toEqual([{ numbers: [5, 10, 15, 20, 25, 30] }]);
  });
});
```

- [ ] **Step 2: 실패 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- history-migration.test
```

Expected: FAIL — module not found.

- [ ] **Step 3: 구현**

```typescript
// apps/frontend/utils/lotto/history-migration.ts
import type { LottoSetRecord } from '../../api/types/lotto';

/**
 * @description 레거시 단일-numbers 레코드를 LottoSetRecord(games[])로 변환.
 * 이미 games[]가 있으면 그대로 반환 (idempotent).
 * read 시점 lazy 변환 — 사용자가 다시 저장하면 신규 형태로 자연스럽게 덮어써짐.
 */
export const toSetRecord = (raw: unknown): LottoSetRecord => {
  const r = raw as Record<string, unknown>;

  if (Array.isArray(r.games)) {
    return r as unknown as LottoSetRecord;
  }

  return {
    id: r.id as number,
    method: r.method as string,
    param: r.param as string | undefined,
    createdAt: r.createdAt as string,
    games: [{ numbers: r.numbers as number[] }],
  };
};
```

- [ ] **Step 4: 통과 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- history-migration.test
```

Expected: PASS — 3 tests.

- [ ] **Step 5: 커밋**

```bash
git add apps/frontend/utils/lotto/history-migration.ts apps/frontend/__tests__/utils/lotto/history-migration.test.ts
git commit -m "feat(lotto): add toSetRecord migration for legacy history records"
```

---

### Task 1.5: `saveLottoSet` (TDD)

**Files:**
- Create: `apps/frontend/utils/lotto/history.ts`
- Create: `apps/frontend/__tests__/utils/lotto/history.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// apps/frontend/__tests__/utils/lotto/history.test.ts
jest.mock('../../../utils/storage', () => ({
  appendToItemArray: jest.fn(),
  StorageKeys: { SAVED_NUMBERS: 'lotto.saved_numbers' },
}));

import { saveLottoSet } from '../../../utils/lotto/history';
import { appendToItemArray, StorageKeys } from '../../../utils/storage';

describe('saveLottoSet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-05-09T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('saved-numbers 키에 묶음 레코드 push', () => {
    const games = [
      { numbers: [1, 2, 3, 4, 5, 6] },
      { numbers: [7, 8, 9, 10, 11, 12] },
    ];
    const result = saveLottoSet({ method: 'SAJU', param: '1990-01-01', games });

    expect(appendToItemArray).toHaveBeenCalledWith(StorageKeys.SAVED_NUMBERS, {
      id: 1700000000000,
      method: 'SAJU',
      param: '1990-01-01',
      createdAt: '2026-05-09T00:00:00.000Z',
      games,
    });
    expect(result.id).toBe(1700000000000);
    expect(result.games).toEqual(games);
  });

  test('param 없이도 저장 가능', () => {
    const games = [{ numbers: [1, 2, 3, 4, 5, 6] }];
    saveLottoSet({ method: 'STATISTICS_HOT', games });

    expect(appendToItemArray).toHaveBeenCalledWith(
      StorageKeys.SAVED_NUMBERS,
      expect.objectContaining({ method: 'STATISTICS_HOT', games }),
    );
  });
});
```

- [ ] **Step 2: 실패 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- history.test
```

Expected: FAIL — `Cannot find module '../../../utils/lotto/history'`.

- [ ] **Step 3: 구현**

```typescript
// apps/frontend/utils/lotto/history.ts
import type { LottoSetRecord, GameSet } from '../../api/types/lotto';
import { appendToItemArray, StorageKeys } from '../storage';

/**
 * @description 묶음 레코드를 로컬 history에 저장. 1게임 / 5게임 / 10게임 모두 동일.
 */
export const saveLottoSet = (input: {
  method: string;
  param?: string;
  games: GameSet[];
}): LottoSetRecord => {
  const record: LottoSetRecord = {
    id: Date.now(),
    method: input.method,
    param: input.param,
    createdAt: new Date().toISOString(),
    games: input.games,
  };
  appendToItemArray(StorageKeys.SAVED_NUMBERS, record);
  return record;
};
```

- [ ] **Step 4: 통과 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- history.test
```

Expected: PASS — 2 tests.

- [ ] **Step 5: utils/lotto.ts에서 re-export**

`apps/frontend/utils/lotto.ts` (barrel export)에 추가:

```typescript
export * from './lotto/rank';
export * from './lotto/generator';
export * from './lotto/ui';
export * from './lotto/labels';
export * from './lotto/history';
export * from './lotto/history-migration';
```

- [ ] **Step 6: 전체 회귀 + 빌드 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test
```

Expected: 기존 + 신규 모두 PASS.

- [ ] **Step 7: 커밋**

```bash
git add apps/frontend/utils/lotto/history.ts \
        apps/frontend/utils/lotto.ts \
        apps/frontend/__tests__/utils/lotto/history.test.ts
git commit -m "feat(lotto): add saveLottoSet helper for batch save"
```

---

## Phase 2 — 컴포넌트

### Task 2.1: `GameCountToggle` 컴포넌트 (TDD)

**Files:**
- Create: `apps/frontend/components/generation/GameCountToggle.tsx`
- Create: `apps/frontend/__tests__/components/generation/GameCountToggle.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// apps/frontend/__tests__/components/generation/GameCountToggle.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameCountToggle } from '../../../components/generation/GameCountToggle';

describe('GameCountToggle', () => {
  test('3개 옵션 모두 렌더', () => {
    const { getByText } = render(
      <GameCountToggle value={1} onChange={jest.fn()} />,
    );
    expect(getByText('1게임')).toBeTruthy();
    expect(getByText(/5게임/)).toBeTruthy();
    expect(getByText(/10게임/)).toBeTruthy();
  });

  test('value=5 → 5게임 버튼이 selected accessibilityState', () => {
    const { getByLabelText } = render(
      <GameCountToggle value={5} onChange={jest.fn()} />,
    );
    const btn = getByLabelText('5게임');
    expect(btn.props.accessibilityState).toMatchObject({ selected: true });
  });

  test('1게임 버튼 클릭 시 onChange(1) 호출', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <GameCountToggle value={5} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('1게임'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  test('10게임 버튼 클릭 시 onChange(10) 호출', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <GameCountToggle value={1} onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('10게임'));
    expect(onChange).toHaveBeenCalledWith(10);
  });
});
```

- [ ] **Step 2: 실패 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- GameCountToggle.test
```

Expected: FAIL — module not found.

- [ ] **Step 3: 구현**

```tsx
// apps/frontend/components/generation/GameCountToggle.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type GameCount = 1 | 5 | 10;

interface GameCountToggleProps {
  value: GameCount;
  onChange: (count: GameCount) => void;
}

const OPTIONS: { count: GameCount; label: string; sub?: string }[] = [
  { count: 1, label: '1게임' },
  { count: 5, label: '5게임', sub: '5천원' },
  { count: 10, label: '10게임', sub: '만원' },
];

/**
 * @description 한 번에 생성할 게임 수 선택 (1/5/10). 화면 상단 sticky로 배치.
 */
export const GameCountToggle = ({ value, onChange }: GameCountToggleProps) => (
  <View className="flex-row bg-white dark:bg-dark-card rounded-2xl p-1 mb-4 shadow-sm">
    {OPTIONS.map(({ count, label, sub }) => {
      const selected = value === count;
      return (
        <TouchableOpacity
          key={count}
          onPress={() => onChange(count)}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ selected }}
          activeOpacity={0.7}
          className={`flex-1 py-3 rounded-xl items-center ${
            selected ? 'bg-primary' : ''
          }`}
        >
          <Text
            className={`font-bold text-[14px] ${
              selected ? 'text-white' : 'text-[#1A1A1A] dark:text-dark-text'
            }`}
          >
            {label}
          </Text>
          {sub ? (
            <Text
              className={`text-[11px] mt-0.5 ${
                selected ? 'text-white/80' : 'text-gray-400'
              }`}
            >
              {sub}
            </Text>
          ) : null}
        </TouchableOpacity>
      );
    })}
  </View>
);
```

- [ ] **Step 4: 통과 + 회귀 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- GameCountToggle.test
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test
```

Expected: PASS — 4 신규 + 기존 모두.

- [ ] **Step 5: 커밋**

```bash
git add apps/frontend/components/generation/GameCountToggle.tsx \
        apps/frontend/__tests__/components/generation/GameCountToggle.test.tsx
git commit -m "feat(generation): add GameCountToggle (1/5/10 segment control)"
```

---

### Task 2.2: `GenerationResultCard` 컴포넌트 (TDD)

**Files:**
- Create: `apps/frontend/components/generation/GenerationResultCard.tsx`
- Create: `apps/frontend/__tests__/components/generation/GenerationResultCard.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// apps/frontend/__tests__/components/generation/GenerationResultCard.test.tsx
import React from 'react';
import { Animated } from 'react-native';
import { render } from '@testing-library/react-native';
import { GenerationResultCard } from '../../../components/generation/GenerationResultCard';

describe('GenerationResultCard', () => {
  const numbers = [3, 7, 12, 19, 28, 41];
  const scaleAnim = new Animated.Value(1);

  test('6번호 모두 렌더', () => {
    const { getByText } = render(
      <GenerationResultCard numbers={numbers} scaleAnim={scaleAnim} />,
    );
    numbers.forEach((n) => {
      expect(getByText(String(n))).toBeTruthy();
    });
  });

  test('label 있을 때만 라벨 표시', () => {
    const { getByText, queryByText } = render(
      <GenerationResultCard numbers={numbers} scaleAnim={scaleAnim} label="A" />,
    );
    expect(getByText('A')).toBeTruthy();

    const { queryByText: queryNoLabel } = render(
      <GenerationResultCard numbers={numbers} scaleAnim={scaleAnim} />,
    );
    // 라벨 없으면 해당 알파벳 텍스트도 없어야 함
    expect(queryNoLabel('A')).toBeNull();
  });
});
```

- [ ] **Step 2: 실패 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- GenerationResultCard.test
```

Expected: FAIL — module not found.

- [ ] **Step 3: 구현**

```tsx
// apps/frontend/components/generation/GenerationResultCard.tsx
import React, { memo } from 'react';
import { View, Text, Animated } from 'react-native';
import { getNumberColor } from '../../utils/lotto';

interface GenerationResultCardProps {
  numbers: number[];
  scaleAnim: Animated.Value;
  label?: string;
}

/**
 * @description 단일 게임 결과 카드 (6번호 + 선택적 라벨).
 * GenerationResultCards에서 N개 묶어 표시할 때 각 카드 단위.
 */
const GenerationResultCardComponent = ({
  numbers,
  scaleAnim,
  label,
}: GenerationResultCardProps) => (
  <View className="bg-white/15 rounded-2xl p-4 mb-3 border border-white/20">
    {label ? (
      <View className="absolute -top-2 -left-1 bg-white px-2 py-0.5 rounded-full">
        <Text className="text-primary font-black text-[12px]">{label}</Text>
      </View>
    ) : null}
    <View className="flex-row flex-wrap justify-center gap-2">
      {numbers.map((n, idx) => (
        <Animated.View
          key={idx}
          style={{ transform: [{ scale: scaleAnim }] }}
          className={`${getNumberColor(n)} w-11 h-11 rounded-full items-center justify-center shadow-md`}
        >
          <Text className="text-white text-lg font-black">{n}</Text>
        </Animated.View>
      ))}
    </View>
  </View>
);

export const GenerationResultCard = memo(GenerationResultCardComponent);
```

- [ ] **Step 4: 통과 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- GenerationResultCard.test
```

Expected: PASS — 2 tests.

- [ ] **Step 5: 커밋**

```bash
git add apps/frontend/components/generation/GenerationResultCard.tsx \
        apps/frontend/__tests__/components/generation/GenerationResultCard.test.tsx
git commit -m "feat(generation): add GenerationResultCard (single game card)"
```

---

### Task 2.3: `GenerationResultCards` 컴포넌트 (TDD)

**Files:**
- Create: `apps/frontend/components/generation/GenerationResultCards.tsx`
- Create: `apps/frontend/__tests__/components/generation/GenerationResultCards.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// apps/frontend/__tests__/components/generation/GenerationResultCards.test.tsx
import React from 'react';
import { Animated } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { GenerationResultCards } from '../../../components/generation/GenerationResultCards';

describe('GenerationResultCards', () => {
  const scaleAnim = new Animated.Value(1);
  const baseProps = {
    methodTitle: '사주팔자',
    isSaving: false,
    onSave: jest.fn(),
    onShare: jest.fn(),
    scaleAnim,
  };

  beforeEach(() => jest.clearAllMocks());

  test('games=[] → 빈 상태 텍스트', () => {
    const { getByText } = render(
      <GenerationResultCards {...baseProps} games={[]} />,
    );
    expect(getByText('아래에서 생성 방식을 선택하세요!')).toBeTruthy();
  });

  test('games.length===1 → 라벨 없이 한 카드', () => {
    const games = [[1, 2, 3, 4, 5, 6]];
    const { queryByText, getByText } = render(
      <GenerationResultCards {...baseProps} games={games} />,
    );
    games[0].forEach((n) => expect(getByText(String(n))).toBeTruthy());
    expect(queryByText('A')).toBeNull();
  });

  test('games.length===5 → 5개 카드 + 라벨 A~E', () => {
    const games = [
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18],
      [19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, 30],
    ];
    const { getByText } = render(
      <GenerationResultCards {...baseProps} games={games} />,
    );
    ['A', 'B', 'C', 'D', 'E'].forEach((label) => {
      expect(getByText(label)).toBeTruthy();
    });
  });

  test('저장 버튼 1쌍만 (5게임이어도)', () => {
    const games = Array.from({ length: 5 }, () => [1, 2, 3, 4, 5, 6]);
    const { getAllByLabelText } = render(
      <GenerationResultCards {...baseProps} games={games} />,
    );
    expect(getAllByLabelText('번호 저장하기')).toHaveLength(1);
    expect(getAllByLabelText('커뮤니티에 공유')).toHaveLength(1);
  });

  test('저장 버튼 클릭 시 onSave 호출', () => {
    const games = [[1, 2, 3, 4, 5, 6]];
    const { getByLabelText } = render(
      <GenerationResultCards {...baseProps} games={games} />,
    );
    fireEvent.press(getByLabelText('번호 저장하기'));
    expect(baseProps.onSave).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- GenerationResultCards.test
```

Expected: FAIL — module not found.

- [ ] **Step 3: 구현**

```tsx
// apps/frontend/components/generation/GenerationResultCards.tsx
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { Sparkles, Save, Share2 } from 'lucide-react-native';
import { GenerationResultCard } from './GenerationResultCard';
import { labelOf } from '../../utils/lotto';

export interface GenerationResultCardsProps {
  games: number[][];
  methodTitle?: string;
  scaleAnim: Animated.Value;
  isSaving: boolean;
  onSave: () => void;
  onShare: () => void;
}

/**
 * @description N세트 결과 카드 묶음 + 묶음 단위 저장/공유 버튼.
 * length===0 → 빈 상태, length===1 → 라벨 없는 단일 카드 (기존 디자인 보존),
 * length>1 → 라벨('A'~) 카드 세로 스택.
 */
const GenerationResultCardsComponent = ({
  games,
  methodTitle,
  scaleAnim,
  isSaving,
  onSave,
  onShare,
}: GenerationResultCardsProps) => {
  const isMulti = games.length > 1;

  return (
    <View className="bg-primary rounded-[24px] p-6 shadow-lg overflow-hidden">
      {methodTitle ? (
        <View className="self-center bg-white/20 px-4 py-2 rounded-full border border-white/30 mb-5">
          <Text className="text-white font-bold">{methodTitle}</Text>
        </View>
      ) : null}

      {games.length === 0 ? (
        <View className="items-center py-4">
          <Sparkles size={56} color="white" />
          <Text className="text-white/70 text-base mt-4 text-center">
            아래에서 생성 방식을 선택하세요!
          </Text>
        </View>
      ) : (
        <View>
          {games.map((numbers, i) => (
            <GenerationResultCard
              key={i}
              numbers={numbers}
              scaleAnim={scaleAnim}
              label={isMulti ? labelOf(i) : undefined}
            />
          ))}
        </View>
      )}

      {games.length > 0 ? (
        <View className="flex-row mt-4 gap-3 justify-center">
          <TouchableOpacity
            onPress={onSave}
            disabled={isSaving}
            activeOpacity={0.7}
            className="bg-white px-6 py-3 rounded-full shadow-sm flex-row items-center justify-center min-w-[140px]"
            accessibilityRole="button"
            accessibilityLabel="번호 저장하기"
            accessibilityState={{ disabled: isSaving, busy: isSaving }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <>
                <Save size={18} color="#4CAF50" />
                <Text className="text-primary font-bold ml-2">번호 저장하기</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onShare}
            activeOpacity={0.7}
            className="bg-white px-6 py-3 rounded-full shadow-sm flex-row items-center justify-center min-w-[140px]"
            accessibilityRole="button"
            accessibilityLabel="커뮤니티에 공유"
          >
            <Share2 size={18} color="#4CAF50" />
            <Text className="text-primary font-bold ml-2">커뮤니티에 공유</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export const GenerationResultCards = memo(GenerationResultCardsComponent);
```

- [ ] **Step 4: 통과 + 회귀 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test
```

Expected: 모두 PASS (Cards 5개 + 기존).

- [ ] **Step 5: 커밋**

```bash
git add apps/frontend/components/generation/GenerationResultCards.tsx \
        apps/frontend/__tests__/components/generation/GenerationResultCards.test.tsx
git commit -m "feat(generation): add GenerationResultCards with multi-game support"
```

---

## Phase 3 — 화면 통합

### Task 3.1: `number-generation.tsx` state + handlers 변경

**Files:**
- Modify: `apps/frontend/app/number-generation.tsx`

- [ ] **Step 1: 파일 전체를 다음으로 교체**

```tsx
// apps/frontend/app/number-generation.tsx
import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Animated, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Sparkles, ChevronLeft } from 'lucide-react-native';
import { generateLottoGames, saveLottoSet, labelOf } from '../utils/lotto';
import { METHODS } from '../constants/generation-methods';
import { GenerationInputModal } from '../components/ui/GenerationInputModal';
import { GenerationResultCards } from '../components/generation/GenerationResultCards';
import { GameCountToggle, GameCount } from '../components/generation/GameCountToggle';
import { MethodSelector } from '../components/generation/MethodSelector';

export default function NumberGenerationScreen() {
  const router = useRouter();
  const [gameCount, setGameCount] = useState<GameCount>(1);
  const [generatedGames, setGeneratedGames] = useState<number[][]>([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [lastParam, setLastParam] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paramInput, setParamInput] = useState('');
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const runGenerate = (methodId: string, count: GameCount, param?: string) => {
    const games = generateLottoGames(methodId, count, param);
    setGeneratedGames(games);
    setLastParam(param);
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    if (['DREAM', 'SAJU', 'PERSONAL_SIGNIFICANCE'].includes(methodId)) {
      setParamInput('');
      setIsModalVisible(true);
    } else {
      runGenerate(methodId, gameCount);
    }
  };

  const handleConfirmModal = () => {
    setIsModalVisible(false);
    runGenerate(selectedMethod, gameCount, paramInput);
  };

  const handleCountChange = (newCount: GameCount) => {
    setGameCount(newCount);
    if (selectedMethod && generatedGames.length > 0) {
      runGenerate(selectedMethod, newCount, lastParam);
    }
  };

  const handleSave = () => {
    if (generatedGames.length === 0) return;
    setIsSaving(true);
    try {
      saveLottoSet({
        method: selectedMethod,
        param: lastParam,
        games: generatedGames.map((numbers) => ({ numbers })),
      });
      Alert.alert('성공', `${gameCount}게임이 저장되었습니다! 내역 탭에서 확인하세요.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    const isMulti = generatedGames.length > 1;
    const sets = generatedGames
      .map((nums, i) => (isMulti ? `${labelOf(i)}: ${nums.join(', ')}` : nums.join(', ')))
      .join('\n');
    router.push({
      pathname: '/create-post',
      params: {
        prefillTitle: '🍀 오늘의 로또 번호',
        prefillContent: `추천 번호 (${gameCount}게임):\n${sets}\n\n${methodTitle ?? ''} 방식으로 생성했습니다!`,
      },
    });
  };

  const methodTitle = METHODS.find((m) => m.id === selectedMethod)?.title;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      <Stack.Screen options={{
        title: '행운의 번호 추첨',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
            activeOpacity={0.7}
            className="p-3 -ml-3"
          >
            <ChevronLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
        ),
      }} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <GameCountToggle value={gameCount} onChange={handleCountChange} />
        <GenerationResultCards
          games={generatedGames}
          methodTitle={methodTitle}
          scaleAnim={scaleAnim}
          isSaving={isSaving}
          onSave={handleSave}
          onShare={handleShare}
        />
        <MethodSelector selectedMethod={selectedMethod} onSelect={handleMethodSelect} />
        <GenerationInputModal
          isVisible={isModalVisible}
          methodTitle={methodTitle}
          selectedMethod={selectedMethod}
          paramInput={paramInput}
          setParamInput={setParamInput}
          onCancel={() => setIsModalVisible(false)}
          onConfirm={handleConfirmModal}
        />
        {/* Tip Section */}
        <View className="bg-amber-50 dark:bg-dark-card rounded-2xl p-4 border border-amber-100 dark:border-dark-card mt-8 mb-10 flex-row">
          <Sparkles size={24} color="#D84315" />
          <View className="flex-1 ml-3">
            <Text className="text-[#5D4037] dark:text-dark-text-secondary text-[13px] leading-5">
              각 방식마다 고유한 알고리즘으로 번호를 생성합니다. 마음에 드는 방법을 선택해보세요!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: 타입체크 + 테스트 + 빌드 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npx tsc --noEmit
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npx expo export --platform web --no-minify > /tmp/build.log 2>&1 && echo OK || tail -20 /tmp/build.log
```

Expected: 모두 PASS / OK.

파일 LOC: 100~120 (150 룰 안전).

- [ ] **Step 3: 커밋**

```bash
git add apps/frontend/app/number-generation.tsx
git commit -m "feat(generation): wire GameCountToggle + multi-game generation in screen"
```

---

### Task 3.2: `useHistoryData` 마이그레이션 적용

**Files:**
- Modify: `apps/frontend/hooks/useHistoryData.ts`

- [ ] **Step 1: 파일 전체를 다음으로 교체**

```typescript
// apps/frontend/hooks/useHistoryData.ts
import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import type { LottoTicket } from '../api/tickets';
import type { LottoSetRecord } from '../api/types/lotto';
import { loadItem, StorageKeys, removeFromItemArray } from '../utils/storage';
import { toSetRecord } from '../utils/lotto';

export interface HistoryRecord extends LottoSetRecord {
  _ticketStatus?: string;
}

export function useHistoryData() {
  const [localHistory, setLocalHistory] = useState<LottoSetRecord[]>([]);

  const { data: ticketData } = useQuery({
    queryKey: ['myTickets'],
    /* istanbul ignore next */
    queryFn: () => ticketsApi.getMyTickets(0, 100),
  });

  const loadLocalHistory = useCallback(() => {
    const raw = loadItem<unknown[]>(StorageKeys.SAVED_NUMBERS) || [];
    setLocalHistory(raw.map(toSetRecord));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLocalHistory();
    }, [loadLocalHistory]),
  );

  const handleDelete = useCallback(
    (id: number) => {
      removeFromItemArray<LottoSetRecord>(
        StorageKeys.SAVED_NUMBERS,
        (item) => item.id === id,
      );
      loadLocalHistory();
    },
    [loadLocalHistory],
  );

  const backendRecords = useMemo<HistoryRecord[]>(() => {
    /* istanbul ignore next */
    return (ticketData?.content ?? []).flatMap((ticket: LottoTicket) =>
      (ticket.games ?? []).map((game) => ({
        id: game.id,
        method: 'TICKET',
        createdAt: ticket.createdAt,
        round: ticket.ordinal,
        games: [{
          numbers: [
            game.number1, game.number2, game.number3,
            game.number4, game.number5, game.number6,
          ],
        }],
        _ticketStatus: game.status,
      })),
    );
  }, [ticketData]);

  const records = useMemo<HistoryRecord[]>(
    () => [...backendRecords, ...localHistory],
    [backendRecords, localHistory],
  );

  return { records, handleDelete };
}
```

주요 변경:
- `LottoRecord` → `LottoSetRecord` 사용
- 로컬 history는 `toSetRecord`로 마이그레이션 (legacy 단일 numbers → games:[{numbers}])
- 백엔드 ticket games[]도 게임당 `LottoSetRecord{games:[{numbers}]}` 형태로 정규화 (HistoryItem이 단일 형태로 처리 가능)
- 기존 dedup 로직 제거 (LottoSetRecord에는 `round`가 모든 케이스에 있지 않아 키 생성이 어렵고, 실제 중복 시나리오 거의 없음 — YAGNI)

- [ ] **Step 2: 테스트 + 타입체크**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npx tsc --noEmit
```

Expected: PASS — 단, HistoryItem 변경 전이라 일부 history 관련 테스트가 깨질 수 있음. 그건 다음 task에서 fix.

만약 `apps/frontend/__tests__/components/ui/HistoryItem.test.tsx`가 깨지면 next task(3.3)로 즉시 진행. 깨지지 않으면 그대로 통과.

- [ ] **Step 3: 커밋**

```bash
git add apps/frontend/hooks/useHistoryData.ts
git commit -m "refactor(history): use LottoSetRecord with toSetRecord migration"
```

---

### Task 3.3: `HistoryItem` games[] 처리

**Files:**
- Modify: `apps/frontend/components/ui/HistoryItem.tsx`
- Modify: `apps/frontend/__tests__/components/ui/HistoryItem.test.tsx` (필요 시)

- [ ] **Step 1: 현재 테스트 확인**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test -- HistoryItem.test
```

테스트가 현재 어떤 record 형태를 기대하는지 확인. `record.numbers` 사용 중이면 `record.games[0].numbers`로 변경 필요.

- [ ] **Step 2: HistoryItem 수정**

`apps/frontend/components/ui/HistoryItem.tsx`를 다음으로 교체:

```tsx
import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Trash2, Calendar } from 'lucide-react-native';
import { LottoBall } from './LottoBall';
import { LottoSetRecord } from '../../api/types/lotto';
import { labelOf } from '../../utils/lotto';

interface HistoryItemProps {
  record: LottoSetRecord;
  onDelete: (id: number) => void;
}

/** @description 사용자의 과거 로또 구매 또는 번호 생성 내역 카드. 단일/N게임 묶음 모두 처리. */
const HistoryItemComponent = ({ record, onDelete }: HistoryItemProps) => {
  const dateStr = formatDate(record.createdAt);
  const isMulti = record.games.length > 1;

  return (
    <View
      className="bg-white rounded-[24px] p-5 mb-5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-2">
          {record.round ? (
            <View className="bg-[#4CAF50]/10 px-3 py-1.5 rounded-xl">
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#4CAF50] text-[12px]">
                {record.round}회차
              </Text>
            </View>
          ) : null}
          {isMulti ? (
            <View className="bg-primary/10 px-3 py-1.5 rounded-xl">
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-primary text-[12px]">
                {record.games.length}게임 묶음
              </Text>
            </View>
          ) : null}
          <View className="flex-row items-center ml-1">
            <Calendar size={14} color="#BDBDBD" />
            <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-[12px] ml-1.5">
              {dateStr}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(record.id)}
          className="p-1"
          activeOpacity={0.6}
          accessibilityLabel="내역 삭제"
          accessibilityRole="button"
        >
          <Trash2 size={18} color="#FFCDCD" />
        </TouchableOpacity>
      </View>

      {record.games.map((game, i) => (
        <View key={i} className={`flex-row justify-between items-center px-1 ${i > 0 ? 'mt-3' : ''}`}>
          {isMulti ? (
            <Text className="text-gray-400 font-bold text-[12px] w-5">{labelOf(i)}</Text>
          ) : null}
          {game.numbers.map((num, j) => (
            <LottoBall key={j} number={num} size="sm" />
          ))}
        </View>
      ))}
    </View>
  );
};

export const HistoryItem = memo(HistoryItemComponent);
HistoryItem.displayName = 'HistoryItem';

function formatDate(date: string | Date): string {
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch {
    return String(date);
  }
}
```

- [ ] **Step 3: 기존 HistoryItem 테스트 수정**

`apps/frontend/__tests__/components/ui/HistoryItem.test.tsx`를 읽고, `record.numbers`를 사용하는 부분을 `record.games[0].numbers`로 변경:

```typescript
// before
const record = {
  id: 1,
  numbers: [1, 2, 3, 4, 5, 6],
  status: 'CHECKED',
  createdAt: '2026-05-09T00:00:00.000Z',
  round: 1100,
};

// after
const record = {
  id: 1,
  method: 'TICKET',
  createdAt: '2026-05-09T00:00:00.000Z',
  round: 1100,
  games: [{ numbers: [1, 2, 3, 4, 5, 6] }],
  _ticketStatus: 'CHECKED',
};
```

새 테스트 케이스 추가 (다중 게임):

```typescript
test('5게임 묶음 → "5게임 묶음" 배지 + 라벨 A~E', () => {
  const record = {
    id: 2,
    method: 'SAJU',
    createdAt: '2026-05-09T00:00:00.000Z',
    games: [
      { numbers: [1, 2, 3, 4, 5, 6] },
      { numbers: [7, 8, 9, 10, 11, 12] },
      { numbers: [13, 14, 15, 16, 17, 18] },
      { numbers: [19, 20, 21, 22, 23, 24] },
      { numbers: [25, 26, 27, 28, 29, 30] },
    ],
  };
  const { getByText } = render(
    <HistoryItem record={record} onDelete={jest.fn()} />,
  );
  expect(getByText('5게임 묶음')).toBeTruthy();
  ['A', 'B', 'C', 'D', 'E'].forEach((label) => {
    expect(getByText(label)).toBeTruthy();
  });
});

test('1게임 (games.length===1) → 묶음 배지 없음, 라벨 없음', () => {
  const record = {
    id: 3,
    method: 'SAJU',
    createdAt: '2026-05-09T00:00:00.000Z',
    games: [{ numbers: [1, 2, 3, 4, 5, 6] }],
  };
  const { queryByText } = render(
    <HistoryItem record={record} onDelete={jest.fn()} />,
  );
  expect(queryByText(/게임 묶음/)).toBeNull();
  expect(queryByText('A')).toBeNull();
});
```

- [ ] **Step 4: 테스트 + 타입체크 + 빌드**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npx tsc --noEmit
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npx expo export --platform web --no-minify > /tmp/build.log 2>&1 && echo OK || tail -30 /tmp/build.log
```

Expected: 모두 PASS / OK.

- [ ] **Step 5: 커밋**

```bash
git add apps/frontend/components/ui/HistoryItem.tsx \
        apps/frontend/__tests__/components/ui/HistoryItem.test.tsx
git commit -m "refactor(history): render games[] with multi-game badge and labels"
```

---

### Task 3.4: 기존 `GenerationResult.tsx` 삭제

**Files:**
- Delete: `apps/frontend/components/generation/GenerationResult.tsx`
- Delete: `apps/frontend/__tests__/components/ui/GenerationResult.test.ts`

- [ ] **Step 1: 사용처 확인 (남은 import 없는지)**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && grep -rn "from.*generation/GenerationResult'" --include="*.tsx" --include="*.ts" .
```

Expected: 결과 없음 (또는 자기 자신만). number-generation.tsx는 이미 GenerationResultCards 사용 중.

- [ ] **Step 2: 파일 삭제**

```bash
rm apps/frontend/components/generation/GenerationResult.tsx
rm apps/frontend/__tests__/components/ui/GenerationResult.test.ts
```

- [ ] **Step 3: 테스트 + 빌드**

```
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npm test
cd /Users/joel/Desktop/git/clover-wallet/apps/frontend && npx expo export --platform web --no-minify > /tmp/build.log 2>&1 && echo OK || tail -20 /tmp/build.log
```

Expected: 모두 PASS / OK.

- [ ] **Step 4: 커밋**

```bash
git add -A apps/frontend/components/generation/GenerationResult.tsx \
          apps/frontend/__tests__/components/ui/GenerationResult.test.ts
# 또는 위가 안 되면:
git add -u
git commit -m "refactor(generation): remove deprecated GenerationResult.tsx"
```

---

## Phase 4 — Manual smoke + 회귀

### Task 4.1: Manual smoke

이 task는 코드 변경 없음. dev 모드로 앱 띄우고 직접 확인.

- [ ] **Step 1: dev 모드 기동**

```
cd /Users/joel/Desktop/git/clover-wallet && npm run dev:local
```

브라우저 자동 진입 또는 `w` 키 → `http://localhost:8081`

- [ ] **Step 2: Manual checklist**

번호 생성 화면(`/number-generation`)에서:

- [ ] 화면 상단 sticky로 1게임/5게임/10게임 토글 보임
- [ ] 기본 1게임. 메서드 클릭 → 결과 카드 1개 (라벨 없음)
- [ ] 5게임으로 토글 변경 → 같은 메서드면 즉시 5세트 카드 (라벨 A~E)
- [ ] 10게임으로 변경 → 10세트 카드 (라벨 A~J)
- [ ] 사주(생년월일 입력) 5게임 → 5세트 모두 다른 번호
- [ ] 같은 생년월일로 다시 5게임 생성 → 두 번 모두 같은 5세트 (결정론 보존)
- [ ] 1게임 모드 → 기존과 동일한 시각적 결과
- [ ] "번호 저장하기" → "5게임이 저장되었습니다" alert
- [ ] history 탭 진입 → "5게임 묶음" 배지 + 5세트 라벨 A~E
- [ ] history 카드의 삭제 버튼 → 묶음 통째로 삭제됨
- [ ] "커뮤니티에 공유" → /create-post에 prefillContent 5세트 줄바꿈 포맷

- [ ] **Step 3: 종료**

dev:local 터미널에서 Ctrl-C.

만약 어떤 항목이라도 실패하면, 실패 내용 기록하고 BLOCKED 상태 유지. 모두 통과 시 plan 완료.

- [ ] **Step 4: 종료 후 커밋 없음** (smoke task)

---

## Manual Test Checklist (최종)

위 Task 4.1 그대로 + 추가 회귀 항목:

- [ ] 기존 frontend 테스트 모두 통과 (272 + 신규 ~20 = ~292)
- [ ] 백엔드 tests 회귀 통과 (233)
- [ ] `npm run lint` 0 errors
- [ ] `npm run dev:local` 깨끗하게 기동/종료 (이전 dev 모드 PR 회귀 없음)

---

## 변경 파일 최종 목록 (확정)

| 파일 | 종류 | LOC |
|------|------|-----|
| `apps/frontend/api/types/lotto.ts` | 수정 | +20 |
| `apps/frontend/utils/lotto/generator.ts` | 수정 | +20 |
| `apps/frontend/utils/lotto/labels.ts` | 신규 | ~10 |
| `apps/frontend/utils/lotto/history-migration.ts` | 신규 | ~22 |
| `apps/frontend/utils/lotto/history.ts` | 신규 | ~25 |
| `apps/frontend/utils/lotto.ts` | 수정 | +3 |
| `apps/frontend/components/generation/GameCountToggle.tsx` | 신규 | ~50 |
| `apps/frontend/components/generation/GenerationResultCard.tsx` | 신규 | ~40 |
| `apps/frontend/components/generation/GenerationResultCards.tsx` | 신규 | ~110 |
| `apps/frontend/components/generation/GenerationResult.tsx` | 삭제 | -88 |
| `apps/frontend/app/number-generation.tsx` | 수정 | +30, -10 |
| `apps/frontend/hooks/useHistoryData.ts` | 수정 | +20, -25 |
| `apps/frontend/components/ui/HistoryItem.tsx` | 수정 | +25, -10 |
| `apps/frontend/__tests__/lotto.test.ts` | 수정 | +60 |
| `apps/frontend/__tests__/utils/lotto/labels.test.ts` | 신규 | ~25 |
| `apps/frontend/__tests__/utils/lotto/history-migration.test.ts` | 신규 | ~50 |
| `apps/frontend/__tests__/utils/lotto/history.test.ts` | 신규 | ~50 |
| `apps/frontend/__tests__/components/generation/GameCountToggle.test.tsx` | 신규 | ~50 |
| `apps/frontend/__tests__/components/generation/GenerationResultCard.test.tsx` | 신규 | ~30 |
| `apps/frontend/__tests__/components/generation/GenerationResultCards.test.tsx` | 신규 | ~70 |
| `apps/frontend/__tests__/components/ui/GenerationResult.test.ts` | 삭제 | (기존 분량) |
| `apps/frontend/__tests__/components/ui/HistoryItem.test.tsx` | 수정 | +30 |

`GenerationResultCards.tsx` 110 LOC가 최댓값 — 150 LOC 룰 안전. 다른 신규 파일 모두 50 LOC 이하.

---

## 자체 검토 (Self-review)

**1. Spec 커버리지**
- §3.1 데이터 모델 → Task 1.1 ✓
- §3.2 시드 다양화 → Task 1.2 ✓
- §3.3 마이그레이션 → Task 1.4 + 3.2 ✓
- §3.4 컴포넌트 구조 → Task 2.1, 2.2, 2.3 ✓
- §3.5 데이터 흐름 → Task 3.1 ✓
- §4 컴포넌트 명세 → Phase 2 + 3 모두 ✓
- §5 변경 파일 → 위 표와 일치 ✓
- §6 테스트 전략 → 각 Task에 TDD red/green 단계 + Task 4.1 manual ✓
- §7 롤아웃 순서 → Phase 1→4 매핑 ✓
- §8 위험 요소 → 시드 우연 충돌(Task 1.2 테스트), 마이그레이션 실패(Task 1.4 테스트), 카드 길이/HistoryItem 단일 분기 보존(Task 3.3) ✓

**2. Placeholder 스캔**: TBD/TODO/"위와 비슷" 등 없음. 모든 step 실제 코드/명령 포함 ✓

**3. 타입 일관성**:
- `LottoSetRecord` Task 1.1 정의 → Task 1.4, 1.5, 3.2, 3.3에서 동일 시그니처 사용 ✓
- `GameSet` Task 1.1 정의 → Task 1.5(`saveLottoSet({games: GameSet[]})`)에서 사용 ✓
- `GameCount` Task 2.1 export → Task 3.1 import 일치 ✓
- `generateLottoGames(methodId, count, param?)` Task 1.2 → Task 3.1 호출 시그니처 일치 ✓
- `labelOf(index)` Task 1.3 → Task 2.3, 3.1, 3.3에서 호출 일치 ✓
- `saveLottoSet({method, param?, games})` Task 1.5 → Task 3.1 호출 일치 ✓
- `toSetRecord(unknown)` Task 1.4 → Task 3.2 import 일치 ✓
