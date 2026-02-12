# BuyBuy SPA (Vite + React + TypeScript + Tailwind + Netlify Functions)

Production-ready SPA for scanning migrated pump.fun tokens from gmgn.ai, verifying by quantitative rules, and buying via Jupiter.

## Features

- Wallet Adapter connect flow (Phantom / Solflare).
- Optional **Advanced / risky** in-memory private key import (base58 or JSON array), with forget button.
- SOL balance view + manual refresh + 12s polling when wallet exists.
- GMGN migrated-token scanner with 30s refresh + countdown + visibility pause.
- Verification rules:
  - holders > 500
  - age < 12h
  - volume24hUsd > 100000
  - ratio = volume24hUsd / (feesTotalSol * solUsd) < 250
- Buy flow using Jupiter quote + swap transaction and Solscan tx link.
- Netlify Functions proxy for GMGN/Jupiter/SOL price to avoid CORS issues.

## Environment Variables

Frontend (`.env`):

- `VITE_SOLANA_RPC_URL` (recommended)
- `VITE_SOLANA_CLUSTER` (optional, default `mainnet-beta`)

Functions (Netlify UI or local env):

- `SOLANA_RPC_URL` (optional fallback for future function-side RPC)
- `GMGN_MIGRATED_ENDPOINT` (optional override if gmgn endpoint changes)

## Local Development

```bash
npm install
npm run dev
```

Functions locally via Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

## Build

```bash
npm run build
```

## Deploy to Netlify

1. Push repo to GitHub/GitLab/Bitbucket.
2. In Netlify: **Add new site > Import from Git**.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Functions directory: `netlify/functions`
6. Configure env vars listed above.
7. Deploy.

`netlify.toml` already includes SPA redirect rules.

## Security Notes

- No private keys are ever sent to backend functions.
- Imported private key stays in React state only, never persisted.
- Do not use this app with high-value wallets without full audit.
