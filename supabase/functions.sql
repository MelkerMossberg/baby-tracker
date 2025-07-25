-- Database Functions for Baby Tracker
-- These functions handle complex operations and GDPR compliance

-- =======================
-- BABY MANAGEMENT FUNCTIONS
-- =======================

-- Create a new baby profile and make the creator an admin
CREATE OR REPLACE FUNCTION create_baby_profile(
  baby_name TEXT,
  baby_birthdate DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_baby_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Create baby profile
  INSERT INTO baby_profiles (name, birthdate, created_by)
  VALUES (baby_name, baby_birthdate, current_user_id)
  RETURNING id INTO new_baby_id;

  -- Make creator an admin
  INSERT INTO user_baby_links (user_id, baby_id, role)
  VALUES (current_user_id, new_baby_id, 'admin');

  RETURN new_baby_id;
END;
$$;

-- =======================
-- INVITE CODE FUNCTIONS
-- =======================

-- Generate a random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := UPPER(
      SUBSTRING(
        MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) 
        FROM 1 FOR 8
      )
    );
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM invite_codes WHERE invite_codes.code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Create an invite code for a baby
CREATE OR REPLACE FUNCTION create_invite_code(
  baby_id UUID,
  role TEXT DEFAULT 'guest',
  expires_in_days INTEGER DEFAULT 7
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_code TEXT;
  current_user_id UUID;
  is_admin BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Check if user is admin for this baby
  SELECT EXISTS(
    SELECT 1 FROM user_baby_links 
    WHERE user_id = current_user_id 
    AND user_baby_links.baby_id = create_invite_code.baby_id 
    AND user_baby_links.role = 'admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can create invite codes';
  END IF;

  -- Validate role
  IF role NOT IN ('admin', 'guest') THEN
    RAISE EXCEPTION 'Role must be admin or guest';
  END IF;

  -- Generate unique code
  invite_code := generate_invite_code();

  -- Create invite code record
  INSERT INTO invite_codes (code, baby_id, created_by, role, expires_at)
  VALUES (
    invite_code, 
    create_invite_code.baby_id, 
    current_user_id, 
    create_invite_code.role, 
    NOW() + (expires_in_days || ' days')::INTERVAL
  );

  RETURN invite_code;
END;
$$;

-- Redeem an invite code
CREATE OR REPLACE FUNCTION redeem_invite_code(
  invite_code TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_record RECORD;
  current_user_id UUID;
  already_has_access BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Find and validate invite code
  SELECT * FROM invite_codes 
  WHERE code = invite_code 
  AND expires_at > NOW() 
  AND used_at IS NULL
  INTO code_record;

  IF code_record IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  -- Check if user already has access to this baby
  SELECT EXISTS(
    SELECT 1 FROM user_baby_links 
    WHERE user_id = current_user_id 
    AND baby_id = code_record.baby_id
  ) INTO already_has_access;

  IF already_has_access THEN
    RAISE EXCEPTION 'User already has access to this baby';
  END IF;

  -- Create user-baby link
  INSERT INTO user_baby_links (user_id, baby_id, role)
  VALUES (current_user_id, code_record.baby_id, code_record.role);

  -- Mark invite code as used
  UPDATE invite_codes 
  SET used_by = current_user_id, used_at = NOW()
  WHERE id = code_record.id;

  RETURN code_record.baby_id;
END;
$$;

-- =======================
-- USER MANAGEMENT FUNCTIONS
-- =======================

-- Remove a user's access to a baby (admin only)
CREATE OR REPLACE FUNCTION remove_baby_access(
  target_user_id UUID,
  baby_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  is_admin BOOLEAN;
  target_is_creator BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Check if current user is admin for this baby
  SELECT EXISTS(
    SELECT 1 FROM user_baby_links 
    WHERE user_id = current_user_id 
    AND user_baby_links.baby_id = remove_baby_access.baby_id 
    AND role = 'admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can remove baby access';
  END IF;

  -- Check if target user is the baby's creator
  SELECT EXISTS(
    SELECT 1 FROM baby_profiles 
    WHERE id = baby_id 
    AND created_by = target_user_id
  ) INTO target_is_creator;

  IF target_is_creator THEN
    RAISE EXCEPTION 'Cannot remove access for baby creator';
  END IF;

  -- Remove the link
  DELETE FROM user_baby_links 
  WHERE user_id = target_user_id 
  AND user_baby_links.baby_id = remove_baby_access.baby_id;

  RETURN FOUND;
END;
$$;

-- =======================
-- GDPR COMPLIANCE FUNCTIONS
-- =======================

-- Delete user account and all associated data
CREATE OR REPLACE FUNCTION delete_user_account(
  user_id_to_delete UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  target_user_id UUID;
  baby_record RECORD;
BEGIN
  current_user_id := auth.uid();
  target_user_id := COALESCE(user_id_to_delete, current_user_id);
  
  -- Only allow users to delete their own account
  IF current_user_id != target_user_id THEN
    RAISE EXCEPTION 'Users can only delete their own account';
  END IF;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Handle babies where user is the only admin
  FOR baby_record IN 
    SELECT bp.id, bp.name
    FROM baby_profiles bp
    JOIN user_baby_links ubl ON bp.id = ubl.baby_id
    WHERE ubl.user_id = target_user_id 
    AND ubl.role = 'admin'
    AND bp.id NOT IN (
      -- Exclude babies that have other admins
      SELECT baby_id FROM user_baby_links 
      WHERE role = 'admin' 
      AND user_id != target_user_id
      GROUP BY baby_id
    )
  LOOP
    -- Delete the entire baby profile and all associated data
    -- This will cascade to events, user_baby_links, and invite_codes
    DELETE FROM baby_profiles WHERE id = baby_record.id;
  END LOOP;

  -- Remove user from all other baby access
  DELETE FROM user_baby_links WHERE user_id = target_user_id;

  -- Delete user's events (if any remain)
  DELETE FROM events WHERE created_by = target_user_id;

  -- Delete user's invite codes (if any remain)
  DELETE FROM invite_codes WHERE created_by = target_user_id;

  -- Delete user profile
  DELETE FROM users WHERE id = target_user_id;

  -- Delete from auth.users (this should be done carefully in production)
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

-- Get user's data summary (for GDPR data export)
CREATE OR REPLACE FUNCTION get_user_data_summary(
  target_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  user_id UUID;
  result JSON;
BEGIN
  current_user_id := auth.uid();
  user_id := COALESCE(target_user_id, current_user_id);
  
  -- Only allow users to get their own data
  IF current_user_id != user_id THEN
    RAISE EXCEPTION 'Users can only access their own data';
  END IF;

  SELECT json_build_object(
    'user_profile', (
      SELECT json_build_object(
        'id', id,
        'name', name,
        'email', email,
        'created_at', created_at
      ) FROM users WHERE id = user_id
    ),
    'babies', (
      SELECT json_agg(
        json_build_object(
          'id', bp.id,
          'name', bp.name,
          'birthdate', bp.birthdate,
          'role', ubl.role,
          'created_at', bp.created_at
        )
      )
      FROM baby_profiles bp
      JOIN user_baby_links ubl ON bp.id = ubl.baby_id
      WHERE ubl.user_id = user_id
    ),
    'events_created', (
      SELECT COUNT(*) FROM events WHERE created_by = user_id
    ),
    'invite_codes_created', (
      SELECT COUNT(*) FROM invite_codes WHERE created_by = user_id
    )
  ) INTO result;

  RETURN result;
END;
$$;