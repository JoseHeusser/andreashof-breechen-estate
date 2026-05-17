import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import heroImg from "@/assets/hero-facade.jpeg";
import salonImg from "@/assets/interior-salon.jpg";
import diningImg from "@/assets/dining-room.jpg";
import bedroomImg from "@/assets/bedroom.jpg";
import gardenImg from "@/assets/garden.jpg";
import nookImg from "@/assets/nook.jpg";
import kitchenImg from "@/assets/kitchen.jpg";

const LocationMap = lazy(() =>
  import("@/components/location-map").then((m) => ({ default: m.LocationMap })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Andreashof Breechen — Historisches Gutshaus in Vorpommern" },
      {
        name: "description",
        content:
          "Gustavianisches Gutshaus aus dem 18. Jahrhundert in Gützkow, Vorpommern. Komplett mietbar für bis zu 21 Gäste — Familien, Hochzeiten, Retreats.",
      },
      { property: "og:title", content: "Andreashof Breechen — Historisches Gutshaus" },
      {
        property: "og:description",
        content:
          "Ein stilles, lichtdurchflutetes Gutshaus im gustavianischen Stil. Für bis zu 21 Gäste.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroImg },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { t } = useTranslation();
  const uses = t("uses", { returnObjects: true }) as Record<
    "family" | "weddings" | "retreats",
    { title: string; body: string }
  >;
  const amenityItems = t("amenitiesSec.items", { returnObjects: true }) as string[];
  const nearby = t("locationSec.nearby", { returnObjects: true }) as { place: string; time: string }[];
  const reviews = t("reviewsSec.items", { returnObjects: true }) as { q: string; a: string }[];
  const faqs = t("faq.items", { returnObjects: true }) as { q: string; a: string }[];

  const [open, setOpen] = useState<number | null>(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div id="top" className="min-h-screen bg-background">
      <SiteHeader tone="light" />

      {/* HERO */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-foreground">
        <img
          src={heroImg}
          alt="Fassade des Andreashof Breechen mit Fachwerkgiebel"
          className="absolute inset-0 h-full w-full object-cover animate-hero-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.45)_100%)]" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-end px-6 pb-20 text-center md:px-10 md:pb-28">
          <span
            className="eyebrow animate-fade-up text-white/85"
            style={{ animationDelay: "200ms", color: "rgba(255,255,255,0.85)" }}
          >
            {t("hero.eyebrow")}
          </span>
          <h1
            className="mt-6 animate-fade-up font-display text-5xl font-light leading-[1.05] text-white md:text-7xl lg:text-[5.5rem]"
            style={{ animationDelay: "400ms", textShadow: "0 2px 28px rgba(0,0,0,0.5)" }}
          >
            {t("hero.titleLine1")}<br />
            <em className="italic text-white/95">{t("hero.titleLine2")}</em>
          </h1>
          <p
            className="mt-8 max-w-xl animate-fade-up text-base leading-relaxed text-white/85 md:text-lg"
            style={{ animationDelay: "700ms", textShadow: "0 1px 14px rgba(0,0,0,0.5)" }}
          >
            {t("hero.subtitle")}
          </p>
          <div
            className="mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: "950ms" }}
          >
            <a
              href="#anfrage"
              className="border border-white bg-white px-8 py-3.5 text-[11px] uppercase tracking-[0.28em] text-foreground transition-all duration-500 hover:bg-sage-deep hover:border-sage-deep hover:text-white"
            >
              {t("hero.ctaPrimary")}
            </a>
            <a
              href="#haus"
              className="border border-white/70 px-8 py-3.5 text-[11px] uppercase tracking-[0.28em] text-white transition-all duration-500 hover:bg-white/10 hover:border-white"
            >
              {t("hero.ctaSecondary")}
            </a>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section id="haus" className="px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
          <div className="reveal md:col-span-4">
            <span className="eyebrow">{t("intro.eyebrow")}</span>
            <span className="rule ml-4 align-middle" />
          </div>
          <div className="md:col-span-8">
            <h2 className="reveal font-display text-3xl font-light leading-[1.15] md:text-5xl" style={{ transitionDelay: "120ms" }}>
              {t("intro.titleA")}
              <em className="italic text-sage-deep">{t("intro.titleEm")}</em>
              {t("intro.titleB")}
            </h2>
            <div className="reveal mt-10 grid gap-8 text-base leading-relaxed text-muted-foreground md:grid-cols-2 md:text-[1.05rem]" style={{ transitionDelay: "240ms" }}>
              <p>{t("intro.p1")}</p>
              <p>{t("intro.p2")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* USES */}
      <section className="px-6 pb-28 md:px-10 md:pb-40">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {(["family", "weddings", "retreats"] as const).map((k, i) => (
              <article
                key={k}
                className="reveal border border-border bg-card p-10 transition-all duration-500 hover:-translate-y-1 hover:border-sage hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.15)]"
                style={{ transitionDelay: `${i * 140}ms` }}
              >
                <h3 className="font-display text-2xl font-light md:text-3xl">
                  {uses[k].title}
                </h3>
                <div className="mt-5 h-px w-10 bg-sage" />
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  {uses[k].body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="galerie" className="bg-linen px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">{t("gallery.eyebrow")}</span>
              <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
                {t("gallery.title")}
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("gallery.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="img-hover reveal col-span-12 md:col-span-8">
              <img src={salonImg} alt={t("gallery.alt.salon")} loading="lazy" className="h-[320px] w-full object-cover md:h-[520px]" />
            </div>
            <div className="img-hover reveal col-span-6 md:col-span-4" style={{ transitionDelay: "120ms" }}>
              <img src={bedroomImg} alt={t("gallery.alt.bedroom")} loading="lazy" className="h-[320px] w-full object-cover md:h-[520px]" />
            </div>
            <div className="img-hover reveal col-span-6 md:col-span-4">
              <img src={nookImg} alt={t("gallery.alt.nook")} loading="lazy" className="h-[260px] w-full object-cover md:h-[400px]" />
            </div>
            <div className="img-hover reveal col-span-12 md:col-span-4" style={{ transitionDelay: "120ms" }}>
              <img src={diningImg} alt={t("gallery.alt.dining")} loading="lazy" className="h-[260px] w-full object-cover md:h-[400px]" />
            </div>
            <div className="img-hover reveal col-span-6 md:col-span-4" style={{ transitionDelay: "240ms" }}>
              <img src={kitchenImg} alt={t("gallery.alt.kitchen")} loading="lazy" className="h-[260px] w-full object-cover md:h-[400px]" />
            </div>
            <div className="img-hover reveal col-span-12">
              <img src={gardenImg} alt={t("gallery.alt.garden")} loading="lazy" className="h-[320px] w-full object-cover md:h-[480px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ROOMS TEASER (links to /zimmer) */}
      <section id="zimmer" className="px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <span className="eyebrow">{t("roomsTeaser.eyebrow")}</span>
              <h2 className="mt-4 font-display text-4xl font-light leading-[1.1] md:text-5xl">
                {t("roomsTeaser.titleA")}
                <em className="italic text-sage-deep">{t("roomsTeaser.titleEm")}</em>
                {t("roomsTeaser.titleB")}
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                {t("roomsTeaser.body")}
              </p>
              <Link
                to="/zimmer"
                className="mt-10 inline-block border border-foreground bg-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-sage-deep hover:border-sage-deep"
              >
                {t("roomsTeaser.cta")}
              </Link>
            </div>
            <div className="md:col-span-5">
              <Link to="/zimmer" className="img-hover block">
                <img
                  src="/rooms/room-01a.jpg"
                  alt={t("gallery.alt.bedroom")}
                  loading="lazy"
                  className="h-[360px] w-full object-cover md:h-[480px]"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AMENITIES */}
      <section className="bg-linen px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <span className="eyebrow">{t("amenitiesSec.eyebrow")}</span>
            <h2 className="mt-4 font-display text-4xl font-light leading-[1.1] md:text-5xl">
              {t("amenitiesSec.title")}
            </h2>
          </div>
          <div className="md:col-span-8">
            <ul className="grid gap-x-10 gap-y-5 md:grid-cols-2">
              {amenityItems.map((a) => (
                <li key={a} className="flex items-baseline gap-4 border-b border-border/60 pb-4">
                  <span className="h-px w-4 shrink-0 translate-y-2 bg-sage" />
                  <span className="text-[0.95rem] text-foreground/85">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section id="lage" className="px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <span className="eyebrow">{t("locationSec.eyebrow")}</span>
              <span className="rule ml-4 align-middle" />
            </div>
            <div className="md:col-span-8">
              <h2 className="font-display text-4xl font-light leading-[1.1] md:text-5xl">
                {t("locationSec.titleA")}
                <em className="italic text-sage-deep">{t("locationSec.titleEm")}</em>
              </h2>
            </div>
          </div>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              {mounted ? (
                <Suspense fallback={<div className="h-[520px] w-full bg-linen" />}>
                  <LocationMap />
                </Suspense>
              ) : (
                <div className="h-[520px] w-full bg-linen" />
              )}
            </div>
            <div className="md:col-span-5">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                {t("locationSec.address")}
              </p>
              <ul className="mt-8 border-t border-border">
                {nearby.map((p) => (
                  <li key={p.place} className="flex items-baseline justify-between border-b border-border py-4">
                    <span className="font-display text-xl">{p.place}</span>
                    <span className="text-sm text-muted-foreground">{p.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-linen px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">{t("reviewsSec.eyebrow")}</span>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-light leading-[1.1] md:text-5xl">
            {t("reviewsSec.title")}
          </h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {reviews.map((r, i) => (
              <figure key={i} className="border-t border-sage pt-8">
                <blockquote className="font-display text-xl font-light italic leading-snug text-foreground md:text-2xl">
                  „{r.q}"
                </blockquote>
                <figcaption className="mt-6 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  — {r.a}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="anfrage" className="px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="eyebrow">{t("booking.eyebrow")}</span>
            <h2 className="mt-4 font-display text-4xl font-light leading-[1.1] md:text-5xl">
              {t("booking.titleA")}
              <em className="italic text-sage-deep">{t("booking.titleEm")}</em>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              {t("booking.body")}
            </p>
            <div className="mt-10 space-y-2 text-sm">
              <p className="text-muted-foreground">{t("booking.or")}</p>
              <p><a href="mailto:willkommen@andreashof-breechen.de" className="hover:text-sage-deep">willkommen@andreashof-breechen.de</a></p>
              <p><a href="https://wa.me/4915112345678" className="hover:text-sage-deep">WhatsApp · +49 151 1234 5678</a></p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(t("booking.thanks"));
            }}
            className="md:col-span-7"
          >
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              <Field label={t("booking.fields.name")} name="name" required />
              <Field label={t("booking.fields.email")} name="email" type="email" required />
              <Field label={t("booking.fields.arrival")} name="arrival" type="date" />
              <Field label={t("booking.fields.departure")} name="departure" type="date" />
              <Field label={t("booking.fields.guests")} name="guests" type="number" />
              <Field label={t("booking.fields.occasion")} name="occasion" placeholder={t("booking.fields.occasionPlaceholder")} />
              <div className="md:col-span-2">
                <label className="eyebrow">{t("booking.fields.message")}</label>
                <textarea
                  name="message"
                  rows={5}
                  className="mt-3 w-full border-0 border-b border-border bg-transparent py-3 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-12 w-full border border-foreground bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-sage-deep hover:border-sage-deep md:w-auto"
            >
              {t("booking.submit")}
            </button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-linen px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <span className="eyebrow">{t("faq.eyebrow")}</span>
            <h2 className="mt-4 font-display text-4xl font-light leading-[1.1] md:text-5xl">
              {t("faq.title")}
            </h2>
          </div>
          <div className="md:col-span-8">
            <div className="border-t border-border">
              {faqs.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div key={i} className="border-b border-border">
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-baseline justify-between gap-6 py-6 text-left transition-colors hover:text-sage-deep"
                    >
                      <span className="font-display text-xl font-light md:text-2xl">
                        {f.q}
                      </span>
                      <span className="font-display text-2xl italic text-sage-deep">
                        {isOpen ? "—" : "·"}
                      </span>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: isOpen ? 240 : 0 }}
                    >
                      <p className="pb-6 pr-12 text-[0.95rem] leading-relaxed text-muted-foreground">
                        {f.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="eyebrow">
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-3 w-full border-0 border-b border-border bg-transparent py-3 font-sans text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-sage-deep"
      />
    </div>
  );
}
