import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ServiceContact, ServiceList, ServicePrice } from "@/components/service-page";

const PHOTOS = [
  { src: "/galerie/pferdeboxen/pferdebox-03.jpg", alt: "Pferdebox mit Blick in den Garten" },
  { src: "/galerie/pferdeboxen/pferdebox-01.jpg", alt: "Pferdebox mit frischem Stroh" },
  { src: "/galerie/pferdeboxen/pferdebox-05.jpg", alt: "Pferdebox im Andreashof" },
  { src: "/galerie/pferdeboxen/pferdebox-06.jpg", alt: "Pferdebox im Andreashof" },
  { src: "/galerie/pferdeboxen/pferdebox-07.jpg", alt: "Pferdebox im Andreashof" },
  { src: "/galerie/pferdeboxen/pferdebox-08.jpg", alt: "Pferdebox im Andreashof" },
];

export const Route = createFileRoute("/pferdeboxen")({
  head: () => ({
    meta: [
      { title: "Urlaub mit dem Pferd · Andreashof Breechen" },
      {
        name: "description",
        content:
          "Urlaub mit Deinem Pferd am Andreashof Breechen: 3 Boxen mit Stroh und Heu, Paddock, tägliches Misten, Ausreiten am Greifswalder Bodden und auf Usedom. 45 € pro Pferd und Tag.",
      },
    ],
    links: [{ rel: "canonical", href: "/pferdeboxen" }],
  }),
  component: PferdeboxenPage,
});

function PferdeboxenPage() {
  const { t } = useTranslation();
  const stableItems = t("pferdeboxen.stableItems", { returnObjects: true }) as string[];
  const ridesItems = t("pferdeboxen.ridesItems", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      <main>
        <section className="px-5 pt-12 pb-8 md:px-10 md:pt-16 md:pb-10">
          <div className="mx-auto max-w-6xl">
            <span className="eyebrow">{t("pferdeboxen.eyebrow")}</span>
            <h1 className="mt-4 max-w-4xl break-words font-display text-[2rem] font-light leading-[1.05] max-md:text-[1.85rem] md:text-6xl">
              {t("pferdeboxen.title")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
              {t("pferdeboxen.intro")}
            </p>
          </div>
        </section>

        <section className="px-5 pb-12 md:px-10 md:pb-16">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3">
            {PHOTOS.map((photo) => (
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
        </section>

        <section className="px-5 pb-12 md:px-10 md:pb-16">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:gap-16">
            <ServiceList title={t("pferdeboxen.stableTitle")} items={stableItems} />
            <ServiceList title={t("pferdeboxen.ridesTitle")} items={ridesItems} />
          </div>
        </section>

        <section className="px-5 pb-16 md:px-10 md:pb-24">
          <div className="mx-auto max-w-md space-y-8">
            <ServicePrice
              label={t("pferdeboxen.priceLabel")}
              price={t("pferdeboxen.price")}
              unit={t("pferdeboxen.priceUnit")}
              note={t("pferdeboxen.priceNote")}
            />
            <ServiceContact
              subject="Urlaub mit dem Pferd"
              message={t("pferdeboxen.message")}
              whatsappLabel={t("pferdeboxen.ctaWhatsapp")}
              emailLabel={t("pferdeboxen.ctaEmail")}
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
