import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouterState } from "@tanstack/react-router";
import i18n, { SUPPORTED_LANGS, DEFAULT_LANG, LANG_LABELS, type Lang } from "@/i18n";

const STORAGE_KEY = "andreashof.lang";

function isLang(v: string | null): v is Lang {
  return v !== null && (SUPPORTED_LANGS as readonly string[]).includes(v);
}

/**
 * Small fixed-position language switcher. Anchored at bottom-right so it
 * never overlaps the header CTAs and stays out of the reading flow.
 *
 * Rendered client-only (after mount) and also responsible for loading the
 * stored language preference from localStorage. Doing this here — rather
 * than in LangProvider — guarantees that the language change happens
 * after React has fully hydrated the SSR tree, removing a source of
 * hydration mismatches (React error #418).
 */
export function FloatingLangSwitcher() {
  const [mounted, setMounted] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLang(stored) && i18n.language !== stored) {
        i18n.changeLanguage(stored);
      }
    } catch {
      // localStorage may be unavailable (Safari private mode etc.) — ignore.
    }
  }, []);

  // Subscribe to language changes for re-render. The actual mutations go
  // through the singleton imported above.
  useTranslation();
  const current = (i18n.language?.slice(0, 2) || DEFAULT_LANG) as Lang;

  if (!mounted || onAdmin) return null;

  const change = (lng: Lang) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lng);
    } catch {}
    i18n.changeLanguage(lng);
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 border border-border bg-background/90 px-3 py-2 text-[11px] uppercase tracking-[0.28em] shadow-sm backdrop-blur-sm md:right-6 md:bottom-6">
      {SUPPORTED_LANGS.map((lng, i) => (
        <span key={lng} className="flex items-center gap-2">
          {i > 0 && <span className="text-muted-foreground/40">·</span>}
          <button
            type="button"
            onClick={() => change(lng)}
            aria-current={current === lng ? "true" : undefined}
            aria-label={`Sprache wechseln zu ${LANG_LABELS[lng]}`}
            className={`transition-colors ${
              current === lng
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {LANG_LABELS[lng]}
          </button>
        </span>
      ))}
    </div>
  );
}
