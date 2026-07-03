create table if not exists public.admin_wallets (
  wallet text primary key
);

insert into public.admin_wallets (wallet) values ('GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52')
on conflict (wallet) do nothing;

create table if not exists public.contributors (
  wallet text primary key,
  x_handle text,
  total_points numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.content_submissions (
  id bigint generated always as identity primary key,
  wallet text not null,
  x_handle text,
  url text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  points_awarded numeric not null default 0,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_wallet text
);

create index if not exists content_submissions_status_idx on public.content_submissions (status, submitted_at desc);
create index if not exists content_submissions_wallet_idx on public.content_submissions (wallet);

-- Short-TTL cache for on-demand wallet trade lookups (see wallet-trades edge
-- function) so repeat views of a popular wallet don't re-spend Helius credits.
create table if not exists public.wallet_trade_cache (
  wallet text primary key,
  computed_at timestamptz not null default now(),
  buys integer not null default 0,
  sells integer not null default 0,
  cost_basis_sol numeric not null default 0,
  proceeds_sol numeric not null default 0,
  current_balance numeric not null default 0
);

alter table public.admin_wallets enable row level security;
alter table public.contributors enable row level security;
alter table public.content_submissions enable row level security;
alter table public.wallet_trade_cache enable row level security;

drop policy if exists "contributors_public_read" on public.contributors;
create policy "contributors_public_read" on public.contributors for select using (true);

-- Anyone can insert a pending submission for review; the check clause blocks
-- forging an already-approved row (points/reviewer fields) through the public
-- insert policy. admin_wallets and wallet_trade_cache have no public policy
-- at all: only the service-role client (inside our edge functions) touches them.
drop policy if exists "content_submissions_insert" on public.content_submissions;
create policy "content_submissions_insert" on public.content_submissions for insert
  with check (status = 'pending' and points_awarded = 0 and reviewed_at is null and reviewer_wallet is null);

drop policy if exists "content_submissions_read_approved" on public.content_submissions;
create policy "content_submissions_read_approved" on public.content_submissions for select
  using (status = 'approved');

grant select on public.contributors to anon, authenticated;
grant select, insert on public.content_submissions to anon, authenticated;
