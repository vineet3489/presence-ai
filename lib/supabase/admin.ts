import { createClient } from '@supabase/supabase-js';

// Singleton — reuse across requests on the same warm function instance
let _adminClient: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
  if (_adminClient) return _adminClient;
  _adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  return _adminClient;
}
