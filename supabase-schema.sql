-- ══════════════════════════════════════════════════════
--  Arik Fashion – Supabase Schema
-- ══════════════════════════════════════════════════════
-- Run this in your Supabase SQL Editor (Database → SQL Editor)

-- 1. Profiles table (stores purchase / shipping details per user)
-- ──────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  first_name  text,
  last_name   text,
  phone       text,
  address     text,
  city        text,
  state       text,
  country     text,
  zip         text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a user signs up. The signup form passes
-- optional shipping fields via auth.user_metadata; we copy them here so the
-- checkout page can prefill from a single source.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, first_name, last_name, phone,
    address, city, state, country, zip
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'zip'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 2. Orders table
-- ──────────────────────────────────────────────────────
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  created_at      timestamptz default now(),
  status          text not null default 'pending'
                    check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  items           jsonb not null default '[]',
  total           numeric(12,2) not null,
  shipping_method text,
  payment_method  text,
  address         jsonb,
  note            text
);

-- Row-level security: users can only see their own orders
alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- 3. Reviews table
-- ──────────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null,
  user_id     uuid references auth.users(id) on delete cascade,
  user_name   text,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select using (true);

create policy "Authenticated users can insert reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Useful indexes
create index if not exists reviews_product_idx on public.reviews(product_id);
create index if not exists orders_user_idx on public.orders(user_id);

-- 4. Auth settings reminder
-- ──────────────────────────────────────────────────────
-- In Supabase Dashboard → Authentication → Providers → Email:
--   ✓ Enable email provider
--   ✓ Enable "Confirm email" (recommended)
--   ✗ Disable OTP / magic link (the app now uses password auth)
--   Site URL: https://your-domain.com (or http://localhost:5173 for dev)
--
-- Optional: enable "Leaked password protection" under Authentication → Settings.
