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

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
