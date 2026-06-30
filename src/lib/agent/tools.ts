import type Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// ─── Tool definitions sent to Claude ────────────────────────────────────────
export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: "check_availability",
    description:
      "Check whether a given date range is available for booking. Pulls the live booking database — Airbnb sync + web bookings + 2-day cleaning buffer included. Returns 'available' or 'unavailable' plus the days that overlap if any.",
    input_schema: {
      type: "object",
      properties: {
        arrival: { type: "string", description: "Arrival date in YYYY-MM-DD format" },
        departure: { type: "string", description: "Departure date in YYYY-MM-DD format (exclusive — the day the guest leaves in the morning)" },
      },
      required: ["arrival", "departure"],
    },
  },
  {
    name: "get_pricing_quote",
    description:
      "Calculate the total price for a stay using the live pricing rules (base + special date ranges + cleaning + extra-person surcharge + small-child crib + pets + Dachboden). Always use this — never compute prices yourself.",
    input_schema: {
      type: "object",
      properties: {
        arrival: { type: "string", description: "YYYY-MM-DD" },
        departure: { type: "string", description: "YYYY-MM-DD" },
        guests: { type: "number", description: "Total adults + older children" },
        children: { type: "number", description: "Small children under 2 needing a crib (each adds the crib fee)" },
        pets: { type: "number", description: "Number of dogs" },
        rents_dachboden: { type: "boolean", description: "True if the attic yoga centre is also being rented" },
      },
      required: ["arrival", "departure", "guests"],
    },
  },
  {
    name: "create_booking_request",
    description:
      "Submit a real booking request. Sends Andrea an email with the details and the guest a confirmation. The request lands as status='requested' — Andrea reviews and confirms within 12 hours. Use only after the guest has explicitly confirmed they want to book and all required fields are present.",
    input_schema: {
      type: "object",
      properties: {
        arrival: { type: "string", description: "YYYY-MM-DD" },
        departure: { type: "string", description: "YYYY-MM-DD" },
        guests: { type: "number", description: "Adults + older children" },
        children: { type: "number", description: "Small children (under 2). Default 0." },
        needs_crib: { type: "boolean", description: "True if a crib is needed for the small children" },
        pets: { type: "number", description: "Number of dogs. Default 0." },
        needs_wheelchair: { type: "boolean", description: "True if accessibility on ground floor required" },
        rents_dachboden: { type: "boolean", description: "True if the yoga attic is to be rented" },
        occasion: {
          type: "string",
          enum: ["wedding", "family", "retreat", "other"],
          description: "What is the stay for",
        },
        name: { type: "string", description: "Full name of the booker" },
        email: { type: "string", description: "Contact email" },
        phone: { type: "string", description: "Optional phone number" },
        message: { type: "string", description: "Optional note for Andrea" },
      },
      required: ["arrival", "departure", "guests", "name", "email"],
    },
  },
];

// ─── Tool execution ─────────────────────────────────────────────────────────
// Run inline (no HTTP roundtrip) so the chat endpoint stays fast.

export async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "check_availability":
        return await checkAvailability(input as { arrival: string; departure: string });
      case "get_pricing_quote":
        return await getPricingQuote(
          input as {
            arrival: string;
            departure: string;
            guests: number;
            children?: number;
            pets?: number;
            rents_dachboden?: boolean;
          },
        );
      case "create_booking_request":
        return await createBookingRequest(input as CreateBookingInput);
      default:
        return JSON.stringify({ error: `unknown tool: ${name}` });
    }
  } catch (e) {
    return JSON.stringify({
      error: e instanceof Error ? e.message : "tool execution failed",
    });
  }
}

