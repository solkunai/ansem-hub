-- Real data for the leaderboard and airdrop feed pages, backed by periodic
-- Helius snapshots (holder_snapshots) and a Helius webhook (airdrop_events).

create table if not exists public.holder_balance_history (
  id bigint generated always as identity primary key,
  wallet text not null,
  balance numeric not null,
  snapshot_at timestamptz not null default now()
);

create index if not exists holder_balance_history_wallet_time_idx
  on public.holder_balance_history (wallet, snapshot_at desc);

create table if not exists public.holder_snapshots (
  wallet text primary key,
  rank integer not null,
  balance numeric not null,
  change_24h numeric not null default 0,
  drops_received numeric not null default 0,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists holder_snapshots_rank_idx on public.holder_snapshots (rank);

-- days_held is time since we first observed the wallet in a snapshot, not its
-- true on-chain hold duration (that would need a signature-history lookup per
-- holder). Good enough for a leaderboard badge.
create or replace view public.leaderboard as
select
  wallet,
  rank,
  balance,
  change_24h,
  greatest(0, extract(day from now() - first_seen_at))::int as days_held,
  drops_received
from public.holder_snapshots
order by rank;

create table if not exists public.airdrop_events (
  id bigint generated always as identity primary key,
  tx_signature text not null,
  wallet text not null,
  amount numeric not null,
  created_at timestamptz not null default now(),
  unique (tx_signature, wallet)
);

create index if not exists airdrop_events_created_at_idx on public.airdrop_events (created_at desc);
create index if not exists airdrop_events_wallet_idx on public.airdrop_events (wallet);

create or replace view public.airdrop_stats_today as
select
  coalesce(sum(amount), 0) as sent_today,
  count(distinct wallet) as recipients,
  coalesce(avg(amount), 0) as avg_drop
from public.airdrop_events
where created_at >= date_trunc('day', now());

alter table public.holder_balance_history enable row level security;
alter table public.holder_snapshots enable row level security;
alter table public.airdrop_events enable row level security;

drop policy if exists "holder_snapshots_public_read" on public.holder_snapshots;
create policy "holder_snapshots_public_read" on public.holder_snapshots for select using (true);

drop policy if exists "airdrop_events_public_read" on public.airdrop_events;
create policy "airdrop_events_public_read" on public.airdrop_events for select using (true);
-- holder_balance_history has no read policy: internal to snapshot-holders only,
-- service_role (used by edge functions) bypasses RLS regardless.

grant select on public.holder_snapshots to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;
grant select on public.airdrop_events to anon, authenticated;
grant select on public.airdrop_stats_today to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'airdrop_events'
  ) then
    alter publication supabase_realtime add table public.airdrop_events;
  end if;
end $$;
