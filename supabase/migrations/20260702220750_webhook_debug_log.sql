create table if not exists public.webhook_debug_log (
  id bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  tx_count integer not null default 0,
  summary jsonb
);

alter table public.webhook_debug_log enable row level security;
-- No policies: service-role only, temporary diagnostic table.
