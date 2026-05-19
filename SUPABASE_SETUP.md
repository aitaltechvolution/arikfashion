# Arik Fashion – Supabase Setup Guide

## Overview

This guide walks you through setting up your Supabase backend from scratch.
You'll end up with a fully working database covering products, orders, shipping,
auth, contact, wishlist, cart, and reviews — with proper admin vs. customer
access control on every table.

---

## Prerequisites

- Supabase project already created (project URL + keys are in your `.env`)
- You are logged into [supabase.com/dashboard](https://supabase.com/dashboard)

---

## Step 1 — Run the SQL (in order)

Go to your project → **SQL Editor** → click **New Query**.
Paste and run the contents of `supabase-full-setup.sql` **section by section**
in the order they appear. Each section is labelled and self-contained.

| Section | What it creates |
|---------|----------------|
| 0 | `profiles` table, `is_admin()` function, auto-profile trigger |
| 1 | `products` table — full CRUD with images, variants, stock |
| 2 | Storage bucket `product-images` + upload policies |
| 3 | `orders` table — status, tracking, payment, admin notes |
| 4 | `addresses` (saved delivery addresses) + `shipping_rates` |
| 5 | Auth settings reminder (no SQL — done in Dashboard) |
| 6 | `contact_messages` table |
| 7 | `wishlists` + `carts` tables |
| 8 | `reviews` table (extended from previous schema) |
| 9 | Admin helper views |

> **If you already ran the old schema** (orders + reviews tables exist):
> Comment out the `create table` blocks for those two tables and use the
> `ALTER TABLE` lines provided in the comments instead.

---

## Step 2 — Create Your Admin Account

1. Open your Arik Fashion site and **sign up** with your email + password.
2. After signing up, go back to Supabase → **SQL Editor** and run:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

Replace the email with the one you signed up with. That's it — you're an admin.
The `is_admin()` function will now return `true` for your session, unlocking
all admin RLS policies automatically.

To add more admins later, either run the same SQL or build an admin UI button
that calls this update (only accessible to existing admins).

---

## Step 3 — Auth Settings (Dashboard, not SQL)

The app uses **email + password** authentication. The signup form also captures
optional shipping details (name, phone, address, city, state, country, ZIP)
and writes them into `public.profiles` so checkout can prefill from a single
source.

Go to your project → **Authentication**:

### Providers → Email
- ✅ Enable **Email** provider
- ✅ Enable **Confirm email** (recommended — users get a link to confirm before they can sign in)
- ❌ Disable **OTP / Magic Link** (no longer used)

### URL Configuration
| Setting | Development | Production |
|---------|-------------|------------|
| Site URL | `http://localhost:5173` | `https://yourdomain.com` |
| Redirect URLs | `http://localhost:5173/**` | `https://yourdomain.com/**` |

### Email Templates (optional but recommended)
Go to **Authentication → Email Templates → Confirm signup**.
Customise the email to use the Arik Fashion brand. The confirmation link is
inserted with `{{ .ConfirmationURL }}`.

Example subject: `Confirm your Arik Fashion account`

Example body:
```
Welcome to Arik Fashion.

Click the link below to confirm your email and activate your account:

{{ .ConfirmationURL }}

If you didn't create this account, you can safely ignore this email.

– The Arik Fashion Team
```

### Settings
- **Minimum password length**: `6` (or higher if you prefer)
- **Leaked password protection**: ✅ enabled (recommended)
- **JWT expiry**: `3600` (1 hour, default is fine)


---

## Step 4 — Storage Bucket

The SQL creates the `product-images` bucket automatically. Verify it:

1. Go to **Storage** in your Supabase dashboard
2. You should see a `product-images` bucket listed as **Public**
3. If it's not there, create it manually: click **New bucket** → name it
   `product-images` → check **Public bucket** → save

To upload a product image from the admin dashboard (once built):
- Use `supabase.storage.from('product-images').upload(filename, file)`
- The public URL will be:
  `https://<project-ref>.supabase.co/storage/v1/object/public/product-images/<filename>`
- Store this URL in the `products.images` array

---

## Step 5 — Seed Shipping Rates (optional, already in SQL)

The SQL seeds your four default shipping options from the existing checkout page.
To edit them after setup, go to **Table Editor → shipping_rates** and update
prices directly, or build an admin UI. Changes are live immediately at checkout.

---

## Step 6 — Verify Everything Works

Run these checks in the SQL Editor:

```sql
-- Should return all your tables
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;

-- Should return your admin profile
select id, email, role from public.profiles
where role = 'admin';

-- Should return 4 shipping options
select name, price, is_active from public.shipping_rates;

-- Test is_admin() (returns false when run outside a user session — that's correct)
select public.is_admin();
```

---

## Table Reference

### `profiles`
Extends `auth.users`. Created automatically on signup.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | = `auth.users.id` |
| `email` | text | |
| `first_name` | text | |
| `last_name` | text | |
| `phone` | text | |
| `role` | text | `'customer'` or `'admin'` |

### `products`
Full product catalogue.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | |
| `name` | text | |
| `slug` | text | URL-safe, unique |
| `category` | text | e.g. "Dresses" |
| `price` | numeric | |
| `sale_price` | numeric | set `on_sale = true` to activate |
| `colors` | text[] | e.g. `['Black', 'Ivory']` |
| `sizes` | text[] | e.g. `['XS', 'S', 'M', 'L']` |
| `lengths` | text[] | e.g. `['Midi', 'Maxi']` |
| `images` | text[] | ordered array of public image URLs |
| `stock` | integer | |
| `is_published` | boolean | `false` = draft |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| `order_number` | text | auto-generated `AF-XXXXX` |
| `status` | text | pending → confirmed → processing → shipped → delivered |
| `payment_status` | text | pending / paid / failed / refunded |
| `tracking_number` | text | added by admin |
| `items` | jsonb | snapshot of cart at time of order |
| `address` | jsonb | delivery address snapshot |
| `admin_note` | text | internal, not shown to customer |

### `contact_messages`
| Column | Type | Notes |
|--------|------|-------|
| `status` | text | unread → read → replied → resolved |
| `admin_note` | text | internal reply / notes |

### `shipping_rates`
Admin-editable. Live at checkout. Set `is_active = false` to hide an option.

### `wishlists` + `carts`
Both have RLS so users only see their own rows.
Cart rows have a unique constraint on `(user_id, product_id, color, size, length)`
so adding the same item twice just needs an `upsert` with quantity increment.

---

## RLS Policy Summary

| Table | Public | Customer | Admin |
|-------|--------|----------|-------|
| `profiles` | — | Read/update own | Read all |
| `products` | Read published | — | Full CRUD |
| `orders` | — | Read/insert own | Read/update all |
| `addresses` | — | Full CRUD own | Read all |
| `shipping_rates` | Read active | — | Full CRUD |
| `contact_messages` | Insert | Read own | Read/update all |
| `wishlists` | — | Full CRUD own | — |
| `carts` | — | Full CRUD own | — |
| `reviews` | Read approved | Insert, delete own | Full CRUD |

---

## Next Steps

Once the database is live, the next build tasks are:

1. **Admin dashboard pages** — product CRUD, order management, message inbox
2. **Wire CartContext to Supabase** — sync cart on login/logout
3. **Wire WishlistContext to Supabase** — same pattern
4. **Checkout** — pull live `shipping_rates` instead of hardcoded options
5. **Order confirmation email** — Supabase Edge Function + Resend/Mailgun
6. **Image upload UI** — drag-and-drop uploader in product edit form

---

*Last updated: May 2026 · Supabase JS SDK v2*
