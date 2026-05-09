import { parsePrefill } from '../../app/create-post';
import { labelOf } from '../../utils/lotto';

/**
 * Integration test for the number-generation → create-post share round-trip.
 *
 * The format is constructed in apps/frontend/app/number-generation.tsx handleShare:
 *   `추천 번호 (${gameCount}게임):\n${sets}\n\n${methodTitle ?? ''} 방식으로 생성했습니다!`
 * where `sets` is either:
 *   - single-game: `1, 2, 3, 4, 5, 6`
 *   - multi-game (joined by \n): `A: 1, 2, 3, 4, 5, 6\nB: 7, 8, 9, 10, 11, 12\n...`
 *
 * If parsePrefill drifts from this format, the BallRow preview silently falls
 * back to plain text — defeating the headline polish fix. This test pins the
 * contract.
 */

const buildShareContent = (
  games: number[][],
  methodTitle: string,
): string => {
  const isMulti = games.length > 1;
  const sets = games
    .map((nums, i) => (isMulti ? `${labelOf(i)}: ${nums.join(', ')}` : nums.join(', ')))
    .join('\n');
  return `추천 번호 (${games.length}게임):\n${sets}\n\n${methodTitle} 방식으로 생성했습니다!`;
};

describe('parsePrefill (integration with number-generation share format)', () => {
  it('parses single-game 사주 share', () => {
    const raw = buildShareContent([[10, 11, 14, 17, 20, 35]], '사주팔자');
    const parsed = parsePrefill(raw);

    expect(parsed).not.toBeNull();
    expect(parsed?.games).toEqual([{ numbers: [10, 11, 14, 17, 20, 35] }]);
    expect(parsed?.method).toBe('사주팔자');
  });

  it('parses 5-game multi share with A/B/C/D/E labels', () => {
    const games = [
      [10, 11, 14, 17, 20, 35],
      [5, 12, 18, 23, 31, 42],
      [3, 8, 19, 25, 36, 44],
      [7, 13, 22, 28, 33, 41],
      [1, 9, 15, 24, 30, 45],
    ];
    const raw = buildShareContent(games, '사주팔자');
    const parsed = parsePrefill(raw);

    expect(parsed).not.toBeNull();
    expect(parsed?.games).toHaveLength(5);
    expect(parsed?.games[0].numbers).toEqual([10, 11, 14, 17, 20, 35]);
    expect(parsed?.games[4].numbers).toEqual([1, 9, 15, 24, 30, 45]);
    expect(parsed?.method).toBe('사주팔자');
  });

  it('parses 10-game multi share (max — labels A through J)', () => {
    const games = Array.from({ length: 10 }, (_, i) =>
      [i + 1, i + 2, i + 3, i + 4, i + 5, i + 6],
    );
    const raw = buildShareContent(games, '랜덤');
    const parsed = parsePrefill(raw);

    expect(parsed?.games).toHaveLength(10);
    expect(parsed?.games[9].numbers).toEqual([10, 11, 12, 13, 14, 15]);
    expect(parsed?.method).toBe('랜덤');
  });

  it('handles empty methodTitle (?? fallback) without crashing', () => {
    const raw = buildShareContent([[1, 2, 3, 4, 5, 6]], '');
    const parsed = parsePrefill(raw);

    expect(parsed?.games).toHaveLength(1);
    // method becomes '' after trim — truthy check in PostNumbersPreview hides the line
    expect(parsed?.method).toBe('');
  });

  it('returns null for undefined input', () => {
    expect(parsePrefill(undefined)).toBeNull();
  });

  it('returns null when no recognizable game lines are present', () => {
    expect(parsePrefill('그냥 텍스트입니다')).toBeNull();
  });

  it('rejects malformed game lines with wrong number count', () => {
    const raw = '추천 번호 (1게임):\n1, 2, 3\n\n랜덤 방식으로 생성했습니다!';
    // 3-number "game" line gets filtered out by the length===6 guard
    expect(parsePrefill(raw)).toBeNull();
  });

  it('does not include the header line as a game', () => {
    const raw = buildShareContent([[1, 2, 3, 4, 5, 6]], '꿈');
    const parsed = parsePrefill(raw);
    // header "추천 번호 (1게임):" must not be parsed as a game line
    expect(parsed?.games).toHaveLength(1);
  });
});
