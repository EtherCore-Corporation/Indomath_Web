import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not configured');
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
}

// Create a service role client that bypasses RLS
export const supabaseService = createClient(
  supabaseUrl, 
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
) 