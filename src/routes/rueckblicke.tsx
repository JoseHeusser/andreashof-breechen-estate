import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const historyHero = "/galerie/history/img_3432.jpg";
const historicMap = "/galerie/history/breechen-historisch.jpg";

// Sticky-section photo picks — one strong image per epoch.
const SECTION1_PHOTO = historicMap; // schwedische Karte
const SECTION2_PHOTO = "/galerie/history/img_3775.jpg"; // bauphase / dachstuhl
const SECTION3_PHOTO = "/galerie/history/img_4533.jpg"; // neue dachkonstruktion

type ImpressionItem = {
  src: string;
  alt: string;
};

// Photos NOT used as sticky anchors above — shown in the closing carousel.
const RIBBON_PHOTOS: ImpressionItem[] = [
  // New batch (June 2026) — Andreas's drop into ./History
  { src: "/galerie/history/img_2352.jpg", alt: "Geschichte des Andreashof Breechen" },
  { src: "/galerie/history/img_2798.jpg", alt: "Geschichte des Andreashof Breechen" },
  { src: "/galerie/history/img_2800.jpg", alt: "Geschichte des Andreashof Breechen" },
  { src: "/galerie/history/img_2808.jpg", alt: "Geschichte des Andreashof Breechen" },
  { src: "/galerie/history/img_2922.jpg", alt: "Geschichte des Andreashof Breechen" },
  { src: "/galerie/history/img_2923.jpg", alt: "Geschichte des Andreashof Breechen" },
  { src: "/galerie/history/img_3312.jpg", alt: "Geschichte des Andreashof Breechen" },
  { src: "/galerie/history/img_3980.jpg", alt: "Geschichte des Andreashof Breechen" },
  { src: "/galerie/history/img_8576.jpg", alt: "Geschichte des Andreashof Breechen" },
  { src: "/galerie/history/img_8582.jpg", alt: "Geschichte des Andreashof Breechen" },
  // Renovation photos
  { src: "/galerie/history/img_3776.jpg", alt: "Fachwerk und Rundfenster im Andreashof Breechen waehrend der Bauphase" },
  { src: "/galerie/history/img_3137.jpg", alt: "Freigelegte historische Wand im Andreashof Breechen waehrend der Sanierung" },
  { src: "/galerie/history/img_3136.jpg", alt: "Entkernter Raum im Andreashof Breechen mit freigelegten Boeden" },
  { src: "/galerie/history/img_3152.jpg", alt: "Entkernter Raum im Andreashof Breechen vor dem Wiederaufbau" },
  { src: "/galerie/history/img_3236.jpg", alt: "Bauphase mit freigelegtem Boden und alten Wandflaechen" },
  { src: "/galerie/history/img_3433.jpg", alt: "Historische Bausubstanz mit offenem Dachstuhl im Andreashof Breechen" },
  { src: "/galerie/history/history-detail-dachbalken.jpg", alt: "Detail der sanierten Dachbalken im Andreashof Breechen" },
  { src: "/galerie/history/history-fundstuecke.jpg", alt: "Historische Fundstuecke aus der Bauphase im Andreashof Breechen" },
  { src: "/galerie/history/img_2999.jpg", alt: "Eindruck aus der Geschichte des Andreashof Breechen" },
];

export const Route = createFileRoute("/rueckblicke")({
  head: () => ({
    meta: [
      { title: "Rückblicke · Andreashof Breechen" },
      {
        name: "description",
        content:
          "Rückblicke und Eindrücke vom Bauverlauf bis heute — die Geschichte des Andreashof Breechen.",
      },
      { property: "og:title", content: "Rückblicke · Andreashof Breechen" },
      {
        property: "og:description",
        content:
          "Eindrücke vom historischen Gutshaus, seiner Entwicklung und dem Leben im Haus bis heute.",
      },
      { property: "og:image", content: historyHero },
    ],
    links: [{ rel: "canonical", href: "/rueckblicke" }],
  }),
  component: RueckblickePage,
});

interface StickySectionProps {
  number: string;
  title: string;
  image: string;
  imageAlt: string;
  imageCaption?: string;
  imageFit?: "cover" | "contain";
  paragraphs: string[];
  imageRight?: boolean;
  tone?: "default" | "linen";
}

/**
 * Editorial split-screen section: sticky image on one side, narrative
 * scrolls past on the other. On mobile (no md), collapses to image
 * first, then text below.
 */
