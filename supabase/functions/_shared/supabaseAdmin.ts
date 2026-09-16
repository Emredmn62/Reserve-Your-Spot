import { createClient } from "npm:@supabase/supabase-js@^2.45.0";

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically into
// every Edge Function by Supabase - you don't set these yourself. The service
// role key bypasses Row Level Security, which these functions need (they run
// as the platform, not as a logged-in user).
export const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);
