-- Supabase's security linter flags SECURITY DEFINER views (the Postgres
-- default) because they bypass the querying role's RLS entirely, using the
-- view creator's permissions instead. Switch to SECURITY INVOKER so these
-- views respect RLS on the underlying tables like a normal query would.

alter view public.leaderboard set (security_invoker = on);
alter view public.airdrop_stats_today set (security_invoker = on);
