-- ══════════════════════════════════════════════════════════════════════════════
--  ARIK FASHION — FIX PROFILES TABLE 500 ERROR
--  Run this in Supabase → SQL Editor
--
--  Problem: is_admin() queries public.profiles, but profiles has RLS policies
--  that call is_admin() — creating infinite recursion → 500 error.
--
--  Fix: rewrite is_admin() to use auth.jwt() claims instead of querying
--  profiles, OR use SECURITY DEFINER to bypass RLS.
-- ══════════════════════════════════════════════════════════════════════════════

-- Step 1: Drop all existing policies on profiles to start clean
DROP POLICY IF EXISTS "Users: read own profile"     ON public.profiles;
DROP POLICY IF EXISTS "Users: update own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Admin: read all profiles"    ON public.profiles;
DROP POLICY IF EXISTS "Admin: update all profiles"  ON public.profiles;
DROP POLICY IF EXISTS "Admin: delete profiles"      ON public.profiles;

-- Step 2: Rewrite is_admin() to use SECURITY DEFINER so it bypasses RLS
--         when checking the role — breaking the recursion loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER  -- runs as the function owner (postgres), bypasses RLS
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Step 3: Re-create clean, non-recursive policies
-- Users can read their own profile
CREATE POLICY "Users: read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but can't change their role)
CREATE POLICY "Users: update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'customer');

-- Admins can read all profiles (uses is_admin() which is now SECURITY DEFINER)
CREATE POLICY "Admin: read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Admins can update all profiles
CREATE POLICY "Admin: update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Step 4: Allow the trigger (service role) to insert new profiles
CREATE POLICY "Service: insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Step 5: Grant admin role to your email (replace with your actual email)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'aitaltechvolution@gmail.com';

-- Step 6: Verify — should show role = 'admin'
SELECT id, email, role FROM public.profiles
WHERE email = 'aitaltechvolution@gmail.com';
