-- G.Adu Motors — Supabase schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run: guarded with IF NOT EXISTS / OR REPLACE where possible.

-- ============================================================
-- 1. profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone can read their own profile (needed client-side to know their role).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- No client-side insert/update/delete policies are defined on purpose:
--   - rows are created automatically by the handle_new_user() trigger below
--   - promoting a user to 'admin' must be done manually in the SQL editor:
--       update public.profiles set role = 'admin' where email = 'you@example.com';
--     This prevents a customer from ever granting themselves admin rights.

-- Auto-create a profiles row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper used by RLS policies below to check "is the current user an admin?".
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- 2. products
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  origin text not null check (origin in ('Japanese', 'Korean')),
  make text not null,
  model text not null,
  year int not null,
  condition text not null check (condition in ('New', 'Used')),
  retail_price numeric(10, 2) not null check (retail_price > 0),
  floor_price numeric(10, 2) not null check (floor_price > 0 and floor_price <= retail_price),
  image_url text,
  created_at timestamptz not null default now()
);

-- id/created_at match the exact `products` schema requested: name, origin,
-- make, model, year, condition, retail_price, floor_price, image_url.

alter table public.products enable row level security;

-- Admins get full row access (dashboard needs to see + manage floor_price).
drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- IMPORTANT: there is deliberately NO select policy granting anon/customer
-- access to the base `products` table. floor_price must stay server-only.
-- The public storefront reads from the `public_products` view below instead,
-- which simply never exposes the floor_price column.

create or replace view public.public_products
with (security_invoker = true)
as
  select id, name, origin, make, model, year, condition, retail_price, image_url, created_at
  from public.products;

grant select on public.public_products to anon, authenticated;

-- ============================================================
-- 3. orders
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  buyer_name text not null,
  buyer_phone text not null,
  momo_network text not null check (momo_network in ('MTN MoMo', 'Telecel Cash', 'AT Money')),
  amount_paid numeric(10, 2) not null,
  paystack_reference text not null unique,
  status text not null default 'paid' check (status in ('paid', 'failed', 'pending')),
  -- Smart Logistics Selector: how the buyer receives the part. Outside-Kumasi
  -- deliveries never reach this table — that flow hands off to WhatsApp
  -- before Paystack, so is_in_kumasi/delivery_address are only ever set for
  -- 'delivery' orders confirmed within Kumasi.
  fulfillment_type text not null default 'pickup' check (fulfillment_type in ('pickup', 'delivery')),
  is_in_kumasi boolean,
  delivery_address text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Safe to re-run against a database created before this migration.
alter table public.orders add column if not exists fulfillment_type text not null default 'pickup';
alter table public.orders add column if not exists is_in_kumasi boolean;
alter table public.orders add column if not exists delivery_address text;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_fulfillment_type_check'
  ) then
    alter table public.orders
      add constraint orders_fulfillment_type_check check (fulfillment_type in ('pickup', 'delivery'));
  end if;
end $$;

-- Orders are written exclusively by the server (service-role key) after a
-- Paystack transaction is verified — see app/api/verify-payment. No insert
-- policy is defined for anon/authenticated, so client-side inserts are
-- rejected outright, which prevents customers from faking a "paid" order.
drop policy if exists "orders_admin_select" on public.orders;
create policy "orders_admin_select"
  on public.orders for select
  to authenticated
  using (public.is_admin());

-- ============================================================
-- 4. Storage bucket for product images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('spare-parts', 'spare-parts', true)
on conflict (id) do nothing;

drop policy if exists "spare_parts_public_read" on storage.objects;
create policy "spare_parts_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'spare-parts');

drop policy if exists "spare_parts_admin_write" on storage.objects;
create policy "spare_parts_admin_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'spare-parts' and public.is_admin());

drop policy if exists "spare_parts_admin_delete" on storage.objects;
create policy "spare_parts_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'spare-parts' and public.is_admin());

-- ============================================================
-- 5. Realtime
-- ============================================================
-- Enable realtime change events on orders so the admin dashboard can
-- subscribe to postgres_changes and flash a banner the instant a row
-- is inserted (see components/AdminOrderAlerts.tsx). Guarded so this
-- script is safe to re-run.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;
