-- ══════════════════════════════════════════════════════════════════════════════
--  ARIK FASHION – COMPLETE SUPABASE SETUP
--  Run each section in order in: Supabase Dashboard → SQL Editor → New Query
--  Sections can be run independently if you're updating an existing install.
-- ══════════════════════════════════════════════════════════════════════════════


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  SECTION 0 – ADMIN ROLE SYSTEM                                              │
-- │  Run this FIRST. Everything else depends on is_admin().                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- Profiles table: extends auth.users with role + saved shipping details
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
  role        text not null default 'customer'
                check (role in ('customer', 'admin')),
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- If the table already existed from a previous run, add the new shipping cols.
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists city    text;
alter table public.profiles add column if not exists state   text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists zip     text;

alter table public.profiles enable row level security;

-- Users can read and update their own profile
create policy "Users: read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users: update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Prevent users from promoting themselves to admin
    and (role = 'customer' or (select role from public.profiles where id = auth.uid()) = 'admin')
  );

-- Admins can read all profiles
create policy "Admin: read all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create a profile row when a new user signs up. The password-based
-- signup form passes optional shipping details via auth.user_metadata; we
-- mirror them into public.profiles so checkout can prefill from one source.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
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

-- Convenience function used in all RLS policies below
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ▶ HOW TO CREATE YOUR FIRST ADMIN
-- After you (or any user) sign in for the first time, run this once:
--
--   update public.profiles
--   set role = 'admin'
--   where email = 'your-admin@email.com';
--
-- All subsequent admins can be promoted from the admin dashboard.


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  SECTION 1 – PRODUCTS                                                       │
-- │  Full CRUD: images, price, colors, sizes, stock, descriptions, categories   │
-- └─────────────────────────────────────────────────────────────────────────────┘

create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),

  -- Core info
  name          text not null,
  slug          text unique,               -- URL-safe name, e.g. "ankara-wrap-dress"
  description   text,
  category      text not null,             -- e.g. "Dresses", "Tops", "Sets"
  sku           text unique,               -- e.g. "AF-0001"

  -- Pricing
  price         numeric(12,2) not null,
  sale_price    numeric(12,2),
  on_sale       boolean not null default false,

  -- Variants stored as arrays (simple approach, no separate variant table)
  colors        text[]  not null default '{}',
  sizes         text[]  not null default '{}',
  lengths       text[]           default '{}',   -- e.g. "Knee", "Midi", "Maxi"

  -- Images: ordered array of public URLs (Supabase Storage or external CDN)
  images        text[]  not null default '{}',

  -- Inventory
  stock         integer not null default 0,

  -- Flags
  is_new        boolean not null default false,
  is_featured   boolean not null default false,
  is_published  boolean not null default true,   -- false = draft (hidden from shop)

  -- Metadata
  tags          text[]  default '{}',            -- for search/filtering
  weight_grams  integer,                         -- for shipping calculation
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.products enable row level security;

-- Anyone can read published products
create policy "Public: read published products"
  on public.products for select
  using (is_published = true);

-- Admins can read ALL products (including drafts)
create policy "Admin: read all products"
  on public.products for select
  using (public.is_admin());

-- Admins can create, update, delete
create policy "Admin: insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admin: update products"
  on public.products for update
  using (public.is_admin());

