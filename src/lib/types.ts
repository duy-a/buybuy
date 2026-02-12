export type RawToken = {
  name: string;
  symbol: string;
  mint: string;
  holders: number;
  ageSeconds: number;
  volume24hUsd: number;
  feesTotalSol: number;
  gmgnUrl: string;
};

export type VerifiedToken = RawToken & {
  feesUsd: number;
  ratio: number;
};

export type ScannerResponse = {
  tokens: RawToken[];
  source: string;
  fetchedAt: string;
};
