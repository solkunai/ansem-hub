<div align="center">
  <img src="public/bull-logo.png" alt="ANSEM Hub" width="120" />

  # ANSEM HUB

  **Home base for ANSEM holders.** Live holder count, tiers, leaderboard, and airdrops — all real, all on-chain.

  <img src="public/black-bull.jpg" alt="ANSEM" width="100%" />
</div>

Standalone product. Separate repo, separate Supabase project, separate domain.

Every number on the site is either live from the chain or a disclosed, deliberate approximation — no mock or placeholder data.

## Features

- **Live market data** — price, market cap, and holder count polled from Jupiter and DexScreener
- **Swap widget** — buy/sell ANSEM directly against SOL via Jupiter's Swap API, signed with your own wallet
- **Leaderboard** — top ANSEM holders, ranked by balance, days held, or 24h change, with on-demand trade/PnL detail per wallet
- **Airdrops feed** — every real ANSEM and SOL send from the creator wallet, indexed in real time via a Helius webhook, filterable by token, paginated
- **Wallet support** — Phantom, Solflare, Backpack, Ledger, and Mobile Wallet Adapter
- **Creators** — a community points system for content contributors, with admin review gated by wallet signature (no OAuth, no server-side keys)

## Stack

- Vite + React + TypeScript + Tailwind
- Solana wallet-adapter (Phantom, Solflare, Backpack, Ledger, Mobile Wallet Adapter)
- Supabase (Postgres, Row-Level Security, Realtime, Cron, Edge Functions) for the backend
- Jupiter (price, quotes, swaps, token search), DexScreener (market cap/volume), Helius (RPC + enhanced webhooks)
- Hosted on Vercel

## Local dev

```bash
npm install
cp .env.example .env.local   # then fill in the real values
npm run dev
```

## Security model

- The frontend only ever holds public-safe values: the Supabase project URL and the Supabase publishable key. These are designed to be shipped to the browser. Row Level Security on the database is the real access boundary.
- Server-only secrets (Helius key, any service_role key, operator signing keys) live in the Supabase project env and are read only inside Edge Functions. They are never imported into the frontend bundle.
- Only `VITE_`-prefixed env vars reach the client. Never prefix a secret with `VITE_`.
- `.env`, `.env.local`, keypairs, and `*.key` / `*.pem` are gitignored.
- The Solana RPC endpoint is proxied through an edge function (`rpc-proxy`) rather than exposing a Helius key to the browser, with a method allowlist and a per-IP rate limit backing it.

## Backend

Edge Functions live in `supabase/functions/`:

- `verify-ansem-holder` — real-time ANSEM balance check for a connected wallet
- `snapshot-holders` — cron-driven leaderboard snapshot (top holders, 24h change, days held)
- `helius-webhook` — receives Helius's enhanced-transaction webhook, indexes real ANSEM/SOL airdrops from the creator wallet
- `backfill-airdrops` — one-off historical backfill for airdrops sent before the webhook existed (admin-gated)
- `rpc-proxy` — server-side Helius RPC proxy for wallet transactions (method allowlist + rate limit, key never reaches the browser)
- `wallet-trades` — on-demand 14-day buy/sell/PnL lookup per wallet
- `admin-review-submission` / `admin-list-submissions` — Creators points moderation, gated by a Solana `signMessage` signature

## Project structure

```
src/
  pages/          route-level views (Landing, Dashboard, Leaderboard, Airdrops, Creators, Admin)
  hooks/          data-fetching hooks (live prices, leaderboard, airdrop feed, wallet trades)
  providers/      wallet + market context providers
  lib/            client-side helpers (formatting, swap building, price fetching)
supabase/
  functions/      edge functions (see above)
  migrations/     database schema history
```

## License

Not yet decided — treat as all-rights-reserved until a `LICENSE` file is added.