create policy "Admin: delete products"
  on public.products for delete
  using (public.is_admin());

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Useful indexes
create index if not exists products_category_idx   on public.products(category);
create index if not exists products_published_idx  on public.products(is_published);
create index if not exists products_featured_idx   on public.products(is_featured);
create index if not exists products_slug_idx       on public.products(slug);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  SECTION 2 – PRODUCT IMAGES (Supabase Storage)                              │
-- │  Images are stored in a "product-images" bucket.                            │
-- │  Run these in: Storage → Policies (or via SQL Editor)                       │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- Create the storage bucket (if not already created via Dashboard)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Anyone can view product images (public bucket)
create policy "Public: view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only admins can upload / delete product images
create policy "Admin: upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin: update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admin: delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- ▶ IMAGE URL FORMAT
-- After uploading, the public URL is:
--   https://<project-ref>.supabase.co/storage/v1/object/public/product-images/<filename>
-- Store this URL in the products.images array.


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  SECTION 3 – ORDERS                                                         │
-- │  Customers place orders; admins manage status + add tracking.               │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- Drop and recreate to add new columns (safe if orders table is empty)
-- If you already have live orders, use ALTER TABLE instead (see comments below).

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text unique,           -- human-readable, e.g. "AF-20250001"
  user_id         uuid references auth.users(id) on delete set null,
  customer_email  text,                  -- stored separately in case user deletes account
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),

  status          text not null default 'pending'
                    check (status in (
                      'pending',       -- just placed, awaiting confirmation
                      'confirmed',     -- admin confirmed, payment verified
                      'processing',   -- being made / picked
                      'shipped',       -- handed to courier
                      'delivered',     -- customer received
                      'cancelled'      -- cancelled by admin or customer
                    )),

  -- Items snapshot (product data at time of order)
  items           jsonb not null default '[]',
  -- Each item: { productId, name, color, size, length?, quantity, price, imageUrl }

  -- Financials
  subtotal        numeric(12,2) not null default 0,
  shipping_cost   numeric(12,2) not null default 0,
  discount        numeric(12,2) not null default 0,
  total           numeric(12,2) not null,

  -- Shipping
  shipping_method text,                  -- pickup | lagos | nationwide | canada
  tracking_number text,                  -- added by admin when shipped
  tracking_url    text,                  -- link to courier tracking page
  shipped_at      timestamptz,

  -- Payment
  payment_method  text,                  -- "bank_transfer" | "paystack" | "cash"
  payment_status  text not null default 'pending'
                    check (payment_status in ('pending','paid','failed','refunded')),
  payment_ref     text,                  -- external payment reference

  -- Address (snapshot at time of order)
  address         jsonb,
  -- { firstName, lastName, phone, email, address, city, state, country }

  -- Admin notes
  note            text,                  -- customer note
  admin_note      text                   -- internal admin note (not shown to customer)
);

-- If orders table already exists, add missing columns instead:
-- alter table public.orders add column if not exists order_number text unique;
-- alter table public.orders add column if not exists customer_email text;
-- alter table public.orders add column if not exists subtotal numeric(12,2) not null default 0;
-- alter table public.orders add column if not exists shipping_cost numeric(12,2) not null default 0;
-- alter table public.orders add column if not exists discount numeric(12,2) not null default 0;
-- alter table public.orders add column if not exists tracking_number text;
-- alter table public.orders add column if not exists tracking_url text;
-- alter table public.orders add column if not exists shipped_at timestamptz;
-- alter table public.orders add column if not exists payment_status text not null default 'pending';
-- alter table public.orders add column if not exists payment_ref text;
-- alter table public.orders add column if not exists admin_note text;

alter table public.orders enable row level security;

-- Customers see only their own orders
create policy "Users: read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users: insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Admins see and manage all orders
create policy "Admin: read all orders"
  on public.orders for select
  using (public.is_admin());

create policy "Admin: update any order"
  on public.orders for update
  using (public.is_admin());

-- Auto-generate order number and updated_at
create or replace function public.set_order_number()
returns trigger language plpgsql as $$
declare
  seq int;
begin
  select count(*) + 1 into seq from public.orders;
  new.order_number := 'AF-' || lpad(seq::text, 5, '0');
  return new;
end;
$$;

create trigger orders_set_number
  before insert on public.orders
  for each row
  when (new.order_number is null)
  execute function public.set_order_number();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create index if not exists orders_user_idx       on public.orders(user_id);
create index if not exists orders_status_idx     on public.orders(status);
create index if not exists orders_created_idx    on public.orders(created_at desc);
create index if not exists orders_number_idx     on public.orders(order_number);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  SECTION 4 – SHIPPING DETAILS                                               │
-- │  Saved addresses per user + shipping zone/rate configuration for admins.    │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- 4a. Saved customer addresses (reusable at checkout)
create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text,                -- e.g. "Home", "Office"
  is_default  boolean not null default false,

  first_name  text not null,
  last_name   text not null,
  phone       text,
  email       text,
  address     text not null,
  city        text not null,
  state       text,
  zip         text,
  country     text not null default 'Nigeria',
  country_code text,

  created_at  timestamptz default now()
);

