import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { SUPPORTED_LANGS, type Lang } from "./index";

const STORAGE_KEY = "andreashof.lang";

function isLang(v: string | null): v is Lang {
  return v !== null && (SUPPORTED_LANGS as readonly string[]).includes(v);
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Default is always German. Only switch if the user has explicitly chosen
    // a language before (saved in localStorage via the FloatingLangSwitcher).
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored) && i18n.language !== stored) {
      i18n.changeLanguage(stored);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
