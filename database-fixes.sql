-- ===============================================
-- Baby Tracker Database Fixes
-- ===============================================
-- This file contains SQL statements to fix RLS policies and create missing functions
-- Execute these in your Supabase SQL Editor

-- STEP 1: Temporarily disable RLS on problematic tables
-- ===============================================
ALTER TABLE user_baby_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE baby_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop all existing policies (if any exist)
-- ===============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view babies they have access to" ON baby_profiles;
DROP POLICY IF EXISTS "Users can create baby profiles" ON baby_profiles;
DROP POLICY IF EXISTS "Admins can update baby profiles" ON baby_profiles;
DROP POLICY IF EXISTS "Users can view their baby links" ON user_baby_links;
DROP POLICY IF EXISTS "Users can create baby links via invite codes" ON user_baby_links;
DROP POLICY IF EXISTS "Admins can manage baby links" ON user_baby_links;
DROP POLICY IF EXISTS "Users can view events for their babies" ON events;
DROP POLICY IF EXISTS "Users can create events for their babies" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can view invite codes for their babies" ON invite_codes;
DROP POLICY IF EXISTS "Admins can create invite codes" ON invite_codes;

-- STEP 3: Create missing RPC functions
-- ===============================================

-- Function to get all babies for a user (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_babies(user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  birthdate DATE,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  role TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.name,
    bp.birthdate,
    bp.created_by,
    bp.created_at,
    bp.updated_at,
    ubl.role::TEXT
  FROM baby_profiles bp
  INNER JOIN user_baby_links ubl ON bp.id = ubl.baby_id
  WHERE ubl.user_id = get_user_babies.user_id
  ORDER BY bp.created_at DESC;
END;
$$;

-- Function to get a specific baby by ID for a user (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_baby_by_id(user_id UUID, baby_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  birthdate DATE,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  role TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.name,
    bp.birthdate,
    bp.created_by,
    bp.created_at,
    bp.updated_at,
    ubl.role::TEXT
  FROM baby_profiles bp
  INNER JOIN user_baby_links ubl ON bp.id = ubl.baby_id
  WHERE ubl.user_id = get_user_baby_by_id.user_id 
    AND bp.id = get_user_baby_by_id.baby_id;
END;
$$;

-- STEP 4: Create new, safe RLS policies
-- ===============================================

-- Users table policies
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Baby profiles policies (simple, no circular references)
CREATE POLICY "baby_profiles_select" ON baby_profiles
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_baby_links 
      WHERE baby_id = baby_profiles.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "baby_profiles_insert" ON baby_profiles
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "baby_profiles_update" ON baby_profiles
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_baby_links 
      WHERE baby_id = baby_profiles.id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- User baby links policies (avoid self-reference)
CREATE POLICY "user_baby_links_select" ON user_baby_links
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_baby_links_insert" ON user_baby_links
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM baby_profiles 
      WHERE id = baby_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "user_baby_links_delete" ON user_baby_links
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM baby_profiles 
      WHERE id = baby_id 
      AND created_by = auth.uid()
    )
  );

-- Events policies
CREATE POLICY "events_select" ON events
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_baby_links 
      WHERE baby_id = events.baby_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_baby_links 
      WHERE baby_id = events.baby_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "events_update" ON events
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "events_delete" ON events
  FOR DELETE USING (created_by = auth.uid());

-- Invite codes policies
CREATE POLICY "invite_codes_select" ON invite_codes
  FOR SELECT USING (
    created_by = auth.uid() OR
    used_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_baby_links 
      WHERE baby_id = invite_codes.baby_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "invite_codes_insert" ON invite_codes
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_baby_links 
      WHERE baby_id = invite_codes.baby_id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- STEP 5: Re-enable RLS with new policies
-- ===============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_baby_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- STEP 6: Grant necessary permissions
-- ===============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- STEP 7: Test the functions work correctly
-- ===============================================
-- You can test these queries after running the above:
-- SELECT * FROM get_user_babies(auth.uid());
-- SELECT * FROM get_user_baby_by_id(auth.uid(), 'some-baby-uuid');

-- ===============================================
-- INSTRUCTIONS:
-- ===============================================
-- 1. Copy this entire file content
-- 2. Go to your Supabase dashboard
-- 3. Navigate to SQL Editor
-- 4. Paste and run this script
-- 5. Verify no errors occur
-- 6. Test baby creation and fetching in your app
-- ===============================================