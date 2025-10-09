import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, these may not be available
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client that won't be used
    // The actual client will be created at runtime
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
