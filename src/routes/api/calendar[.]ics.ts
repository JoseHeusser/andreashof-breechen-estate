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
        // Only confirmed-or-paid bookings count as "the house is taken".
        // requested = still under review, doesn't block.
        const { data, error } = await admin
          .from("bookings")
          .select("id,arrival,departure,source,status")
          .in("status", ["accepted", "deposit_paid", "fully_paid"]);
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
          lines.push(
            "BEGIN:VEVENT",
            `UID:${b.id}@andreashof-breechen.de`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${b.arrival.replaceAll("-", "")}`,
            `DTEND;VALUE=DATE:${b.departure.replaceAll("-", "")}`,
            `SUMMARY:Reserved (${b.source})`,
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
