// Deno Edge Function — pulls the configured Airbnb iCal feed and reconciles
// the `bookings` table. Called by:
//   • pg_cron hourly
//   • pg_net from the bookings trigger (every insert/update)
//   • Manual button in /admin → Einstellungen
//
// Rate-limited to 30 s via settings.airbnb_last_synced_at.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SYNC_COOLDOWN_MS = 30_000;

interface Setting {
  key: string;
  value: unknown;
}

async function pg<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE,
      authorization: `Bearer ${SERVICE_ROLE}`,
      "content-type": "application/json",
      prefer: init.method && init.method !== "GET" ? "return=representation" : "",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// Tiny iCal parser — extracts VEVENT blocks with UID, DTSTART, DTEND, SUMMARY.
// iCal DATE values for all-day events are exclusive at DTEND, which matches
// our `departure` column (checkout date).
function parseIcal(ics: string) {
  const events: { uid: string; start: string; end: string; summary: string }[] = [];
  const unfolded = ics.replace(/\r?\n[ \t]/g, ""); // line continuations
  const re = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(unfolded))) {
    const block = m[1];
    const uid = pick(block, "UID");
    const start = pickDate(block, "DTSTART");
    const end = pickDate(block, "DTEND");
    const summary = pick(block, "SUMMARY") ?? "Reserved";
    if (uid && start && end) events.push({ uid, start, end, summary });
  }
  return events;
}
function pick(block: string, prop: string) {
  const m = new RegExp(`^${prop}(?:;[^:]*)?:(.+)$`, "m").exec(block);
  return m ? m[1].trim() : null;
}
function pickDate(block: string, prop: string) {
  const raw = pick(block, prop);
  if (!raw) return null;
  // Accepts 20260625 or 20260625T140000Z — we only want the date.
  const d = raw.slice(0, 8);
  if (!/^\d{8}$/.test(d)) return null;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

Deno.serve(async (req) => {
  try {
    const { reason } = await req.json().catch(() => ({ reason: "unknown" }));

    // 1. Load settings
    const settings = await pg<Setting[]>("settings?select=key,value");
    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value])) as Record<
      string,
      unknown
    >;
    const icalUrl = (settingsMap["airbnb_ical_url"] as string | undefined) ?? "";
    if (!icalUrl) {
      return json({ ok: false, reason: "no_ical_url_configured" }, 200);
    }

    // 2. Rate limit
    const lastSyncedAt = settingsMap["airbnb_last_synced_at"] as string | undefined;
    if (lastSyncedAt && reason !== "manual") {
      const ageMs = Date.now() - new Date(lastSyncedAt).getTime();
      if (ageMs < SYNC_COOLDOWN_MS) {
        return json({ ok: true, skipped: "rate_limited", age_ms: ageMs }, 200);
      }
    }

    // 3. Fetch the iCal
    const icsRes = await fetch(icalUrl, {
      headers: { "user-agent": "AndreashofBreechenSync/1.0" },
    });
    if (!icsRes.ok) {
      return json({ ok: false, reason: "fetch_failed", status: icsRes.status }, 200);
    }
    const ics = await icsRes.text();
    const events = parseIcal(ics);

    // 4. Diff against existing airbnb-sourced bookings
    const existing = await pg<{ airbnb_uid: string; id: string; arrival: string; departure: string }[]>(
      "bookings?source=eq.airbnb&select=airbnb_uid,id,arrival,departure",
    );
    const existingByUid = new Map(existing.map((b) => [b.airbnb_uid, b]));

    let inserted = 0;
    let updated = 0;
    let removed = 0;
    const seen = new Set<string>();

    for (const ev of events) {
      seen.add(ev.uid);
      const row = {
        source: "airbnb" as const,
        status: "accepted" as const,
        airbnb_uid: ev.uid,
        arrival: ev.start,
        departure: ev.end,
        guests: 1, // unknown from iCal; we just need a value > 0
        contact_name: ev.summary || "Airbnb Reservation",
        contact_email: `airbnb+${ev.uid}@andreashof-breechen.de`,
      };
      const prior = existingByUid.get(ev.uid);
      if (!prior) {
        await pg("bookings", { method: "POST", body: JSON.stringify(row) });
        inserted++;
      } else if (prior.arrival !== ev.start || prior.departure !== ev.end) {
        await pg(`bookings?airbnb_uid=eq.${encodeURIComponent(ev.uid)}`, {
          method: "PATCH",
          body: JSON.stringify({ arrival: ev.start, departure: ev.end }),
        });
        updated++;
      }
    }

    // Anything in DB but not in current iCal = cancelled on Airbnb's side.
    for (const [uid, b] of existingByUid) {
      if (!seen.has(uid)) {
        await pg(`bookings?id=eq.${b.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "cancelled" }),
        });
        removed++;
      }
    }

    // 5. Stamp last_synced_at
    await pg("settings?key=eq.airbnb_last_synced_at", {
      method: "PATCH",
      body: JSON.stringify({ value: new Date().toISOString() }),
    }).catch(async () => {
      // Row doesn't exist yet — insert it.
      await pg("settings", {
        method: "POST",
        body: JSON.stringify({
          key: "airbnb_last_synced_at",
          value: new Date().toISOString(),
        }),
      });
    });

    return json({ ok: true, inserted, updated, removed, total_events: events.length }, 200);
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
