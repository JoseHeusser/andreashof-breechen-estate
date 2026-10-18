import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-chrome";
import { LOGO_ALT, LOGO_BLACK } from "@/lib/logos";

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
            <img src={LOGO_BLACK} alt={LOGO_ALT} className="h-10 w-auto md:h-12" />
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
              Nach unserer Bestätigung erhalten Sie den Mietvertrag. Der Vertrag ist verbindlich
              geschlossen, sobald der von Ihnen unterschriebene Mietvertrag bei uns eingegangen ist.
              Die Unterkunft darf nur mit der im Mietvertrag angegebenen Personenzahl und
              ausschließlich zu Urlaubszwecken genutzt werden.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">3. Zahlungsbedingungen</h2>
            <p className="mt-3">
              Eine Anzahlung in Höhe von 50 % des Gesamtbetrags ist sofort nach Vertragsschluss
              fällig. Der Restbetrag ist spätestens 2 Tage vor Anreise zu entrichten, sofern nichts
              anderes vereinbart wurde. Maßgeblich ist der Zahlungseingang auf dem angegebenen
              Konto.
            </p>
            <p className="mt-3">
              Zusätzlich ist mit der Zahlung eine Kaution in Höhe von 500 € zu entrichten. Sie wird
              nach der Mietzeit abzüglich etwaiger Verbrauchskosten innerhalb von 10 Tagen per
              Überweisung erstattet und nicht verzinst. Wohnen mehr Personen im Haus als im
              Mietvertrag vereinbart, berechnen wir 45 € pro zusätzlicher Person und Nacht.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">4. Änderungen der Buchung</h2>
            <p className="mt-3">
              Änderungen der Buchungsdaten — insbesondere die Anzahl der Personen, Hunde oder Pferde
              — sind bis 4 Wochen vor Anreise möglich. Danach gilt die Buchung als verbindlich
              festgelegt, da wir das Haus ab diesem Zeitpunkt entsprechend vorbereiten (Betten,
              Tische, Stühle und Verpflegung). Spätere Änderungswünsche können wir nur nach
              Absprache und im Rahmen unserer Möglichkeiten berücksichtigen. Eine Verringerung der
              Personenzahl innerhalb der letzten 4 Wochen vor Anreise führt nicht zu einer Minderung
              des vereinbarten Gesamtpreises.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">5. Stornierungsbedingungen</h2>
            <p className="mt-3">
              Kostenfreie Stornierung bis zum 60. Tag vor Anreise. Bei späterer Stornierung werden
              50 % des Gesamtbetrags fällig. Maßgeblich ist der Zugang der Stornierungserklärung bei
              uns. Wir bemühen uns um eine anderweitige Vermietung; soweit dadurch Einnahmen erzielt
              werden, werden diese auf die Stornierungskosten angerechnet.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">6. An- und Abreise</h2>
            <p className="mt-3">
              Check-in: ab 11:00 Uhr · Check-out: bis 16:00 Uhr. Der Check-in erfolgt in der Regel
              über die Schlüsselbox. Den aktuellen Code erhalten Gäste einen Tag vor Anreise per
              E-Mail. Erfolgt die Anreise nach 20:00 Uhr, geben Sie uns bitte vorher Bescheid.
              Hausvater Gunter ist am ersten Abend vor Ort und beantwortet bei Bedarf auftretende
              Fragen.
            </p>
            <p className="mt-3">
              Bitte prüfen Sie nach der Ankunft die Inventarliste im Haus und melden Sie etwaige
              Fehlbestände spätestens am Folgetag. Am Abreisetag übergeben Sie das Haus bis 16:00
              Uhr besenrein. Dazu gehören: Bettwäsche abziehen, Geschirr spülen sowie Papierkörbe
              und Mülleimer leeren. Die Schlüssel legen Sie bitte zurück in die Schlüsselbox.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">7. Hausordnung</h2>
            <p className="mt-3">
              Das Gutshaus ist ein Nichtraucherhaus. Wir bitten um Rücksicht auf die Dorfbewohner:
              Musizieren und andere laute Geräusche sind zwischen 00:00 und 07:00 Uhr zu
              unterlassen, Radio, Fernseher und Musikanlagen bitte nur in Zimmerlautstärke.
              Veranstaltungen sind nach Absprache möglich. Ein Hund ist nach vorheriger Absprache
              erlaubt. Gäste haften für Schäden, die durch sie, Mitreisende, Besucher oder
              mitgebrachte Tiere verursacht werden, soweit sie diese zu vertreten haben.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">8. Haftung</h2>
            <p className="mt-3">
              Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von
              Leben, Körper oder Gesundheit sowie nach zwingenden gesetzlichen Vorschriften. Bei
              leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist die Haftung auf den
              vertragstypischen, vorhersehbaren Schaden begrenzt. Im Übrigen ist eine Haftung
              ausgeschlossen.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">9. Widerrufsrecht</h2>
            <p className="mt-3">
              Für Verträge zur Erbringung von Dienstleistungen im Bereich Beherbergung zu einem
              spezifischen Termin oder Zeitraum besteht kein gesetzliches Widerrufsrecht, soweit die
              gesetzlichen Voraussetzungen erfüllt sind.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">10. Schlussbestimmungen</h2>
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
