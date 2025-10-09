-- Fix the test user by creating a proper auth.users entry
-- Run this in Supabase SQL Editor

-- Step 1: Clean up existing test data
-- Delete group memberships first (foreign key constraint)
DELETE FROM group_memberships WHERE user_id = 'a702251f-4686-4a79-aa8a-3fc936194860';

-- Delete any groups that are now empty
DELETE FROM groups WHERE id IN (
    SELECT g.id FROM groups g
    LEFT JOIN group_memberships gm ON g.id = gm.group_id
    WHERE gm.id IS NULL
);

-- Now delete the orphaned profile
DELETE FROM profiles WHERE id = 'a702251f-4686-4a79-aa8a-3fc936194860';

-- Step 2: Create a proper auth user
-- This creates the user in auth.users first, then creates the profile
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Generate a new user ID
    v_user_id := gen_random_uuid();

    -- Create auth.users entry (required for foreign key)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        'test@dredre.net',
        crypt('TestPassword123!', gen_salt('bf')), -- Password: TestPassword123!
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        NOW(),
        NOW(),
        '',
        ''
    );

    -- Create profile linked to auth user
    INSERT INTO profiles (id, phone, email, display_name)
    VALUES (
        v_user_id,
        '+15555551234',
        'test@dredre.net',
        'Test User'
    );

    -- Output the user ID for use in the app
    RAISE NOTICE 'Created test user with ID: %', v_user_id;
    RAISE NOTICE 'Email: test@dredre.net';
    RAISE NOTICE 'Password: TestPassword123!';
    RAISE NOTICE '';
    RAISE NOTICE 'Update app/today/page.tsx line 52 with this ID:';
    RAISE NOTICE 'const currentUserId = ''%'';', v_user_id;
END $$;

-- Verify the user was created
SELECT
    u.id,
    u.email,
    p.display_name,
    'User has valid auth entry' as status
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'test@dredre.net';
