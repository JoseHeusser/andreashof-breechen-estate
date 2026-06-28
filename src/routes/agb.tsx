import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-chrome";
import logo from "@/assets/logo-andreashof.jpeg";

export const Route = createFileRoute("/agb")({
  head: () => ({
    meta: [
      { title: "AGB — Andreashof Breechen" },
      { name: "description", content: "Allgemeine Geschäftsbedingungen des Andreashof Breechen." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/agb" }],
  }),
  component: AGBPage,
});

function AGBPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-10 md:py-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Andreashof" className="h-10 w-auto md:h-12" />
          </Link>
          <Link
            to="/"
            className="min-h-11 py-2 text-[11px] uppercase tracking-[0.18em] hover:text-sage-deep md:tracking-[0.28em]"
          >
            ← Zurück
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-16 md:px-10 md:py-32">
        <span className="eyebrow">Rechtliches</span>
        <h1 className="mt-4 break-words font-display text-[2.4rem] font-light leading-[1.1] md:text-5xl">
          Allgemeine Geschäfts­bedingungen
        </h1>
        <div className="mt-12 space-y-8 text-[0.95rem] leading-relaxed text-foreground/85">
          <section>
            <h2 className="font-display text-2xl">1. Geltungsbereich</h2>
            <p className="mt-3">
              Diese AGB gelten für alle Buchungen und Mietverträge zwischen Gästen und dem
              Andreashof Breechen GbR.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">2. Buchung und Vertragsschluss</h2>
            <p className="mt-3">
              Eine Anfrage über die Website, per E-Mail oder telefonisch ist zunächst unverbindlich.
              Ein Vertrag kommt erst zustande, wenn wir die Buchung schriftlich oder per E-Mail
              bestätigen und die vereinbarte Anzahlung fristgerecht eingeht, sofern keine andere
              Vereinbarung getroffen wurde.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">3. Zahlungsbedingungen</h2>
            <p className="mt-3">
              Eine Anzahlung in Höhe von 50 % ist innerhalb von 14 Tagen nach Buchungsbestätigung
              fällig. Der Restbetrag ist spätestens 2 Tage vor Anreise zu entrichten, sofern nichts
              anderes vereinbart wurde. Maßgeblich ist der Zahlungseingang auf dem angegebenen
              Konto.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">4. Stornierungsbedingungen</h2>
            <p className="mt-3">
              Kostenfreie Stornierung bis 60 Tage vor Anreise. Bei späterer Stornierung werden 50 %
              des Gesamtbetrags fällig. Ab 14 Tagen vor Anreise wird der volle Betrag berechnet.
              Maßgeblich ist der Zugang der Stornierungserklärung bei uns. Wir bemühen uns um eine
              anderweitige Vermietung; soweit dadurch Einnahmen erzielt werden, werden diese auf die
              Stornierungskosten angerechnet.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">5. An- und Abreise</h2>
            <p className="mt-3">
              Check-in: ab 14:00 Uhr · Check-out: bis 11:00 Uhr. Eine persönliche Begrüßung ist
              Bestandteil der Anreise.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">6. Hausordnung</h2>
            <p className="mt-3">
              Wir bitten um Rücksicht auf die Nachbarschaft. Nachtruhe ab 22:00 Uhr. Veranstaltungen
              sind nach Absprache möglich. Gäste haften für Schäden, die durch sie, Mitreisende oder
              Besucher verursacht werden, soweit sie diese zu vertreten haben.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">7. Haftung</h2>
            <p className="mt-3">
              Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von
              Leben, Körper oder Gesundheit sowie nach zwingenden gesetzlichen Vorschriften. Bei
              leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist die Haftung auf den
              vertragstypischen, vorhersehbaren Schaden begrenzt. Im Übrigen ist eine Haftung
              ausgeschlossen.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">8. Widerrufsrecht</h2>
            <p className="mt-3">
              Für Verträge zur Erbringung von Dienstleistungen im Bereich Beherbergung zu einem
              spezifischen Termin oder Zeitraum besteht kein gesetzliches Widerrufsrecht, soweit die
              gesetzlichen Voraussetzungen erfüllt sind.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">9. Schlussbestimmungen</h2>
            <p className="mt-3">
              Es gilt deutsches Recht. Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder
              werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
