import { NextResponse } from 'next/server';
import { createTRPCContext } from '@/server/trpc';

export async function GET() {
  try {
    // Test context creation with different header scenarios
    const context1 = await createTRPCContext({ headers: new Headers() });
    
    const context2 = await createTRPCContext({ 
      headers: new Headers({
        'user-agent': 'test',
        'accept': 'application/json'
      })
    });

    return NextResponse.json({
      success: true,
      context1: {
        hasSession: !!context1.session,
        userId: context1.userId,
        supabaseConnected: !!context1.supabase
      },
      context2: {
        hasSession: !!context2.session,
        userId: context2.userId,
        supabaseConnected: !!context2.supabase
      },
      message: 'Context creation test'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      message: 'Context creation failed'
    }, { status: 500 });
  }
}
