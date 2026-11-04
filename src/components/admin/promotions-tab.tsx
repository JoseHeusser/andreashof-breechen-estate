import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllPromotions, savePromotions } from "@/lib/promotions/server-fns";
import type { Promotion } from "@/lib/promotions/types";

// Admin editor for the website's "Aktuelle Angebote" drawer.
// Text only — prices typed here are shown to guests, they are not used
// by the price calculation.

const COPY = {
  de: {
    title: "Aktuelle Angebote",
    intro:
      "Diese Angebote erscheinen auf der Website hinter dem Button „Aktuelle Angebote“ (unten rechts). Nichts öffnet sich von selbst. Sichtbar ist ein Angebot nur, wenn es aktiv ist und heute im Zeitraum „Sichtbar ab / bis“ liegt. Die Preise hier sind reiner Text — sie ändern nicht die Preisberechnung der Buchung.",
    add: "Neues Angebot",
    save: "Speichern",
    saving: "Speichert…",
    saved: "Gespeichert.",
    unsaved: "Ungespeicherte Änderungen",
    delete: "Löschen",
    confirmDelete: "Dieses Angebot wirklich löschen?",
    up: "↑",
    down: "↓",
    active: "Aktiv (auf der Website sichtbar)",
    badge: "Kleine Überschrift",
    badgeHint: "z. B. Angebot für Sofortbucher",
    titleField: "Titel",
    dates: "Zeitraum (Text)",
    datesHint: "z. B. 17.–20. Dezember 2026",
    description: "Beschreibung",
    price: "Preis (Text)",
    priceHint: "z. B. 4 Nächte, ab 10 Personen: 1.000 €",
    image: "Bild (optional)",
    imageHint: "Pfad, z. B. /galerie/salon-02.jpg",
    visibleFrom: "Sichtbar ab",
    visibleUntil: "Sichtbar bis (einschließlich)",
    empty: "Noch keine Angebote.",
    loading: "Wird geladen…",
    status: { live: "Online", scheduled: "Geplant", expired: "Abgelaufen", off: "Aus" },
  },
  en: {
    title: "Current offers",
    intro:
      "These offers appear on the website behind the “Current offers” button (bottom right). Nothing opens by itself. An offer is visible only if it is active and today falls between “Visible from / until”. Prices here are plain text — they do not change the booking price calculation.",
    add: "New offer",
    save: "Save",
    saving: "Saving…",
    saved: "Saved.",
    unsaved: "Unsaved changes",
    delete: "Delete",
    confirmDelete: "Really delete this offer?",
    up: "↑",
    down: "↓",
    active: "Active (visible on the website)",
    badge: "Small heading",
    badgeHint: "e.g. Offer for early bookers",
    titleField: "Title",
    dates: "Period (text)",
    datesHint: "e.g. 17–20 December 2026",
    description: "Description",
    price: "Price (text)",
    priceHint: "e.g. 4 nights, from 10 people: €1,000",
    image: "Image (optional)",
    imageHint: "Path, e.g. /galerie/salon-02.jpg",
    visibleFrom: "Visible from",
    visibleUntil: "Visible until (inclusive)",
    empty: "No offers yet.",
    loading: "Loading…",
    status: { live: "Live", scheduled: "Scheduled", expired: "Expired", off: "Off" },
  },
} as const;

function newPromotion(): Promotion {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    active: true,
    badge: "",
    title: "",
    dates: "",
    description: "",
    price: "",
    image: "",
    visibleFrom: "",
    visibleUntil: "",
  };
}

function statusOf(p: Promotion, today: string): "live" | "scheduled" | "expired" | "off" {
  if (!p.active) return "off";
  if (p.visibleUntil && today > p.visibleUntil) return "expired";
  if (p.visibleFrom && today < p.visibleFrom) return "scheduled";
  return "live";
}

const STATUS_STYLE = {
  live: "border-sage-deep text-sage-deep",
  scheduled: "border-amber-400 text-amber-900",
  expired: "border-stone-300 text-stone-500",
  off: "border-stone-300 text-stone-500",
};