// ─── check_availability ─────────────────────────────────────────────────────
async function checkAvailability(input: { arrival: string; departure: string }): Promise<string> {
  if (!isValidDate(input.arrival) || !isValidDate(input.departure)) {
    return JSON.stringify({ error: "invalid date format — use YYYY-MM-DD" });
  }
  if (input.arrival >= input.departure) {
    return JSON.stringify({ error: "departure must be after arrival" });
  }
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("bookings")
    .select("arrival,departure,is_cleaning,status")
    .in("status", ["accepted", "deposit_paid", "fully_paid"]);
  if (error) return JSON.stringify({ error: "could not query bookings" });

  // Build set of blocked dates (including ±2 buffer around each stay).
  const blocked = new Set<string>();
  for (const b of data ?? []) {
    const arr = isoToDate(b.arrival as string);
    const dep = isoToDate(b.departure as string);
    const nights = Math.max(1, Math.round((dep.getTime() - arr.getTime()) / 86400000));
    // is_cleaning entries → block as-is, no buffer
    if (b.is_cleaning) {
      for (let i = 0; i < nights; i++) blocked.add(dateToIso(addDays(arr, i)));
      continue;
    }
    // Real reservation: block all nights + departure + 2 days each side
    for (let i = 0; i < nights; i++) blocked.add(dateToIso(addDays(arr, i)));
    blocked.add(dateToIso(dep));
    blocked.add(dateToIso(addDays(arr, -1)));
    blocked.add(dateToIso(addDays(arr, -2)));
    blocked.add(dateToIso(addDays(dep, 1)));
    blocked.add(dateToIso(addDays(dep, 2)));
  }

  // Check requested range
  const reqArr = isoToDate(input.arrival);
  const reqDep = isoToDate(input.departure);
  const reqNights = Math.max(1, Math.round((reqDep.getTime() - reqArr.getTime()) / 86400000));
  const overlaps: string[] = [];
  for (let i = 0; i < reqNights; i++) {
    const iso = dateToIso(addDays(reqArr, i));
    if (blocked.has(iso)) overlaps.push(iso);
  }
  return JSON.stringify({
    available: overlaps.length === 0,
    arrival: input.arrival,
    departure: input.departure,
    nights: reqNights,
    overlapping_blocked_days: overlaps,
  });
}

// ─── get_pricing_quote ──────────────────────────────────────────────────────
async function getPricingQuote(input: {
  arrival: string;
  departure: string;
  guests: number;
  children?: number;
  pets?: number;
  rents_dachboden?: boolean;
}): Promise<string> {
  if (!isValidDate(input.arrival) || !isValidDate(input.departure)) {
    return JSON.stringify({ error: "invalid date format — use YYYY-MM-DD" });
  }
  if (input.arrival >= input.departure) {
    return JSON.stringify({ error: "departure must be after arrival" });
  }
  if (!input.guests || input.guests < 1) {
    return JSON.stringify({ error: "guests must be >= 1" });
  }
  const admin = getSupabaseAdmin();
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
  if (pricingRes.error || settingsRes.error) {
    return JSON.stringify({ error: "could not load pricing" });
  }
  const settings = Object.fromEntries(
    (settingsRes.data ?? []).map((s) => [s.key, s.value as number]),
  );
  const cleaning = (settings.cleaning_fee_cents as number) ?? 0;
  const baseOccupancy = (settings.base_occupancy as number) ?? 10;
  const extraPerNight = (settings.extra_person_fee_per_night_cents as number) ?? 0;
  const cribFee = (settings.child_crib_fee_cents as number) ?? 0;
  const petFee = (settings.pet_fee_cents as number) ?? 0;
  const dachbodenFee = (settings.dachboden_fee_cents as number) ?? 0;

  const base = (pricingRes.data ?? []).find((p) => p.type === "base");
  const baseCents = base?.price_per_night_cents ?? 0;
  const specials = (pricingRes.data ?? [])
    .filter((p) => p.type === "special")
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  let nightlySum = 0;
  let nights = 0;
  const start = isoToDate(input.arrival);
  const end = isoToDate(input.departure);
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const special = specials.find(
      (s) => s.start_date && s.end_date && iso >= s.start_date && iso <= s.end_date,
    );
    nightlySum += special ? special.price_per_night_cents : baseCents;
    nights++;
  }
  const extraGuests = Math.max(0, input.guests - baseOccupancy);
  const extraTotal = extraGuests * extraPerNight * nights;
  const cribTotal = input.children && input.children > 0 ? input.children * cribFee : 0;
  const petTotal = input.pets && input.pets > 0 ? input.pets * petFee : 0;
  const dachbodenTotal = input.rents_dachboden ? dachbodenFee : 0;
  const totalCents =
    nightlySum + cleaning + extraTotal + cribTotal + petTotal + dachbodenTotal;

  return JSON.stringify({
    nights,
    total_eur: Math.round(totalCents / 100),
    breakdown: {
      nightly: Math.round(nightlySum / 100),
      cleaning: Math.round(cleaning / 100),
      extra_guests: Math.round(extraTotal / 100),
      crib: Math.round(cribTotal / 100),
      pets: Math.round(petTotal / 100),
      dachboden: Math.round(dachbodenTotal / 100),
    },
    notes: "Total in EUR. 50 % deposit due within 24h of confirmation. 50 % balance 2 days before arrival.",
  });
}

