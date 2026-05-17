import logo from "@/assets/logo-andreashof.jpeg";
import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  const nav = [
    { href: "#haus", label: "Das Haus" },
    { href: "#zimmer", label: "Zimmer" },
    { href: "#galerie", label: "Galerie" },
    { href: "#lage", label: "Lage" },
    { href: "#anfrage", label: "Anfrage" },
  ];
  return (
    <header className="absolute top-0 left-0 right-0 z-20 animate-fade-in" style={{ animationDelay: "100ms" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <a href="#top" className="flex items-center gap-3">
          <img src={logo} alt="Andreashof Breechen" className="h-12 w-auto mix-blend-screen md:h-14" />
        </a>
        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-[11px] uppercase tracking-[0.28em] text-white/85 transition-colors hover:text-white"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <a
          href="#anfrage"
          className="hidden border border-white/80 px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] text-white transition-colors hover:bg-white hover:text-foreground md:inline-block"
        >
          Reservieren
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-linen">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <img src={logo} alt="Andreashof Breechen" className="h-16 w-auto" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Ein historisches Gutshaus aus dem 18. Jahrhundert in Vorpommern —
              für Familien, Hochzeiten und Rückzüge.
            </p>
          </div>
          <div>
            <h4 className="eyebrow">Navigation</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><a href="#haus" className="hover:text-sage-deep">Das Haus</a></li>
              <li><a href="#zimmer" className="hover:text-sage-deep">Zimmer</a></li>
              <li><a href="#galerie" className="hover:text-sage-deep">Galerie</a></li>
              <li><a href="#lage" className="hover:text-sage-deep">Lage</a></li>
              <li><a href="#anfrage" className="hover:text-sage-deep">Anfrage</a></li>
            </ul>
          </div>
          <div>
            <h4 className="eyebrow">Kontakt</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><a href="mailto:willkommen@andreashof-breechen.de" className="hover:text-sage-deep">willkommen@andreashof-breechen.de</a></li>
              <li><a href="https://wa.me/4915112345678" className="hover:text-sage-deep">WhatsApp +49 151 1234 5678</a></li>
              <li className="text-muted-foreground">Breechen 1, 17506 Gützkow<br/>Mecklenburg-Vorpommern</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Andreashof Breechen. Alle Rechte vorbehalten.</p>
          <div className="flex gap-6">
            <Link to="/impressum" className="hover:text-sage-deep">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-sage-deep">Datenschutz</Link>
            <Link to="/agb" className="hover:text-sage-deep">AGB</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
