import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { PARTNER_PHOTOS, type PartnerId } from "@/data/partners";

type PartnerItem = {
  id: PartnerId;
  title: string;
  category: string;
  description: string;
  area: string;
  phone?: string;
  websiteUrl?: string;
  websiteLabel?: string;
};

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Partner & Empfehlungen · Andreashof Breechen" },
      {
        name: "description",
        content:
          "Empfohlene Partner, Dienstleister und Ausflugsziele rund um den Andreashof Breechen.",
      },
    ],
    links: [{ rel: "canonical", href: "/partner" }],
  }),
  component: PartnerPage,
});

function PartnerPage() {
  const { t } = useTranslation();
  const items = t("partners.items", { returnObjects: true }) as PartnerItem[];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      <main>
        <section className="px-5 pt-12 pb-12 md:px-10 md:pt-16 md:pb-16">
          <div className="mx-auto max-w-6xl">
            <span className="eyebrow">{t("partners.eyebrow")}</span>
            <h1 className="mt-4 max-w-4xl font-display text-[2.35rem] font-light leading-[1.05] md:text-6xl">
              {t("partners.title")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
              {t("partners.subtitle")}
            </p>
          </div>
        </section>

        <section className="px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {items.map((item) => {
              const photos = PARTNER_PHOTOS[item.id] ?? [];

              return (
                <article
                  key={item.id}
                  className="flex flex-col border border-border bg-card"
                >
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-0.5 border-b border-border sm:gap-1">
                      {photos.map((photo) => (
                        <div key={photo.src} className="img-hover overflow-hidden">
                          <img
                            src={photo.src}
                            alt={photo.alt}
                            loading="lazy"
                            className="aspect-[4/3] w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {item.category}
                    </p>
                    <h2 className="mt-3 font-display text-xl font-light leading-tight md:text-2xl">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="mt-4 border-t border-border pt-3 text-[11px] uppercase tracking-[0.18em] text-sage-deep">
                      {item.area}
                    </p>
                    {(item.phone || item.websiteUrl) && (
                      <div className="mt-4 flex flex-wrap gap-2 text-xs md:text-sm">
                        {item.phone && (
                          <a
                            href={`tel:${item.phone.replace(/[^\d+]/g, "")}`}
                            className="inline-flex min-h-9 items-center border border-border px-3 py-1.5 transition-colors hover:border-sage-deep hover:text-sage-deep"
                          >
                            {item.phone}
                          </a>
                        )}
                        {item.websiteUrl && (
                          <a
                            href={item.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center border border-border px-3 py-1.5 transition-colors hover:border-sage-deep hover:text-sage-deep"
                          >
                            {item.websiteLabel ?? item.websiteUrl}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
