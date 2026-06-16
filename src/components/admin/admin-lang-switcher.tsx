import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const STORAGE_KEY = "andreashof.lang";
const LANGS = ["de", "en"] as const;
type AdminLang = (typeof LANGS)[number];

/** Tiny DE/EN switcher for the admin shell. Spanish is intentionally
 *  excluded — the admin UI ships only in those two languages. */
export function AdminLangSwitcher() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useTranslation(); // subscribe to language changes
  const current = ((i18n.language?.slice(0, 2) || "de") === "en" ? "en" : "de") as AdminLang;

  if (!mounted) return null;

  const change = (lng: AdminLang) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lng);
    } catch {}
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em]">
      {LANGS.map((lng, i) => (
        <span key={lng} className="flex items-center gap-2">
          {i > 0 && <span className="text-muted-foreground/40">·</span>}
          <button
            type="button"
            onClick={() => change(lng)}
            aria-current={current === lng ? "true" : undefined}
            className={`transition-colors ${
              current === lng
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lng.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
