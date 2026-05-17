import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, DEFAULT_LANG, LANG_LABELS, type Lang } from "@/i18n";

const STORAGE_KEY = "andreashof.lang";

/**
 * Small fixed-position language switcher. Anchored at bottom-right so it
 * never overlaps the header CTAs and stays out of the reading flow. Uses
 * a single light tone — the bottom of the page is always linen-coloured
 * across every route.
 */
export function FloatingLangSwitcher() {
  const { i18n } = useTranslation();
  const current = (i18n.language?.slice(0, 2) || DEFAULT_LANG) as Lang;

  const change = (lng: Lang) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lng);
    }
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
