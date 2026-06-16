import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Booking, BookingStatus, PricingRow } from "@/lib/supabase/types";

/* -----------------------------------------------------------------
 * Auth helper — every protected fn calls requireAdmin(). It reads
 * the Bearer token sent by the client (Supabase access token) and
 * verifies it against Supabase's auth.users via the admin client.
 * If the token is missing or invalid, the fn throws → the client
 * will see a 500 and we redirect to /admin/login.
 * -------------------------------------------------------------- */
async function requireAdmin(): Promise<{ userId: string; email: string }> {
  const headers = getRequestHeaders();
  const authHeader = headers["authorization"] ?? headers["Authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw new Error("UNAUTHORIZED");

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error("UNAUTHORIZED");
  return { userId: data.user.id, email: data.user.email ?? "" };
}

/* -----------------------------------------------------------------
 * DASHBOARD DATA — one shot that returns everything the admin
 * landing page needs.
 * -------------------------------------------------------------- */
export const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const admin = getSupabaseAdmin();
  const [pricingRes, bookingsRes, settingsRes] = await Promise.all([
    admin.from("pricing").select("*").order("priority", { ascending: false }).order("start_date"),
    admin.from("bookings").select("*").order("arrival"),
    admin.from("settings").select("*"),
  ]);
  if (pricingRes.error) throw pricingRes.error;
  if (bookingsRes.error) throw bookingsRes.error;
  if (settingsRes.error) throw settingsRes.error;
  return {
    pricing: pricingRes.data as PricingRow[],
    bookings: bookingsRes.data as Booking[],
    settings: settingsRes.data as { key: string; value: unknown }[],
  };
});

/* -----------------------------------------------------------------
 * PRICING — base price update + create / delete special date ranges
 * -------------------------------------------------------------- */
export const updateBasePrice = createServerFn({ method: "POST" })
  .validator((data: { pricePerNightCents: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("pricing")
      .update({ price_per_night_cents: data.pricePerNightCents })
      .eq("type", "base");
    if (error) throw error;
  });

export const upsertSpecialPrice = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id?: string;
      label: string;
      startDate: string;
      endDate: string;
      pricePerNightCents: number;
      priority?: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = getSupabaseAdmin();
    const row = {
      type: "special" as const,
      label: data.label,
      start_date: data.startDate,
      end_date: data.endDate,
      price_per_night_cents: data.pricePerNightCents,
      priority: data.priority ?? 10,
    };
    if (data.id) {
      const { error } = await admin.from("pricing").update(row).eq("id", data.id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("pricing").insert(row);
      if (error) throw error;
    }
  });

export const deleteSpecialPrice = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("pricing")
      .delete()
      .eq("id", data.id)
      .eq("type", "special");
    if (error) throw error;
  });

/* -----------------------------------------------------------------
 * BOOKINGS — status change + notes + price
 * -------------------------------------------------------------- */
export const updateBooking = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      status?: BookingStatus;
      totalPriceCents?: number | null;
      depositAmountCents?: number | null;
      internalNotes?: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = getSupabaseAdmin();
    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.totalPriceCents !== undefined) patch.total_price_cents = data.totalPriceCents;
    if (data.depositAmountCents !== undefined) patch.deposit_amount_cents = data.depositAmountCents;
    if (data.internalNotes !== undefined) patch.internal_notes = data.internalNotes;

    const { error } = await admin.from("bookings").update(patch).eq("id", data.id);
    if (error) throw error;
  });

/* -----------------------------------------------------------------
 * PUBLIC — create a new booking request from the /reservations form.
 * No auth required; status defaults to 'requested'.
 * -------------------------------------------------------------- */
export const createBookingRequest = createServerFn({ method: "POST" })
  .validator(
    (data: {
      arrival: string;
      departure: string;
      guests: number;
      occasion?: string;
      name: string;
      email: string;
      phone?: string;
      message?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!data.arrival || !data.departure || !data.name || !data.email || !data.guests) {
      throw new Error("Missing required fields");
    }
    if (data.arrival >= data.departure) throw new Error("Arrival must be before departure");
    if (data.guests < 1 || data.guests > 30) throw new Error("Invalid guest count");

    const admin = getSupabaseAdmin();
    const { data: row, error } = await admin
      .from("bookings")
      .insert({
        source: "web",
        status: "requested",
        arrival: data.arrival,
        departure: data.departure,
        guests: data.guests,
        occasion: data.occasion ?? null,
        contact_name: data.name,
        contact_email: data.email,
        contact_phone: data.phone ?? null,
        message: data.message ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: row.id };
  });

/* -----------------------------------------------------------------
 * PUBLIC — fetch blocked ranges so the public calendar greys them
 * out. Only returns accepted / paid bookings, never raw requests.
 * -------------------------------------------------------------- */
export const getBlockedRanges = createServerFn({ method: "GET" }).handler(async () => {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("blocked_ranges")
    .select("arrival,departure,source");
  if (error) throw error;
  return data as { arrival: string; departure: string; source: string }[];
});

/* -----------------------------------------------------------------
 * SETTINGS + manual Airbnb sync
 * -------------------------------------------------------------- */
export const updateAirbnbIcalUrl = createServerFn({ method: "POST" })
  .validator((data: { url: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("settings")
      .upsert({ key: "airbnb_ical_url", value: data.url });
    if (error) throw error;
  });

export const triggerAirbnbSync = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  const res = await fetch(`${url}/functions/v1/airbnb-sync`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ reason: "manual" }),
  });
  const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(`sync failed (${res.status}): ${JSON.stringify(payload)}`);
  return payload;
});
