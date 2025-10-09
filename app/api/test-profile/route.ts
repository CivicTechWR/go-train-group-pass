import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const testUserId = 'a702251f-4686-4a79-aa8a-3fc936194860';

  // Test 1: Check if profile exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', testUserId)
    .maybeSingle();

  // Test 2: Check if auth user exists
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(testUserId);

  return NextResponse.json({
    testUserId,
    profile: {
      exists: !!profile,
      data: profile,
      error: profileError?.message,
    },
    authUser: {
      exists: !!authUser?.user,
      email: authUser?.user?.email,
      error: authError?.message,
    },
    recommendation: !profile
      ? 'Profile not found - run FIX_TEST_USER_SIMPLE.sql'
      : 'Profile exists and should work!',
  });
}
