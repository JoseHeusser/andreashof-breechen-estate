import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-chrome";
import logo from "@/assets/logo-andreashof.jpeg";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum — Andreashof Breechen" },
      { name: "description", content: "Impressum und Anbieterkennzeichnung des Andreashof Breechen." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/impressum" }],
  }),
  component: ImpressumPage,
});

function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background">
      <LegalHeader />
      <main className="mx-auto max-w-3xl px-6 py-32 md:px-10">
        <span className="eyebrow">Rechtliches</span>
        <h1 className="mt-4 font-display text-5xl font-light">Impressum</h1>
        <div className="mt-12 space-y-8 text-[0.95rem] leading-relaxed text-foreground/85">
          <section>
            <h2 className="font-display text-2xl">Angaben gemäß § 5 TMG</h2>
            <p className="mt-3">
              Andreashof Breechen<br />
              Peenestrassee 16, 17506<br />
              Deutschland
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">Vertreten durch</h2>
            <p className="mt-3">[Name des Inhabers / Geschäftsführers]</p>
          </section>
          <section>
            <h2 className="font-display text-2xl">Kontakt</h2>
            <p className="mt-3"></p>
          </section>
          <section>
            <h2 className="font-display text-2xl">Umsatzsteuer-ID</h2>
            <p className="mt-3">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: [USt-IdNr.]
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p className="mt-3">[Name], [Adresse]</p>
          </section>
          <section>
            <h2 className="font-display text-2xl">Haftungsausschluss</h2>
            <p className="mt-3">
              Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
              kann jedoch keine Gewähr übernommen werden.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function LegalHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Andreashof" className="h-12 w-auto" />
        </Link>
        <Link to="/" className="text-[11px] uppercase tracking-[0.28em] hover:text-sage-deep">
          ← Zurück
        </Link>
      </div>
    </header>
  );
}
