-- Row Level Security (RLS) Policies for Baby Tracker
-- These policies ensure users can only access data they have permission to see

-- =======================
-- ENABLE RLS
-- =======================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_baby_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- =======================
-- USERS TABLE POLICIES
-- =======================

-- Users can only see and update their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- =======================
-- BABY_PROFILES TABLE POLICIES
-- =======================

-- Users can view babies they have access to
CREATE POLICY "Users can view babies they have access to" ON baby_profiles
  FOR SELECT USING (
    id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid()
    )
  );

-- Users can create new baby profiles (they automatically become admin)
CREATE POLICY "Users can create baby profiles" ON baby_profiles
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Only admins can update baby profiles
CREATE POLICY "Admins can update baby profiles" ON baby_profiles
  FOR UPDATE USING (
    id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete baby profiles
CREATE POLICY "Admins can delete baby profiles" ON baby_profiles
  FOR DELETE USING (
    id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =======================
-- USER_BABY_LINKS TABLE POLICIES
-- =======================

-- Users can view their own baby links
CREATE POLICY "Users can view their own baby links" ON user_baby_links
  FOR SELECT USING (user_id = auth.uid());

-- Users can view other users' links to babies they admin
CREATE POLICY "Admins can view all links to their babies" ON user_baby_links
  FOR SELECT USING (
    baby_id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System can create baby links (handled by functions)
CREATE POLICY "System can create baby links" ON user_baby_links
  FOR INSERT WITH CHECK (true);

-- Only admins can delete baby links (remove access)
CREATE POLICY "Admins can remove baby access" ON user_baby_links
  FOR DELETE USING (
    baby_id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =======================
-- INVITE_CODES TABLE POLICIES
-- =======================

-- Admins can view invite codes for their babies
CREATE POLICY "Admins can view invite codes for their babies" ON invite_codes
  FOR SELECT USING (
    baby_id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Anyone can view invite codes by code (for redemption)
CREATE POLICY "Anyone can view invite codes by code" ON invite_codes
  FOR SELECT USING (true);

-- Admins can create invite codes for their babies
CREATE POLICY "Admins can create invite codes" ON invite_codes
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    baby_id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update invite codes for their babies
CREATE POLICY "Admins can update invite codes" ON invite_codes
  FOR UPDATE USING (
    baby_id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete invite codes for their babies
CREATE POLICY "Admins can delete invite codes" ON invite_codes
  FOR DELETE USING (
    baby_id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =======================
-- EVENTS TABLE POLICIES
-- =======================

-- Users can view events for babies they have access to
CREATE POLICY "Users can view events for accessible babies" ON events
  FOR SELECT USING (
    baby_id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid()
    )
  );

-- Users can create events for babies they have access to
CREATE POLICY "Users can create events for accessible babies" ON events
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    baby_id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid()
    )
  );

-- Users can update their own events
CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (
    auth.uid() = created_by AND
    baby_id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own events, admins can delete any events for their babies
CREATE POLICY "Users can delete their own events, admins can delete any" ON events
  FOR DELETE USING (
    (auth.uid() = created_by) OR
    (baby_id IN (
      SELECT baby_id FROM user_baby_links 
      WHERE user_id = auth.uid() AND role = 'admin'
    ))
  );