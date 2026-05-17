import { useEffect } from "react";

/**
 * Observes every `.reveal` element on the page once on mount and toggles
 * `is-visible` when it enters the viewport. Pages opt in by calling
 * `useRevealPage()` and adding the `reveal` class to elements that should
 * fade up on scroll.
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
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
