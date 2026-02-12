import type { Handler } from '@netlify/functions';

type Normalized = {
  name: string;
  symbol: string;
  mint: string;
  holders: number;
  ageSeconds: number;
  volume24hUsd: number;
  feesTotalSol: number;
  gmgnUrl: string;
};

const tryNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const normalizeCandidate = (item: Record<string, unknown>): Normalized | null => {
  const mint = String(item.mint ?? item.address ?? item.token_address ?? '');
  if (!mint) return null;
  const name = String(item.name ?? item.base_name ?? 'Unknown');
  const symbol = String(item.symbol ?? item.base_symbol ?? 'UNK');
  const holders = tryNumber(item.holders ?? item.holder_count);
  const ageSeconds = tryNumber(item.age_seconds ?? item.age ?? item.created_age_seconds);
  const volume24hUsd = tryNumber(item.volume24h ?? item.volume_24h_usd ?? item.v24h);
  const feesTotalSol = tryNumber(item.fees_total_sol ?? item.total_fees_sol ?? item.fees);
  const gmgnUrl = String(item.gmgnUrl ?? item.url ?? `https://gmgn.ai/sol/token/${mint}`);

  if (!Number.isFinite(holders) || !Number.isFinite(volume24hUsd)) return null;

  return {
    name,
    symbol,
    mint,
    holders,
    ageSeconds,
    volume24hUsd,
    feesTotalSol,
    gmgnUrl,
  };
};

const extractList = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const keys = ['data', 'list', 'pairs', 'tokens', 'rows'];
    for (const key of keys) {
      const value = obj[key];
      if (Array.isArray(value)) return value;
      if (value && typeof value === 'object') {
        const nested = value as Record<string, unknown>;
        if (Array.isArray(nested.list)) return nested.list;
      }
    }
  }
  return [];
};

export const handler: Handler = async () => {
  try {
    const endpoint =
      process.env.GMGN_MIGRATED_ENDPOINT ||
      'https://gmgn.ai/defi/quotation/v1/rank/sol/swaps/24h?device=web&from_app=gmgn&orderby=volume&direction=desc';

    const response = await fetch(endpoint, {
      headers: {
        accept: 'application/json',
        'user-agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: 'gmgn upstream failed' }) };
    }

    const payload = (await response.json()) as unknown;
    const list = extractList(payload);
    const normalized = list
      .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === 'object'))
      .map(normalizeCandidate)
      .filter((item): item is Normalized => item !== null)
      .filter((item) => {
        const source = JSON.stringify(item).toLowerCase();
        return source.includes('pump') || source.includes('migrat') || item.gmgnUrl.includes('/token/');
      });

    return {
      statusCode: 200,
      headers: { 'cache-control': 'public, max-age=20' },
      body: JSON.stringify({
        tokens: normalized,
        source: endpoint,
        fetchedAt: new Date().toISOString(),
      }),
    };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'gmgn parsing failed' }) };
  }
};
