create or replace function public.increment_contributor_points(p_wallet text, p_delta numeric, p_x_handle text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.contributors (wallet, x_handle, total_points)
  values (p_wallet, p_x_handle, p_delta)
  on conflict (wallet) do update
    set total_points = contributors.total_points + excluded.total_points,
        x_handle = coalesce(excluded.x_handle, contributors.x_handle);
$$;

revoke all on function public.increment_contributor_points(text, numeric, text) from public;
grant execute on function public.increment_contributor_points(text, numeric, text) to service_role;
