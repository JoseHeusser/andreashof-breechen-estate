import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouterState } from "@tanstack/react-router";
import { SUPPORTED_LANGS, DEFAULT_LANG, LANG_LABELS, type Lang } from "@/i18n";

const STORAGE_KEY = "andreashof.lang";

/**
 * A small fixed-position language switcher that stays visible while scrolling.
 * Adopts a light tone over dark backgrounds (e.g. on top of the hero) and
 * switches to dark text once the page has scrolled past the hero.
 */
export function FloatingLangSwitcher() {
  const { i18n } = useTranslation();
  const current = (i18n.language?.slice(0, 2) || DEFAULT_LANG) as Lang;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Home has a full-bleed hero; switcher stays light until the hero scrolls
    // out of view. Other pages only have a ~104px dark header strip.
    const threshold = isHome ? window.innerHeight * 0.4 : 120;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const change = (lng: Lang) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lng);
    }
    i18n.changeLanguage(lng);
  };

  const dark = scrolled;
  const containerClass = dark
    ? "bg-background/90 border border-border text-foreground"
    : "bg-foreground/30 backdrop-blur-sm border border-white/20 text-white";
  const inactive = dark ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white";
  const active = dark ? "text-foreground" : "text-white";
  const sep = dark ? "text-muted-foreground/40" : "text-white/40";

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.28em] transition-colors duration-500 md:right-6 md:top-6 ${containerClass}`}
    >
      {SUPPORTED_LANGS.map((lng, i) => (
        <span key={lng} className="flex items-center gap-2">
          {i > 0 && <span className={sep}>·</span>}
          <button
            type="button"
            onClick={() => change(lng)}
            aria-current={current === lng ? "true" : undefined}
            aria-label={`Switch language to ${LANG_LABELS[lng]}`}
            className={`transition-colors ${current === lng ? active : inactive}`}
          >
            {LANG_LABELS[lng]}
          </button>
        </span>
      ))}
    </div>
  );
}
