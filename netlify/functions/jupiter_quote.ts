import type { Handler } from '@netlify/functions';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export const handler: Handler = async (event) => {
  const outputMint = event.queryStringParameters?.outputMint;
  const amount = event.queryStringParameters?.amount;
  const slippageBps = event.queryStringParameters?.slippageBps ?? '100';

  if (!outputMint || !amount) {
    return { statusCode: 400, body: JSON.stringify({ error: 'missing params' }) };
  }

  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
  const response = await fetch(url);
  const text = await response.text();

  return {
    statusCode: response.status,
    headers: { 'content-type': 'application/json' },
    body: text,
  };
};
