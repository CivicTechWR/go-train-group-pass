import { NextRequest, NextResponse } from 'next/server';
import { adminErrorResponse, requireAdminApi } from '@/lib/admin-api';

export async function POST(request: NextRequest) {
  try {
    const { serviceClient: supabase } = await requireAdminApi(request);

    // Create test user in auth.users
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: 'test@dredre.net',
        password: 'TestPassword123!',
        email_confirm: true,
        user_metadata: {
          display_name: 'Test User',
        },
      });

    if (authError) {
      return NextResponse.json(
        {
          success: false,
          error: authError.message,
          message: 'Failed to create auth user',
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      throw new Error('No user data returned from Supabase');
    }

    // Create profile for the user
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      display_name: 'Test User',
      email: 'test@dredre.net',
      phone: '+15555551234',
      reputation_score: 100,
      trips_completed: 0,
      on_time_payment_rate: 1,
      is_community_admin: false,
    });

    if (profileError) {
      // If profile creation fails, clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      email: 'test@dredre.net',
      message:
        'Test user created successfully! You can now sign in with test@dredre.net / TestPassword123!',
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
