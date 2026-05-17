import { useEffect } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LANGS, DEFAULT_LANG, LANG_LABELS, type Lang } from "./index";

const STORAGE_KEY = "andreashof.lang";

function isLang(v: string | null): v is Lang {
  return v !== null && (SUPPORTED_LANGS as readonly string[]).includes(v);
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) {
      if (i18n.language !== stored) i18n.changeLanguage(stored);
      return;
    }
    const nav = window.navigator.language?.slice(0, 2).toLowerCase();
    if (isLang(nav) && nav !== i18n.language) {
      i18n.changeLanguage(nav);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export function LangSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { i18n } = useTranslation();
  const current = (i18n.language?.slice(0, 2) || DEFAULT_LANG) as Lang;

  const change = (lng: Lang) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lng);
    }
    i18n.changeLanguage(lng);
  };

  const baseColor = tone === "light" ? "text-white/70" : "text-muted-foreground";
  const activeColor = tone === "light" ? "text-white" : "text-foreground";
  const sep = tone === "light" ? "text-white/40" : "text-muted-foreground/50";

  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em]">
      {SUPPORTED_LANGS.map((lng, i) => (
        <span key={lng} className="flex items-center gap-2">
          {i > 0 && <span className={sep}>·</span>}
          <button
            type="button"
            onClick={() => change(lng)}
            aria-current={current === lng ? "true" : undefined}
            className={`transition-colors hover:opacity-100 ${
              current === lng ? activeColor : `${baseColor} hover:${activeColor}`
            }`}
          >
            {LANG_LABELS[lng]}
          </button>
        </span>
      ))}
    </div>
  );
}
