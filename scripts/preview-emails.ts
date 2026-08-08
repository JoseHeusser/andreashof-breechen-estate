// One-shot preview: send every guest+admin email template with a fake
// booking to a single inbox so Andrea can eyeball each layout.
//
// Run:  npx tsx scripts/preview-emails.ts [to-email]
// Env:  RESEND_API_KEY, EMAIL_FROM

import {
  tplRequestedGuest,
  tplRequestedAdmin,
  tplAcceptedGuest,
  tplDepositPaidGuest,
  tplFullyPaidGuest,
  tplBalanceReminderGuest,
  tplArrivalInstructionsGuest,
} from "../src/lib/email/templates";
import type { Booking } from "../src/lib/supabase/types";

const TO = process.argv[2] || "andrea.lietz@web.de";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Andreashof Breechen <andrea@andreashof-breechen.de>";
if (!RESEND_API_KEY) {
  console.error("missing RESEND_API_KEY");
  process.exit(1);
}

// Fake booking used to fill in placeholder values across every template.
const FAKE: Booking = {
  id: "preview01-1234-5678-abcd-000000000000",
  source: "web",
  status: "requested",
  arrival: "2026-08-15",
  departure: "2026-08-22",
  guests: 12,
  children: 2,
  needs_crib: true,
  pets: 1,
  needs_wheelchair: false,
  rents_dachboden: false,
  is_cleaning: false,
  reminder_balance_sent_at: null,
  reminder_arrival_sent_at: null,
  occasion: "Familienfeier",
  contact_name: "Andrea Lietz",
  contact_email: "andrea.lietz@web.de",
  contact_phone: "+49 172 3813606",
  message: "Bitte prüfen — Test-Anfrage aus dem Vorschau-Skript.",
  total_price_cents: 260000,
  deposit_amount_cents: 130000,
  internal_notes: null,
  airbnb_uid: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const templates = [
  { key: "1_requested_guest", tpl: tplRequestedGuest(FAKE) },
  { key: "2_requested_admin", tpl: tplRequestedAdmin(FAKE) },
  { key: "3_accepted_guest", tpl: tplAcceptedGuest({ ...FAKE, status: "accepted" }) },
  { key: "4_deposit_paid_guest", tpl: tplDepositPaidGuest({ ...FAKE, status: "deposit_paid" }) },
  { key: "5_fully_paid_guest", tpl: tplFullyPaidGuest({ ...FAKE, status: "fully_paid" }) },
  { key: "6_balance_reminder", tpl: tplBalanceReminderGuest({ ...FAKE, status: "deposit_paid" }) },
  {
    key: "7_arrival_instructions",
    tpl: tplArrivalInstructionsGuest({ ...FAKE, status: "fully_paid" }),
  },
];

async function send(subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [TO],
      subject,
      html,
      reply_to: "andrea.lietz@web.de",
    }),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

async function main() {
  console.log(`Sending ${templates.length} preview emails → ${TO}\n`);
  for (const { key, tpl } of templates) {
    const prefixedSubject = `[VORSCHAU · ${key}] ${tpl.subject}`;
    const r = await send(prefixedSubject, tpl.html);
    console.log(`  ${key.padEnd(28)} → ${r.ok ? "ok" : "FAIL " + r.status + " " + r.body}`);
    // Slight pause so Resend doesn't rate-limit.
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
