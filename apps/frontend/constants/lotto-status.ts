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
