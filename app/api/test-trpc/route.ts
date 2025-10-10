import { NextResponse } from 'next/server';
import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/server/trpc';

export async function GET() {
  try {
    // Create tRPC context
    const context = await createTRPCContext({ headers: new Headers() });
    
    // Test the trips.list procedure directly
    const caller = appRouter.createCaller(context);
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const result = await caller.trips.list({
      startDate: todayStr,
      endDate: todayStr,
    });

    return NextResponse.json({
      success: true,
      result: result,
      context: {
        hasSession: !!context.session,
        userId: context.userId,
        supabaseConnected: !!context.supabase
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      message: 'tRPC test failed'
    }, { status: 500 });
  }
}
