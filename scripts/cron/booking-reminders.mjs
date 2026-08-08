#!/usr/bin/env node
// Daily reminder emails:
//   1. Restzahlung-Erinnerung: status=deposit_paid AND arrival = today + 3 days
//   2. Anreise-Instruktionen:  status=fully_paid  AND arrival = today + 1 day
// Ported from supabase/functions/booking-reminders/index.ts.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, EMAIL_FROM,
//      EMAIL_TO_ADMIN (reply-to), optional KEYBOX_CODE.

const SUPABASE_URL = mustEnv("SUPABASE_URL");
const SERVICE_ROLE = mustEnv("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = mustEnv("RESEND_API_KEY");
const EMAIL_FROM = process.env.EMAIL_FROM || "Andreashof Breechen <andrea.lietz@web.de>";
const REPLY_TO = process.env.EMAIL_TO_ADMIN || "andrea.lietz@web.de";
const KEYBOX_CODE = (process.env.KEYBOX_CODE || "").trim();

const BANK = {
  holder: "Andreashof Breechen",
  iban: "DE78 1005 0000 0190 9484 85",
  bic: "BELADEBEXXX",
  bank: "Berliner Sparkasse",
};
const COLORS = {
  bg: "#F4EFE6",
  card: "#FBFAF6",
  fg: "#2C2A26",
  muted: "#6B6960",
  border: "#D8D2C5",
  sage: "#7A8B72",
  sageDeep: "#556A50",
};
const SIGNATURE = "Andrea & Andreas & das Andreashof-Team";

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
    throw new Error(`Supabase ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.status === 204 ? undefined : res.json();
}

async function sendResend(to, subject, html) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html, reply_to: REPLY_TO }),
    });
    if (!res.ok) {
      console.error("resend", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("resend threw", e);
    return false;
  }
}

// ─── formatting helpers ─────────────────────────────────────────────────────
function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function formatPrice(cents) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}
function salutation(b) {
  const name = b.contact_name?.trim();
  return name ? `Liebe/r ${escapeHtml(name)},` : "Liebe Gäste,";
}

function keyboxCodeBlock() {
  if (!KEYBOX_CODE) {
    return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Den aktuellen Schlüsselbox-Code erhalten Sie in einer separaten Nachricht einen Tag vor Anreise.</p>`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;padding:16px;background:${COLORS.bg};border:1px solid ${COLORS.border};width:100%;">
      <tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;width:140px;">Schlüsselbox-Code</td><td style="padding:4px 0;font-size:20px;font-family:monospace;font-weight:600;letter-spacing:0.08em;">${escapeHtml(KEYBOX_CODE)}</td></tr>
    </table>`;
}

function shell(title, body) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${COLORS.fg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.bg};padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${COLORS.card};border:1px solid ${COLORS.border};">
        <tr><td style="padding:36px 40px 8px;">
          <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${COLORS.muted};">Andreashof Breechen</p>
          <p style="margin:6px 0 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${COLORS.muted};">Vorpommern · Est. 1782</p>
        </td></tr>
        <tr><td style="padding:24px 40px 40px;">${body}</td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid ${COLORS.border};font-size:11px;color:${COLORS.muted};">
          Andreashof Breechen · Peenestraße 16 · 17506 Gützkow<br>
          <a href="mailto:andrea.lietz@web.de" style="color:${COLORS.sageDeep};text-decoration:none;">andrea.lietz@web.de</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ─── email templates ────────────────────────────────────────────────────────
function balanceReminderHtml(b) {
  const balance =
    b.total_price_cents != null
      ? formatPrice(Math.round(b.total_price_cents * 0.5))
      : "die Restzahlung";
  const body = `
    <h1 style="margin:0 0 18px;font-size:22px;font-weight:300;">Freundliche Erinnerung</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${salutation(b)}</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Ihre Anreise am <strong>${formatDate(b.arrival)}</strong> rückt näher — wir freuen uns! Bitte überweisen Sie die <strong>Restzahlung von ${balance}</strong> in den nächsten 24 Stunden, damit alles für Ihren Aufenthalt vorbereitet ist.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;padding:14px;background:${COLORS.bg};border:1px solid ${COLORS.border};width:100%;font-size:13px;">
      <tr><td style="padding:3px 0;color:${COLORS.muted};width:120px;">IBAN</td><td style="padding:3px 0;font-family:monospace;">${BANK.iban}</td></tr>
      <tr><td style="padding:3px 0;color:${COLORS.muted};">BIC</td><td style="padding:3px 0;font-family:monospace;">${BANK.bic}</td></tr>
      <tr><td style="padding:3px 0;color:${COLORS.muted};">Verwendungszweck</td><td style="padding:3px 0;">Restzahlung ${b.id.slice(0, 8)}</td></tr>
    </table>
    <p style="margin:18px 0 0;font-size:14px;color:${COLORS.muted};line-height:1.6;">Sollten Sie bereits überwiesen haben, betrachten Sie diese Erinnerung bitte als gegenstandslos.</p>
    <p style="margin:18px 0 0;font-size:15px;line-height:1.6;">Herzliche Grüße<br><em style="color:${COLORS.sageDeep};">${SIGNATURE}</em></p>
  `;
  return shell("Erinnerung: Restzahlung", body);
}

function arrivalInstructionsHtml(b) {
  const body = `
    <h1 style="margin:0 0 18px;font-size:24px;font-weight:300;font-style:italic;">Wir freuen uns auf Sie.</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${salutation(b)}</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">morgen heißen wir Sie auf dem Andreashof Breechen willkommen. Hier alle Informationen für Ihre Anreise am <strong>${formatDate(b.arrival)}</strong>:</p>
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Adresse</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Andreashof Breechen<br>Peenestraße 16<br>17506 Gützkow</p>
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Anreise</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Check-in ab <strong>14:00 Uhr</strong> über die Schlüsselbox. Bei Fragen erreichen Sie uns per E-Mail an <a href="mailto:andrea.lietz@web.de" style="color:${COLORS.sageDeep};">andrea.lietz@web.de</a> oder per WhatsApp an <a href="tel:+491723813606" style="color:${COLORS.sageDeep};">+49 172 3813606</a>.</p>
    ${keyboxCodeBlock()}
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Vor Ort</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Der Schlüssel liegt in der Schlüsselbox bereit. Vor und neben dem Gutshaus gibt es genügend Parkplätze für Ihre Fahrzeuge. Hausvater Gunter ist am ersten Abend vor Ort, um bei Bedarf auftretende Fragen zu beantworten.</p>
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Abreise</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Check-out bis <strong>11:00 Uhr</strong> am ${formatDate(b.departure)}. Bitte bringen Sie die Schlüssel auf den Esstisch, alles Weitere übernehmen wir.</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.6;">Sollten Sie irgendwelche Fragen haben — vor, während oder nach Ihrem Aufenthalt — sind wir jederzeit für Sie da.</p>
    <p style="margin:18px 0 0;font-size:15px;line-height:1.6;">Herzliche Grüße<br><em style="color:${COLORS.sageDeep};">${SIGNATURE}</em></p>
  `;
  return shell("Anreise zum Andreashof", body);
}

// ─── main ───────────────────────────────────────────────────────────────────
function todayPlus(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const target3 = todayPlus(3); // balance reminder
  const target1 = todayPlus(1); // arrival instructions

  const select =
    "id,arrival,departure,contact_name,contact_email,status,total_price_cents,is_cleaning,reminder_balance_sent_at,reminder_arrival_sent_at";
  const [balanceCandidates, arrivalCandidates] = await Promise.all([
    pg(
      `bookings?status=eq.deposit_paid&arrival=eq.${target3}&is_cleaning=eq.false&select=${select}`,
    ),
    pg(
      `bookings?status=eq.fully_paid&arrival=eq.${target1}&is_cleaning=eq.false&select=${select}`,
    ),
  ]);

  let sentBalance = 0;
  let sentArrival = 0;

  for (const b of balanceCandidates) {
    if (b.reminder_balance_sent_at) continue;
    if (b.contact_email.endsWith("@andreashof-breechen.de")) continue;
    const ok = await sendResend(
      b.contact_email,
      "Erinnerung: Restzahlung für Ihren Aufenthalt",
      balanceReminderHtml(b),
    );
    if (ok) {
      await pg(`bookings?id=eq.${b.id}`, {
        method: "PATCH",
        body: JSON.stringify({ reminder_balance_sent_at: new Date().toISOString() }),
      });
      sentBalance++;
    }
  }

  // Arrival instructions are sent MANUALLY by Andrea (Schlüsselbox code
  // handoff needs a human touch). This loop is intentionally disabled.
  // The template + helper stay in the file so we can re-enable later.
  //
  // for (const b of arrivalCandidates) { … } — see git history if needed.
  void arrivalCandidates;
  void arrivalInstructionsHtml;

  console.log(
    JSON.stringify({
      ok: true,
      target_balance: target3,
      target_arrival: target1,
      candidates: { balance: balanceCandidates.length, arrival: arrivalCandidates.length },
      sent: { balance: sentBalance, arrival: sentArrival },
    }),
  );
}

main().catch((e) => {
  console.error("::error::" + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
