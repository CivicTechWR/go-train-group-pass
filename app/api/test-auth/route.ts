import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test the development bypass
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .limit(1);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No profiles found in database',
        message: 'Please run the database setup first'
      }, { status: 400 });
    }

    const testUserId = profiles[0].id;

    // Test tRPC context creation
    const { createTRPCContext } = await import('@/server/trpc');
    const context = await createTRPCContext({ headers: new Headers() });

    return NextResponse.json({
      success: true,
      testUserId,
      profile: profiles[0],
      context: {
        hasSession: !!context.session,
        userId: context.userId || 'No userId in context',
        supabaseConnected: !!context.supabase
      },
      message: 'Authentication test successful!'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Authentication test failed'
    }, { status: 500 });
  }
}
