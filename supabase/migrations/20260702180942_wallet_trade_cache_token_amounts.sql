alter table public.wallet_trade_cache
  add column if not exists ansem_bought numeric not null default 0,
  add column if not exists ansem_sold numeric not null default 0;
