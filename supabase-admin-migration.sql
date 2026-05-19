-- ══════════════════════════════════════════════════════════════════════════════
--  ARIK FASHION — ADMIN MIGRATION (v5)
--  Adds: discount_codes, site_settings tables
--  Run after supabase-full-setup.sql is in place.
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── DISCOUNT CODES ──────────────────────────────────────────────────────────
create table if not exists public.discount_codes (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  kind         text not null check (kind in ('percent', 'fixed')),
  amount       numeric(12,2) not null check (amount > 0),
  expires_at   timestamptz,
  usage_limit  integer,                  -- null = unlimited
  used_count   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz default now()
);

alter table public.discount_codes enable row level security;

-- Anyone can validate a code at checkout (read only the active ones)
create policy "Public: read active discount codes"
  on public.discount_codes for select
  using (is_active = true);

-- Admins manage all
create policy "Admin: manage discount codes"
  on public.discount_codes for all
  using (public.is_admin())
  with check (public.is_admin());


-- ─── SITE SETTINGS ───────────────────────────────────────────────────────────
create table if not exists public.site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

-- Anyone can read settings (used by the public storefront)
create policy "Public: read site settings"
  on public.site_settings for select
  using (true);

-- Admins write
create policy "Admin: write site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Seed defaults
insert into public.site_settings (key, value) values
  ('marquee_text',    'NEW ARRIVALS – ARIK FASHION 2026'),
  ('hero_eyebrow',    'Arik Fashion'),
  ('hero_title',      'Crafted with intention.'),
  ('hero_subtitle',   'Bespoke African luxury, tailored for the modern woman.'),
  ('whatsapp_number', '2348012345678'),
  ('contact_email',   'hello@arikfashion.com'),
  ('contact_phone',   '+234 801 234 5678'),
  ('instagram_url',   'https://instagram.com/arikfashion'),
  ('tiktok_url',      'https://tiktok.com/@arikfashion'),
  ('address_line',    'Lagos, Nigeria')
on conflict (key) do nothing;
