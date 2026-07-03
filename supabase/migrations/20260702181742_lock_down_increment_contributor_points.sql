-- Supabase grants EXECUTE on public-schema functions to anon/authenticated by
-- default for PostgREST RPC exposure, independent of a `revoke ... from
-- public` (every role is implicitly a PUBLIC member, but anon/authenticated
-- had a direct grant too). Revoke explicitly so only the service-role client
-- inside our edge functions can call this.
revoke execute on function public.increment_contributor_points(text, numeric, text) from anon, authenticated;