alter table public.addresses enable row level security;

create policy "Users: manage own addresses"
  on public.addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admin: read all addresses"
  on public.addresses for select
  using (public.is_admin());

create index if not exists addresses_user_idx on public.addresses(user_id);

-- 4b. Shipping zones / rates (editable by admin from dashboard)
create table if not exists public.shipping_rates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,             -- "Lagos Delivery"
  description text,                      -- shown to customer at checkout
  zone        text not null,             -- "lagos" | "nationwide" | "pickup" | "international"
  country     text,                      -- null = all countries, or "NG" etc.
  price       numeric(12,2) not null default 0,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.shipping_rates enable row level security;

-- Anyone can read active rates (needed at checkout)
create policy "Public: read active shipping rates"
  on public.shipping_rates for select
  using (is_active = true);

-- Admins manage rates
create policy "Admin: manage shipping rates"
  on public.shipping_rates for all
  using (public.is_admin())
  with check (public.is_admin());

create trigger shipping_rates_updated_at
  before update on public.shipping_rates
  for each row execute function public.set_updated_at();

-- Seed default rates (matches your existing CheckoutPage options)
insert into public.shipping_rates (name, description, zone, country, price, sort_order)
values
  ('Customer Pickup',        'Pick up at our Lagos store. Ready within 24 hours of confirmation.',           'pickup',        'NG', 0,    1),
  ('Lagos Delivery',         'Door-to-door within Lagos State. 1–2 business days after dispatch.',          'lagos',         'NG', 3500, 2),
  ('Nationwide Delivery',    'Via courier partners. 2–5 business days depending on location.',              'nationwide',    'NG', 5000, 3),
  ('International · Canada', 'Dimensional weight pricing. Contacted once order reaches shipping company.',  'international', 'CA', 0,    4)
on conflict do nothing;


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  SECTION 5 – AUTH (existing OTP flow + admin flag)                          │
-- │  No new table needed — handled by profiles.role.                            │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- ▶ AUTH SETTINGS (do these manually in the Dashboard):
--
-- Dashboard → Authentication → Providers → Email:
--   ✓ Enable Email provider
--   ✓ Enable "Email OTP" (magic link / passwordless)
--   ✗ Disable "Confirm email" if you want instant OTP login
--
-- Dashboard → Authentication → URL Configuration:
--   Site URL:            http://localhost:5173       (dev)
--                        https://yourdomain.com      (prod)
--   Redirect URLs:       http://localhost:5173/**
--                        https://yourdomain.com/**
--
-- Dashboard → Authentication → Email Templates:
--   Customize OTP / magic-link email to match Arik Fashion branding.
--   Use {{ .Token }} to embed the 6-digit OTP code.
--
-- Dashboard → Authentication → Settings:
--   OTP expiry: 300 (5 minutes) recommended
--   JWT expiry: 3600 (1 hour) default is fine
--
-- ▶ ADMIN LOGIN FLOW (separate from customer OTP):
--   Admins log in with the same OTP email flow.
--   After login, check profiles.role === 'admin' in the app to show admin UI.
--   Never expose the service_role key to the browser — admin writes use RLS.


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  SECTION 6 – CONTACT MESSAGES                                               │
-- │  Stores contact form submissions; admins can mark as resolved.              │
-- └─────────────────────────────────────────────────────────────────────────────┘

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,  -- null if not logged in
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  status      text not null default 'unread'
                check (status in ('unread', 'read', 'replied', 'resolved')),
  admin_note  text,                          -- internal reply note
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.contact_messages enable row level security;

-- Anyone (logged in or not) can submit a contact message
create policy "Public: insert contact message"
  on public.contact_messages for insert
  with check (true);

-- Logged-in users can read their own messages
create policy "Users: read own messages"
  on public.contact_messages for select
  using (auth.uid() = user_id);

-- Admins can read and update all messages
create policy "Admin: read all contact messages"
  on public.contact_messages for select
  using (public.is_admin());

create policy "Admin: update contact messages"
  on public.contact_messages for update
  using (public.is_admin());

create trigger contact_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

