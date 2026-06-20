import { SITE_URL } from "./client";
import type { Booking } from "@/lib/supabase/types";

// Bank details — hard-coded for now. If Andrea wants to edit them later,
// move to the settings table and pass into each template.
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

function shell(title: string, body: string) {
  // Inline-styled email shell. Email clients only support a tiny subset
  // of CSS so everything goes inline.
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${COLORS.fg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.bg};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${COLORS.card};border:1px solid ${COLORS.border};">
          <tr>
            <td style="padding:36px 40px 8px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${COLORS.muted};">Andreashof Breechen</p>
              <p style="margin:6px 0 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${COLORS.muted};">Vorpommern · Est. 1782</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 40px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid ${COLORS.border};font-size:11px;color:${COLORS.muted};">
              Andreashof Breechen · Peenestraße 16 · 17506 Gützkow<br>
              <a href="mailto:willkommen@andreashof-breechen.de" style="color:${COLORS.sageDeep};text-decoration:none;">willkommen@andreashof-breechen.de</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function formatDate(iso: string): string {
  // 2026-08-21 → 21.08.2026
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function nightCount(arrival: string, departure: string): number {
  const a = new Date(arrival + "T00:00:00Z");
  const d = new Date(departure + "T00:00:00Z");
  return Math.max(1, Math.round((d.getTime() - a.getTime()) / 86400000));
}

function formatPrice(cents: number | null): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

function bookingSummary(b: Booking): string {
  const nights = nightCount(b.arrival, b.departure);
  const lines: string[] = [];
  lines.push(`<tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;width:140px;">Anreise</td><td style="padding:4px 0;font-size:14px;">${formatDate(b.arrival)}</td></tr>`);
  lines.push(`<tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">Abreise</td><td style="padding:4px 0;font-size:14px;">${formatDate(b.departure)} <span style="color:${COLORS.muted};">(${nights} ${nights === 1 ? "Nacht" : "Nächte"})</span></td></tr>`);
  lines.push(`<tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">Gäste</td><td style="padding:4px 0;font-size:14px;">${b.guests}</td></tr>`);
  if (b.children > 0) lines.push(`<tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">Kleinkinder</td><td style="padding:4px 0;font-size:14px;">${b.children}${b.needs_crib ? " · Bett/Babybett" : ""}</td></tr>`);
  if (b.pets > 0) lines.push(`<tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">Haustiere</td><td style="padding:4px 0;font-size:14px;">${b.pets}</td></tr>`);
  if (b.needs_wheelchair) lines.push(`<tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">Barrierefrei</td><td style="padding:4px 0;font-size:14px;">EG vorbereiten</td></tr>`);
  if (b.rents_dachboden) lines.push(`<tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">Dachboden</td><td style="padding:4px 0;font-size:14px;">inkl. Yoga-Zentrum</td></tr>`);
  if (b.occasion) lines.push(`<tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">Anlass</td><td style="padding:4px 0;font-size:14px;">${escapeHtml(b.occasion)}</td></tr>`);
  if (b.total_price_cents != null) lines.push(`<tr><td style="padding:8px 0 4px;color:${COLORS.muted};font-size:13px;border-top:1px solid ${COLORS.border};">Gesamtpreis</td><td style="padding:8px 0 4px;font-size:18px;font-weight:500;border-top:1px solid ${COLORS.border};">${formatPrice(b.total_price_cents)}</td></tr>`);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:20px 0;">${lines.join("")}</table>`;
}

function ctaButton(label: string, href: string, color = COLORS.fg): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 24px;background:${color};color:#fff;text-decoration:none;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;border:1px solid ${color};">${escapeHtml(label)}</a>`;
}

// ═══════════════════════════════════════════════════════════════
//  1) Booking request → guest
// ═══════════════════════════════════════════════════════════════
export function tplRequestedGuest(b: Booking) {
  const subject = `Wir haben Ihre Anfrage erhalten — Andreashof Breechen`;
  const body = `
    <h1 style="margin:0 0 18px;font-size:24px;font-weight:300;font-style:italic;">Wir haben Ihre Anfrage erhalten.</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Liebe Gäste,</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">vielen Dank für Ihre Reservierungsanfrage für den Andreashof Breechen. Wir prüfen Ihre Anfrage und melden uns <strong>innerhalb von 12 Stunden</strong> persönlich bei Ihnen.</p>
    ${bookingSummary(b)}
    <p style="margin:18px 0 6px;font-size:13px;color:${COLORS.muted};">Bei Fragen erreichen Sie uns jederzeit unter <a href="mailto:willkommen@andreashof-breechen.de" style="color:${COLORS.sageDeep};">willkommen@andreashof-breechen.de</a>.</p>
    <p style="margin:18px 0 0;font-size:15px;line-height:1.6;">Herzliche Grüße<br><em style="color:${COLORS.sageDeep};">Andrea & das Andreashof-Team</em></p>
  `;
  return { subject, html: shell(subject, body) };
}

// ═══════════════════════════════════════════════════════════════
//  2) Booking request → admin (Andrea)
// ═══════════════════════════════════════════════════════════════
export function tplRequestedAdmin(b: Booking) {
  const subject = `Neue Anfrage von ${b.contact_name} (${formatDate(b.arrival)})`;
  const acceptUrl = `${SITE_URL}/admin?action=accept&id=${b.id}`;
  const rejectUrl = `${SITE_URL}/admin?action=reject&id=${b.id}`;
  const viewUrl = `${SITE_URL}/admin?focus=${b.id}`;
  const body = `
    <h1 style="margin:0 0 18px;font-size:22px;font-weight:300;">Neue Reservierungsanfrage</h1>
    <p style="margin:0 0 4px;font-size:15px;"><strong>${escapeHtml(b.contact_name)}</strong></p>
    <p style="margin:0 0 14px;font-size:13px;color:${COLORS.muted};">${escapeHtml(b.contact_email)}${b.contact_phone ? ` · ${escapeHtml(b.contact_phone)}` : ""}</p>
    ${bookingSummary(b)}
    ${b.message ? `<p style="margin:18px 0 14px;padding:14px;background:${COLORS.bg};border-left:3px solid ${COLORS.sage};font-style:italic;font-size:14px;line-height:1.5;">${escapeHtml(b.message)}</p>` : ""}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <td style="padding-right:8px;">${ctaButton("Annehmen", acceptUrl, COLORS.sageDeep)}</td>
        <td style="padding-right:8px;">${ctaButton("Ablehnen", rejectUrl, "#8b4444")}</td>
        <td>${ctaButton("Admin öffnen", viewUrl, COLORS.fg)}</td>
      </tr>
    </table>
    <p style="margin:18px 0 0;font-size:12px;color:${COLORS.muted};">SLA: innerhalb von 12 Stunden antworten.</p>
  `;
  return { subject, html: shell(subject, body) };
}

// ═══════════════════════════════════════════════════════════════
//  3) Accepted → guest (with bank details)
// ═══════════════════════════════════════════════════════════════
export function tplAcceptedGuest(b: Booking) {
  const subject = `Ihre Buchung ist bestätigt — Andreashof Breechen`;
  const deposit = b.total_price_cents != null ? formatPrice(Math.round(b.total_price_cents * 0.5)) : "50% des Gesamtpreises";
  const body = `
    <h1 style="margin:0 0 18px;font-size:24px;font-weight:300;font-style:italic;">Ihre Buchung ist bestätigt.</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Liebe Gäste,</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">wir freuen uns sehr, Ihre Reservierung am Andreashof Breechen bestätigen zu dürfen.</p>
    ${bookingSummary(b)}
    <h2 style="margin:28px 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Zahlung der Anzahlung</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Bitte überweisen Sie <strong>${deposit}</strong> (50% Anzahlung) <strong>innerhalb von 24 Stunden</strong> auf folgendes Konto:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;padding:16px;background:${COLORS.bg};border:1px solid ${COLORS.border};width:100%;">
      <tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;width:140px;">Kontoinhaber</td><td style="padding:4px 0;font-size:14px;">${BANK.holder}</td></tr>
      <tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">IBAN</td><td style="padding:4px 0;font-size:14px;font-family:monospace;">${BANK.iban}</td></tr>
      <tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">BIC</td><td style="padding:4px 0;font-size:14px;font-family:monospace;">${BANK.bic}</td></tr>
      <tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">Bankinstitut</td><td style="padding:4px 0;font-size:14px;">${BANK.bank}</td></tr>
      <tr><td style="padding:4px 0;color:${COLORS.muted};font-size:13px;">Verwendungszweck</td><td style="padding:4px 0;font-size:14px;">Anzahlung ${b.id.slice(0, 8)} · ${formatDate(b.arrival)}</td></tr>
    </table>
    <h2 style="margin:28px 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Stornierungsbedingungen</h2>
    <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:${COLORS.muted};">Kostenfreie Stornierung bis <strong>30 Tage vor Anreise</strong>. Danach werden 50% des Gesamtpreises in Rechnung gestellt.</p>
    <p style="margin:18px 0 0;font-size:15px;line-height:1.6;">Herzliche Grüße<br><em style="color:${COLORS.sageDeep};">Andrea & das Andreashof-Team</em></p>
  `;
  return { subject, html: shell(subject, body) };
}

// ═══════════════════════════════════════════════════════════════
//  4) Deposit received → guest
// ═══════════════════════════════════════════════════════════════
export function tplDepositPaidGuest(b: Booking) {
  const subject = `Anzahlung erhalten — wir freuen uns auf Sie`;
  const balance = b.total_price_cents != null ? formatPrice(Math.round(b.total_price_cents * 0.5)) : "die Restzahlung";
  const body = `
    <h1 style="margin:0 0 18px;font-size:24px;font-weight:300;font-style:italic;">Anzahlung erhalten.</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Liebe Gäste,</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">vielen Dank — wir haben Ihre Anzahlung erhalten. Ihre Reservierung am Andreashof Breechen ist nun fest gebucht.</p>
    ${bookingSummary(b)}
    <h2 style="margin:28px 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Restzahlung</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Bitte überweisen Sie die <strong>Restzahlung von ${balance}</strong> spätestens <strong>2 Tage vor Anreise</strong> auf das gleiche Konto wie bei der Anzahlung.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;padding:14px;background:${COLORS.bg};border:1px solid ${COLORS.border};width:100%;font-size:13px;">
      <tr><td style="padding:3px 0;color:${COLORS.muted};width:120px;">IBAN</td><td style="padding:3px 0;font-family:monospace;">${BANK.iban}</td></tr>
      <tr><td style="padding:3px 0;color:${COLORS.muted};">Verwendungszweck</td><td style="padding:3px 0;">Restzahlung ${b.id.slice(0, 8)}</td></tr>
    </table>
    <p style="margin:24px 0 14px;font-size:15px;line-height:1.6;">Wir freuen uns sehr darauf, Sie bei uns begrüßen zu dürfen — bringen Sie gute Laune und vielleicht ein gutes Buch mit. Den Rest übernimmt das Haus.</p>
    <p style="margin:18px 0 0;font-size:15px;line-height:1.6;">Herzliche Grüße<br><em style="color:${COLORS.sageDeep};">Andrea & das Andreashof-Team</em></p>
  `;
  return { subject, html: shell(subject, body) };
}

// ═══════════════════════════════════════════════════════════════
//  5) Balance reminder (3 days before arrival, still not fully paid)
// ═══════════════════════════════════════════════════════════════
export function tplBalanceReminderGuest(b: Booking) {
  const subject = `Erinnerung: Restzahlung für Ihren Aufenthalt`;
  const balance = b.total_price_cents != null ? formatPrice(Math.round(b.total_price_cents * 0.5)) : "die Restzahlung";
  const body = `
    <h1 style="margin:0 0 18px;font-size:22px;font-weight:300;">Freundliche Erinnerung</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Liebe Gäste,</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Ihre Anreise am <strong>${formatDate(b.arrival)}</strong> rückt näher — wir freuen uns! Bitte überweisen Sie die <strong>Restzahlung von ${balance}</strong> in den nächsten 24 Stunden, damit alles für Ihren Aufenthalt vorbereitet ist.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;padding:14px;background:${COLORS.bg};border:1px solid ${COLORS.border};width:100%;font-size:13px;">
      <tr><td style="padding:3px 0;color:${COLORS.muted};width:120px;">IBAN</td><td style="padding:3px 0;font-family:monospace;">${BANK.iban}</td></tr>
      <tr><td style="padding:3px 0;color:${COLORS.muted};">BIC</td><td style="padding:3px 0;font-family:monospace;">${BANK.bic}</td></tr>
      <tr><td style="padding:3px 0;color:${COLORS.muted};">Verwendungszweck</td><td style="padding:3px 0;">Restzahlung ${b.id.slice(0, 8)}</td></tr>
    </table>
    <p style="margin:18px 0 0;font-size:14px;color:${COLORS.muted};line-height:1.6;">Sollten Sie bereits überwiesen haben, betrachten Sie diese Erinnerung bitte als gegenstandslos.</p>
    <p style="margin:18px 0 0;font-size:15px;line-height:1.6;">Herzliche Grüße<br><em style="color:${COLORS.sageDeep};">Andrea</em></p>
  `;
  return { subject, html: shell(subject, body) };
}

// ═══════════════════════════════════════════════════════════════
//  6) Arrival instructions (2 days before, fully paid)
// ═══════════════════════════════════════════════════════════════
export function tplArrivalInstructionsGuest(b: Booking) {
  const subject = `Anreise zum Andreashof — alle Informationen`;
  const body = `
    <h1 style="margin:0 0 18px;font-size:24px;font-weight:300;font-style:italic;">Wir freuen uns auf Sie.</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Liebe Gäste,</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">in wenigen Tagen heißen wir Sie auf dem Andreashof Breechen willkommen. Hier alle Informationen für Ihre Anreise am <strong>${formatDate(b.arrival)}</strong>:</p>
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Adresse</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Andreashof Breechen<br>Peenestraße 16<br>17506 Gützkow</p>
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Anreise</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Check-in ab <strong>16:00 Uhr</strong>. Bitte geben Sie uns kurz Bescheid, wann Sie voraussichtlich eintreffen — entweder per E-Mail oder WhatsApp an <a href="tel:+4915112345678" style="color:${COLORS.sageDeep};">+49 151 1234 5678</a>.</p>
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Vor Ort</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Sie werden persönlich begrüßt, die Schlüsselübergabe und eine kurze Hausführung sind selbstverständlich inklusive. Ein Parkplatz für Ihr Fahrzeug steht direkt am Hof bereit.</p>
    <h2 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:${COLORS.sageDeep};">Abreise</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Check-out bis <strong>11:00 Uhr</strong> am ${formatDate(b.departure)}. Bitte bringen Sie die Schlüssel auf den Esstisch, alles Weitere übernehmen wir.</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.6;">Sollten Sie irgendwelche Fragen haben — vor, während oder nach Ihrem Aufenthalt — sind wir jederzeit für Sie da.</p>
    <p style="margin:18px 0 0;font-size:15px;line-height:1.6;">Herzliche Grüße<br><em style="color:${COLORS.sageDeep};">Andrea & das Andreashof-Team</em></p>
  `;
  return { subject, html: shell(subject, body) };
}
