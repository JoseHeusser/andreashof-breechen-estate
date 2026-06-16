import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client. Uses the service-role key, which bypasses
// row-level security. NEVER import this module from client code. The
// SUPABASE_SERVICE_ROLE_KEY env var must NEVER be exposed with a VITE_ prefix.
//
// On the Vercel runtime we set these in the dashboard; locally they come
// from .env.local (gitignored).
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars (server-only).",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
