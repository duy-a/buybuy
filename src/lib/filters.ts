import type { RawToken, VerifiedToken } from './types';

export const passesBaseFilters = (token: RawToken): boolean =>
  token.holders > 500 && token.ageSeconds < 12 * 60 * 60 && token.volume24hUsd > 100_000;

export const calculateRatio = (volume24hUsd: number, feesTotalSol: number, solUsd: number): { feesUsd: number; ratio: number } => {
  const feesUsd = feesTotalSol * solUsd;
  if (feesUsd <= 0) return { feesUsd, ratio: Number.POSITIVE_INFINITY };
  return { feesUsd, ratio: volume24hUsd / feesUsd };
};

export const verifyTokens = (tokens: RawToken[], solUsd: number): VerifiedToken[] =>
  tokens
    .filter(passesBaseFilters)
    .map((token) => {
      const { feesUsd, ratio } = calculateRatio(token.volume24hUsd, token.feesTotalSol, solUsd);
      return {
        ...token,
        feesUsd,
        ratio,
      };
    })
    .filter((token) => token.ratio < 250);
