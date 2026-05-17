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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Andreashof" className="h-12 w-auto" />
          </Link>
          <Link to="/" className="text-[11px] uppercase tracking-[0.28em] hover:text-sage-deep">← Zurück</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-32 md:px-10">
        <span className="eyebrow">Rechtliches</span>
        <h1 className="mt-4 font-display text-5xl font-light">Datenschutz­erklärung</h1>
        <div className="mt-12 space-y-8 text-[0.95rem] leading-relaxed text-foreground/85">
          <section>
            <h2 className="font-display text-2xl">1. Verantwortlicher</h2>
            <p className="mt-3">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist
              der Andreashof Breechen, Breechen 1, 17506 Gützkow.
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
