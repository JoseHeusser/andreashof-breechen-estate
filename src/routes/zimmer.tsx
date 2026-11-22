import { seo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { FloorPlan } from "@/components/floor-plan";
import { bathMates } from "@/data/floor-plan";
import { ROOM_IMAGES, type RoomKey } from "@/data/rooms";

const ROOM_SWITCH_OUT_MS = 280;
const ROOM_SWITCH_GAP_MS = 110;
const ROOM_SWITCH_IN_MS = 380;

export const Route = createFileRoute("/zimmer")({
  head: () =>
    seo({
      title: "Zimmer · Andreashof Breechen",
      description: "Elf Kammern im Andreashof Breechen — wählen Sie eine Kammer im Grundriss, um Bett, Aussicht und Atmosphäre zu sehen.",
      path: "/zimmer",
    }),
  component: ZimmerPage,
});

function ZimmerPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState<RoomKey>("I");
  const [displayedRoom, setDisplayedRoom] = useState<RoomKey>("I");
  const [imgIdx, setImgIdx] = useState(0);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "out" | "gap" | "in">("idle");
  const [reduceMotion, setReduceMotion] = useState(false);
  const displayedRoomRef = useRef<RoomKey>("I");
  const transitionRunRef = useRef(0);

  const room = t(`rooms.${displayedRoom}`, { returnObjects: true }) as {
    name: string;
    bed: string;
    view: string;
    desc: string;
  };

  const photos = useMemo(() => ROOM_IMAGES[displayedRoom], [displayedRoom]);
  const currentPhoto = photos[Math.min(imgIdx, photos.length - 1)];
  const mates = bathMates(displayedRoom);

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

    const transitionRun = transitionRunRef.current + 1;
    transitionRunRef.current = transitionRun;
    let gapTimer: number | undefined;
    let inTimer: number | undefined;
    setTransitionPhase("out");
    const outTimer = window.setTimeout(() => {
      if (transitionRunRef.current !== transitionRun) return;
      setTransitionPhase("gap");
      gapTimer = window.setTimeout(() => {
        if (transitionRunRef.current !== transitionRun) return;
        displayedRoomRef.current = active;
        setDisplayedRoom(active);
        setTransitionPhase("in");

        inTimer = window.setTimeout(() => {
          if (transitionRunRef.current !== transitionRun) return;
          setTransitionPhase("idle");
        }, ROOM_SWITCH_IN_MS);
      }, ROOM_SWITCH_GAP_MS);
    }, ROOM_SWITCH_OUT_MS);

    return () => {
      transitionRunRef.current += 1;
      window.clearTimeout(outTimer);
      if (gapTimer) window.clearTimeout(gapTimer);
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
      ? "opacity-0 translate-y-0.5"
      : transitionPhase === "gap"
        ? "opacity-0 translate-y-0.5"
        : transitionPhase === "in"
          ? "opacity-100 translate-y-0"
          : "opacity-100 translate-y-0";
  const detailTransitionDurationMs = reduceMotion
    ? 0
    : transitionPhase === "out"
      ? ROOM_SWITCH_OUT_MS
      : transitionPhase === "gap"
        ? 0
        : ROOM_SWITCH_IN_MS;

  return (
    <div className="min-h-screen bg-background">
      {/* Solid header strip so dark logo/links remain legible (no hero behind). */}
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      {/* PAGE INTRO */}
      <section className="px-5 pt-14 pb-10 md:px-10 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-[2.2rem] font-light leading-[1.1] md:text-6xl">
            {t("zimmer.pageTitle")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("zimmer.pageSubtitle")}
          </p>
        </div>
      </section>

      {/* EXPLORER: floor plan + room index on the left, the chosen room on the right */}
      <section className="px-5 pb-20 md:px-10 md:pb-40">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <FloorPlan active={active} onSelect={setActive} />
          </div>

          {/* Detail panel */}
          <div className="lg:sticky lg:top-8 lg:col-span-5 lg:self-start">
            <div
              className={`transition-[opacity,transform] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${detailTransitionClass}`}
              style={{ transitionDuration: `${detailTransitionDurationMs}ms` }}
            >
              <div className="img-hover">
                <img
                  src={currentPhoto}
                  alt={`${room.name} — ${imgIdx + 1}/${photos.length}`}
                  className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[400px]"
                />
              </div>
              {photos.length > 1 && (
                <div
                  className="mt-4 flex gap-2.5 overflow-x-auto pb-1 max-md:snap-x max-md:snap-mandatory md:grid md:gap-3 md:overflow-visible md:pb-0"
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
                        className={`shrink-0 overflow-hidden transition-all duration-300 max-md:w-20 max-md:snap-start md:w-auto ${
                          isActive
                            ? "opacity-100 ring-1 ring-sage-deep ring-offset-2 ring-offset-background"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={src}
                          alt=""
                          loading="lazy"
                          className="h-16 w-full object-cover sm:h-20 md:h-24"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-8">
                <p className="eyebrow text-sage-deep">
                  {t("zimmer.labelNumber")} {displayedRoom}
                </p>
                <h2 className="mt-3 font-display text-3xl font-light leading-tight md:text-[2.6rem]">
                  {room.name}
                </h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
                  {room.desc}
                </p>

                <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-3">
                  <div>
                    <dt className="eyebrow text-muted-foreground">{t("zimmer.labelBed")}</dt>
                    <dd className="mt-2 font-display text-lg text-foreground">{room.bed}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-muted-foreground">{t("zimmer.labelView")}</dt>
                    <dd className="mt-2 font-display text-lg text-foreground">{room.view}</dd>
                  </div>
                  <div className="max-sm:col-span-2">
                    <dt className="eyebrow text-muted-foreground">{t("zimmer.labelBath")}</dt>
                    <dd className="mt-2 font-display text-lg text-foreground">
                      {mates.length
                        ? t("zimmer.plan.bathShared", { key: mates.join(" · ") })
                        : t("zimmer.plan.bathOwn")}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            {!reduceMotion && (transitionPhase === "out" || transitionPhase === "gap") && (
              <div className="mt-4 h-px w-full bg-sage-deep/35" />
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
