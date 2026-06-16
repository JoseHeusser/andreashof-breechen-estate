import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !key) {
  // Caught loudly at runtime in the browser, but not at SSR import time.
  console.warn("[supabase] missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
}

// Single browser-side client. Used for auth (login / logout / session) only.
// All data mutations on the public site go through TanStack Start server fns
// that use the service-role client.
export const supabaseBrowser = createClient(url ?? "", key ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
