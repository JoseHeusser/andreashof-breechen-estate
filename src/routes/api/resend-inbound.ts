import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ADMIN_EMAIL, sendEmail } from "@/lib/email/client";

type InboundAddress = string | { email?: string; name?: string };

type InboundAttachment = {
  filename?: string;
  content_type?: string;
  contentType?: string;
};

type ResendInboundPayload = {
  type?: string;
  data?: InboundEmail;
} & Partial<InboundEmail>;

type InboundEmail = {
  from?: InboundAddress;
  to?: InboundAddress | InboundAddress[];
  cc?: InboundAddress | InboundAddress[];
  subject?: string;
  html?: string;
  text?: string;
  reply_to?: InboundAddress | InboundAddress[];
  replyTo?: InboundAddress | InboundAddress[];
  attachments?: InboundAttachment[];
};

const BRAND_DOMAIN = "andreashof-breechen.de";

export const Route = createFileRoute("/api/resend-inbound")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorized(request)) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }

        let payload: ResendInboundPayload;
        try {
          payload = (await request.json()) as ResendInboundPayload;
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const inbound = payload.data ?? payload;
        const recipients = addressList(inbound.to);
        const targetsBrandDomain = recipients.some((email) =>
          email.toLowerCase().endsWith(`@${BRAND_DOMAIN}`),
        );
        if (!targetsBrandDomain) {
          return json({ ok: false, error: "ignored_recipient" }, 202);
        }

        const from = addressText(inbound.from) || "Unbekannter Absender";
        const replyTo =
          firstAddress(inbound.reply_to) ??
          firstAddress(inbound.replyTo) ??
          firstAddress(inbound.from);
        const originalSubject = inbound.subject?.trim() || "(ohne Betreff)";
        const subject = `Weitergeleitet: ${originalSubject}`;
        const html = forwardedHtml({
          from,
          to: recipients.join(", "),
          cc: addressList(inbound.cc).join(", "),
          subject: originalSubject,
          html: inbound.html,
          text: inbound.text,
          attachments: inbound.attachments ?? [],
        });

        const sent = await sendEmail({
          to: ADMIN_EMAIL,
          subject,
          html,
          text: forwardedText({
            from,
            to: recipients.join(", "),
            cc: addressList(inbound.cc).join(", "),
            subject: originalSubject,
            text: inbound.text,
            attachments: inbound.attachments ?? [],
          }),
          replyTo,
        });

        if (!sent) {
          return json({ ok: false, error: "forward_failed" }, 502);
        }

        return json({ ok: true });
      },
    },
  },
});

function isAuthorized(request: Request): boolean {
  const secret = process.env.RESEND_INBOUND_SECRET;
  if (!secret) return true;

  const url = new URL(request.url);
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-resend-inbound-secret");
  return url.searchParams.get("secret") === secret || bearer === secret || headerSecret === secret;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function addressText(address: InboundAddress | undefined): string {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (address.name && address.email) return `${address.name} <${address.email}>`;
  return address.email ?? address.name ?? "";
}

function firstAddress(value: InboundAddress | InboundAddress[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  const text = addressText(first);
  const match = text.match(/<([^>]+)>/);
  return (match?.[1] ?? text).trim() || undefined;
}

function addressList(value: InboundAddress | InboundAddress[] | undefined): string[] {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.map(addressText).filter(Boolean);
}

function forwardedHtml({
  from,
  to,
  cc,
  subject,
  html,
  text,
  attachments,
}: {
  from: string;
  to: string;
  cc: string;
  subject: string;
  html?: string;
  text?: string;
  attachments: InboundAttachment[];
}): string {
  const attachmentNote = attachments.length
    ? `<p style="margin:16px 0 0;color:#6B6960;font-size:13px;">Adjuntos recibidos: ${escapeHtml(
        attachments.map((a) => a.filename ?? "archivo").join(", "),
      )}</p>`
    : "";
  const body =
    html ||
    `<pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(text ?? "")}</pre>`;

  return `<!doctype html>
<html lang="de">
<body style="margin:0;padding:24px;background:#F4EFE6;color:#2C2A26;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:720px;margin:0 auto;background:#FBFAF6;border:1px solid #D8D2C5;padding:28px;">
    <p style="margin:0 0 18px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#6B6960;">E-Mail weitergeleitet von Resend</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 22px;font-size:14px;">
      <tr><td style="width:84px;padding:3px 0;color:#6B6960;">Von</td><td style="padding:3px 0;">${escapeHtml(from)}</td></tr>
      <tr><td style="padding:3px 0;color:#6B6960;">An</td><td style="padding:3px 0;">${escapeHtml(to)}</td></tr>
      ${cc ? `<tr><td style="padding:3px 0;color:#6B6960;">Cc</td><td style="padding:3px 0;">${escapeHtml(cc)}</td></tr>` : ""}
      <tr><td style="padding:3px 0;color:#6B6960;">Betreff</td><td style="padding:3px 0;">${escapeHtml(subject)}</td></tr>
    </table>
    <div style="border-top:1px solid #D8D2C5;padding-top:22px;">${body}</div>
    ${attachmentNote}
  </div>
</body>
</html>`;
}

function forwardedText({
  from,
  to,
  cc,
  subject,
  text,
  attachments,
}: {
  from: string;
  to: string;
  cc: string;
  subject: string;
  text?: string;
  attachments: InboundAttachment[];
}): string {
  const lines = [
    "E-Mail weitergeleitet von Resend",
    "",
    `Von: ${from}`,
    `An: ${to}`,
    cc ? `Cc: ${cc}` : "",
    `Betreff: ${subject}`,
    "",
    text ?? "(Diese Nachricht enthielt nur HTML.)",
  ].filter(Boolean);
  if (attachments.length) {
    lines.push(
      "",
      `Adjuntos recibidos: ${attachments.map((a) => a.filename ?? "archivo").join(", ")}`,
    );
  }
  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
