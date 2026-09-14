import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";

// "Wasted in Jarmen" 2027 — 3./4. September. Andrea rents out free rooms for
// festival guests (walking distance). The popup switches itself off after the
// festival, so nobody has to remember to remove it.
const FESTIVAL_END = new Date("2027-09-05T00:00:00");
const SHOW_DELAY_MS = 4000;
// Once dismissed, stay quiet for a week on this device.
const DISMISS_STORAGE = "andreashof.festivalPopup2027";
const DISMISS_DAYS = 7;

const WHATSAPP_NUMBER = "491723813606";
const EMAIL = "andrea.lietz@web.de";

// Copy lives here rather than in the locale files: it's a one-off, time-boxed
// campaign and gets deleted as a whole once the festival is over.
const COPY = {
  de: {
    eyebrow: "Festival · 3. & 4. September 2027",
    titleA: "Zum Festival",
    titleEm: " nach Jarmen?",
    body: "Für „Wasted in Jarmen“ 2027 haben wir noch Zimmer frei — fußläufig zum Festivalgelände. Nach dem Tanzen einfach zu Fuß ins Gutshaus, ausschlafen und in Ruhe frühstücken.",
    whatsapp: "Per WhatsApp anfragen",
    email: "Per E-Mail anfragen",
    close: "Schließen",
    message:
      "Hallo Andrea, ich interessiere mich für ein Zimmer zum Festival Wasted in Jarmen (3./4. September 2027).",
  },
  en: {
    eyebrow: "Festival · 3 & 4 September 2027",
    titleA: "Coming to",
    titleEm: " the festival?",
    body: "We still have rooms available for “Wasted in Jarmen” 2027 — within walking distance of the festival grounds. Walk home after the last set, sleep in and enjoy a slow breakfast.",
    whatsapp: "Ask via WhatsApp",
    email: "Ask via email",
    close: "Close",
    message:
      "Hi Andrea, I'm interested in a room for the Wasted in Jarmen festival (3–4 September 2027).",
  },
  es: {
    eyebrow: "Festival · 3 y 4 de septiembre 2027",
    titleA: "¿Vienes",
    titleEm: " al festival?",
    body: "Para «Wasted in Jarmen» 2027 aún tenemos habitaciones libres — a poca distancia a pie del recinto del festival. Vuelve caminando después del último concierto, duerme hasta tarde y desayuna con calma.",
    whatsapp: "Consultar por WhatsApp",
    email: "Consultar por email",
    close: "Cerrar",
    message:
      "Hola Andrea, me interesa una habitación para el festival Wasted in Jarmen (3 y 4 de septiembre de 2027).",
  },
} as const;

function recentlyDismissed() {
  try {
    const ts = Number(window.localStorage.getItem(DISMISS_STORAGE));
    return ts > 0 && Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function FestivalPopup() {
  const { i18n } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  // Legal pages and the booking form stay undisturbed.
  const excluded = ["/impressum", "/datenschutz", "/agb", "/reservations", "/rezension"].some((p) =>
    pathname.startsWith(p),
  );

  useEffect(() => {
    if (excluded || Date.now() >= FESTIVAL_END.getTime()) return;
    // ?festival in the URL always shows it (to preview after a dismissal).
    const forced = new URLSearchParams(window.location.search).has("festival");
    if (!forced && recentlyDismissed()) return;
    const id = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [excluded]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(DISMISS_STORAGE, String(Date.now()));
    } catch {
      // Storage unavailable — it just shows again on the next visit.
    }
  };

  if (!open || excluded) return null;

  const lang = (i18n.language?.slice(0, 2) ?? "de") as keyof typeof COPY;
  const c = COPY[lang] ?? COPY.de;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(c.message)}`;
  const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent("Wasted in Jarmen 2027")}&body=${encodeURIComponent(c.message)}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 animate-fade-up sm:items-center"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="festival-popup-title"
        className="relative w-full max-w-md border border-border bg-linen px-6 pb-7 pt-8 shadow-xl md:px-9 md:pb-9 md:pt-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label={c.close}
          className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="eyebrow">{c.eyebrow}</p>
        <h2
          id="festival-popup-title"
          className="mt-4 font-display text-[2.2rem] font-light leading-[1] text-foreground md:text-[2.7rem]"
        >
          {c.titleA}
          <span className="italic text-sage-deep">{c.titleEm}</span>
        </h2>
        <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">{c.body}</p>

        <div className="mt-7 flex flex-col gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="min-h-11 border border-foreground bg-foreground px-6 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-background transition-colors hover:border-sage-deep hover:bg-sage-deep md:tracking-[0.28em]"
          >
            {c.whatsapp}
          </a>
          <a
            href={mailHref}
            onClick={dismiss}
            className="min-h-11 border border-foreground/60 px-6 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground/5 md:tracking-[0.28em]"
          >
            {c.email}
          </a>
        </div>
      </div>
    </div>
  );
}
