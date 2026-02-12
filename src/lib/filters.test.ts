import { describe, expect, it } from 'vitest';
import { calculateRatio, passesBaseFilters, verifyTokens } from './filters';

describe('filters', () => {
  it('calculates ratio safely', () => {
    const out = calculateRatio(200000, 2, 100);
    expect(out.feesUsd).toBe(200);
    expect(out.ratio).toBe(1000);
  });

  it('enforces base filters', () => {
    expect(
      passesBaseFilters({
        name: 'A',
        symbol: 'A',
        mint: 'm',
        holders: 600,
        ageSeconds: 100,
        volume24hUsd: 150000,
        feesTotalSol: 1,
        gmgnUrl: 'x',
      }),
    ).toBe(true);
  });

  it('returns only verified tokens', () => {
    const verified = verifyTokens(
      [
        {
          name: 'A',
          symbol: 'A',
          mint: 'm1',
          holders: 600,
          ageSeconds: 100,
          volume24hUsd: 100000,
          feesTotalSol: 1,
          gmgnUrl: 'x',
        },
        {
          name: 'B',
          symbol: 'B',
          mint: 'm2',
          holders: 100,
          ageSeconds: 100,
          volume24hUsd: 100000,
          feesTotalSol: 1,
          gmgnUrl: 'x',
        },
      ],
      200,
    );

    expect(verified).toHaveLength(0);
  });
});
