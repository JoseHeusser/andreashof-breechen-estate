import { Resend } from "resend";

// Server-only Resend client. Never import from client code.
// Required env: RESEND_API_KEY, EMAIL_FROM, EMAIL_TO_ADMIN.
let cached: Resend | null = null;

function getClient(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  cached = new Resend(key);
  return cached;
}

export interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(args: SendArgs): Promise<{ id: string } | null> {
  const from = process.env.EMAIL_FROM ?? "Andreashof Breechen <andrea.lietz@web.de>";
  try {
    const res = await getClient().emails.send({
      from,
      to: Array.isArray(args.to) ? args.to : [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: args.replyTo,
    });
    if (res.error) {
      console.error("[email] resend error", res.error);
      return null;
    }
    return res.data ? { id: res.data.id } : null;
  } catch (e) {
    // Never let an email failure break the booking flow.
    console.error("[email] sendEmail threw", e);
    return null;
  }
}

export const ADMIN_EMAIL = process.env.EMAIL_TO_ADMIN ?? "andrea.lietz@web.de";
export const SITE_URL = process.env.SITE_URL ?? "https://andreashof-breechen.de";
