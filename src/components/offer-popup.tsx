import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";

// Short-notice gap Andrea wants to fill: 5–8 November 2026.
// Switches itself off once the dates have passed. While this popup is
// live it takes precedence over the festival one (see festival-popup).
export const OFFER_END = new Date("2026-11-09T00:00:00");
const SHOW_DELAY_MS = 3500;
const DISMISS_STORAGE = "andreashof.offerNov2026";
const DISMISS_DAYS = 3;

const WHATSAPP_NUMBER = "491723813606";
const EMAIL = "andrea.lietz@web.de";

// Andrea's own Kaminzimmer photo; falls back to the blue salon until
// the file is added under public/galerie/.
const PHOTO = "/galerie/kaminzimmer.jpg";
const PHOTO_FALLBACK = "/galerie/salon-02.jpg";

const COPY = {
  de: {
    eyebrow: "Kurzfristig frei",
    titleA: "5.–8. November",
    titleEm: " im Gutshaus.",
    body: "Diese Tage sind bei uns gerade frei geworden. Kaminzimmer, stille Räume und Vorpommern im Novemberlicht — fragen Sie uns einfach nach Preis und Platz.",
    whatsapp: "Per WhatsApp anfragen",
    email: "Per E-Mail anfragen",
    close: "Schließen",
    alt: "Kaminzimmer im Andreashof Breechen",
    message:
      "Hallo Andrea, wir interessieren uns für die freien Tage vom 5. bis 8. November 2026 im Andreashof.",
  },
  en: {
    eyebrow: "Just became free",
    titleA: "5–8 November",
    titleEm: " at the manor.",
    body: "These days have just opened up. A fireplace room, quiet spaces and Western Pomerania in November light — ask us about price and availability.",
    whatsapp: "Ask via WhatsApp",
    email: "Ask via email",
    close: "Close",
    alt: "Fireplace room at Andreashof Breechen",
    message:
      "Hi Andrea, we're interested in the free dates from 5 to 8 November 2026 at Andreashof.",
  },
  es: {
    eyebrow: "Libre de última hora",
    titleA: "5–8 de noviembre",
    titleEm: " en la casa señorial.",
    body: "Estos días acaban de quedar libres. La sala de la chimenea, espacios en calma y Pomerania con luz de noviembre — pregúntanos precio y disponibilidad.",
    whatsapp: "Consultar por WhatsApp",
    email: "Consultar por email",
    close: "Cerrar",
    alt: "Sala de la chimenea en el Andreashof Breechen",
    message:
      "Hola Andrea, nos interesan los días libres del 5 al 8 de noviembre de 2026 en el Andreashof.",
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

export function OfferPopup() {
  const { i18n } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState(PHOTO);

  const excluded = ["/impressum", "/datenschutz", "/agb", "/reservations", "/rezension"].some((p) =>
    pathname.startsWith(p),
  );

  useEffect(() => {
    if (excluded || Date.now() >= OFFER_END.getTime()) return;
    // ?angebot in the URL always shows it, for previewing after a dismissal.
    const forced = new URLSearchParams(window.location.search).has("angebot");
    if (!forced && recentlyDismissed()) return;
    const id = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [excluded]);

  const dismiss = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(DISMISS_STORAGE, String(Date.now()));
    } catch {
      // Storage unavailable — it just shows again on the next visit.
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || excluded) return null;

  const lang = (i18n.language?.slice(0, 2) ?? "de") as keyof typeof COPY;
  const c = COPY[lang] ?? COPY.de;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(c.message)}`;
  const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent("5.–8. November 2026")}&body=${encodeURIComponent(c.message)}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 animate-fade-up sm:items-center"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-popup-title"
        className="relative w-full max-w-md overflow-hidden border border-border bg-linen shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label={c.close}
          className="absolute right-3 top-3 z-10 flex min-h-11 min-w-11 items-center justify-center bg-black/30 text-white transition-colors hover:bg-black/50"
        >
          <X className="h-5 w-5" />
        </button>

        <img
          src={photo}
          alt={c.alt}
          onError={() => setPhoto(PHOTO_FALLBACK)}
          className="h-48 w-full object-cover md:h-56"
        />

        <div className="px-6 pb-7 pt-6 md:px-9 md:pb-9">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2
            id="offer-popup-title"
            className="mt-3 font-display text-[2rem] font-light leading-[1.05] text-foreground md:text-[2.5rem]"
          >
            {c.titleA}
            <span className="italic text-sage-deep">{c.titleEm}</span>
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">{c.body}</p>

          <div className="mt-6 flex flex-col gap-3">
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
    </div>
  );
}
