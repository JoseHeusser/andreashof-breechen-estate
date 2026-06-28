import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { AnalyticsStats, Booking, BookingStatus, PricingRow } from "@/lib/supabase/types";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email/client";
import {
  tplRequestedGuest,
  tplRequestedAdmin,
  tplAcceptedGuest,
  tplDepositPaidGuest,
  tplFullyPaidGuest,
} from "@/lib/email/templates";

type PricingQuoteInput = {
  arrival: string;
  departure: string;
  guests: number;
  children?: number;
  pets?: number;
  rentsDachboden?: boolean;
};

/* -----------------------------------------------------------------
 * Auth helper — every protected fn calls requireAdmin(). It reads
 * the Bearer token sent by the client (Supabase access token) and
 * verifies it against Supabase's auth.users via the admin client.
 * If the token is missing or invalid, the fn throws → the client
 * will see a 500 and we redirect to /admin/login.
 * -------------------------------------------------------------- */
async function requireAdmin(): Promise<{ userId: string; email: string }> {
  // h3 returns a Headers instance (Web Fetch API), accessed via .get()
  const headers = getRequestHeaders();
  const authHeader = headers.get("authorization") ?? headers.get("Authorization");
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
  const [pricingRes, bookingsRes, settingsRes, analytics] = await Promise.all([
    admin.from("pricing").select("*").order("priority", { ascending: false }).order("start_date"),
    admin.from("bookings").select("*").order("arrival"),
    admin.from("settings").select("*"),
    getAnalyticsStats(admin),
  ]);
  if (pricingRes.error) throw pricingRes.error;
  if (bookingsRes.error) throw bookingsRes.error;
  if (settingsRes.error) throw settingsRes.error;
  return {
    pricing: pricingRes.data as PricingRow[],
    bookings: bookingsRes.data as Booking[],
    settings: settingsRes.data as { key: string; value: unknown }[],
    analytics,
  };
});

type PageVisitRow = {
  occurred_at: string;
  path: string;
  referrer: string | null;
  language: string | null;
  session_id: string | null;
};

async function getAnalyticsStats(
  admin: ReturnType<typeof getSupabaseAdmin>,
): Promise<AnalyticsStats> {
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const start7 = new Date(now);
  start7.setDate(start7.getDate() - 7);
  const start14 = new Date(now);
  start14.setDate(start14.getDate() - 14);

  const [totalRes, todayRes, last7Res, rowsRes] = await Promise.all([
    admin.from("page_visits").select("id", { count: "exact", head: true }),
    admin
      .from("page_visits")
      .select("id", { count: "exact", head: true })
      .gte("occurred_at", startToday.toISOString()),
    admin
      .from("page_visits")
      .select("id", { count: "exact", head: true })
      .gte("occurred_at", start7.toISOString()),
    admin
      .from("page_visits")
      .select("occurred_at,path,referrer,language,session_id")
      .gte("occurred_at", start14.toISOString())
      .order("occurred_at", { ascending: false })
      .limit(3000),
  ]);

  const analyticsError = totalRes.error ?? todayRes.error ?? last7Res.error ?? rowsRes.error;
  if (analyticsError && isMissingPageVisitsTable(analyticsError)) {
    return emptyAnalyticsStats();
  }
  if (totalRes.error) throw totalRes.error;
  if (todayRes.error) throw todayRes.error;
  if (last7Res.error) throw last7Res.error;
  if (rowsRes.error) throw rowsRes.error;

  const rows = (rowsRes.data ?? []) as PageVisitRow[];
  const rows7 = rows.filter((row) => new Date(row.occurred_at) >= start7);
  const uniqueSessions7Days = new Set(rows7.map((row) => row.session_id).filter(Boolean)).size;

  const hourly = new Map<string, number>();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(d.getHours() - i, 0, 0, 0);
    hourly.set(formatHourKey(d), 0);
  }

  const dayAgo = new Date(now);
  dayAgo.setHours(dayAgo.getHours() - 24);
  for (const row of rows) {
    const d = new Date(row.occurred_at);
    if (d < dayAgo) continue;
    const key = formatHourKey(d);
    if (hourly.has(key)) hourly.set(key, (hourly.get(key) ?? 0) + 1);
  }

  const daily = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    daily.set(formatDateKey(d), 0);
  }
  for (const row of rows) {
    const key = formatDateKey(new Date(row.occurred_at));
    if (daily.has(key)) daily.set(key, (daily.get(key) ?? 0) + 1);
  }

  const pageCounts = new Map<string, number>();
  for (const row of rows7) {
    pageCounts.set(row.path, (pageCounts.get(row.path) ?? 0) + 1);
  }

  return {
    totalVisits: totalRes.count ?? 0,
    todayVisits: todayRes.count ?? 0,
    last7DaysVisits: last7Res.count ?? 0,
    uniqueSessions7Days,
    hourly: [...hourly.entries()].map(([hour, visits]) => ({ hour, visits })),
    daily: [...daily.entries()].map(([date, visits]) => ({ date, visits })),
    topPages: [...pageCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, visits]) => ({ path, visits })),
    recent: rows.slice(0, 12).map(({ occurred_at, path, referrer, language }) => ({
      occurred_at,
      path,
      referrer,
      language,
    })),
  };
}

