import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Promotion } from "./types";

/* -----------------------------------------------------------------
 * "Aktuelle Angebote" — promotions shown in the site's offers drawer.
 * Managed in the admin, stored as a JSON array under
 * `settings.promotions` (no table, no migration).
 * -------------------------------------------------------------- */

const SETTINGS_KEY = "promotions";

// Same check as requireAdmin in lib/admin/server-fns.ts: the admin client
// sends the Supabase access token as a Bearer header.
async function requireAdmin() {
  const headers = getRequestHeaders();
  const authHeader = headers.get("authorization") ?? headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw new Error("UNAUTHORIZED");
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user) throw new Error("UNAUTHORIZED");
}

async function readAll(): Promise<Promotion[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  if (error) throw error;
  const value = (data as { value: unknown } | null)?.value;
  return Array.isArray(value) ? (value as Promotion[]) : [];
}

/** Berlin calendar date, so an offer ends at local midnight, not UTC. */
function todayInBerlin(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date());
}

// PUBLIC — what visitors see: active and inside the visibility window.
export const getActivePromotions = createServerFn({ method: "GET" }).handler(async () => {
  const today = todayInBerlin();
  const all = await readAll();
  return all
    .filter(
      (p) =>
        p.active &&
        (!p.visibleFrom || p.visibleFrom <= today) &&
        (!p.visibleUntil || today <= p.visibleUntil),
    )
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
});

// ADMIN — every promotion, including drafts and expired ones.
export const getAllPromotions = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return readAll();
});

// ADMIN — the whole list is saved at once.
export const savePromotions = createServerFn({ method: "POST" })
  .validator((data: { promotions: Promotion[] }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    const promotions = data.promotions.map((p, i) => {
      if (!p.title.trim()) throw new Error("TITLE_REQUIRED");
      for (const d of [p.visibleFrom, p.visibleUntil]) {
        if (d && !iso.test(d)) throw new Error("INVALID_DATE");
      }
      return {
        ...p,
        title: p.title.trim(),
        badge: p.badge?.trim() ?? "",
        dates: p.dates?.trim() ?? "",
        description: p.description?.trim() ?? "",
        price: p.price?.trim() ?? "",
        image: p.image?.trim() ?? "",
        sortOrder: i,
      };
    });
    const { error } = await getSupabaseAdmin()
      .from("settings")
      .upsert({ key: SETTINGS_KEY, value: promotions });
    if (error) throw error;
  });