create index if not exists contact_status_idx  on public.contact_messages(status);
create index if not exists contact_created_idx on public.contact_messages(created_at desc);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  SECTION 7 – WISHLIST & CART (persistent, per user)                         │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- 7a. Wishlist
create table if not exists public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, product_id)            -- no duplicates
);

alter table public.wishlists enable row level security;

create policy "Users: manage own wishlist"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists wishlist_user_idx on public.wishlists(user_id);

-- 7b. Persistent cart
create table if not exists public.carts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  quantity    integer not null default 1 check (quantity > 0),
  color       text,
  size        text,
  length      text,
  added_at    timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id, product_id, color, size, length)
);

alter table public.carts enable row level security;

create policy "Users: manage own cart"
  on public.carts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger carts_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

create index if not exists carts_user_idx on public.carts(user_id);

-- ▶ NOTE on cart/wishlist in the app:
-- The current CartContext uses in-memory state.
-- To persist: on login, fetch carts/wishlists rows and merge with local state.
-- On logout, push local cart to DB before clearing.
-- A cart sync helper function is a good next step.


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  SECTION 8 – REVIEWS (existing table – extended)                            │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- Already created in earlier schema. If running fresh:
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references public.products(id) on delete cascade,
  -- NOTE: product_id was text before. If upgrading, keep as text or migrate.
  user_id     uuid references auth.users(id) on delete cascade,
  user_name   text,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  is_approved boolean not null default true,   -- admin can hide reviews
  created_at  timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "Public: read approved reviews"
  on public.reviews for select
  using (is_approved = true);

create policy "Authenticated users: insert review"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users: delete own review"
  on public.reviews for delete
  using (auth.uid() = user_id);

create policy "Admin: manage all reviews"
  on public.reviews for all
  using (public.is_admin());

create index if not exists reviews_product_idx on public.reviews(product_id);
create index if not exists reviews_approved_idx on public.reviews(is_approved);


-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │  SECTION 9 – ADMIN HELPERS / USEFUL VIEWS                                   │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- Dashboard summary view (for admin home)
create or replace view public.admin_summary as
select
  (select count(*) from public.orders where status = 'pending')                as pending_orders,
  (select count(*) from public.orders where status = 'processing')             as processing_orders,
  (select count(*) from public.orders where created_at > now() - interval '7 days') as orders_this_week,
  (select coalesce(sum(total),0) from public.orders where payment_status = 'paid') as total_revenue,
  (select count(*) from public.products where is_published = true)             as live_products,
  (select count(*) from public.products where stock = 0 and is_published = true) as out_of_stock,
  (select count(*) from public.contact_messages where status = 'unread')      as unread_messages,
  (select count(*) from public.profiles where role = 'customer')               as total_customers;

-- Order detail view (joins profile name to order)
create or replace view public.orders_with_customer as
select
  o.*,
  p.first_name,
  p.last_name,
  p.email  as profile_email
from public.orders o
left join public.profiles p on p.id = o.user_id;

-- Low stock alert view
create or replace view public.low_stock_products as
select id, name, sku, category, stock, is_published
from public.products
where stock <= 5 and is_published = true
order by stock asc;


-- ══════════════════════════════════════════════════════════════════════════════
--  DONE. Summary of what was created:
--
--  public.profiles          – user info + role (customer | admin)
--  public.products          – full product catalogue with images, variants, stock
--  public.orders            – customer orders with status, tracking, payment
--  public.addresses         – saved delivery addresses per user
--  public.shipping_rates    – admin-editable shipping zones and prices
--  public.contact_messages  – contact form inbox with admin status tracking
--  public.wishlists         – per-user wishlist (persistent)
--  public.carts             – per-user cart (persistent)
--  public.reviews           – product reviews with admin approval flag
--
--  storage bucket: product-images (public, admin-upload-only)
--
--  Views:
--    admin_summary          – counts for admin dashboard home
--    orders_with_customer   – orders joined with customer name
--    low_stock_products     – products with stock ≤ 5
--
--  Helper functions:
--    is_admin()             – used in all admin RLS policies
--    handle_new_user()      – auto-creates profile on signup
--    set_updated_at()       – keeps updated_at current on all tables
--    set_order_number()     – auto-generates AF-XXXXX order numbers
-- ══════════════════════════════════════════════════════════════════════════════
