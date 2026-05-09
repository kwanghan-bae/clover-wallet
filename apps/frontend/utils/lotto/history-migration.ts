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
