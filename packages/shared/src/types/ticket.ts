export interface ScanResult {
  round?: number;
  numbers: number[];
}

export type ExtractionMethod =
  | 'DREAM'
  | 'SAJU'
  | 'PERSONAL_SIGNIFICANCE'
  | 'AUTO'
  | 'RANDOM'
  | 'STATISTICS';
