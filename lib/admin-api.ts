import { NextRequest, NextResponse } from 'next/server';
import {
  createClient as createServiceClient,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

interface AdminContext {
  serviceClient: SupabaseClient;
}

export async function requireAdminApi(
  request: NextRequest
): Promise<AdminContext> {
  if (process.env.ENABLE_ADMIN_APIS !== 'true') {
    throw new AdminApiError('Admin APIs are disabled', 410);
  }

  const token = process.env.ADMIN_API_TOKEN;
  if (!token) {
    throw new AdminApiError('Admin API token is not configured', 500);
  }

  const authHeader = request.headers.get('authorization') ?? '';
  if (authHeader !== `Bearer ${token}`) {
    throw new AdminApiError('Unauthorized admin request', 401);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new AdminApiError(
      'Supabase service credentials are not configured',
      500
    );
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  return { serviceClient };
}

export function adminErrorResponse(error: unknown): NextResponse {
  if (error instanceof AdminApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.status }
    );
  }

  logger.error('Admin API error', error as Error);

  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
    },
    { status: 500 }
  );
}
