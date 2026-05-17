import logo from "@/assets/logo-andreashof.jpeg";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { t } = useTranslation();

  const nav = [
    { href: "/#haus", label: t("nav.house") },
    { href: "/zimmer", label: t("nav.rooms"), to: "/zimmer" as const },
    { href: "/#galerie", label: t("nav.gallery") },
    { href: "/#lage", label: t("nav.location") },
    { href: "/reservations", label: t("nav.inquiry"), to: "/reservations" as const },
  ];

  const isLight = tone === "light";
  const textColor = isLight ? "text-white/85" : "text-foreground/80";
  const hoverColor = isLight ? "hover:text-white" : "hover:text-foreground";
  const borderColor = isLight ? "border-white/80 text-white hover:bg-white hover:text-foreground" : "border-foreground/80 text-foreground hover:bg-foreground hover:text-background";
  const blend = isLight ? "mix-blend-screen" : "";

  return (
    <header className={`absolute top-0 left-0 right-0 z-20 animate-fade-in`} style={{ animationDelay: "100ms" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6 md:px-10">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Andreashof Breechen" className={`h-12 w-auto md:h-14 ${blend}`} />
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
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/60 bg-linen">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <img src={logo} alt="Andreashof Breechen" className="h-16 w-auto" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
          <div>
            <h4 className="eyebrow">{t("footer.navHeading")}</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><a href="/#haus" className="hover:text-sage-deep">{t("nav.house")}</a></li>
              <li><Link to="/zimmer" className="hover:text-sage-deep">{t("nav.rooms")}</Link></li>
              <li><a href="/#galerie" className="hover:text-sage-deep">{t("nav.gallery")}</a></li>
              <li><a href="/#lage" className="hover:text-sage-deep">{t("nav.location")}</a></li>
              <li><Link to="/reservations" className="hover:text-sage-deep">{t("nav.inquiry")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="eyebrow">{t("footer.contactHeading")}</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><a href="mailto:willkommen@andreashof-breechen.de" className="hover:text-sage-deep">willkommen@andreashof-breechen.de</a></li>
              <li><a href="https://wa.me/4915112345678" className="hover:text-sage-deep">WhatsApp +49 151 1234 5678</a></li>
              <li className="text-muted-foreground">{t("footer.address")}<br/>{t("footer.region")}</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Andreashof Breechen. {t("footer.copyright")}</p>
          <div className="flex gap-6">
            <Link to="/impressum" className="hover:text-sage-deep">{t("footer.imprint")}</Link>
            <Link to="/datenschutz" className="hover:text-sage-deep">{t("footer.privacy")}</Link>
            <Link to="/agb" className="hover:text-sage-deep">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
