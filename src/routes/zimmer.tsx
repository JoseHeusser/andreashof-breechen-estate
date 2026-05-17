import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

const ROOM_KEYS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"] as const;
type RoomKey = (typeof ROOM_KEYS)[number];

// Photos copied from the original Airbnb listing (public/rooms/).
// Order: roman numeral I → bedroom 1, etc.
const ROOM_IMAGES: Record<RoomKey, string[]> = {
  I:    ["/rooms/room-01a.jpg", "/rooms/room-01b.jpg", "/rooms/room-01c.jpg"],
  II:   ["/rooms/room-02a.jpg"],
  III:  ["/rooms/room-03a.jpg"],
  IV:   ["/rooms/room-04a.jpg"],
  V:    ["/rooms/room-05a.jpg"],
  VI:   ["/rooms/room-06a.jpg", "/rooms/room-06b.jpg"],
  VII:  ["/rooms/room-07a.jpg", "/rooms/room-07b.jpg"],
  VIII: ["/rooms/room-08a.jpg", "/rooms/room-08b.jpg", "/rooms/room-08c.jpg"],
  IX:   ["/rooms/room-09a.jpg"],
  X:    ["/rooms/room-10a.jpg"],
};

export const Route = createFileRoute("/zimmer")({
  head: () => ({
    meta: [
      { title: "Zimmer · Andreashof Breechen" },
      {
        name: "description",
        content:
          "Zehn Kammern im Andreashof Breechen — wählen Sie eine Kammer, um Bett, Aussicht und Atmosphäre zu sehen.",
      },
    ],
    links: [{ rel: "canonical", href: "/zimmer" }],
  }),
  component: ZimmerPage,
});

function ZimmerPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState<RoomKey>("I");
  const [imgIdx, setImgIdx] = useState(0);

  const room = t(`rooms.${active}`, { returnObjects: true }) as {
    name: string;
    bed: string;
    view: string;
    desc: string;
  };

  const photos = useMemo(() => ROOM_IMAGES[active], [active]);
  const currentPhoto = photos[Math.min(imgIdx, photos.length - 1)];

  // Reset image index whenever the active room changes.
  useEffect(() => {
    setImgIdx(0);
  }, [active]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Solid header strip so dark logo/links remain legible (no hero behind). */}
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      {/* PAGE INTRO */}
      <section className="px-6 pt-20 pb-12 md:px-10 md:pt-28 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="eyebrow text-muted-foreground transition-colors hover:text-sage-deep"
          >
            ← {t("zimmer.ctaBack")}
          </Link>
          <div className="mt-10 grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <span className="eyebrow">{t("zimmer.pageEyebrow")}</span>
              <span className="rule ml-4 align-middle" />
            </div>
            <div className="md:col-span-8">
              <h1 className="font-display text-4xl font-light leading-[1.1] md:text-6xl">
                {t("zimmer.pageTitle")}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                {t("zimmer.pageSubtitle")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE SELECTOR */}
      <section className="px-6 pb-8 md:hidden">
        <div className="mx-auto max-w-6xl">
          <label htmlFor="room-select" className="eyebrow block">
            {t("zimmer.selectorLabel")}
          </label>
          <div className="relative mt-3">
            <select
              id="room-select"
              value={active}
              onChange={(e) => setActive(e.target.value as RoomKey)}
              className="w-full appearance-none border border-border bg-card px-4 py-4 pr-10 font-display text-lg text-foreground outline-none transition-colors focus:border-sage-deep"
            >
              {ROOM_KEYS.map((k) => {
                const r = t(`rooms.${k}`, { returnObjects: true }) as { name: string };
                return (
                  <option key={k} value={k}>
                    {k}. {r.name}
                  </option>
                );
              })}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-display text-xl italic text-sage-deep">
              ▾
            </span>
          </div>
        </div>
      </section>

      {/* CONTENT: sidebar list + detail panel */}
      <section className="px-6 pb-32 md:px-10 md:pb-40">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12 md:gap-16">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:col-span-4 md:block">
            <p className="eyebrow text-muted-foreground">{t("zimmer.selectorLabel")}</p>
            <ul className="mt-6 border-t border-border">
              {ROOM_KEYS.map((k) => {
                const r = t(`rooms.${k}`, { returnObjects: true }) as { name: string; bed: string };
                const isActive = k === active;
                return (
                  <li key={k} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => setActive(k)}
                      aria-current={isActive ? "true" : undefined}
                      className={`group flex w-full items-baseline gap-4 py-5 text-left transition-colors ${
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`shrink-0 font-display text-xl italic transition-all duration-300 ${
                          isActive ? "translate-x-1 text-sage-deep" : "text-sage-deep/60"
                        }`}
                      >
                        {k}
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-lg font-light leading-tight">
                          {r.name}
                        </span>
                        <span className="mt-1 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          {r.bed}
                        </span>
                      </span>
                      <span
                        className={`mt-2 h-px shrink-0 bg-sage-deep transition-all duration-500 ${
                          isActive ? "w-8 opacity-100" : "w-0 opacity-0"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Detail panel */}
          <div className="md:col-span-8" key={active}>
            <div className="img-hover animate-fade-up">
              <img
                src={currentPhoto}
                alt={`${room.name} — ${imgIdx + 1}/${photos.length}`}
                className="h-[320px] w-full object-cover md:h-[560px]"
              />
            </div>
            {photos.length > 1 && (
              <div
                className="mt-4 grid gap-3 animate-fade-up"
                style={{
                  gridTemplateColumns: `repeat(${photos.length}, minmax(0, 1fr))`,
                  animationDelay: "60ms",
                }}
              >
                {photos.map((src, i) => {
                  const isActive = i === imgIdx;
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setImgIdx(i)}
                      aria-current={isActive ? "true" : undefined}
                      className={`overflow-hidden transition-all duration-300 ${
                        isActive
                          ? "opacity-100 ring-1 ring-sage-deep ring-offset-2 ring-offset-background"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="h-20 w-full object-cover md:h-24"
                      />
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-10 animate-fade-up" style={{ animationDelay: "120ms" }}>
              <p className="eyebrow text-sage-deep">
                {t("zimmer.labelNumber")} {active}
              </p>
              <h2 className="mt-3 font-display text-3xl font-light leading-tight md:text-5xl">
                {room.name}
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
                {room.desc}
              </p>

              <dl className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-border pt-6">
                <div>
                  <dt className="eyebrow text-muted-foreground">{t("zimmer.labelBed")}</dt>
                  <dd className="mt-2 font-display text-lg text-foreground">{room.bed}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-muted-foreground">{t("zimmer.labelView")}</dt>
                  <dd className="mt-2 font-display text-lg text-foreground">{room.view}</dd>
                </div>
              </dl>

              <div className="mt-12">
                <a
                  href="/#anfrage"
                  className="inline-block border border-foreground bg-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-sage-deep hover:border-sage-deep"
                >
                  {t("nav.reserve")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
