import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ServiceContact, ServiceList, ServicePrice } from "@/components/service-page";

export const Route = createFileRoute("/fruehstueckservice")({
  head: () => ({
    meta: [
      { title: "Frühstücksservice · Andreashof Breechen" },
      {
        name: "description",
        content:
          "Frühstücksservice im Andreashof Breechen: Aufbau und Abbau eines schönen Frühstücksbuffets nach euren Wünschen. Ab 15 € pro Person.",
      },
    ],
    links: [{ rel: "canonical", href: "/fruehstueckservice" }],
  }),
  component: FruehstueckservicePage,
});

function FruehstueckservicePage() {
  const { t } = useTranslation();
  const items = t("fruehstueck.items", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      <main>
        <section className="px-5 pt-12 pb-10 md:px-10 md:pt-16 md:pb-14">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">{t("fruehstueck.eyebrow")}</span>
            <h1 className="mt-4 break-words font-display text-[2rem] font-light leading-[1.05] max-md:text-[1.85rem] md:text-6xl">
              {t("fruehstueck.title")}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
              {t("fruehstueck.intro")}
            </p>
          </div>
        </section>

        <section className="px-5 pb-16 md:px-10 md:pb-24">
          <div className="mx-auto max-w-md space-y-10">
            <ServiceList items={items} />
            <ServicePrice
              label={t("fruehstueck.priceLabel")}
              price={t("fruehstueck.price")}
              unit={t("fruehstueck.priceUnit")}
              note={t("fruehstueck.priceNote")}
            />
            <ServiceContact
              subject="Frühstücksservice"
              message={t("fruehstueck.message")}
              whatsappLabel={t("fruehstueck.ctaWhatsapp")}
              emailLabel={t("fruehstueck.ctaEmail")}
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
