create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  external_ref text not null unique,
  account_type text not null check (account_type in ('user','symbol','system')),
  currency text not null default 'MXN',
  created_at timestamptz not null default now()
);

create table if not exists public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  stripe_payment_intent text,
  order_id uuid references public.orders(id) on delete set null,
  kind text not null check (kind in ('symbol_purchase','refund')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ledger_entries (
  id bigserial primary key,
  txn_id uuid not null references public.ledger_transactions(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  direction text not null check (direction in ('debit','credit')),
  amount numeric(18,2) not null check (amount > 0),
  currency text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists ledger_txn_stripe_pi_idx on public.ledger_transactions(stripe_payment_intent) where stripe_payment_intent is not null;
create index if not exists ledger_entries_txn_id_idx on public.ledger_entries(txn_id);

create or replace function public.is_txn_balanced(p_txn_id uuid)
returns boolean
language sql
stable
as $$
  select coalesce(sum(case when direction='debit' then amount else 0 end),0)
       = coalesce(sum(case when direction='credit' then amount else 0 end),0)
  from public.ledger_entries
  where txn_id = p_txn_id;
$$;

alter table public.accounts enable row level security;
alter table public.ledger_transactions enable row level security;
alter table public.ledger_entries enable row level security;
create policy "accounts_service_role_only" on public.accounts for all using (auth.role() = 'service_role');
create policy "ledger_txn_service_role_only" on public.ledger_transactions for all using (auth.role() = 'service_role');
create policy "ledger_entries_service_role_only" on public.ledger_entries for all using (auth.role() = 'service_role');
