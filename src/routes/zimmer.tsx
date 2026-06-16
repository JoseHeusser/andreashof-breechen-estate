import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ROOM_IMAGES, ROOM_KEYS, type RoomKey } from "@/data/rooms";

const ROOM_SWITCH_OUT_MS = 110;
const ROOM_SWITCH_IN_MS = 220;

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
  const [displayedRoom, setDisplayedRoom] = useState<RoomKey>("I");
  const [imgIdx, setImgIdx] = useState(0);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "out" | "in">("idle");
  const [reduceMotion, setReduceMotion] = useState(false);
  const displayedRoomRef = useRef<RoomKey>("I");

  const room = t(`rooms.${displayedRoom}`, { returnObjects: true }) as {
    name: string;
    bed: string;
    view: string;
    desc: string;
  };

  const photos = useMemo(() => ROOM_IMAGES[displayedRoom], [displayedRoom]);
  const currentPhoto = photos[Math.min(imgIdx, photos.length - 1)];

  // Reset image index whenever the displayed room changes.
  useEffect(() => {
    setImgIdx(0);
  }, [displayedRoom]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(mediaQuery.matches);
    onChange();
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    displayedRoomRef.current = displayedRoom;
  }, [displayedRoom]);

  useEffect(() => {
    if (active === displayedRoomRef.current) {
      setTransitionPhase("idle");
      return;
    }
    if (reduceMotion) {
      setDisplayedRoom(active);
      displayedRoomRef.current = active;
      setTransitionPhase("idle");
      return;
    }

    let inTimer: number | undefined;
    setTransitionPhase("out");
    const outTimer = window.setTimeout(() => {
      displayedRoomRef.current = active;
      setDisplayedRoom(active);
      setTransitionPhase("in");

      inTimer = window.setTimeout(() => {
        setTransitionPhase("idle");
      }, ROOM_SWITCH_IN_MS);
    }, ROOM_SWITCH_OUT_MS);

    return () => {
      window.clearTimeout(outTimer);
      if (inTimer) window.clearTimeout(inTimer);
    };
  }, [active, reduceMotion]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const detailTransitionClass = reduceMotion
    ? "opacity-100 translate-y-0"
    : transitionPhase === "out"
      ? "opacity-30 translate-y-0.5"
      : transitionPhase === "in"
        ? "opacity-100 translate-y-0"
        : "opacity-100 translate-y-0";
  const detailTransitionDurationMs = reduceMotion
    ? 0
    : transitionPhase === "out"
      ? ROOM_SWITCH_OUT_MS
      : ROOM_SWITCH_IN_MS;

  return (
    <div className="min-h-screen bg-background">
      {/* Solid header strip so dark logo/links remain legible (no hero behind). */}
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      {/* PAGE INTRO */}
      <section className="px-6 pt-16 pb-12 md:px-10 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-4xl font-light leading-[1.1] md:text-6xl">
            {t("zimmer.pageTitle")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("zimmer.pageSubtitle")}
          </p>
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
          <div className="md:col-span-8">
            <div
              className={`transition-[opacity,transform] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${detailTransitionClass}`}
              style={{ transitionDuration: `${detailTransitionDurationMs}ms` }}
            >
              <div className="img-hover">
                <img
                  src={currentPhoto}
                  alt={`${room.name} — ${imgIdx + 1}/${photos.length}`}
                  className="h-[320px] w-full object-cover md:h-[560px]"
                />
              </div>
              {photos.length > 1 && (
                <div
                  className="mt-4 grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${photos.length}, minmax(0, 1fr))`,
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
              <div className="mt-10">
                <p className="eyebrow text-sage-deep">
                  {t("zimmer.labelNumber")} {displayedRoom}
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
              </div>
            </div>
            {!reduceMotion && transitionPhase === "out" && (
              <div className="mt-4 h-px w-full bg-sage-deep/35" />
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
