import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { GALLERY_PHOTOS, type GalleryCategory } from "@/data/galerie";

const CATEGORIES: GalleryCategory[] = [
  "interior",
  "bath",
  "garden",
  "around",
  "plans",
  "atmos",
];

export const Route = createFileRoute("/galerie")({
  head: () => ({
    meta: [
      { title: "Galerie · Andreashof Breechen" },
      {
        name: "description",
        content:
          "Galerie des Andreashof Breechen — Innenräume, Bäder, Garten und das Dorf mit Badesee, Gützkow und Usedom.",
      },
    ],
    links: [{ rel: "canonical", href: "/galerie" }],
  }),
  component: GaleriePage,
});

function GaleriePage() {
  const { t } = useTranslation();
  const labels = t("galerieFull.categories", { returnObjects: true }) as Record<
    GalleryCategory,
    string
  >;

  const [active, setActive] = useState<GalleryCategory>("interior");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const photos = useMemo(() => GALLERY_PHOTOS.filter((p) => p.category === active), [active]);

  // Reset lightbox when filter changes.
  useEffect(() => setLightbox(null), [active]);

  // Keyboard nav for the lightbox.
  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? null : Math.min(photos.length - 1, i + 1)));
      if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? null : Math.max(0, i - 1)));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, photos.length]);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      {/* INTRO */}
      <section className="px-5 pt-12 pb-8 md:px-10 md:pt-16 md:pb-12">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">{t("galerieFull.eyebrow")}</span>
          <h1 className="mt-4 font-display text-[2.2rem] font-light leading-[1.1] md:text-6xl">
            {t("galerieFull.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
            {t("galerieFull.subtitle")}
          </p>
        </div>
      </section>

      {/* FILTERS */}
      <section className="px-5 pb-10 md:px-10">
        <div className="mx-auto max-w-6xl overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <ul className="flex min-w-max gap-3 border-b border-border pb-3 max-md:gap-4 md:gap-10">
            {CATEGORIES.map((c) => {
              const isActive = c === active;
              const label = labels[c];
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => setActive(c)}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative min-h-11 px-1 pb-1 text-[11px] uppercase tracking-[0.2em] transition-colors md:tracking-[0.28em] ${
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute -bottom-[13px] left-0 right-0 h-px bg-sage-deep" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* GRID */}
      <section className="px-5 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="columns-1 gap-4 sm:columns-2 md:columns-3 md:gap-6 lg:columns-4">
            {photos.map((p, i) => (
              <button
                key={p.src}
                type="button"
                onClick={() => setLightbox(i)}
                className="img-hover mb-4 block w-full break-inside-avoid md:mb-6"
                aria-label={p.alt}
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="block h-auto w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightbox !== null && photos[lightbox] && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 px-4 py-10"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((i) => (i === null ? null : Math.max(0, i - 1)));
            }}
            disabled={lightbox === 0}
            aria-label="Zurück"
            className="absolute left-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center border border-white/40 px-3 py-2 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30 md:left-8 md:min-h-0 md:min-w-0 md:px-4 md:py-3"
          >
            ←
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((i) =>
                i === null ? null : Math.min(photos.length - 1, i + 1),
              );
            }}
            disabled={lightbox === photos.length - 1}
            aria-label="Weiter"
            className="absolute right-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center border border-white/40 px-3 py-2 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30 md:right-8 md:min-h-0 md:min-w-0 md:px-4 md:py-3"
          >
            →
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            aria-label="Schließen"
            className="absolute right-2 top-3 flex min-h-11 min-w-11 items-center justify-center border border-white/40 px-3 py-2 text-white/80 transition-colors hover:bg-white/10 md:right-8 md:top-8 md:min-h-0 md:min-w-0"
          >
            ✕
          </button>
          <figure
            className="flex max-h-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightbox].src}
              alt={photos[lightbox].alt}
              className="max-h-[80vh] w-auto max-w-full object-contain"
            />
            <figcaption className="mt-4 text-[11px] uppercase tracking-[0.28em] text-white/70">
              {photos[lightbox].alt} · {lightbox + 1} / {photos.length}
            </figcaption>
          </figure>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
