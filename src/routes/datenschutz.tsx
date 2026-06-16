import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-chrome";
import logo from "@/assets/logo-andreashof.jpeg";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutz — Andreashof Breechen" },
      { name: "description", content: "Datenschutzerklärung des Andreashof Breechen." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/datenschutz" }],
  }),
  component: DatenschutzPage,
});

function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-10 md:py-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Andreashof" className="h-10 w-auto md:h-12" />
          </Link>
          <Link to="/" className="min-h-11 py-2 text-[11px] uppercase tracking-[0.18em] hover:text-sage-deep md:tracking-[0.28em]">← Zurück</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-16 md:px-10 md:py-32">
        <span className="eyebrow">Rechtliches</span>
        <h1 className="mt-4 break-words font-display text-[2.4rem] font-light leading-[1.1] md:text-5xl">Datenschutz­erklärung</h1>
        <div className="mt-12 space-y-8 text-[0.95rem] leading-relaxed text-foreground/85">
          <section>
            <h2 className="font-display text-2xl">1. Verantwortlicher</h2>
            <p className="mt-3">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist
              der Andreashof Breechen, Peenestrassee 16, 17506.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">2. Erhebung personenbezogener Daten</h2>
            <p className="mt-3">
              Beim Besuch unserer Website werden technische Daten (IP-Adresse,
              Browsertyp, Uhrzeit der Anfrage) automatisch erhoben. Diese
              Daten dienen ausschließlich der Sicherstellung des Betriebs.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">3. Kontaktformular</h2>
            <p className="mt-3">
              Wenn Sie uns über das Kontaktformular Anfragen zukommen lassen,
              werden Ihre Angaben zur Bearbeitung der Anfrage und für mögliche
              Anschlussfragen gespeichert.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">4. Ihre Rechte</h2>
            <p className="mt-3">
              Sie haben jederzeit das Recht auf Auskunft, Berichtigung,
              Löschung, Einschränkung der Verarbeitung sowie das Recht auf
              Datenübertragbarkeit und Widerspruch.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">5. Karten</h2>
            <p className="mt-3">
              Diese Website verwendet OpenStreetMap zur Darstellung der Lage.
              Bei Aufruf der Karte werden Daten an die OpenStreetMap
              Foundation übertragen.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
