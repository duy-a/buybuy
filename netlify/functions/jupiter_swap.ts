import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST' || !event.body) {
    return { statusCode: 405, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  try {
    const input = JSON.parse(event.body) as { quoteResponse: unknown; userPublicKey: string };
    const response = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: input.quoteResponse,
        userPublicKey: input.userPublicKey,
        wrapUnwrapSOL: true,
        dynamicComputeUnitLimit: true,
      }),
    });

    const text = await response.text();
    return {
      statusCode: response.status,
      headers: { 'content-type': 'application/json' },
      body: text,
    };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'swap preparation failed' }) };
  }
};