// ─── create_booking_request ─────────────────────────────────────────────────
interface CreateBookingInput {
  arrival: string;
  departure: string;
  guests: number;
  children?: number;
  needs_crib?: boolean;
  pets?: number;
  needs_wheelchair?: boolean;
  rents_dachboden?: boolean;
  occasion?: "wedding" | "family" | "retreat" | "other";
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

async function createBookingRequest(input: CreateBookingInput): Promise<string> {
  if (!isValidDate(input.arrival) || !isValidDate(input.departure)) {
    return JSON.stringify({ error: "invalid date format" });
  }
  if (input.arrival >= input.departure) {
    return JSON.stringify({ error: "departure must be after arrival" });
  }
  if (input.guests < 1 || input.guests > 30) {
    return JSON.stringify({ error: "invalid guest count" });
  }
  if (!input.name?.trim() || !input.email?.trim()) {
    return JSON.stringify({ error: "name and email required" });
  }

  // Import lazily to avoid pulling email + Resend into the bundle when the
  // tool route is loaded without booking intent.
  const { sendEmail, ADMIN_EMAIL } = await import("@/lib/email/client");
  const { tplRequestedGuest, tplRequestedAdmin } = await import("@/lib/email/templates");

  const admin = getSupabaseAdmin();
  const { data: row, error } = await admin
    .from("bookings")
    .insert({
      source: "web",
      status: "requested",
      arrival: input.arrival,
      departure: input.departure,
      guests: input.guests,
      children: input.children ?? 0,
      needs_crib: !!input.needs_crib,
      pets: Math.max(0, input.pets ?? 0),
      needs_wheelchair: !!input.needs_wheelchair,
      rents_dachboden: !!input.rents_dachboden,
      occasion: input.occasion ?? null,
      contact_name: input.name,
      contact_email: input.email,
      contact_phone: input.phone ?? null,
      message: input.message
        ? `${input.message}\n\n— eingereicht über den Andreashof-Chat`
        : "— eingereicht über den Andreashof-Chat",
    })
    .select("*")
    .single();
  if (error) {
    return JSON.stringify({ error: `could not create booking: ${error.message}` });
  }

  // Fire emails — same as the public form path.
  const booking = row as Parameters<typeof tplRequestedGuest>[0];
  const guestTpl = tplRequestedGuest(booking);
  const adminTpl = tplRequestedAdmin(booking);
  await Promise.all([
    sendEmail({ to: booking.contact_email, ...guestTpl, replyTo: ADMIN_EMAIL }),
    sendEmail({ to: ADMIN_EMAIL, ...adminTpl, replyTo: booking.contact_email }),
  ]);

  return JSON.stringify({
    success: true,
    booking_id: booking.id,
    message:
      "Buchungsanfrage angelegt. Bestätigung an den Gast und Benachrichtigung an Andrea verschickt.",
  });
}

// ─── helpers ────────────────────────────────────────────────────────────────
function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
function isoToDate(s: string): Date {
  return new Date(s + "T00:00:00Z");
}
function dateToIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + n);
  return next;
}
