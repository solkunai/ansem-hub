-- Superseded: Jupiter's free lite-api.jup.ag/tokens/v2/search endpoint
-- returns holderCount directly (same host already used for prices, no API
-- key, no pagination needed), making the Helius-paginated cache/cron
-- approach in 20260702190500_holder_count_cache.sql unnecessary.
drop table if exists public.holder_count_cache;
