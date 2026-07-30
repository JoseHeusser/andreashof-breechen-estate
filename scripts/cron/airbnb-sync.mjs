#!/usr/bin/env node
// Airbnb iCal → Supabase bookings reconciler.
// Runs on GitHub Actions (see .github/workflows/cron-airbnb-sync.yml).
// Ported from supabase/functions/airbnb-sync/index.ts on 2026-07-30 to
// escape a stuck pg_net on the Supabase side.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

const SUPABASE_URL = mustEnv("SUPABASE_URL");
const SERVICE_ROLE = mustEnv("SUPABASE_SERVICE_ROLE_KEY");

function mustEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`::error::missing env var ${name}`);
    process.exit(1);
  }
  return v;
}

async function pg(path, init = {}) {
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
    const body = await res.text();
    throw new Error(`Supabase ${path} → ${res.status}: ${body}`);
  }
  return res.status === 204 ? undefined : res.json();
}

// Tiny iCal parser — extracts VEVENT blocks with UID, DTSTART, DTEND, SUMMARY.
// All-day DTEND is exclusive → matches our `departure` (checkout) column.
function parseIcal(ics) {
  const events = [];
  const unfolded = ics.replace(/\r?\n[ \t]/g, "");
  const re = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let m;
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
function pick(block, prop) {
  const m = new RegExp(`^${prop}(?:;[^:]*)?:(.+)$`, "m").exec(block);
  return m ? m[1].trim() : null;
}
function pickDate(block, prop) {
  const raw = pick(block, prop);
  if (!raw) return null;
  const d = raw.slice(0, 8);
  if (!/^\d{8}$/.test(d)) return null;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

async function main() {
  // 1. Load settings
  const settings = await pg("settings?select=key,value");
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const icalUrl = settingsMap["airbnb_ical_url"];
  if (!icalUrl) {
    console.log(JSON.stringify({ ok: false, reason: "no_ical_url_configured" }));
    return;
  }

  // 2. Fetch iCal
  const icsRes = await fetch(icalUrl, {
    headers: { "user-agent": "AndreashofBreechenSync/1.0" },
  });
  if (!icsRes.ok) {
    console.log(JSON.stringify({ ok: false, reason: "fetch_failed", status: icsRes.status }));
    process.exitCode = 1;
    return;
  }
  const ics = await icsRes.text();
  const events = parseIcal(ics);

  // 3. Diff against existing airbnb-sourced bookings
  const existing = await pg(
    "bookings?source=eq.airbnb&select=airbnb_uid,id,arrival,departure",
  );
  const existingByUid = new Map(existing.map((b) => [b.airbnb_uid, b]));

  let inserted = 0;
  let updated = 0;
  let removed = 0;
  const seen = new Set();

  for (const ev of events) {
    seen.add(ev.uid);
    const isCleaning = /not available/i.test(ev.summary);
    const row = {
      source: "airbnb",
      status: "accepted",
      is_cleaning: isCleaning,
      airbnb_uid: ev.uid,
      arrival: ev.start,
      departure: ev.end,
      guests: 1,
      contact_name: isCleaning ? "🧹 Reinigungstag" : ev.summary || "Airbnb Reservation",
      contact_email: `airbnb+${ev.uid}@andreashof-breechen.de`,
    };
    const prior = existingByUid.get(ev.uid);
    if (!prior) {
      await pg("bookings", { method: "POST", body: JSON.stringify(row) });
      inserted++;
    } else {
      await pg(`bookings?airbnb_uid=eq.${encodeURIComponent(ev.uid)}`, {
        method: "PATCH",
        body: JSON.stringify({
          arrival: ev.start,
          departure: ev.end,
          is_cleaning: isCleaning,
          contact_name: isCleaning ? "🧹 Reinigungstag" : ev.summary || "Airbnb Reservation",
        }),
      });
      if (prior.arrival !== ev.start || prior.departure !== ev.end) updated++;
    }
  }

  // Anything in DB but not in current iCal = cancelled on Airbnb's side
  for (const [uid, b] of existingByUid) {
    if (!seen.has(uid)) {
      await pg(`bookings?id=eq.${b.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });
      removed++;
    }
  }

  // 4. Stamp last_synced_at (upsert)
  const stamp = new Date().toISOString();
  const patchRes = await pg("settings?key=eq.airbnb_last_synced_at", {
    method: "PATCH",
    body: JSON.stringify({ value: stamp }),
  }).catch(() => null);
  if (!patchRes || patchRes.length === 0) {
    await pg("settings", {
      method: "POST",
      body: JSON.stringify({ key: "airbnb_last_synced_at", value: stamp }),
    }).catch(() => {
      /* ignore — someone else may have raced us */
    });
  }

  console.log(
    JSON.stringify({
      ok: true,
      inserted,
      updated,
      removed,
      total_events: events.length,
    }),
  );
}

main().catch((e) => {
  console.error("::error::" + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
