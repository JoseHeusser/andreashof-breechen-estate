import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// Public iCal feed for Airbnb's "Import calendar" feature.
// Andrea pastes this URL in Airbnb → Listing → Calendar → Sync calendars.
// Airbnb polls it on its own schedule (~2-12h).
export const Route = createFileRoute("/api/calendar.ics")({
  server: {
    handlers: {
      GET: async () => {
        const admin = getSupabaseAdmin();
        // Confirmed-or-paid bookings block the house outright; "requested"
        // (provisional/not yet confirmed) still needs to show up on Airbnb
        // so Andrea doesn't get a double-booking while it's pending.
        const { data, error } = await admin
          .from("bookings")
          .select("id,arrival,departure,source,status,is_cleaning")
          .in("status", ["requested", "accepted", "deposit_paid", "fully_paid"]);
        if (error) {
          return new Response(`error: ${error.message}`, { status: 500 });
        }

        const now = new Date();
        const stamp = toIcsDateTime(now);
        const lines: string[] = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Andreashof Breechen//Booking Calendar//EN",
          "CALSCALE:GREGORIAN",
          "METHOD:PUBLISH",
          "X-WR-CALNAME:Andreashof Breechen — Buchungen",
        ];

        for (const b of data ?? []) {
          // Skip Airbnb-sourced rows — Airbnb already knows about those;
          // re-publishing them would create a loop.
          if (b.source === "airbnb") continue;

          // Same ±2-day prep/cleaning buffer used by the availability
          // checker and the admin calendar (src/lib/agent/tools.ts,
          // src/routes/admin.index.tsx) — cleaning-only rows never get one.
          const arr = isoToDate(b.arrival);
          const dep = isoToDate(b.departure);
          const [eventStart, eventEnd] = b.is_cleaning
            ? [arr, dep]
            : [addDays(arr, -2), addDays(dep, 2)];

          const summary =
            b.status === "requested"
              ? `Reserviert für Andreashof (Anfrage, ${b.source})`
              : `Reserved (${b.source})`;

          lines.push(
            "BEGIN:VEVENT",
            `UID:${b.id}@andreashof-breechen.de`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${dateToIcsDate(eventStart)}`,
            `DTEND;VALUE=DATE:${dateToIcsDate(eventEnd)}`,
            `SUMMARY:${summary}`,
            "TRANSP:OPAQUE",
            "END:VEVENT",
          );
        }
        lines.push("END:VCALENDAR");

        return new Response(lines.join("\r\n") + "\r\n", {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Cache-Control": "public, max-age=300",
            "Content-Disposition": 'inline; filename="andreashof-breechen.ics"',
          },
        });
      },
    },
  },
});

function toIcsDateTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function isoToDate(s: string): Date {
  return new Date(s + "T00:00:00Z");
}
function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + n);
  return next;
}
function dateToIcsDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}
