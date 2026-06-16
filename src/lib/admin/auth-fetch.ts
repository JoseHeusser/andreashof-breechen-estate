import { supabaseBrowser } from "@/lib/supabase/browser";

/**
 * Patches global fetch so any request to /_server (TanStack Start's
 * server-fn endpoint) carries the current Supabase access token in
 * Authorization. Server functions decode it via `requireAdmin()`.
 *
 * Idempotent — call once at app boot or top of the admin layout.
 */
let installed = false;
export function installAdminFetch() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = (async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (!url.includes("/_server")) return original(input, init);

    const { data } = await supabaseBrowser.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return original(input, init);

    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.set("Authorization", `Bearer ${token}`);
    return original(input, { ...init, headers });
  }) as typeof window.fetch;
}