function emptyAnalyticsStats(): AnalyticsStats {
  return {
    totalVisits: 0,
    todayVisits: 0,
    last7DaysVisits: 0,
    uniqueSessions7Days: 0,
    hourly: [],
    daily: [],
    topPages: [],
    recent: [],
  };
}

function isMissingPageVisitsTable(error: { code?: string; message?: string }): boolean {
  return error.code === "42P01" || error.message?.includes("page_visits") === true;
}

function formatHourKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:00`;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* -----------------------------------------------------------------
 * PRICING — base price update + create / delete special date ranges
 * -------------------------------------------------------------- */
export const updateBasePrice = createServerFn({ method: "POST" })
  .inputValidator((data: { pricePerNightCents: number }) => data)
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
  .inputValidator(
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
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("pricing").delete().eq("id", data.id).eq("type", "special");
    if (error) throw error;
  });

async function calculatePricingQuote(
  admin: ReturnType<typeof getSupabaseAdmin>,
  data: PricingQuoteInput,
) {
  const [pricingRes, settingsRes] = await Promise.all([
    admin.from("pricing").select("*"),
    admin
      .from("settings")
      .select("key,value")
      .in("key", [
        "cleaning_fee_cents",
        "base_occupancy",
        "extra_person_fee_per_night_cents",
        "child_crib_fee_cents",
        "pet_fee_cents",
        "dachboden_fee_cents",
      ]),
  ]);
  if (pricingRes.error) throw pricingRes.error;
  if (settingsRes.error) throw settingsRes.error;

  const settings = Object.fromEntries(
    (settingsRes.data ?? []).map((s) => [s.key, s.value as number]),
  );
  const cleaningCents = (settings.cleaning_fee_cents as number) ?? 0;
  const baseOccupancy = (settings.base_occupancy as number) ?? 10;
  const extraPerNight = (settings.extra_person_fee_per_night_cents as number) ?? 0;
  const cribCents = (settings.child_crib_fee_cents as number) ?? 0;
  const petCents = (settings.pet_fee_cents as number) ?? 0;
  const dachbodenCents = (settings.dachboden_fee_cents as number) ?? 0;

  const base = (pricingRes.data ?? []).find((p) => p.type === "base");
  const baseCents = base?.price_per_night_cents ?? 0;
  const specials = (pricingRes.data ?? [])
    .filter((p) => p.type === "special")
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  let nightlySum = 0;
  let nights = 0;
  const start = new Date(data.arrival + "T00:00:00Z");
  const end = new Date(data.departure + "T00:00:00Z");
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const special = specials.find(
      (s) => s.start_date && s.end_date && iso >= s.start_date && iso <= s.end_date,
    );
    nightlySum += special ? special.price_per_night_cents : baseCents;
    nights++;
  }

  const extraGuests = Math.max(0, data.guests - baseOccupancy);
  const extraTotal = extraGuests * extraPerNight * nights;
  const cribTotal = data.children ? data.children * cribCents : 0;
  const petTotal = data.pets && data.pets > 0 ? data.pets * petCents : 0;
  const dachbodenTotal = data.rentsDachboden ? dachbodenCents : 0;
  const totalCents =
    nightlySum + cleaningCents + extraTotal + cribTotal + petTotal + dachbodenTotal;

  return { totalCents, nights };
}

/* -----------------------------------------------------------------
 * BOOKINGS — status change + notes + price
 * -------------------------------------------------------------- */
export const updateBooking = createServerFn({ method: "POST" })
  .inputValidator(
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

    // Read current state first to detect status transitions for emails.
    const { data: prev, error: prevErr } = await admin
      .from("bookings")
      .select("*")
      .eq("id", data.id)
      .single();
    if (prevErr) throw prevErr;

    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.totalPriceCents !== undefined) patch.total_price_cents = data.totalPriceCents;
    if (data.depositAmountCents !== undefined) patch.deposit_amount_cents = data.depositAmountCents;
    if (data.internalNotes !== undefined) patch.internal_notes = data.internalNotes;

    const { data: updated, error } = await admin
      .from("bookings")
      .update(patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw error;

    // Send transition emails. Never throw on email failure — bookings
    // are the source of truth; emails are best-effort.
    const prevStatus = (prev as Booking).status;
    const newStatus = (updated as Booking).status;
    const booking = updated as Booking;
    if (newStatus !== prevStatus && !booking.is_cleaning && booking.contact_email) {
      const isFakeAirbnbEmail = booking.contact_email.endsWith("@andreashof-breechen.de");
      if (!isFakeAirbnbEmail) {
        if (prevStatus === "requested" && newStatus === "accepted") {
          const tpl = tplAcceptedGuest(booking);
          await sendEmail({ to: booking.contact_email, ...tpl, replyTo: ADMIN_EMAIL });
        } else if (newStatus === "deposit_paid") {
          const tpl = tplDepositPaidGuest(booking);
          await sendEmail({ to: booking.contact_email, ...tpl, replyTo: ADMIN_EMAIL });
        } else if (newStatus === "fully_paid") {
          const tpl = tplFullyPaidGuest(booking);
          await sendEmail({ to: booking.contact_email, ...tpl, replyTo: ADMIN_EMAIL });
        }
      }
    }
  });

/* -----------------------------------------------------------------
 * PUBLIC — create a new booking request from the /reservations form.
 * No auth required; status defaults to 'requested'.
 * -------------------------------------------------------------- */
export const createBookingRequest = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      arrival: string;
      departure: string;
      guests: number;
      children?: number;
      needsCrib?: boolean;
      pets?: number;
      needsWheelchair?: boolean;
      rentsDachboden?: boolean;
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
    const quote = await calculatePricingQuote(admin, {
      arrival: data.arrival,
      departure: data.departure,
      guests: data.guests,
      children: data.children,
      pets: data.pets,
      rentsDachboden: data.rentsDachboden,
    });
    const { data: row, error } = await admin
      .from("bookings")
      .insert({
        source: "web",
        status: "requested",
        arrival: data.arrival,
        departure: data.departure,
        guests: data.guests,
        children: data.children ?? 0,
        needs_crib: (data.children ?? 0) > 0 || !!data.needsCrib,
        pets: Math.max(0, data.pets ?? 0),
        needs_wheelchair: !!data.needsWheelchair,
        rents_dachboden: !!data.rentsDachboden,
        occasion: data.occasion ?? null,
        contact_name: data.name,
        contact_email: data.email,
        contact_phone: data.phone ?? null,
        message: data.message ?? null,
        total_price_cents: quote.totalCents,
        deposit_amount_cents: Math.round(quote.totalCents * 0.5),
      })
      .select("*")
      .single();
    if (error) throw error;

    // Best-effort: confirmation to guest + new-request alert to Andrea.
    // Guest "Reply" goes to Andrea's personal inbox.
    const booking = row as Booking;
    const guestTpl = tplRequestedGuest(booking);
    const adminTpl = tplRequestedAdmin(booking);
    await Promise.all([
      sendEmail({ to: booking.contact_email, ...guestTpl, replyTo: ADMIN_EMAIL }),
      sendEmail({ to: ADMIN_EMAIL, ...adminTpl, replyTo: booking.contact_email }),
    ]);

    return { id: booking.id };
  });

/* -----------------------------------------------------------------
 * PUBLIC — pricing quote for the /reservations widget.
 *   total = Σ(nightly price for each night) + cleaning_fee
 *         + max(0, guests - base_occupancy) × extra_person_fee × nights
 * Nightly price is the base unless the date falls inside a special
 * range, in which case the highest-priority special wins.
 * -------------------------------------------------------------- */
export const getPricingQuote = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      arrival: string;
      departure: string;
      guests: number;
      children?: number;
      needsCrib?: boolean;
      pets?: number;
      rentsDachboden?: boolean;
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!data.arrival || !data.departure || data.arrival >= data.departure) {
      throw new Error("invalid_date_range");
    }
    if (!data.guests || data.guests < 1) throw new Error("invalid_guests");

    const admin = getSupabaseAdmin();
    return calculatePricingQuote(admin, data);
  });

/* -----------------------------------------------------------------
 * PUBLIC — raw booking rows so calendars on the client can compute
 * per-day modifiers (stay full / arrival half / departure half /
 * cleaning buffer / Airbnb cleaning).
 *
 * Each row is the actual booking range. The ±2-day cleaning buffer
 * is intentionally NOT included here — the client computes it so we
 * have flexibility to render arrival/departure as half-circles.
 * -------------------------------------------------------------- */
export const getBlockedRanges = createServerFn({ method: "GET" }).handler(async () => {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("bookings")
    .select("arrival,departure,source,is_cleaning")
    .in("status", ["accepted", "deposit_paid", "fully_paid"]);
  if (error) throw error;
  return (data ?? []) as {
    arrival: string;
    departure: string;
    source: string;
    is_cleaning: boolean;
  }[];
});

/* -----------------------------------------------------------------
 * SETTINGS + manual Airbnb sync
 * -------------------------------------------------------------- */
export const updateAirbnbIcalUrl = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("settings")
      .upsert({ key: "airbnb_ical_url", value: data.url });
    if (error) throw error;
  });

/* -----------------------------------------------------------------
 * GLOBAL FEES (cleaning, base occupancy, extra-person surcharge)
 * Stored as integers (cents / persons) in `settings`.
 * -------------------------------------------------------------- */
export const updateFees = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      cleaningFeeCents?: number;
      baseOccupancy?: number;
      extraPersonFeePerNightCents?: number;
      childCribFeeCents?: number;
      petFeeCents?: number;
      dachbodenFeeCents?: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const admin = getSupabaseAdmin();
    const rows: { key: string; value: number }[] = [];
    const push = (key: string, value: number | undefined) => {
      if (value !== undefined) rows.push({ key, value });
    };
    push("cleaning_fee_cents", data.cleaningFeeCents);
    push("base_occupancy", data.baseOccupancy);
    push("extra_person_fee_per_night_cents", data.extraPersonFeePerNightCents);
    push("child_crib_fee_cents", data.childCribFeeCents);
    push("pet_fee_cents", data.petFeeCents);
    push("dachboden_fee_cents", data.dachbodenFeeCents);
    if (rows.length === 0) return;
    const { error } = await admin.from("settings").upsert(rows);
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
