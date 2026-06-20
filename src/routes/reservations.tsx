import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DayPicker, type DateRange } from "react-day-picker";
import { de as deLocale, es as esLocale } from "date-fns/locale";
import { differenceInCalendarDays, addDays, format, isSameMonth, startOfMonth } from "date-fns";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { cn } from "@/lib/utils";
import { createBookingRequest, getBlockedRanges, getPricingQuote } from "@/lib/admin/server-fns";

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

// (placeholder buildBlockedRanges removed — real blocked ranges come from
//  getBlockedRanges, sourced from the bookings + airbnb_uid rows)

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

  // Fetched once on mount from /api server fn — confirmed-or-paid bookings
  // (web + Airbnb iCal sync) become disabled days in the calendar.
  const [blocked, setBlocked] = useState<{ from: Date; to: Date }[]>([]);
  useEffect(() => {
    let cancelled = false;
    getBlockedRanges()
      .then((rows) => {
        if (cancelled) return;
        setBlocked(
          rows.map((r) => ({
            from: new Date(r.arrival + "T00:00:00"),
            // iCal/DB departure is exclusive; day-picker disable wants the
            // last blocked night, so subtract one day.
            to: addDays(new Date(r.departure + "T00:00:00"), -1),
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setBlocked([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState<number>(12);
  const [children, setChildren] = useState<number>(0);
  const [needsCrib, setNeedsCrib] = useState<boolean>(false);
  const [pets, setPets] = useState<number>(0);
  const [needsWheelchair, setNeedsWheelchair] = useState<boolean>(false);
  const [rentsDachboden, setRentsDachboden] = useState<boolean>(false);
  const [occasion, setOccasion] = useState<OccasionKey | "">("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quoteCents, setQuoteCents] = useState<number | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  // The quote is invalidated as soon as the user changes any input after
  // a quote was already fetched. Forces them to click 'Check availability'
  // again — so they can't keep tweaking guests to fish for prices.
  const [quoteStale, setQuoteStale] = useState(false);

  const nights =
    range?.from && range?.to ? Math.max(0, differenceInCalendarDays(range.to, range.from)) : 0;
  const locale = localeFor(i18n.language);
  const fmt = (d: Date) => format(d, "EEE, d MMM", { locale });
  const MAX_GUESTS = 21;
  const guestsTooMany = guests > MAX_GUESTS;
  const canCheck = !!range?.from && !!range?.to && nights >= 1 && guests >= 1 && !guestsTooMany && occasion !== "";
  const showQuote = quoteCents != null && !quoteStale;

  // Mark the quote as stale whenever the user changes any input that
  // affects the price (or the contact metadata).
  useEffect(() => {
    if (quoteCents != null) setQuoteStale(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    range?.from,
    range?.to,
    guests,
    occasion,
    children,
    needsCrib,
    pets,
    needsWheelchair,
    rentsDachboden,
  ]);

  const handleCheckAvailability = async () => {
    if (!canCheck || !range?.from || !range?.to) return;
    setQuoteLoading(true);
    try {
      const res = await getPricingQuote({
        data: {
          arrival: format(range.from, "yyyy-MM-dd"),
          departure: format(range.to, "yyyy-MM-dd"),
          guests,
          children,
          needsCrib: children > 0 && needsCrib,
          pets,
          rentsDachboden,
        },
      });
      setQuoteCents(res.totalCents);
      setQuoteStale(false);
    } catch {
      setQuoteCents(null);
    } finally {
      setQuoteLoading(false);
    }
  };

  const totalFormatted =
    quoteCents != null
      ? new Intl.NumberFormat(i18n.language === "en" ? "en-GB" : i18n.language === "es" ? "es-ES" : "de-DE", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(quoteCents / 100)
      : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      {/* INTRO */}
      <section className="px-5 pt-12 pb-8 md:px-10 md:pt-16 md:pb-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-[2.2rem] font-light leading-[1.1] md:text-6xl">
            {t("reservations.title")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
            {t("reservations.subtitle")}
          </p>
        </div>
      </section>

      {/* BOOKING WIDGET — main content, never gated behind a scroll reveal */}
      <section className="px-5 pb-24 md:px-10 md:pb-32">
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
              <div className="border-b border-border px-5 py-8 md:col-span-7 md:border-b-0 md:border-r md:px-10 md:py-12">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <span className="eyebrow text-sage-deep">
                      {t("reservations.calendarEyebrow")}
                    </span>
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
                      navLayout={numberOfMonths === 2 ? "around" : undefined}
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

                <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:tracking-[0.2em]">
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
              <div className="px-5 py-8 md:col-span-5 md:px-10 md:py-12">
                <span className="eyebrow">{t("reservations.summaryTitle")}</span>

                <div
                  className={`mt-6 border-t border-border pt-6 transition-all ${
                    showQuote ? "pb-2" : "border-b pb-2"
                  }`}
                >
                  {range?.from ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!range?.from || !range?.to) return;
                    setSubmitError(null);
                    setSubmitting(true);
                    try {
                      const fd = new FormData(e.currentTarget);
                      await createBookingRequest({
                        data: {
                          arrival: format(range.from, "yyyy-MM-dd"),
                          departure: format(range.to, "yyyy-MM-dd"),
                          guests,
                          children,
                          needsCrib: children > 0 && needsCrib,
                          pets,
                          needsWheelchair,
                          rentsDachboden,
                          occasion: occasion || undefined,
                          name: String(fd.get("name") || ""),
                          email: String(fd.get("email") || ""),
                        },
                      });
                      setSubmitted(true);
                    } catch (err) {
                      setSubmitError(
                        err instanceof Error
                          ? err.message
                          : "Beim Senden ist etwas schiefgegangen.",
                      );
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="mt-1 space-y-6"
                >
                  {/* Editable inputs (Guests + Occasion) — collapse out once
                       the user has checked availability so they can't keep
                       tweaking values to fish for prices. 'Ändern' brings
                       them back. */}
                  <div
                    className={`space-y-6 transition-all duration-500 ease-out ${
                      showQuote
                        ? "max-h-0 -translate-y-1 opacity-0 pointer-events-none overflow-hidden"
                        : "max-h-[28rem] translate-y-0 opacity-100"
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="guests" className="eyebrow">
                          {t("reservations.adults")}
                        </label>
                        <input
                          id="guests"
                          type="number"
                          min={1}
                          max={MAX_GUESTS}
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className={`mt-3 min-h-11 w-full border-0 border-b bg-transparent py-2 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep ${
                            guestsTooMany ? "border-red-500" : "border-border"
                          }`}
                        />
                      </div>
                      <div>
                        <label htmlFor="children" className="eyebrow">
                          {t("reservations.children")}
                        </label>
                        <input
                          id="children"
                          type="number"
                          min={0}
                          max={10}
                          value={children}
                          onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                          className="mt-3 min-h-11 w-full border-0 border-b border-border bg-transparent py-2 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep"
                        />
                      </div>
                    </div>
                    {guestsTooMany && (
                      <p className="text-[11px] leading-relaxed text-red-700">
                        {t("reservations.guestsMaxError")}
                      </p>
                    )}
                    {children > 0 && (
                      <p className="-mt-3 text-[11px] leading-relaxed text-muted-foreground">
                        {t("reservations.childrenHint")}
                      </p>
                    )}

                    <div>
                      <label htmlFor="occasion" className="eyebrow">
                        {t("reservations.fields.occasion")}
                      </label>
                      <div className="relative mt-3">
                        <select
                          id="occasion"
                          value={occasion}
                          onChange={(e) => setOccasion(e.target.value as OccasionKey)}
                          className="min-h-11 w-full appearance-none border-0 border-b border-border bg-transparent py-2 pr-8 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep"
                        >
                          <option value="" disabled>
                            —
                          </option>
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

                    {/* Extras: pets, wheelchair, dachboden — plus the crib question
                         that only shows when children > 0 */}
                    <div className="border-t border-border pt-5">
                      <p className="eyebrow mb-3">{t("reservations.extrasTitle")}</p>
                      <div className="space-y-3 text-sm">
                        {children > 0 && (
                          <Toggle
                            label={t("reservations.cribQuestion")}
                            note={t("reservations.cribNote")}
                            checked={needsCrib}
                            onChange={setNeedsCrib}
                          />
                        )}
                        {/* Pets — number input rather than yes/no, so Andrea
                            knows how many are coming. Price per animal stays
                            hidden from the public. */}
                        <div className="flex items-center justify-between gap-3">
                          <label htmlFor="pets" className="flex-1">
                            <span className="block text-[13px] text-foreground/90">
                              {t("reservations.petsQuestion")}
                            </span>
                          </label>
                          <input
                            id="pets"
                            type="number"
                            min={0}
                            max={5}
                            value={pets}
                            onChange={(e) => setPets(Math.max(0, Number(e.target.value)))}
                            className="w-16 border-0 border-b border-border bg-transparent py-1 text-center text-sm focus:border-sage-deep focus:outline-none"
                          />
                        </div>
                        <Toggle
                          label={t("reservations.wheelchairQuestion")}
                          note={t("reservations.wheelchairNote")}
                          checked={needsWheelchair}
                          onChange={setNeedsWheelchair}
                        />
                        <Toggle
                          label={t("reservations.dachbodenQuestion")}
                          note={t("reservations.dachbodenNote")}
                          checked={rentsDachboden}
                          onChange={setRentsDachboden}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Collapsed summary — shown after Check availability */}
                  <div
                    className={`transition-all duration-500 ease-out ${
                      showQuote
                        ? "max-h-32 translate-y-0 opacity-100"
                        : "max-h-0 -translate-y-1 opacity-0 pointer-events-none overflow-hidden"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          {t("reservations.fields.guests")} · {t("reservations.fields.occasion")}
                        </p>
                        <p className="mt-1 font-display text-lg leading-tight text-foreground">
                          {guests}
                          {children > 0 ? ` + ${children} 👶` : ""}
                          {" · "}
                          {occasion ? occasionOptions[occasion as OccasionKey] : ""}
                        </p>
                        {(needsCrib || pets > 0 || needsWheelchair || rentsDachboden) && (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {[
                              needsCrib && "🛏",
                              pets > 0 && `🐾 ${pets}`,
                              needsWheelchair && "♿",
                              rentsDachboden && "🧘",
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setQuoteCents(null);
                          setQuoteStale(false);
                        }}
                        className="shrink-0 text-[11px] uppercase tracking-[0.22em] text-muted-foreground underline decoration-muted-foreground/30 underline-offset-[6px] transition-all duration-200 hover:text-sage-deep hover:decoration-sage-deep hover:underline-offset-4"
                      >
                        {t("reservations.change")}
                      </button>
                    </div>
                  </div>

                  {/* Total price block — sits below the collapsed summary */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-out ${
                      showQuote
                        ? "max-h-40 translate-y-0 opacity-100"
                        : "max-h-0 -translate-y-1 opacity-0"
                    }`}
                  >
                    <div className="pt-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        {t("reservations.summaryTotal")}
                      </p>
                      <p className="mt-1 font-display text-3xl leading-tight text-foreground">
                        {totalFormatted ?? "…"}
                      </p>
                    </div>
                  </div>

                  {/* Step 1: Check availability — gates the contact form below */}
                  <div
                    className={`transition-all duration-500 ease-out ${
                      showQuote ? "max-h-0 -translate-y-1 opacity-0 pointer-events-none overflow-hidden" : "max-h-40 translate-y-0 opacity-100"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={!canCheck || quoteLoading}
                      onClick={handleCheckAvailability}
                      className="mt-2 min-h-11 w-full border border-foreground bg-foreground px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] text-background transition-colors hover:bg-sage-deep hover:border-sage-deep disabled:cursor-not-allowed disabled:border-border disabled:bg-border disabled:text-muted-foreground md:tracking-[0.28em]"
                    >
                      {quoteLoading ? t("reservations.checking") : t("reservations.checkAvailability")}
                    </button>
                    {!canCheck && !guestsTooMany && (
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                        {t("reservations.selectFieldsFirst")}
                      </p>
                    )}
                  </div>

                  {/* Step 2: Contact form — fades in once a quote has been fetched */}
                  <div
                    className={`space-y-6 transition-all duration-500 ease-out ${
                      showQuote ? "max-h-[40rem] translate-y-0 opacity-100" : "max-h-0 -translate-y-1 opacity-0 pointer-events-none overflow-hidden"
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <SmallField label={t("reservations.fields.name")} name="name" required />
                      <SmallField
                        label={t("reservations.fields.email")}
                        name="email"
                        type="email"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!showQuote || submitting}
                      className="mt-2 min-h-11 w-full border border-foreground bg-foreground px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] text-background transition-colors hover:bg-sage-deep hover:border-sage-deep disabled:cursor-not-allowed disabled:border-border disabled:bg-border disabled:text-muted-foreground md:tracking-[0.28em]"
                    >
                      {submitting ? "…" : t("reservations.submit")}
                    </button>
                    {submitError && (
                      <p className="text-[11px] leading-relaxed text-red-700">
                        {submitError}
                      </p>
                    )}
                  </div>
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
      <section className="reveal border-t border-border bg-linen px-5 py-20 md:px-10 md:py-28">
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
      <section className="reveal border-t border-border px-5 py-20 md:px-10 md:py-28">
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
        className="mt-3 min-h-11 w-full border-0 border-b border-border bg-transparent py-2 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep"
      />
    </div>
  );
}

function Toggle({
  label,
  note,
  checked,
  onChange,
}: {
  label: string;
  note?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span className="flex-1">
        <span className="block text-[13px] text-foreground/90">{label}</span>
        {note && <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{note}</span>}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
          checked ? "border-sage-deep bg-sage-deep" : "border-border bg-background"
        }`}
      >
        <span
          className={`absolute h-3 w-3 rounded-full transition-transform ${
            checked ? "translate-x-5 bg-white" : "translate-x-1 bg-muted-foreground"
          }`}
        />
      </span>
    </label>
  );
}

// Renders during SSR + first client paint to keep the calendar slot the same
// height. Once `today` is set in useEffect, the real DayPicker takes over.
function CalendarSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6 md:flex-row md:gap-8" aria-hidden="true">
      {[0, 1].map((m) => (
        <div key={m} className={cn("grid flex-1 grid-cols-7 gap-2", m === 1 && "hidden md:grid")}>
          <div className="col-span-7 mb-3 h-6 w-32 bg-linen" />
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square w-full rounded-full bg-linen/60" />
          ))}
        </div>
      ))}
    </div>
  );
}
