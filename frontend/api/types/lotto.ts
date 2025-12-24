export interface LottoRecord {
  id: string;
  round: number;
  numbers: number[];
  createdAt: string;
  isScanned?: boolean;
}
