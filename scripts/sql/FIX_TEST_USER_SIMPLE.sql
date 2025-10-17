-- Simple fix: Just get the existing auth user ID and update the profile
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    v_auth_user_id UUID;
    v_old_profile_id UUID := 'a702251f-4686-4a79-aa8a-3fc936194860';
BEGIN
    -- Get the existing auth user ID
    SELECT id INTO v_auth_user_id
    FROM auth.users
    WHERE email = 'test@dredre.net';

    IF v_auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Auth user not found for test@dredre.net';
    END IF;

    -- Clean up old memberships (if any)
    DELETE FROM group_memberships WHERE user_id = v_old_profile_id;

    -- Delete empty groups
    DELETE FROM groups WHERE id IN (
        SELECT g.id FROM groups g
        LEFT JOIN group_memberships gm ON g.id = gm.group_id
        WHERE gm.id IS NULL
    );

    -- Delete old profile
    DELETE FROM profiles WHERE id = v_old_profile_id;

    -- Create new profile linked to existing auth user
    INSERT INTO profiles (id, phone, email, display_name)
    VALUES (
        v_auth_user_id,
        '+15555551234',
        'test@dredre.net',
        'Test User'
    );

    -- Output the user ID
    RAISE NOTICE '✅ Fixed! Test user ID: %', v_auth_user_id;
    RAISE NOTICE 'Email: test@dredre.net';
    RAISE NOTICE 'Password: (use your existing password)';
    RAISE NOTICE '';
    RAISE NOTICE 'Update app/today/page.tsx line 52:';
    RAISE NOTICE 'const currentUserId = ''%'';', v_auth_user_id;
END $$;

-- Verify
SELECT
    u.id,
    u.email,
    p.display_name,
    '✅ User properly linked' as status
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'test@dredre.net';
