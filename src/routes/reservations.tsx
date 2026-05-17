import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reservierung · Andreashof Breechen" },
      {
        name: "description",
        content:
          "Reservieren Sie das ganze Gutshaus Andreashof Breechen — für 11 bis 21 Gäste. Wir antworten innerhalb von 24 Stunden.",
      },
    ],
    links: [{ rel: "canonical", href: "/reservations" }],
  }),
  component: ReservationsPage,
});

type OccasionKey = "wedding" | "family" | "retreat" | "other";

function ReservationsPage() {
  const { t } = useTranslation();
  const steps = t("reservations.steps", { returnObjects: true }) as {
    n: string;
    title: string;
    body: string;
  }[];
  const occasionOptions = t("reservations.fields.occasionOptions", {
    returnObjects: true,
  }) as Record<OccasionKey, string>;

  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Solid header strip (no hero image behind) */}
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      {/* INTRO */}
      <section className="px-6 pt-20 pb-16 md:px-10 md:pt-28 md:pb-20">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <span className="eyebrow">{t("reservations.eyebrow")}</span>
            <span className="rule ml-4 align-middle" />
          </div>
          <div className="md:col-span-8">
            <h1 className="font-display text-4xl font-light leading-[1.1] md:text-6xl">
              {t("reservations.title")}
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
              {t("reservations.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="border-t border-border bg-linen px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">{t("reservations.stepsEyebrow")}</span>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
            {steps.map((s) => (
              <div key={s.n} className="border-t border-sage pt-8">
                <p className="font-display text-3xl italic text-sage-deep md:text-4xl">
                  {s.n}
                </p>
                <h3 className="mt-4 font-display text-xl font-light leading-tight md:text-2xl">
                  {s.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-4">
              <span className="eyebrow">{t("reservations.formEyebrow")}</span>
            </div>
            <div className="md:col-span-8">
              <h2 className="font-display text-3xl font-light leading-tight md:text-5xl">
                {t("reservations.formTitle")}
              </h2>
            </div>
          </div>

          {submitted ? (
            <div className="border border-sage bg-card px-8 py-16 text-center md:px-16 md:py-24">
              <p className="font-display text-2xl font-light italic text-sage-deep md:text-3xl">
                {t("reservations.thanks")}
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="border border-border bg-card px-6 py-10 md:px-12 md:py-14"
            >
              {/* Dates */}
              <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
                <Field label={t("reservations.fields.arrival")} name="arrival" type="date" required />
                <Field label={t("reservations.fields.departure")} name="departure" type="date" required />

                <div>
                  <label htmlFor="guests" className="eyebrow">
                    {t("reservations.fields.guests")}
                    <span className="ml-2 normal-case tracking-normal text-muted-foreground">
                      ({t("reservations.fields.guestsHint")})
                    </span>
                  </label>
                  <input
                    id="guests"
                    name="guests"
                    type="number"
                    min={11}
                    max={21}
                    required
                    className="mt-3 w-full border-0 border-b border-border bg-transparent py-3 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep"
                  />
                </div>

                <div>
                  <label htmlFor="occasion" className="eyebrow">
                    {t("reservations.fields.occasion")}
                  </label>
                  <div className="relative mt-3">
                    <select
                      id="occasion"
                      name="occasion"
                      defaultValue=""
                      className="w-full appearance-none border-0 border-b border-border bg-transparent py-3 pr-8 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep"
                    >
                      <option value="" disabled>—</option>
                      {(Object.keys(occasionOptions) as OccasionKey[]).map((k) => (
                        <option key={k} value={k}>
                          {occasionOptions[k]}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 font-display text-lg italic text-sage-deep">
                      ▾
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 h-px w-full bg-border/60" />

              {/* Contact */}
              <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
                <Field label={t("reservations.fields.name")} name="name" required />
                <Field label={t("reservations.fields.email")} name="email" type="email" required />
                <Field label={t("reservations.fields.phone")} name="phone" type="tel" />
                <div className="md:col-span-2">
                  <label htmlFor="message" className="eyebrow">
                    {t("reservations.fields.message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder={t("reservations.fields.messagePlaceholder")}
                    className="mt-3 w-full border-0 border-b border-border bg-transparent py-3 font-sans text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-sage-deep"
                  />
                </div>
              </div>

              <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
                {t("reservations.pricingNote")}
              </p>

              <div className="mt-10 border-t border-border pt-8 md:flex md:items-baseline md:justify-between md:gap-10">
                <p className="text-xs leading-relaxed text-muted-foreground md:max-w-md">
                  {t("reservations.submitNote")}
                </p>
                <button
                  type="submit"
                  className="mt-6 w-full border border-foreground bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-sage-deep hover:border-sage-deep md:mt-0 md:w-auto"
                >
                  {t("reservations.submit")}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* DIRECT CONTACT */}
      <section className="border-t border-border bg-linen px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="eyebrow">{t("reservations.contactEyebrow")}</span>
            <h3 className="mt-4 font-display text-2xl font-light leading-tight md:text-3xl">
              {t("reservations.contactBody")}
            </h3>
          </div>
          <div className="md:col-span-7">
            <ul className="space-y-4 text-base">
              <li>
                <a href="mailto:willkommen@andreashof-breechen.de" className="hover:text-sage-deep">
                  willkommen@andreashof-breechen.de
                </a>
              </li>
              <li>
                <a href="https://wa.me/4915112345678" className="hover:text-sage-deep">
                  WhatsApp · +49 151 1234 5678
                </a>
              </li>
            </ul>
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
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
        className="mt-3 w-full border-0 border-b border-border bg-transparent py-3 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep"
      />
    </div>
  );
}
