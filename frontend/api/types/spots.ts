export interface LottoSpot {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  firstPlaceWins: number;
  secondPlaceWins: number;
  isFavorite?: boolean;
}

export interface WinningHistory {
  round: number;
  rank: number;
  storeName: string;
  address: string;
  method: string | null;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
