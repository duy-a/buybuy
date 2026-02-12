import type { Handler } from '@netlify/functions';

let cache: { at: number; value: number } | null = null;

export const handler: Handler = async () => {
  const now = Date.now();
  if (cache && now - cache.at < 30_000) {
    return { statusCode: 200, body: JSON.stringify({ solUsd: cache.value, cached: true }) };
  }

  try {
    const response = await fetch('https://price.jup.ag/v6/price?ids=SOL');
    if (!response.ok) throw new Error('price fail');
    const json = (await response.json()) as { data?: { SOL?: { price?: number } } };
    const price = json.data?.SOL?.price;
    if (!price) throw new Error('no price');

    cache = { at: now, value: price };
    return {
      statusCode: 200,
      headers: { 'cache-control': 'public, max-age=30' },
      body: JSON.stringify({ solUsd: price, cached: false }),
    };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'price unavailable' }) };
  }
};
