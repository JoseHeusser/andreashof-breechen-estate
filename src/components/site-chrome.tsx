import { LOGO_ALT, LOGO_BLACK, LOGO_WHITE } from "@/lib/logos";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const nav = [
    { href: "/", label: t("nav.home"), to: "/" as const },
    { href: "/#haus", label: t("nav.house") },
    { href: "/zimmer", label: t("nav.rooms"), to: "/zimmer" as const },
    { href: "/galerie", label: t("nav.gallery"), to: "/galerie" as const },
    { href: "/rueckblicke", label: t("nav.history"), to: "/rueckblicke" as const },
    { href: "/#lage", label: t("nav.location") },
    { href: "/partner", label: t("nav.partners"), to: "/partner" as const },
    { href: "/reservations", label: t("nav.inquiry"), to: "/reservations" as const },
  ];

  const isLight = tone === "light";
  const textColor = isLight ? "text-white/85" : "text-foreground/80";
  const hoverColor = isLight ? "hover:text-white" : "hover:text-foreground";
  const borderColor = isLight
    ? "border-white/80 text-white hover:bg-white hover:text-foreground"
    : "border-foreground/80 text-foreground hover:bg-foreground hover:text-background";
  const logoSrc = isLight ? LOGO_WHITE : LOGO_BLACK;
  const mobilePanelBg = isLight
    ? "bg-black/70 backdrop-blur-sm border-white/25"
    : "bg-background/95 backdrop-blur-sm border-border";

  return (
    <header
      className={`absolute top-0 left-0 right-0 z-20 animate-fade-in`}
      style={{ animationDelay: "100ms" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:gap-6 md:px-10 md:py-6">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img src={logoSrc} alt={LOGO_ALT} className="h-9 w-auto max-md:max-w-[9rem] md:h-14" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) =>
            n.to ? (
              <Link
                key={n.href}
                to={n.to}
                className={`text-[11px] uppercase tracking-[0.28em] ${textColor} transition-colors ${hoverColor}`}
              >
                {n.label}
              </Link>
            ) : (
              <a
                key={n.href}
                href={n.href}
                className={`text-[11px] uppercase tracking-[0.28em] ${textColor} transition-colors ${hoverColor}`}
              >
                {n.label}
              </a>
            ),
          )}
        </nav>
        <Link
          to="/reservations"
          className={`hidden border px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] transition-colors md:inline-block ${borderColor}`}
        >
          {t("nav.reserve")}
        </Link>
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setMobileOpen((prev) => !prev)}
          className={`inline-flex min-h-11 min-w-[4.5rem] shrink-0 items-center justify-center border px-3 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors md:hidden ${borderColor}`}
        >
          {mobileOpen ? "Schließen" : "Menü"}
        </button>
      </div>
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Menü schließen"
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`fixed inset-x-0 top-[88px] z-40 max-h-[calc(100dvh-88px)] overflow-y-auto border-b px-4 py-4 md:hidden ${mobilePanelBg}`}
          >
            <nav className="grid gap-0.5">
              {nav.map((n) =>
                n.to ? (
                  <Link
                    key={n.href}
                    to={n.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex min-h-11 items-center px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] ${textColor} transition-colors ${hoverColor}`}
                  >
                    {n.label}
                  </Link>
                ) : (
                  <a
                    key={n.href}
                    href={n.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex min-h-11 items-center px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] ${textColor} transition-colors ${hoverColor}`}
                  >
                    {n.label}
                  </a>
                ),
              )}
              <Link
                to="/reservations"
                onClick={() => setMobileOpen(false)}
                className={`mt-3 inline-flex min-h-11 items-center justify-center border px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] transition-colors ${borderColor}`}
              >
                {t("nav.reserve")}
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/60 bg-linen">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <img src={LOGO_BLACK} alt={LOGO_ALT} className="h-16 w-auto" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
          <div>
            <h4 className="eyebrow">{t("footer.navHeading")}</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-sage-deep">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <a href="/#haus" className="hover:text-sage-deep">
                  {t("nav.house")}
                </a>
              </li>
              <li>
                <Link to="/zimmer" className="hover:text-sage-deep">
                  {t("nav.rooms")}
                </Link>
              </li>
              <li>
                <Link to="/galerie" className="hover:text-sage-deep">
                  {t("nav.gallery")}
                </Link>
              </li>
              <li>
                <Link to="/rueckblicke" className="hover:text-sage-deep">
                  {t("nav.history")}
                </Link>
              </li>
              <li>
                <a href="/#lage" className="hover:text-sage-deep">
                  {t("nav.location")}
                </a>
              </li>
              <li>
                <Link to="/partner" className="hover:text-sage-deep">
                  {t("nav.partners")}
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="hover:text-sage-deep">
                  {t("nav.inquiry")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="eyebrow">{t("footer.contactHeading")}</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href="mailto:andrea.lietz@web.de" className="hover:text-sage-deep">
                  andrea.lietz@web.de
                </a>
              </li>
              <li>
                <a href="tel:+491723813606" className="hover:text-sage-deep">
                  +49 172 3813606
                </a>
              </li>
              <li className="text-muted-foreground">{t("footer.address")}</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Andreashof Breechen. {t("footer.copyright")}
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6">
            <Link to="/impressum" className="hover:text-sage-deep">
              {t("footer.imprint")}
            </Link>
            <Link to="/datenschutz" className="hover:text-sage-deep">
              {t("footer.privacy")}
            </Link>
            <Link to="/agb" className="hover:text-sage-deep">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
