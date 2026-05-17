import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DayPicker, type DateRange } from "react-day-picker";
import { de as deLocale, es as esLocale } from "date-fns/locale";
import { differenceInCalendarDays, addDays, addMonths, format, isSameMonth, startOfMonth } from "date-fns";
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

// Sample unavailable ranges (placeholder until wired to a real availability source).
function buildBlockedRanges(today: Date): { from: Date; to: Date }[] {
  const base = startOfMonth(today);
  return [
    { from: addDays(base, 12), to: addDays(base, 15) },
    { from: addDays(base, 40), to: addDays(base, 46) },
    { from: addDays(base, 78), to: addDays(base, 82) },
  ];
}

function localeFor(lang: string) {
  if (lang.startsWith("de")) return deLocale;
  if (lang.startsWith("es")) return esLocale;
  return undefined;
}

function ReservationsPage() {
  const { t, i18n } = useTranslation();

  const steps = t("reservations.steps", { returnObjects: true }) as {
    n: string;
    title: string;
    body: string;
  }[];
  const occasionOptions = t("reservations.fields.occasionOptions", {
    returnObjects: true,
  }) as Record<OccasionKey, string>;

  // Date state is initialised after mount only. Computing `new Date()` during
  // SSR vs. on the client in a different timezone produces different month
  // grids in react-day-picker → React error #418 (text content mismatch).
  // We render a skeleton during SSR and the first client paint, then swap
  // the real calendar in once the client has mounted.
  const [today, setToday] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [numberOfMonths, setNumberOfMonths] = useState<1 | 2>(1);

  useEffect(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setToday(d);
    setMonth(d);

    const mql = window.matchMedia("(min-width: 768px)");
    const apply = () => setNumberOfMonths(mql.matches ? 2 : 1);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  const blocked = useMemo(() => (today ? buildBlockedRanges(today) : []), [today]);

  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState<number>(12);
  const [occasion, setOccasion] = useState<OccasionKey | "">("");
  const [submitted, setSubmitted] = useState(false);

  const nights =
    range?.from && range?.to ? Math.max(0, differenceInCalendarDays(range.to, range.from)) : 0;
  const locale = localeFor(i18n.language);
  const fmt = (d: Date) => format(d, "EEE, d MMM", { locale });

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      {/* INTRO */}
      <section className="px-6 pt-12 pb-8 md:px-10 md:pt-16 md:pb-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-4xl font-light leading-[1.1] md:text-6xl">
            {t("reservations.title")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
            {t("reservations.subtitle")}
          </p>
        </div>
      </section>

      {/* BOOKING WIDGET — main content, never gated behind a scroll reveal */}
      <section className="px-6 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-6xl border border-border bg-card">
          {submitted ? (
            <div className="px-8 py-20 text-center md:px-16 md:py-28">
              <p className="font-display text-2xl font-light italic text-sage-deep md:text-3xl">
                {t("reservations.thanks")}
              </p>
            </div>
          ) : (
            <div className="grid gap-0 md:grid-cols-12">
              {/* CALENDAR */}
              <div className="border-b border-border px-6 py-10 md:col-span-7 md:border-b-0 md:border-r md:px-10 md:py-12">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <span className="eyebrow text-sage-deep">{t("reservations.calendarEyebrow")}</span>
                    <h2 className="mt-2 font-display text-2xl font-light leading-tight md:text-3xl">
                      {t("reservations.calendarTitle")}
                    </h2>
                  </div>
                  <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                    {t("reservations.calendarHint")}
                  </p>
                </div>

                <div className="andreashof-calendar">
                  {today && month ? (
                    <DayPicker
                      mode="range"
                      selected={range}
                      onSelect={(r) => {
                        setRange(r);
                        if (r?.from && !isSameMonth(r.from, month)) setMonth(startOfMonth(r.from));
                      }}
                      month={month}
                      onMonthChange={setMonth}
                      numberOfMonths={numberOfMonths}
                      pagedNavigation
                      disabled={[{ before: today }, ...blocked]}
                      locale={locale}
                      showOutsideDays={false}
                      weekStartsOn={1}
                    />
                  ) : (
                    <CalendarSkeleton />
                  )}
                </div>

                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 border border-border bg-background" />
                    {t("reservations.legendAvailable")}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 bg-sage-deep" />
                    {t("reservations.legendSelected")}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 bg-border line-through" />
                    {t("reservations.legendBlocked")}
                  </li>
                </ul>
              </div>

              {/* SUMMARY & FORM */}
              <div className="px-6 py-10 md:col-span-5 md:px-10 md:py-12">
                <span className="eyebrow">{t("reservations.summaryTitle")}</span>

                <div className="mt-6 border-y border-border py-6">
                  {range?.from ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            {t("reservations.summaryArrival")}
                          </p>
                          <p className="mt-2 font-display text-lg leading-tight text-foreground">
                            {fmt(range.from)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            {t("reservations.summaryDeparture")}
                          </p>
                          <p className="mt-2 font-display text-lg leading-tight text-foreground">
                            {range.to ? fmt(range.to) : "—"}
                          </p>
                        </div>
                      </div>
                      {nights > 0 && (
                        <p className="text-sm italic text-sage-deep">
                          {t("reservations.summaryNights", { count: nights })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t("reservations.summaryEmpty")}
                    </p>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="mt-6 space-y-6"
                >
                  <div>
                    <label htmlFor="guests" className="eyebrow">
                      {t("reservations.fields.guests")}
                      <span className="ml-2 normal-case tracking-normal text-muted-foreground">
                        ({t("reservations.fields.guestsHint")})
                      </span>
                    </label>
                    <input
                      id="guests"
                      type="number"
                      min={11}
                      max={21}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="mt-3 w-full border-0 border-b border-border bg-transparent py-2 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep"
                    />
                  </div>

                  <div>
                    <label htmlFor="occasion" className="eyebrow">
                      {t("reservations.fields.occasion")}
                    </label>
                    <div className="relative mt-3">
                      <select
                        id="occasion"
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value as OccasionKey)}
                        className="w-full appearance-none border-0 border-b border-border bg-transparent py-2 pr-8 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep"
                      >
                        <option value="" disabled>—</option>
                        {(Object.keys(occasionOptions) as OccasionKey[]).map((k) => (
                          <option key={k} value={k}>
                            {occasionOptions[k]}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 font-display text-base italic text-sage-deep">
                        ▾
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <SmallField label={t("reservations.fields.name")} name="name" required />
                    <SmallField label={t("reservations.fields.email")} name="email" type="email" required />
                  </div>

                  <button
                    type="submit"
                    disabled={!range?.from || !range?.to}
                    className="mt-2 w-full border border-foreground bg-foreground px-6 py-4 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-sage-deep hover:border-sage-deep disabled:cursor-not-allowed disabled:border-border disabled:bg-border disabled:text-muted-foreground"
                  >
                    {t("reservations.submit")}
                  </button>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {t("reservations.submitNote")}
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* STEPS */}
      <section className="reveal border-t border-border bg-linen px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">{t("reservations.stepsEyebrow")}</span>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
            {steps.map((s) => (
              <div key={s.n} className="border-t border-sage pt-8">
                <p className="font-display text-3xl italic text-sage-deep md:text-4xl">{s.n}</p>
                <h3 className="mt-4 font-display text-xl font-light leading-tight md:text-2xl">
                  {s.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <p className="reveal mt-16 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {t("reservations.pricingNote")}
          </p>
        </div>
      </section>

      {/* DIRECT CONTACT */}
      <section className="reveal border-t border-border px-6 py-20 md:px-10 md:py-28">
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

function SmallField({
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
        className="mt-3 w-full border-0 border-b border-border bg-transparent py-2 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep"
      />
    </div>
  );
}

// Renders during SSR + first client paint to keep the calendar slot the same
// height. Once `today` is set in useEffect, the real DayPicker takes over.
function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-2" aria-hidden="true">
      <div className="col-span-7 mb-3 h-6 w-32 bg-linen" />
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="h-9 w-full rounded-full bg-linen/60" />
      ))}
    </div>
  );
}
