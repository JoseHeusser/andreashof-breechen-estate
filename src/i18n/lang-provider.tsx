import { I18nextProvider } from "react-i18next";
import i18n from "./index";

/**
 * Wraps the app with the i18next instance. Language is always German by
 * default — any user preference stored in localStorage is applied later
 * by the FloatingLangSwitcher, which is client-only. This keeps SSR and
 * the first client paint perfectly in sync (no hydration mismatch).
 */
export function LangProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
