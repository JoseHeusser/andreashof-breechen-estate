import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DayPicker } from "react-day-picker";
import { de as deLocale, enUS as enLocale } from "date-fns/locale";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { installAdminFetch } from "@/lib/admin/auth-fetch";
import { AdminLangSwitcher } from "@/components/admin/admin-lang-switcher";
import {
  getDashboardData,
  updateBasePrice,
  upsertSpecialPrice,
  deleteSpecialPrice,
  updateBooking,
  updateAirbnbIcalUrl,
  triggerAirbnbSync,
} from "@/lib/admin/server-fns";
import {
  STATUS_COLOR,
  type Booking,
  type BookingStatus,
  type PricingRow,
} from "@/lib/supabase/types";

// Helper: returns date-fns locale based on current i18n language.
function useLocale() {
  const { i18n } = useTranslation();
  return i18n.language?.startsWith("en") ? enLocale : deLocale;
}

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin · Andreashof" }] }),
  component: AdminPage,
});

type Tab = "bookings" | "pricing" | "calendar" | "settings";

function AdminPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("bookings");
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<{ key: string; value: unknown }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth gate + fetch
  useEffect(() => {
    installAdminFetch();
    (async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!data.session) {
        nav({ to: "/admin/login" });
        return;
      }
      setEmail(data.session.user.email ?? null);
      setReady(true);
    })();
  }, [nav]);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await getDashboardData();
      setPricing(res.pricing);
      setBookings(res.bookings);
      setSettings(res.settings);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) reload();
  }, [ready]);

  if (!ready) return <div className="p-10 text-muted-foreground">…</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-display text-xl">Andreashof <span className="text-muted-foreground italic">· {t("admin.brand")}</span></Link>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <AdminLangSwitcher />
            <span>{email}</span>
            <button
              onClick={async () => {
                await supabaseBrowser.auth.signOut();
                nav({ to: "/admin/login" });
              }}
              className="hover:text-sage-deep uppercase tracking-[0.22em]"
            >
              {t("admin.signOut")}
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-8 px-6 text-[11px] uppercase tracking-[0.28em]">
          {(["bookings", "pricing", "calendar", "settings"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`py-4 transition-colors ${
                tab === k ? "text-foreground border-b-2 border-sage-deep -mb-px" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(`admin.tabs.${k}`)}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {error && <p className="mb-6 text-sm text-red-700">{error}</p>}
        {loading && !pricing.length ? (
          <p className="text-muted-foreground">{t("admin.loading")}</p>
        ) : tab === "bookings" ? (
          <BookingsTab bookings={bookings} onReload={reload} />
        ) : tab === "pricing" ? (
          <PricingTab pricing={pricing} onReload={reload} />
        ) : tab === "calendar" ? (
          <CalendarTab bookings={bookings} />
        ) : (
          <SettingsTab settings={settings} onReload={reload} />
        )}
      </main>
    </div>
  );
}

/* ============================================================
 *  BOOKINGS TAB
 * ========================================================== */
function BookingsTab({ bookings, onReload }: { bookings: Booking[]; onReload: () => void }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const b of bookings) c[b.status] = (c[b.status] ?? 0) + 1;
    return c;
  }, [bookings]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={t("admin.bookings.filterAll", { n: bookings.length })} />
        {(["requested", "accepted", "deposit_paid", "fully_paid", "cancelled", "completed"] as BookingStatus[]).map((s) => (
          <FilterChip
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            label={`${t(`admin.statusShort.${s}`)} (${counts[s] ?? 0})`}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">{t("admin.bookings.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((b) => (
            <BookingCard key={b.id} booking={b} onReload={onReload} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`border px-3 py-1.5 transition-colors ${
        active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function BookingCard({ booking, onReload }: { booking: Booking; onReload: () => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(booking.status);
  const [notes, setNotes] = useState(booking.internal_notes ?? "");
  const [price, setPrice] = useState(booking.total_price_cents != null ? String(booking.total_price_cents / 100) : "");
  const [busy, setBusy] = useState(false);
  const nights = differenceInCalendarDays(parseISO(booking.departure), parseISO(booking.arrival));

  return (
    <li className="border border-border bg-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-baseline justify-between gap-4 px-5 py-4 text-left">
        <span className="flex-1">
          <span className="font-display text-lg">{booking.contact_name}</span>
          <span className="ml-3 text-xs text-muted-foreground">
            {format(parseISO(booking.arrival), "d MMM", { locale })} → {format(parseISO(booking.departure), "d MMM yyyy", { locale })} · {nights}{t("admin.bookings.nightsShort")} · {booking.guests} {t("admin.bookings.personsShort")}
          </span>
        </span>
        <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${STATUS_COLOR[booking.status]}`}>
          {t(`admin.statusShort.${booking.status}`)}
        </span>
        <span className="text-xs text-muted-foreground">{booking.source}</span>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-5 grid gap-5 md:grid-cols-2">
          <div className="text-sm space-y-1">
            <p><strong>{t("admin.bookings.labelEmail")}</strong> <a href={`mailto:${booking.contact_email}`} className="underline">{booking.contact_email}</a></p>
            {booking.contact_phone && <p><strong>{t("admin.bookings.labelPhone")}</strong> {booking.contact_phone}</p>}
            {booking.occasion && <p><strong>{t("admin.bookings.labelOccasion")}</strong> {booking.occasion}</p>}
            {booking.message && <p className="mt-3 italic text-muted-foreground">"{booking.message}"</p>}
            <p className="mt-3 text-xs text-muted-foreground">{t("admin.bookings.labelReceived", { when: format(parseISO(booking.created_at), "d MMM yyyy, HH:mm", { locale }) })}</p>
          </div>

          <div className="space-y-3 text-sm">
            <label className="block">
              <span className="eyebrow block mb-1">{t("admin.bookings.fieldStatus")}</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="w-full border border-border bg-background px-2 py-1.5"
              >
                {(["requested", "accepted", "deposit_paid", "fully_paid", "cancelled", "completed"] as BookingStatus[]).map((s) => (
                  <option key={s} value={s}>{t(`admin.status.${s}`)}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="eyebrow block mb-1">{t("admin.bookings.fieldTotalPrice")}</span>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-border bg-background px-2 py-1.5"
              />
            </label>

            <label className="block">
              <span className="eyebrow block mb-1">{t("admin.bookings.fieldNotes")}</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-border bg-background px-2 py-1.5"
              />
            </label>

            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await updateBooking({
                    data: {
                      id: booking.id,
                      status,
                      internalNotes: notes || null,
                      totalPriceCents: price ? Math.round(parseFloat(price) * 100) : null,
                    },
                  });
                  await onReload();
                  setOpen(false);
                } finally {
                  setBusy(false);
                }
              }}
              className="border border-foreground bg-foreground px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-background disabled:opacity-50"
            >
              {busy ? t("admin.saving") : t("admin.save")}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

/* ============================================================
 *  PRICING TAB
 * ========================================================== */
function PricingTab({ pricing, onReload }: { pricing: PricingRow[]; onReload: () => void }) {
  const { t } = useTranslation();
  const base = pricing.find((p) => p.type === "base");
  const specials = pricing.filter((p) => p.type === "special");
  const [baseEdit, setBaseEdit] = useState(base ? String(base.price_per_night_cents / 100) : "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (base) setBaseEdit(String(base.price_per_night_cents / 100));
  }, [base]);

  return (
    <div className="space-y-12">
      {/* Base price */}
      <section>
        <h2 className="eyebrow">{t("admin.pricing.baseTitle")}</h2>
        <div className="mt-4 flex items-end gap-4">
          <div>
            <input
              type="number"
              step="1"
              value={baseEdit}
              onChange={(e) => setBaseEdit(e.target.value)}
              className="border border-border bg-background px-3 py-2 font-display text-2xl w-40"
            />
            <span className="ml-2 text-sm text-muted-foreground">{t("admin.pricing.baseSuffix")}</span>
          </div>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await updateBasePrice({ data: { pricePerNightCents: Math.round(parseFloat(baseEdit) * 100) } });
                await onReload();
              } finally {
                setBusy(false);
              }
            }}
            className="border border-foreground bg-foreground px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-background"
          >
            {t("admin.save")}
          </button>
        </div>
      </section>

      {/* Special date ranges */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="eyebrow">{t("admin.pricing.specialTitle")}</h2>
          <span className="text-xs text-muted-foreground">{t("admin.pricing.specialHint")}</span>
        </div>

        <ul className="mt-4 divide-y divide-border border border-border">
          {specials.length === 0 && (
            <li className="px-4 py-6 text-sm text-muted-foreground">{t("admin.pricing.empty")}</li>
          )}
          {specials.map((s) => (
            <SpecialPriceRow key={s.id} row={s} onReload={onReload} />
          ))}
          <SpecialPriceRow row={null} onReload={onReload} />
        </ul>
      </section>
    </div>
  );
}

function SpecialPriceRow({ row, onReload }: { row: PricingRow | null; onReload: () => void }) {
  const { t } = useTranslation();
  const [label, setLabel] = useState(row?.label ?? "");
  const [start, setStart] = useState(row?.start_date ?? "");
  const [end, setEnd] = useState(row?.end_date ?? "");
  const [price, setPrice] = useState(row ? String(row.price_per_night_cents / 100) : "");
  const [busy, setBusy] = useState(false);
  const isNew = !row;

  return (
    <li className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto_auto_auto_auto_auto] md:items-end">
      <label>
        <span className="eyebrow block mb-1">{t("admin.pricing.fieldLabel")}</span>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={isNew ? t("admin.pricing.fieldLabelPlaceholder") : ""}
          className="w-full border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <label>
        <span className="eyebrow block mb-1">{t("admin.pricing.fieldFrom")}</span>
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <label>
        <span className="eyebrow block mb-1">{t("admin.pricing.fieldTo")}</span>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <label>
        <span className="eyebrow block mb-1">{t("admin.pricing.fieldPrice")}</span>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <button
        disabled={busy || !label || !start || !end || !price}
        onClick={async () => {
          setBusy(true);
          try {
            await upsertSpecialPrice({
              data: {
                id: row?.id,
                label,
                startDate: start,
                endDate: end,
                pricePerNightCents: Math.round(parseFloat(price) * 100),
              },
            });
            if (isNew) {
              setLabel("");
              setStart("");
              setEnd("");
              setPrice("");
            }
            await onReload();
          } finally {
            setBusy(false);
          }
        }}
        className="border border-foreground bg-foreground px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-background disabled:opacity-30"
      >
        {isNew ? t("admin.add") : t("admin.save")}
      </button>
      {!isNew && (
        <button
          disabled={busy}
          onClick={async () => {
            if (!confirm(t("admin.deleteConfirm", { label: row.label }))) return;
            setBusy(true);
            try {
              await deleteSpecialPrice({ data: { id: row.id } });
              await onReload();
            } finally {
              setBusy(false);
            }
          }}
          className="text-xs text-red-700 hover:underline"
        >
          {t("admin.delete")}
        </button>
      )}
    </li>
  );
}

/* ============================================================
 *  CALENDAR TAB — visual overview
 * ========================================================== */
function CalendarTab({ bookings }: { bookings: Booking[] }) {
  const { t } = useTranslation();
  const locale = useLocale();
  // Visualise web + Airbnb bookings on a single calendar.
  // Web (accepted/paid) = sage. Airbnb = stone. Requested (pending review) = amber.
  const modifiers = useMemo(() => {
    const web: Date[] = [];
    const airbnb: Date[] = [];
    const pending: Date[] = [];
    for (const b of bookings) {
      if (b.status === "cancelled" || b.status === "completed") continue;
      const start = parseISO(b.arrival);
      const end = parseISO(b.departure);
      const days = Math.max(1, differenceInCalendarDays(end, start));
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        if (b.source === "airbnb") airbnb.push(d);
        else if (b.status === "requested") pending.push(d);
        else web.push(d);
      }
    }
    return { web, airbnb, pending };
  }, [bookings]);

  return (
    <div>
      <ul className="mb-6 flex gap-6 text-xs">
        <Legend color="bg-sage-deep" label={t("admin.calendar.legendWeb")} />
        <Legend color="bg-amber-400" label={t("admin.calendar.legendPending")} />
        <Legend color="bg-stone-500" label={t("admin.calendar.legendAirbnb")} />
      </ul>

      <div className="andreashof-calendar admin-calendar">
        <DayPicker
          mode="default"
          numberOfMonths={3}
          pagedNavigation
          locale={locale}
          showOutsideDays={false}
          weekStartsOn={1}
          modifiers={modifiers}
          modifiersClassNames={{
            web: "bg-sage-deep text-background font-medium",
            airbnb: "bg-stone-500 text-background font-medium",
            pending: "bg-amber-400 text-background font-medium",
          }}
        />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`h-3 w-3 ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </li>
  );
}

/* ============================================================
 *  SETTINGS TAB — Airbnb iCal URL + manual sync + outbound .ics
 * ========================================================== */
function SettingsTab({
  settings,
  onReload,
}: {
  settings: { key: string; value: unknown }[];
  onReload: () => void;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const lookup = (k: string) => settings.find((s) => s.key === k)?.value;
  const [icalUrl, setIcalUrl] = useState((lookup("airbnb_ical_url") as string) ?? "");
  const lastSynced = lookup("airbnb_last_synced_at") as string | undefined;

  const [busy, setBusy] = useState<"save" | "sync" | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const outboundUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api/calendar.ics` : "/api/calendar.ics";

  return (
    <div className="space-y-12">
      {/* PULL: import Airbnb iCal */}
      <section>
        <h2 className="eyebrow">{t("admin.settings.pullTitle")}</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {t("admin.settings.pullBody")}
        </p>

        <label className="mt-6 block">
          <span className="eyebrow block mb-2">{t("admin.settings.fieldIcalUrl")}</span>
          <input
            type="url"
            value={icalUrl}
            onChange={(e) => setIcalUrl(e.target.value)}
            placeholder="https://www.airbnb.com/calendar/ical/..."
            className="w-full border border-border bg-background px-3 py-2 text-sm font-mono"
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            disabled={busy !== null}
            onClick={async () => {
              setBusy("save");
              setResult(null);
              try {
                await updateAirbnbIcalUrl({ data: { url: icalUrl } });
                setResult(t("admin.settings.urlSaved"));
                await onReload();
              } catch (e) {
                setResult(e instanceof Error ? e.message : "Error");
              } finally {
                setBusy(null);
              }
            }}
            className="border border-foreground bg-foreground px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-background disabled:opacity-50"
          >
            {busy === "save" ? t("admin.saving") : t("admin.settings.saveUrl")}
          </button>

          <button
            disabled={busy !== null || !icalUrl}
            onClick={async () => {
              setBusy("sync");
              setResult(null);
              try {
                const r = (await triggerAirbnbSync()) as Record<string, unknown>;
                setResult(JSON.stringify(r));
                await onReload();
              } catch (e) {
                setResult(e instanceof Error ? e.message : "Error");
              } finally {
                setBusy(null);
              }
            }}
            className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.22em] hover:border-foreground disabled:opacity-50"
          >
            {busy === "sync" ? t("admin.saving") : t("admin.settings.syncNow")}
          </button>

          {lastSynced && (
            <span className="text-xs text-muted-foreground">
              {t("admin.settings.syncedAt", { when: format(parseISO(lastSynced), "d MMM yyyy, HH:mm", { locale }) })}
            </span>
          )}
        </div>

        {result && <p className="mt-3 text-xs text-sage-deep break-all">{result}</p>}
      </section>

      <div className="h-px bg-border" />

      {/* PUSH: outbound iCal feed */}
      <section>
        <h2 className="eyebrow">{t("admin.settings.pushTitle")}</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {t("admin.settings.pushBody")}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <input
            readOnly
            value={outboundUrl}
            className="flex-1 border border-border bg-background px-3 py-2 text-sm font-mono"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            onClick={() => navigator.clipboard.writeText(outboundUrl)}
            className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.22em] hover:border-foreground"
          >
            {t("admin.settings.copy")}
          </button>
        </div>
      </section>
    </div>
  );
}