export function PromotionsTab() {
  const { i18n } = useTranslation();
  const c = i18n.language?.startsWith("en") ? COPY.en : COPY.de;
  const [items, setItems] = useState<Promotion[] | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date());

  useEffect(() => {
    getAllPromotions()
      .then((rows) => setItems([...rows]))
      .catch((e) => setMessage({ ok: false, text: e instanceof Error ? e.message : String(e) }));
  }, []);

  const update = (id: string, patch: Partial<Promotion>) => {
    setItems((prev) => prev?.map((p) => (p.id === id ? { ...p, ...patch } : p)) ?? prev);
    setDirty(true);
    setMessage(null);
  };

  const move = (index: number, delta: number) => {
    setItems((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  };

  const save = async () => {
    if (!items) return;
    setBusy(true);
    setMessage(null);
    try {
      await savePromotions({ data: { promotions: items } });
      setDirty(false);
      setMessage({ ok: true, text: c.saved });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full border border-border bg-background px-2 py-1.5 text-sm";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-light">{c.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{c.intro}</p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-xs text-amber-800">{c.unsaved}</span>}
          <button
            onClick={() => {
              setItems((prev) => [newPromotion(), ...(prev ?? [])]);
              setDirty(true);
            }}
            className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.22em] hover:border-foreground"
          >
            {c.add}
          </button>
          <button
            disabled={busy || !dirty}
            onClick={save}
            className="border border-foreground bg-foreground px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-background disabled:opacity-50"
          >
            {busy ? c.saving : c.save}
          </button>
        </div>
      </div>
      {message && (
        <p className={`mt-3 text-sm ${message.ok ? "text-sage-deep" : "text-red-700"}`}>
          {message.text}
        </p>
      )}

      {!items ? (
        <p className="mt-8 text-sm text-muted-foreground">{c.loading}</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">{c.empty}</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {items.map((p, i) => {
            const status = statusOf(p, today);
            return (
              <li key={p.id} className="border border-border bg-card p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${STATUS_STYLE[status]}`}
                    >
                      {c.status[status]}
                    </span>
                    <span className="font-display text-lg">{p.title || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="border border-border px-2 py-1 disabled:opacity-30"
                    >
                      {c.up}
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1}
                      className="border border-border px-2 py-1 disabled:opacity-30"
                    >
                      {c.down}
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(c.confirmDelete)) return;
                        setItems((prev) => prev?.filter((x) => x.id !== p.id) ?? prev);
                        setDirty(true);
                      }}
                      className="ml-2 uppercase tracking-[0.18em] text-red-700 hover:underline"
                    >
                      {c.delete}
                    </button>
                  </div>
                </div>

                <label className="mb-4 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={p.active}
                    onChange={(e) => update(p.id, { active: e.target.checked })}
                  />
                  {c.active}
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow mb-1 block">{c.badge}</span>
                    <input
                      value={p.badge}
                      placeholder={c.badgeHint}
                      onChange={(e) => update(p.id, { badge: e.target.value })}
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow mb-1 block">{c.titleField}</span>
                    <input
                      value={p.title}
                      onChange={(e) => update(p.id, { title: e.target.value })}
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow mb-1 block">{c.dates}</span>
                    <input
                      value={p.dates}
                      placeholder={c.datesHint}
                      onChange={(e) => update(p.id, { dates: e.target.value })}
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow mb-1 block">{c.image}</span>
                    <input
                      value={p.image}
                      placeholder={c.imageHint}
                      onChange={(e) => update(p.id, { image: e.target.value })}
                      className={input}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow mb-1 block">{c.description}</span>
                    <textarea
                      value={p.description}
                      rows={3}
                      onChange={(e) => update(p.id, { description: e.target.value })}
                      className={input}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow mb-1 block">{c.price}</span>
                    <textarea
                      value={p.price}
                      rows={2}
                      placeholder={c.priceHint}
                      onChange={(e) => update(p.id, { price: e.target.value })}
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow mb-1 block">{c.visibleFrom}</span>
                    <input
                      type="date"
                      value={p.visibleFrom}
                      onChange={(e) => update(p.id, { visibleFrom: e.target.value })}
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow mb-1 block">{c.visibleUntil}</span>
                    <input
                      type="date"
                      value={p.visibleUntil}
                      onChange={(e) => update(p.id, { visibleUntil: e.target.value })}
                      className={input}
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
