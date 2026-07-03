-- Rolling 7-day ANSEM/SOL airdrop total, separate from airdrop_stats_today's
-- daily reset. The window boundary date shown to the user ("since Jun 25")
-- is computed client-side from now()-7d, not stored here, since it's purely
-- a function of the current date rather than the underlying data.
create view public.airdrop_stats_7d
with (security_invoker = on) as
select
  coalesce(sum(amount) filter (where mint = '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump'), 0) as sent_7d_ansem,
  coalesce(sum(amount) filter (where mint = 'SOL'), 0) as sent_7d_sol,
  count(distinct wallet) as recipients_7d
from public.airdrop_events
where created_at >= now() - interval '7 days';

grant select on public.airdrop_stats_7d to anon, authenticated;
