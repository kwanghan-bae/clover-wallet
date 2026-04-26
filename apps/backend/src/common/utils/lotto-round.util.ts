
export function calculateCurrentRound(): number {
  const baseDate = new Date('2002-12-07');
  const now = new Date();
  const diffMs = now.getTime() - baseDate.getTime();
  const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return weeks + 1;
}
