import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

/**
 * Returns a Supabase client configured with the service role key.
 * Use only inside trusted server-side contexts (e.g. webhooks, cron jobs)
 * where bypassing RLS is required.
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
