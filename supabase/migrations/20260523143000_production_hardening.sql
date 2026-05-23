create extension if not exists pgcrypto;

create table if not exists public.app_logs (
  id bigserial primary key,
  level text not null,
  event text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.app_metrics (
  id bigserial primary key,
  metric_name text not null,
  metric_value numeric not null,
  dimensions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.job_queue (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','processing','done','failed')),
  run_at timestamptz not null default now(),
  attempts int not null default 0,
  max_attempts int not null default 5,
  locked_by text,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ownership_ledger (
  id bigserial primary key,
  symbol_id bigint not null references public.symbols(id) on delete cascade,
  owner_key text not null,
  event_type text not null check (event_type in ('minted','unlocked','transferred')),
  source_ref text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists job_queue_status_run_at_idx on public.job_queue(status, run_at);
create index if not exists ownership_ledger_owner_idx on public.ownership_ledger(owner_key, created_at desc);

create or replace function public.claim_next_job(worker_id text)
returns setof public.job_queue
language plpgsql
security definer
as $$
declare
  next_id uuid;
begin
  select id into next_id
  from public.job_queue
  where status = 'pending' and run_at <= now() and attempts < max_attempts
  order by run_at asc
  for update skip locked
  limit 1;

  if next_id is null then
    return;
  end if;

  update public.job_queue
  set status = 'processing', locked_by = worker_id, locked_at = now(), attempts = attempts + 1, updated_at = now()
  where id = next_id;

  return query select * from public.job_queue where id = next_id;
end;
$$;

create or replace function public.fail_job_with_retry(p_job_id uuid, p_error text)
returns void
language plpgsql
security definer
as $$
begin
  update public.job_queue
  set
    status = case when attempts >= max_attempts then 'failed' else 'pending' end,
    run_at = case when attempts >= max_attempts then run_at else now() + ((attempts * attempts) || ' minutes')::interval end,
    last_error = p_error,
    updated_at = now()
  where id = p_job_id;
end;
$$;

alter table public.app_logs enable row level security;
alter table public.app_metrics enable row level security;
alter table public.job_queue enable row level security;
alter table public.ownership_ledger enable row level security;

create policy "metrics_service_role_only" on public.app_metrics for all using (auth.role() = 'service_role');
create policy "logs_service_role_only" on public.app_logs for all using (auth.role() = 'service_role');
create policy "queue_service_role_only" on public.job_queue for all using (auth.role() = 'service_role');
create policy "ownership_owner_read" on public.ownership_ledger for select using (lower(owner_key)=lower(auth.jwt() ->> 'email'));
