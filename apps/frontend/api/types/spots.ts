import type { LottoSpot as SharedLottoSpot } from '@clover/shared';

export interface LottoSpot extends SharedLottoSpot {
  isFavorite?: boolean;
}

export type { WinningStoreHistory as WinningHistory } from '@clover/shared';

/** Frontend-only: map viewport region */
export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
