-- ══════════════════════════════════════════════════════════════════════════════
--  ARIK FASHION — FIX ADMIN ACCESS
--  Run this in Supabase → SQL Editor
--
--  Background: When the original admin user was deleted and recreated,
--  the profiles row either has role='customer' (default) or is missing.
--  This script fixes both cases.
-- ══════════════════════════════════════════════════════════════════════════════

-- STEP 1: Replace 'your-admin@email.com' with your actual admin email below,
--         then run this entire script in the Supabase SQL Editor.

-- ── Option A: Profile row EXISTS but role is 'customer' ──────────────────────
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';   -- ← replace with your email

-- ── Option B: Profile row does NOT exist yet (upsert approach) ───────────────
-- If the UPDATE above affected 0 rows, run this instead:
--
-- INSERT INTO public.profiles (id, email, role)
-- SELECT id, email, 'admin'
-- FROM auth.users
-- WHERE email = 'your-admin@email.com'   -- ← replace with your email
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';


-- ── Verify: you should see role = 'admin' for your email ─────────────────────
SELECT id, email, role, created_at
FROM public.profiles
WHERE email = 'your-admin@email.com';   -- ← replace with your email