function StickySection({
  number,
  title,
  image,
  imageAlt,
  imageCaption,
  imageFit = "cover",
  paragraphs,
  imageRight = false,
  tone = "default",
}: StickySectionProps) {
  const bg = tone === "linen" ? "bg-linen" : "bg-background";
  // Image column is rendered first in source order so mobile naturally
  // shows it above the text. On desktop, the `md:order-*` classes
  // optionally flip the image to the right.
  return (
    <section className={`border-t border-border/60 ${bg} px-5 py-16 md:px-10 md:py-24`}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* IMAGE column — sticky on desktop */}
          <div className={imageRight ? "md:order-2" : "md:order-1"}>
            <div className="md:sticky md:top-24">
              <figure className="overflow-hidden border border-border bg-card">
                <img
                  src={image}
                  alt={imageAlt}
                  loading="lazy"
                  className={`w-full ${imageFit === "contain" ? "h-auto object-contain" : "aspect-[4/5] object-cover"}`}
                />
                {imageCaption ? (
                  <figcaption className="border-t border-border/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                    {imageCaption}
                  </figcaption>
                ) : null}
              </figure>
            </div>
          </div>

          {/* TEXT column */}
          <div className={imageRight ? "md:order-1" : "md:order-2"}>
            <div className="flex flex-col items-baseline gap-3 border-b border-border/60 pb-5 max-md:gap-2 md:flex-row md:gap-5">
              <span className="font-display text-4xl font-light italic text-sage-deep md:text-5xl">
                {number}
              </span>
              <h2 className="font-display text-xl font-light leading-tight max-md:leading-snug md:text-3xl lg:text-4xl">
                {title}
              </h2>
            </div>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-foreground/85 md:text-[1.05rem]">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "text-[1.05rem] leading-relaxed text-foreground md:text-[1.18rem] md:leading-[1.65]"
                      : ""
                  }
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: ImpressionItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  // Keyboard: Esc closes, arrows navigate. Lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext]);

  const photo = photos[index];
  return (
    <div
      onClick={onClose}
      className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4 py-12 md:px-12"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Schließen"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-white/40 text-white transition-colors hover:bg-white/10 md:right-8 md:top-8"
      >
        ×
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Vorheriges Bild"
        className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/40 text-white transition-colors hover:bg-white/10 md:left-6 md:h-14 md:w-14"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Nächstes Bild"
        className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/40 text-white transition-colors hover:bg-white/10 md:right-6 md:h-14 md:w-14"
      >
        ›
      </button>
      <img
        src={photo.src}
        alt={photo.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full object-contain"
      />
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.22em] text-white/60">
        {index + 1} / {photos.length}
      </p>
    </div>
  );
}

function RueckblickePage() {
  const { t } = useTranslation();
  const section1 = t("history.section1", { returnObjects: true }) as string[];
  const section2 = t("history.section2", { returnObjects: true }) as string[];
  const section3 = t("history.section3", { returnObjects: true }) as string[];

  // Lightbox state — null when closed, otherwise the index in RIBBON_PHOTOS.
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const nextLightbox = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % RIBBON_PHOTOS.length)),
    [],
  );
  const prevLightbox = useCallback(
    () => setLightboxIndex((i) =>
      i === null ? null : (i - 1 + RIBBON_PHOTOS.length) % RIBBON_PHOTOS.length,
    ),
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      <main>
        {/* HERO — centred, minimal */}
        <section className="px-5 pt-16 pb-12 md:px-10 md:pt-24 md:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">{t("history.eyebrow")}</span>
            <h1 className="mt-6 font-display text-[2.4rem] font-light leading-[1.05] md:text-6xl">
              {t("history.title")}
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
              {t("history.subtitle")}
            </p>
          </div>
        </section>

        {/* SECTION I — Lage und Ursprung. Sticky map on left. */}
        <StickySection
          number="I"
          title={t("history.section1Title")}
          image={SECTION1_PHOTO}
          imageAlt="Schwedische Situationskarte von Jarmen mit Breechen"
          imageCaption={t("history.mapCaption")}
          imageFit="contain"
          paragraphs={section1}
          tone="linen"
        />

        {/* SECTION II — Wechselnde Eigentümer. Photo on right. */}
        <StickySection
          number="II"
          title={t("history.section2Title")}
          image={SECTION2_PHOTO}
          imageAlt="Bauphase im Andreashof Breechen — Dachstuhl und Fachwerk"
          paragraphs={section2}
          imageRight
        />

        {/* SECTION III — Unser Umbau. Photo on left. */}
        <StickySection
          number="III"
          title={t("history.section3Title")}
          image={SECTION3_PHOTO}
          imageAlt="Neue Dachkonstruktion und alte Raumstruktur waehrend der Sanierung"
          paragraphs={section3}
          tone="linen"
        />

        {/* CODA — carousel of impressions */}
        <section className="border-t border-border/60 px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <span className="eyebrow">{t("history.impressionsEyebrow")}</span>
            <div className="mt-8">
              <Carousel
                opts={{ loop: true, align: "start" }}
                className="relative"
              >
                <CarouselContent className="-ml-3 md:-ml-4">
                  {RIBBON_PHOTOS.map((photo, i) => (
                    <CarouselItem
                      key={photo.src}
                      className="basis-3/4 pl-3 sm:basis-1/2 md:basis-1/3 md:pl-4 lg:basis-1/4"
                    >
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        aria-label={`${photo.alt} — vergrößern`}
                        className="img-hover group block w-full overflow-hidden border border-border bg-card outline-none focus-visible:ring-2 focus-visible:ring-sage-deep"
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          loading="lazy"
                          className="aspect-[4/5] w-full cursor-zoom-in object-cover"
                        />
                      </button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-3 hidden md:flex" />
                <CarouselNext className="-right-3 hidden md:flex" />
              </Carousel>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      {lightboxIndex !== null ? (
        <Lightbox
          photos={RIBBON_PHOTOS}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      ) : null}
    </div>
  );
}
