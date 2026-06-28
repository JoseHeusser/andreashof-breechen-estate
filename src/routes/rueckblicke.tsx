import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

const historyHero = "/galerie/history/img_3432.jpg";

type TimelineItem = {
  year: string;
  title: string;
  body: string;
};

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

function RueckblickePage() {
  const { t } = useTranslation();
  const timeline = t("history.timeline", { returnObjects: true }) as TimelineItem[];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      <main>
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

        <section className="px-5 pb-16 md:px-10 md:pb-24">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>

        <section className="border-y border-border/70 bg-linen px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-5xl">
            <span className="eyebrow">{t("history.timelineEyebrow")}</span>
            <div className="mt-10 divide-y divide-border/80 border-y border-border/80">
              {timeline.map((item) => (
                <article key={`${item.year}-${item.title}`} className="grid gap-4 py-8 md:grid-cols-[180px_1fr] md:gap-10">
                  <p className="font-display text-3xl font-light text-sage-deep md:text-4xl">
                    {item.year}
                  </p>
                  <div>
                    <h2 className="font-display text-2xl font-light leading-tight md:text-3xl">
                      {item.title}
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
