import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Gift, X } from "lucide-react";
import { getActivePromotions } from "@/lib/promotions/server-fns";
import type { Promotion } from "@/lib/promotions/types";

// "Aktuelle Angebote": a small fixed button that opens a side panel.
// It replaces the old popups — Andrea found having to click them away
// annoying, so nothing here ever opens on its own.
// Bottom-right: the chat widget owns bottom-left, and on desktop the
// language switcher sits right below this button.

const WHATSAPP_NUMBER = "491723813606";
const EMAIL = "andrea.lietz@web.de";

const COPY = {
  de: {
    button: "Aktuelle Angebote",
    title: "Aktuelle Angebote",
    close: "Schließen",
    whatsapp: "Per WhatsApp anfragen",
    email: "Per E-Mail anfragen",
    message: (p: Promotion) =>
      `Hallo Andrea, wir interessieren uns für das Angebot „${p.title}“${p.dates ? ` (${p.dates})` : ""}.`,
  },
  en: {
    button: "Current offers",
    title: "Current offers",
    close: "Close",
    whatsapp: "Ask via WhatsApp",
    email: "Ask via email",
    message: (p: Promotion) =>
      `Hi Andrea, we're interested in the offer “${p.title}”${p.dates ? ` (${p.dates})` : ""}.`,
  },
  es: {
    button: "Ofertas actuales",
    title: "Ofertas actuales",
    close: "Cerrar",
    whatsapp: "Consultar por WhatsApp",
    email: "Consultar por email",
    message: (p: Promotion) =>
      `Hola Andrea, nos interesa la oferta «${p.title}»${p.dates ? ` (${p.dates})` : ""}.`,
  },
} as const;

export function PromotionsDrawer() {
  const { i18n } = useTranslation();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getActivePromotions()
      .then((rows) => {
        if (!cancelled) setPromotions([...rows]);
      })
      .catch(() => {
        // No offers is a fine fallback — the button simply doesn't appear.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (promotions.length === 0) return null;

  const lang = (i18n.language?.slice(0, 2) ?? "de") as keyof typeof COPY;
  const c = COPY[lang] ?? COPY.de;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex min-h-11 items-center gap-2 border border-foreground bg-foreground px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] text-background shadow-md transition-colors hover:border-sage-deep hover:bg-sage-deep md:bottom-20 md:right-6"
      >
        <Gift className="h-4 w-4" aria-hidden />
        {c.button}
        <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1.5 text-[10px] tracking-normal text-foreground">
          {promotions.length}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex justify-end bg-black/40"
          onClick={() => setOpen(false)}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="promotions-title"
            className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-linen shadow-xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-linen px-6 py-4">
              <h2 id="promotions-title" className="font-display text-2xl font-light">
                {c.title}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={c.close}
                className="flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <ul className="flex flex-col gap-6 px-6 py-6">
              {promotions.map((p) => {
                const message = c.message(p);
                const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
                const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(p.title)}&body=${encodeURIComponent(message)}`;
                return (
                  <li key={p.id} className="overflow-hidden border border-border bg-background">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="h-44 w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="px-5 pb-5 pt-4">
                      {p.badge && <p className="eyebrow">{p.badge}</p>}
                      <h3 className="mt-2 font-display text-[1.6rem] font-light leading-tight">
                        {p.title}
                      </h3>
                      {p.dates && <p className="mt-1 text-sm text-sage-deep">{p.dates}</p>}
                      {p.description && (
                        <p className="mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed text-muted-foreground">
                          {p.description}
                        </p>
                      )}
                      {p.price && (
                        <p className="mt-3 whitespace-pre-line border-l-2 border-sage-deep pl-3 text-[0.95rem] font-medium">
                          {p.price}
                        </p>
                      )}
                      <div className="mt-5 flex flex-col gap-2">
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-11 border border-foreground bg-foreground px-5 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-background transition-colors hover:border-sage-deep hover:bg-sage-deep"
                        >
                          {c.whatsapp}
                        </a>
                        <a
                          href={mailHref}
                          className="min-h-11 border border-foreground/60 px-5 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground/5"
                        >
                          {c.email}
                        </a>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      )}
    </>
  );
}
