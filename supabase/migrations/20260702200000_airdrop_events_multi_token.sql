-- Airdrops now track SOL sent directly from the creator wallet, not just
-- ANSEM. 'mint' distinguishes them ('SOL' is a sentinel, not a real mint
-- address, since native SOL isn't an SPL token). The old (tx_signature,
-- wallet) unique constraint would collide if a single transaction sent both
-- SOL and ANSEM to the same recipient, so it's widened to include mint.
alter table public.airdrop_events add column if not exists mint text not null default '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump';

alter table public.airdrop_events drop constraint if exists airdrop_events_tx_signature_wallet_key;
alter table public.airdrop_events add constraint airdrop_events_tx_signature_wallet_mint_key unique (tx_signature, wallet, mint);

-- Split by mint instead of summing raw amounts across different units/value.
-- The client converts each to USD using live prices and combines them.
drop view if exists public.airdrop_stats_today;
create view public.airdrop_stats_today
with (security_invoker = on) as
select
  coalesce(sum(amount) filter (where mint = '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump'), 0) as sent_today_ansem,
  coalesce(sum(amount) filter (where mint = 'SOL'), 0) as sent_today_sol,
  count(*) as events_today,
  count(distinct wallet) as recipients
from public.airdrop_events
where created_at >= date_trunc('day', now());

grant select on public.airdrop_stats_today to anon, authenticated;
