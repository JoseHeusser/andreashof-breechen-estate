import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

const historyHero = "/galerie/history/img_3432.jpg";
const historicMap = "/galerie/history/breechen-historisch.jpg";

type ImpressionItem = {
  src: string;
  alt: string;
};

const IMPRESSIONS: ImpressionItem[] = [
  {
    src: "/galerie/history/img_3775.jpg",
    alt: "Dachstuhl und Fachwerk waehrend der Sanierung des Andreashof Breechen",
  },
  {
    src: "/galerie/history/img_3776.jpg",
    alt: "Fachwerk und Rundfenster im Andreashof Breechen waehrend der Bauphase",
  },
  {
    src: "/galerie/history/img_4533.jpg",
    alt: "Neue Dachkonstruktion und alte Raumstruktur waehrend der Sanierung",
  },
  {
    src: "/galerie/history/img_3137.jpg",
    alt: "Freigelegte historische Wand im Andreashof Breechen waehrend der Sanierung",
  },
  {
    src: "/galerie/history/img_3136.jpg",
    alt: "Entkernter Raum im Andreashof Breechen mit freigelegten Boeden",
  },
  {
    src: "/galerie/history/img_3152.jpg",
    alt: "Entkernter Raum im Andreashof Breechen vor dem Wiederaufbau",
  },
  {
    src: "/galerie/history/img_3236.jpg",
    alt: "Bauphase mit freigelegtem Boden und alten Wandflaechen",
  },
  {
    src: "/galerie/history/img_3433.jpg",
    alt: "Historische Bausubstanz mit offenem Dachstuhl im Andreashof Breechen",
  },
  {
    src: "/galerie/history/history-detail-dachbalken.jpg",
    alt: "Detail der sanierten Dachbalken im Andreashof Breechen",
  },
  {
    src: "/galerie/history/history-fundstuecke.jpg",
    alt: "Historische Fundstuecke aus der Bauphase im Andreashof Breechen",
  },
  {
    src: "/galerie/history/img_2999.jpg",
    alt: "Eindruck aus der Geschichte des Andreashof Breechen",
  },
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

function NarrativeSection({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <section className="border-t border-border/60 px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[200px_1fr] md:gap-16">
        <h2 className="font-display text-2xl font-light leading-tight text-sage-deep md:text-3xl">
          {title}
        </h2>
        <div className="space-y-5 text-base leading-relaxed text-foreground/85 md:text-[1.05rem]">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
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
        {/* HERO */}
        <section className="px-5 pt-12 pb-12 md:px-10 md:pt-16 md:pb-20">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-16">
            <div>
              <span className="eyebrow">{t("history.eyebrow")}</span>
              <h1 className="mt-4 max-w-4xl font-display text-[2.35rem] font-light leading-[1.05] md:text-6xl">
                {t("history.title")}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
                {t("history.subtitle")}
              </p>
            </div>
            <figure className="overflow-hidden border border-border">
              <img
                src={historyHero}
                alt="Freigelegter Dachstuhl und historische Mauern waehrend der Sanierung"
                className="aspect-[4/3] w-full object-cover"
              />
            </figure>
          </div>
        </section>

        {/* HISTORIC MAP */}
        <section className="bg-linen px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-5xl">
            <span className="eyebrow">{t("history.mapEyebrow")}</span>
            <figure className="mt-8 overflow-hidden border border-border bg-card">
              <img
                src={historicMap}
                alt="Schwedische Situationskarte von Jarmen mit Breechen"
                loading="lazy"
                className="w-full object-contain"
              />
              <figcaption className="border-t border-border/60 px-5 py-4 text-xs leading-relaxed text-muted-foreground md:px-7 md:text-sm">
                {t("history.mapCaption")}
              </figcaption>
            </figure>
          </div>
        </section>

        {/* NARRATIVE — Andreas's text */}
        <NarrativeSection title={t("history.section1Title")} paragraphs={section1} />
        <NarrativeSection title={t("history.section2Title")} paragraphs={section2} />
        <NarrativeSection title={t("history.section3Title")} paragraphs={section3} />

        {/* IMPRESSIONS (renovation photos) */}
        <section className="border-t border-border/60 bg-linen px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <span className="eyebrow">{t("history.impressionsEyebrow")}</span>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {IMPRESSIONS.map((photo) => (
                <figure key={photo.src} className="img-hover overflow-hidden border border-border bg-card">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
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
