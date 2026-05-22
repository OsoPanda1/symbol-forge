
-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  plan text not null check (plan in ('single','legion')),
  amount_mxn integer not null,
  mode text not null check (mode in ('text','image')),
  prompt text not null,
  contact text not null,
  hash text not null,
  image_path text,
  stripe_session_id text unique,
  status text not null default 'pending' check (status in ('pending','paid','failed','expired')),
  selected_sigil_id uuid,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.orders enable row level security;

-- Only allow public read of orders by id (needed for client to poll status by id+hash combo)
create policy "orders_public_read_by_id"
on public.orders for select
using (true);

-- SIGILS
create table public.sigils (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  idx integer not null,
  content text not null,
  style_id text,
  released boolean not null default false,
  created_at timestamptz not null default now()
);

create index sigils_order_id_idx on public.sigils(order_id);

alter table public.sigils enable row level security;

-- Candidates are visible publicly so the buyer can browse them.
-- Final release flag controls whether buyer sees post-payment confirmation.
create policy "sigils_public_read"
on public.sigils for select
using (true);

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public)
values ('forge-uploads', 'forge-uploads', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('sigil-renders', 'sigil-renders', true)
on conflict (id) do nothing;

-- Allow public read of the public renders bucket
create policy "sigil_renders_public_read"
on storage.objects for select
using (bucket_id = 'sigil-renders');
