// Daily cron — runs once per day (Berlin morning) via pg_cron.
// Sends two kinds of emails:
//   1. Restzahlung-Erinnerung: status=deposit_paid AND arrival = today + 3 days
//      and not already reminded
//   2. Anreise-Instruktionen: status=fully_paid AND arrival = today + 2 days
//      and not already sent
// Both flags persist in the booking row so we don't double-send.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "Andreashof Breechen <andrea@andreashof-breechen.de>";
// Guest "Reply" goes here so it doesn't bounce off the brand domain.
const REPLY_TO = Deno.env.get("EMAIL_TO_ADMIN") ?? "andrea.lietz@web.de";

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

interface BookingRow {
  id: string;
  arrival: string;
  departure: string;
  contact_name: string;
  contact_email: string;
  status: string;
  total_price_cents: number | null;
  is_cleaning: boolean;
  reminder_balance_sent_at: string | null;
  reminder_arrival_sent_at: string | null;
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
  if (!res.ok) throw new Error(`Supabase ${path} → ${res.status}: ${await res.text()}`);
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

async function sendResend(to: string, subject: string, html: string): Promise<boolean> {
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

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function formatPrice(cents: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
function salutation(b: BookingRow): string {
  const name = b.contact_name?.trim();
  return name ? `Liebe/r ${escapeHtml(name)},` : "Liebe Gäste,";
}

function shell(title: string, body: string) {
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
          <a href="mailto:willkommen@andreashof-breechen.de" style="color:${COLORS.sageDeep};text-decoration:none;">willkommen@andreashof-breechen.de</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function balanceReminderHtml(b: BookingRow): string {
  const balance = b.total_price_cents != null ? formatPrice(Math.round(b.total_price_cents * 0.5)) : "die Restzahlung";
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

function arrivalInstructionsHtml(b: BookingRow): string {
  const body = `
    <h1 style="margin:0 0 18px;font-size:24px;font-weight:300;font-style:italic;">Wir freuen uns auf Sie.</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${salutation(b)}</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">in wenigen Tagen heißen wir Sie auf dem Andreashof Breechen willkommen. Hier alle Informationen für Ihre Anreise am <strong>${formatDate(b.arrival)}</strong>:</p>
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Adresse</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Andreashof Breechen<br>Peenestraße 16<br>17506 Gützkow</p>
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Anreise</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Check-in ab <strong>14:00 Uhr</strong>. Bitte geben Sie uns kurz Bescheid, wann Sie voraussichtlich eintreffen — per E-Mail an <a href="mailto:willkommen@andreashof-breechen.de" style="color:${COLORS.sageDeep};">willkommen@andreashof-breechen.de</a> oder per WhatsApp an <a href="tel:+491723813606" style="color:${COLORS.sageDeep};">+49 172 3813606</a>.</p>
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Vor Ort</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Der Schlüssel liegt im Schlüsselsafe bereit — den Code finden Sie weiter unten in dieser E-Mail. Vor und neben dem Gutshaus gibt es genügend Parkplätze für Ihre Fahrzeuge.</p>
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Abreise</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Check-out bis <strong>11:00 Uhr</strong> am ${formatDate(b.departure)}. Bitte bringen Sie die Schlüssel auf den Esstisch, alles Weitere übernehmen wir.</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.6;">Sollten Sie irgendwelche Fragen haben — vor, während oder nach Ihrem Aufenthalt — sind wir jederzeit für Sie da.</p>
    <p style="margin:18px 0 0;font-size:15px;line-height:1.6;">Herzliche Grüße<br><em style="color:${COLORS.sageDeep};">${SIGNATURE}</em></p>
  `;
  return shell("Anreise zum Andreashof", body);
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async () => {
  try {
    const target3 = todayPlus(3); // balance reminder
    const target2 = todayPlus(2); // arrival instructions

    // Pull both buckets in parallel.
    const select = "id,arrival,departure,contact_name,contact_email,status,total_price_cents,is_cleaning,reminder_balance_sent_at,reminder_arrival_sent_at";
    const [balanceCandidates, arrivalCandidates] = await Promise.all([
      pg<BookingRow[]>(`bookings?status=eq.deposit_paid&arrival=eq.${target3}&is_cleaning=eq.false&select=${select}`),
      pg<BookingRow[]>(`bookings?status=eq.fully_paid&arrival=eq.${target2}&is_cleaning=eq.false&select=${select}`),
    ]);

    let sentBalance = 0;
    let sentArrival = 0;

    for (const b of balanceCandidates) {
      if (b.reminder_balance_sent_at) continue;
      if (b.contact_email.endsWith("@andreashof-breechen.de")) continue;
      const ok = await sendResend(b.contact_email, "Erinnerung: Restzahlung für Ihren Aufenthalt", balanceReminderHtml(b));
      if (ok) {
        await pg(`bookings?id=eq.${b.id}`, {
          method: "PATCH",
          body: JSON.stringify({ reminder_balance_sent_at: new Date().toISOString() }),
        });
        sentBalance++;
      }
    }

    for (const b of arrivalCandidates) {
      if (b.reminder_arrival_sent_at) continue;
      if (b.contact_email.endsWith("@andreashof-breechen.de")) continue;
      const ok = await sendResend(b.contact_email, "Anreise zum Andreashof — alle Informationen", arrivalInstructionsHtml(b));
      if (ok) {
        await pg(`bookings?id=eq.${b.id}`, {
          method: "PATCH",
          body: JSON.stringify({ reminder_arrival_sent_at: new Date().toISOString() }),
        });
        sentArrival++;
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        target_balance: target3,
        target_arrival: target2,
        candidates: { balance: balanceCandidates.length, arrival: arrivalCandidates.length },
        sent: { balance: sentBalance, arrival: sentArrival },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
