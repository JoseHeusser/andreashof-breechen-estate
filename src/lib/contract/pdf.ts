import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { Booking } from "@/lib/supabase/types";
import { VORLAGE_BASE64 } from "./vorlage-base64";

/**
 * Fills Andrea's original Mietvertrag. The template PDF is her document as
 * is; each blank (the dotted run) is covered with white and the booking value
 * is written on top, so the result looks exactly like the original.
 *
 * Coordinates come from `pdftotext -bbox vertrag-vorlage.pdf` (origin top-left,
 * points). If the template is ever re-exported, re-measure them.
 *
 * Left as dots on purpose — the guest fills these in by hand: address, bank
 * details for the deposit refund, place/date and signatures.
 */

type Field = {
  page: number; // 0-based
  x0: number;
  x1: number;
  yTop: number;
  yBottom: number;
  align: "left" | "center";
  bold?: boolean;
  size?: number;
};

const FIELDS = {
  tenant: {
    page: 0,
    x0: 220.9,
    x1: 374.4,
    yTop: 354.1,
    yBottom: 369.6,
    align: "center",
    bold: true,
    size: 12,
  },
  persons: { page: 0, x0: 265.9, x1: 293.9, yTop: 704.0, yBottom: 717.7, align: "center" },
  arrival: { page: 1, x0: 292.6, x1: 349.2, yTop: 479.0, yBottom: 492.7, align: "center" },
  departure: { page: 1, x0: 393.0, x1: 440.1, yTop: 479.0, yBottom: 492.7, align: "center" },
  nights: {
    page: 1,
    x0: 291.8,
    x1: 349.1,
    yTop: 504.7,
    yBottom: 520.2,
    align: "center",
    bold: true,
  },
  // The measured word is "Euro):……€"; only the dots between ":" and "€".
  basePrice: { page: 2, x0: 294.0, x1: 345.0, yTop: 154.1, yBottom: 167.8, align: "center" },
  pets: { page: 2, x0: 212.2, x1: 249.8, yTop: 232.3, yBottom: 246.0, align: "center" },
  totalPrice: { page: 2, x0: 371.4, x1: 425.0, yTop: 258.7, yBottom: 272.4, align: "center" },
  balanceDue: { page: 2, x0: 71.0, x1: 149.9, yTop: 427.7, yBottom: 441.4, align: "left" },
} satisfies Record<string, Field>;

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function nights(arrival: string, departure: string): number {
  const a = new Date(arrival + "T00:00:00Z").getTime();
  const d = new Date(departure + "T00:00:00Z").getTime();
  return Math.max(1, Math.round((d - a) / 86400000));
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** "2.600,00" — the template already prints the € sign after the blank. */
function amount(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Standard PDF fonts only cover WinAnsi; drop anything they cannot encode. */
function encodable(font: PDFFont, text: string): string {
  let out = "";
  for (const ch of text) {
    try {
      font.encodeText(ch);
      out += ch;
    } catch {
      out += "?";
    }
  }
  return out;
}

export function contractFilename(b: Booking): string {
  const name = b.contact_name
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
  return `Mietvertrag-Andreashof-${name || "Gast"}-${b.arrival}.pdf`;
}

export async function renderContractPdf(b: Booking): Promise<Uint8Array> {
  const doc = await PDFDocument.load(Uint8Array.from(atob(VORLAGE_BASE64), (c) => c.charCodeAt(0)));
  const regular = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const pages = doc.getPages();

  const values: Partial<Record<keyof typeof FIELDS, string>> = {
    tenant: b.contact_name,
    persons: String(b.guests),
    arrival: formatDate(b.arrival),
    departure: formatDate(b.departure),
    nights: String(nights(b.arrival, b.departure)),
    pets: String(b.pets ?? 0),
    // Per § 3 (5) and the AGB the balance is due 2 days before arrival.
    balanceDue: formatDate(addDays(b.arrival, -2)),
  };
  if (b.total_price_cents != null) {
    values.basePrice = amount(b.total_price_cents);
    values.totalPrice = amount(b.total_price_cents);
  }

  for (const [key, value] of Object.entries(values) as [keyof typeof FIELDS, string][]) {
    const f: Field = FIELDS[key];
    const page = pages[f.page];
    const height = page.getHeight();
    const font = f.bold ? bold : regular;
    const size = f.size ?? 11;
    const text = encodable(font, value);

    // Cover the dots…
    page.drawRectangle({
      x: f.x0 - 1,
      y: height - f.yBottom - 1,
      width: f.x1 - f.x0 + 2,
      height: f.yBottom - f.yTop + 2,
      color: rgb(1, 1, 1),
    });

    // …and write the value on the same baseline, never wider than the blank
    // would allow on a centred line.
    const width = font.widthOfTextAtSize(text, size);
    const x = f.align === "center" ? (f.x0 + f.x1) / 2 - width / 2 : f.x0;
    page.drawText(text, {
      x,
      y: height - f.yBottom + 3.2,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  doc.setTitle(`Mietvertrag — ${b.contact_name}`);
  doc.setAuthor("Andreashof Breechen GbR");
  return doc.save();
}
