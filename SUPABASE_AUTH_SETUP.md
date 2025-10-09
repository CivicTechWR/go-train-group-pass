# Setting Up Authentication for Test User

## Option 1: Reset Password via Supabase Dashboard (Recommended)

### Step 1: Go to Authentication
Visit: https://supabase.com/dashboard/project/gwljtlrlbiygermawabm/auth/users

### Step 2: Find Your User
Look for: `test@dredre.net` (User 1)

### Step 3: Reset Password
1. Click on the user
2. Click "Send Password Recovery Email"
   - OR -
3. Click "Generate new password" to set a temporary password

### Step 4: Create Auth User (if doesn't exist)

If the user `test@dredre.net` doesn't exist in Supabase Auth:

1. Go to Authentication → Users
2. Click "+ Add user"
3. Fill in:
   - Email: `test@dredre.net`
   - Password: `TestPass123!` (or your choice)
   - Auto Confirm User: ✅ YES
4. Click "Create user"
5. **Copy the user ID** from the created user

### Step 5: Link Profile to Auth User

Run this SQL in Supabase SQL Editor:

```sql
-- Update the profile to match the auth user ID
UPDATE profiles
SET id = 'PASTE_AUTH_USER_ID_HERE'
WHERE email = 'test@dredre.net';
```

---

## Option 2: Create Fresh Test User via SQL

Run this in Supabase SQL Editor:

```sql
-- Step 1: Create auth user (Supabase will handle password)
-- This creates a user in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), -- This is your user ID
  'authenticated',
  'authenticated',
  'test@dredre.net',
  crypt('TestPass123!', gen_salt('bf')), -- Password: TestPass123!
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) RETURNING id;
-- COPY THIS ID!

-- Step 2: Create profile for this user
-- Replace YOUR_USER_ID_HERE with the ID from above
INSERT INTO profiles (id, phone, email, display_name)
VALUES (
  'YOUR_USER_ID_HERE',
  '+15555551234',
  'test@dredre.net',
  'Test User'
);
```

---

## Option 3: Use Supabase CLI (Local)

If you have Supabase CLI installed:

```bash
# Reset password for user
supabase auth reset-password test@dredre.net --project-ref gwljtlrlbiygermawabm
```

---

## Quick Fix: Use Existing User

Your database already has this user:
- **ID:** `a702251f-4686-4a79-aa8a-3fc936194860`
- **Email:** `test@dredre.net`
- **Display Name:** User 1

### Check if this user exists in Auth:

1. Go to: https://supabase.com/dashboard/project/gwljtlrlbiygermawabm/auth/users
2. Search for `test@dredre.net`
3. If exists: Click "Send password reset email" or "Generate new password"
4. If doesn't exist: Use Option 1 or 2 above

---

## After Resetting Password

1. Login at: http://localhost:3000/login
2. Use email: `test@dredre.net`
3. Use password you set
4. Should redirect to `/today` page

---

## Current Workaround (No Auth Required)

The app currently works WITHOUT authentication for testing:
- User ID is hardcoded in `app/today/page.tsx:52`
- You can join/leave trains without logging in
- Perfect for testing the core functionality

To test WITHOUT password:
- Just visit http://localhost:3000/today
- Everything works with the hardcoded user ID
