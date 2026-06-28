import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

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

// Photos NOT used as sticky anchors above — shown in the closing ribbon.
const RIBBON_PHOTOS: ImpressionItem[] = [
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
            <div className="flex items-baseline gap-5 border-b border-border/60 pb-5">
              <span className="font-display text-4xl font-light italic text-sage-deep md:text-5xl">
                {number}
              </span>
              <h2 className="font-display text-2xl font-light leading-tight md:text-3xl lg:text-4xl">
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

function RueckblickePage() {
  const { t } = useTranslation();
  const section1 = t("history.section1", { returnObjects: true }) as string[];
  const section2 = t("history.section2", { returnObjects: true }) as string[];
  const section3 = t("history.section3", { returnObjects: true }) as string[];

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

        {/* CODA — photo ribbon of remaining renovation impressions */}
        <section className="border-t border-border/60 px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <span className="eyebrow">{t("history.impressionsEyebrow")}</span>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {RIBBON_PHOTOS.map((photo) => (
                <figure
                  key={photo.src}
                  className="img-hover overflow-hidden border border-border bg-card"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
