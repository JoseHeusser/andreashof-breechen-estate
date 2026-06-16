import { useEffect, useMemo, useState } from "react";
import { planZoneById, type PlanZone } from "@/data/plan-zones";

type FloorKey = "floor1" | "floor2";

const PLAN_FILE: Record<FloorKey, string> = {
  floor1: "/plans/floor1_plan.svg",
  floor2: "/plans/floor2_plan.svg",
};

export function PlanClickDemo() {
  const [floor, setFloor] = useState<FloorKey>("floor1");
  const [svgMarkup, setSvgMarkup] = useState("");
  const [lastClicked, setLastClicked] = useState<PlanZone | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(PLAN_FILE[floor])
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setSvgMarkup(text);
      })
      .catch(() => {
        if (!cancelled) setSvgMarkup("");
      });
    return () => {
      cancelled = true;
    };
  }, [floor]);

  const svgWithHandlers = useMemo(() => {
    if (!svgMarkup) return "";
    // Ensure keyboard and pointer interaction on zone polygons.
    return svgMarkup
      .replaceAll('class="zone"', 'class="zone" tabindex="0" role="button"')
      .replaceAll("<polygon ", '<polygon data-clickable-zone="true" ');
  }, [svgMarkup]);

  useEffect(() => {
    const root = document.getElementById("plan-svg-container");
    if (!root) return;

    const onActivate = (event: MouseEvent | KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const zoneEl = target.closest("[data-clickable-zone='true']") as SVGElement | null;
      if (!zoneEl) return;

      if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") return;
      const zoneId = zoneEl.id;
      const zone = planZoneById[zoneId];
      if (!zone) return;
      setLastClicked(zone);
      console.log("Plan zone clicked:", zone.id);
    };

    root.addEventListener("click", onActivate as EventListener);
    root.addEventListener("keydown", onActivate as EventListener);
    return () => {
      root.removeEventListener("click", onActivate as EventListener);
      root.removeEventListener("keydown", onActivate as EventListener);
    };
  }, [svgWithHandlers]);

  return (
    <section className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-3xl font-light">Plan click demo</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Basic integration for clickable SVG zones. Replace neutral room labels once room names are confirmed.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setFloor("floor1")}
            className="border border-border px-4 py-2 text-xs uppercase tracking-[0.18em]"
          >
            Floor 1
          </button>
          <button
            type="button"
            onClick={() => setFloor("floor2")}
            className="border border-border px-4 py-2 text-xs uppercase tracking-[0.18em]"
          >
            Floor 2
          </button>
        </div>
        <div
          id="plan-svg-container"
          className="mt-6 overflow-auto border border-border bg-card p-3"
          dangerouslySetInnerHTML={{ __html: svgWithHandlers }}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Last clicked: {lastClicked ? `${lastClicked.id} (${lastClicked.label.en})` : "none"}
        </p>
      </div>
    </section>
  );
}
