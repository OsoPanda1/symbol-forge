create extension if not exists vector;

create table if not exists public.rate_limit_events (
  key text primary key,
  count int not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ip_reputation (
  ip text primary key,
  status text not null default 'allow' check (status in ('allow','challenge','block')),
  reason text,
  score int not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.symbol_embeddings (
  symbol_id bigint primary key references public.symbols(id) on delete cascade,
  embedding vector(32),
  embedding_source text not null default 'heuristic',
  updated_at timestamptz not null default now()
);

create index if not exists ip_reputation_status_idx on public.ip_reputation(status, expires_at);

create or replace function public.rl_take(p_key text, p_window_seconds int, p_max int)
returns boolean
language plpgsql
security definer
as $$
declare
  now_ts timestamptz := now();
  existing_count int;
  existing_reset timestamptz;
begin
  select count, reset_at into existing_count, existing_reset
  from public.rate_limit_events
  where key = p_key
  for update;

  if not found or existing_reset <= now_ts then
    insert into public.rate_limit_events(key, count, reset_at, updated_at)
    values (p_key, 1, now_ts + make_interval(secs => p_window_seconds), now_ts)
    on conflict (key)
    do update set count = 1,
      reset_at = now_ts + make_interval(secs => p_window_seconds),
      updated_at = now_ts;
    return true;
  end if;

  if existing_count >= p_max then
    update public.rate_limit_events set updated_at = now_ts where key = p_key;
    return false;
  end if;

  update public.rate_limit_events
  set count = count + 1,
      updated_at = now_ts
  where key = p_key;

  return true;
end;
$$;

create or replace function public.match_symbols_hybrid(p_query text, p_limit int default 10)
returns table (
  symbol_id bigint,
  symbol_name text,
  pua_hex text,
  lexical_score numeric,
  semantic_score numeric,
  final_score numeric
)
language sql
stable
as $$
  with q as (
    select least(1.0, length(p_query)::numeric / 120.0) as q_boost
  )
  select
    s.id as symbol_id,
    s.symbol_name,
    s.pua_hex,
    case
      when lower(s.symbol_name) like '%' || lower(p_query) || '%' then 1.0
      else 0.1
    end as lexical_score,
    coalesce((1 / (1 + abs(se.id % 97 - length(p_query)))), 0)::numeric as semantic_score,
    (
      (case when lower(s.symbol_name) like '%' || lower(p_query) || '%' then 0.65 else 0.2 end)
      + (coalesce((1 / (1 + abs(se.id % 97 - length(p_query)))), 0) * 0.35)
    ) * (select q_boost from q) as final_score
  from public.symbols s
  left join public.symbol_embeddings se on se.symbol_id = s.id
  where s.is_active = true
  order by final_score desc, s.created_at desc
  limit greatest(1, least(p_limit, 50));
$$;

alter table public.rate_limit_events enable row level security;
alter table public.ip_reputation enable row level security;
alter table public.symbol_embeddings enable row level security;

create policy if not exists "rate_limits_service_role_only" on public.rate_limit_events for all using (auth.role() = 'service_role');
create policy if not exists "ip_reputation_service_role_only" on public.ip_reputation for all using (auth.role() = 'service_role');
create policy if not exists "symbol_embeddings_service_role_only" on public.symbol_embeddings for all using (auth.role() = 'service_role');
