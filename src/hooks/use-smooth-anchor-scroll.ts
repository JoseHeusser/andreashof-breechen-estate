import { useEffect } from "react";

const EASE_DURATION_MS = 1100;
// easeInOutCubic — slow start, slow end. Matches the editorial feel of the site.
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY: number, duration = EASE_DURATION_MS) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: targetY });
    return;
  }
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * Intercepts clicks on `<a href="#id">` and `<a href="/#id">` anchors and
 * scrolls to the target with an easeInOutCubic ramp. Falls back to the
 * native behaviour when the target is missing, when the user holds
 * a modifier key, or when reduced-motion is requested.
 */
export function useSmoothAnchorScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    function handler(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Only handle in-page anchors. Allow same-origin "/#hash" too —
      // when already on the matching page, we scroll smoothly.
      let hashIndex = -1;
      if (href.startsWith("#")) hashIndex = 0;
      else if (href.startsWith("/#") && window.location.pathname === "/") hashIndex = 1;
      else return;

      const id = href.slice(hashIndex + 1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;

      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const target = window.scrollY + rect.top - 8;
      smoothScrollTo(target);

      // Keep the URL hash in sync (without jumping).
      history.replaceState(null, "", `#${id}`);
    }

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
}
