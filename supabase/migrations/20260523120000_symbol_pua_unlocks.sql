-- PUA collections and symbol unlock architecture
create table if not exists public.collections (
  id bigserial primary key,
  name varchar(100) not null,
  price numeric(10,2) not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.symbols (
  id bigserial primary key,
  collection_id bigint references public.collections(id) on delete set null,
  sigil_id uuid unique references public.sigils(id) on delete cascade,
  symbol_name varchar(80) not null,
  pua_hex varchar(10) unique not null,
  svg_path_data text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_unlocks (
  user_key text not null,
  symbol_id bigint not null references public.symbols(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_key, symbol_id)
);

create table if not exists public.webhook_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

create index if not exists symbols_sigil_id_idx on public.symbols (sigil_id);
create index if not exists user_unlocks_symbol_id_idx on public.user_unlocks (symbol_id);

alter table public.collections enable row level security;
alter table public.symbols enable row level security;
alter table public.user_unlocks enable row level security;
alter table public.webhook_events enable row level security;

create policy "collections_public_read" on public.collections for select using (true);
create policy "symbols_public_read" on public.symbols for select using (is_active = true);
create policy "user_unlocks_owner_read" on public.user_unlocks for select using (lower(user_key) = lower(auth.jwt() ->> 'email'));

insert into public.collections (name, price, is_public)
values ('ALPHA CORE', 30.00, false)
on conflict do nothing;
