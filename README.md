# ANSEM HUB

Home base for ANSEM token holders. Holder verification, live holder count, leaderboard, airdrop feed, per-wallet PnL, and an embedded Jupiter swap.

Standalone product. Separate repo, separate Supabase project, separate domain. Not part of Sol Trivia.

## Stack

- Vite + React + TypeScript + Tailwind
- Solana wallet-adapter (Phantom, Solflare, Backpack)
- Supabase (Postgres + Edge Functions) for the backend
- Helius DAS for on-chain reads
- Hosted on Cloudflare Pages (static, edge, no cold start)

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

## Backend

Edge Functions live in `supabase/functions/`. Phase 1: `verify-ansem-holder`, `get-holder-count`.
