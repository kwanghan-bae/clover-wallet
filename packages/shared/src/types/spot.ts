export interface LottoSpot {
  id: bigint;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  firstPlaceWins: number;
  secondPlaceWins: number;
}

export interface WinningStoreHistory {
  round: number;
  rank: number;
  storeName: string;
  address: string;
  method?: string;
}
