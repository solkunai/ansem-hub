-- Singleton row (id must be true) caching the total unique ANSEM holder
-- count, refreshed periodically by get-holder-count since a full paginated
-- enumeration is too expensive to run on every page load.
create table if not exists public.holder_count_cache (
  id boolean primary key default true,
  holder_count integer not null default 0,
  computed_at timestamptz not null default now(),
  constraint holder_count_cache_singleton check (id)
);

alter table public.holder_count_cache enable row level security;

drop policy if exists "holder_count_cache_public_read" on public.holder_count_cache;
create policy "holder_count_cache_public_read" on public.holder_count_cache for select using (true);

grant select on public.holder_count_cache to anon, authenticated;
