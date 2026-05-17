import { useEffect } from "react";

/**
 * Observes every `.reveal` element on the page and toggles `is-visible`
 * when it enters the viewport. Pages opt in by adding the `reveal`
 * class to elements that should fade up on scroll.
 *
 * Also installs a safety-net timer: anything still hidden 1.6s after
 * mount is force-revealed. This guarantees the page is never stuck
 * with invisible content (e.g. observer never fires, JS errored after
 * setup, layout has 0-height elements that never qualify as visible).
 */
export function useRevealPage() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll(".reveal");
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    els.forEach((el) => io.observe(el));

    // Safety net: anything not yet visible after a moment gets revealed.
    const fallback = window.setTimeout(() => {
      document
        .querySelectorAll(".reveal:not(.is-visible)")
        .forEach((el) => el.classList.add("is-visible"));
    }, 1600);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);
}
