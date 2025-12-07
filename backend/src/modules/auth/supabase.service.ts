import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseKey =
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      '';

    if (!supabaseKey) {
      throw new Error(
        'Supabase key is required. Set SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in your .env file',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient<Database> {
    return this.supabase;
  }

  // Get auth client for authentication operations
  get auth() {
    return this.supabase.auth;
  }
}
