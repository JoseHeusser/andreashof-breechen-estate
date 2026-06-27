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
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
            </p>
            <p className="mt-3">
              Andreashof Breechen<br />
              Andrea Lietz-Kreher und Andreas Kreher GbR<br />
              Peenestraße 16<br />
              17506 Gützkow<br />
              Deutschland<br />
              E-Mail:{" "}
              <a href="mailto:willkommen@andreashof-breechen.de" className="underline decoration-border underline-offset-4 hover:text-sage-deep">
                willkommen@andreashof-breechen.de
              </a>
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
            <h2 className="font-display text-2xl">3. Reservierungsanfragen und Kontakt</h2>
            <p className="mt-3">
              Wenn Sie über die Website eine Reservierungsanfrage senden oder
              per E-Mail Kontakt aufnehmen, verarbeiten wir die von Ihnen
              angegebenen Daten, insbesondere Name, E-Mail-Adresse, Reisedaten,
              Gästezahl, Sonderwünsche und Nachrichtentext. Die Verarbeitung
              erfolgt zur Bearbeitung Ihrer Anfrage, zur Vorbereitung oder
              Durchführung eines Vertrags sowie für Anschlussfragen.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">4. Buchungsverwaltung und E-Mail-Versand</h2>
            <p className="mt-3">
              Reservierungsdaten werden in einer geschützten Datenbank
              verarbeitet. Für den Versand von Bestätigungen, Zahlungs- und
              Anreiseinformationen nutzen wir einen E-Mail-Dienstleister. Die
              Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
              für vorvertragliche Maßnahmen und Vertragsdurchführung sowie,
              soweit erforderlich, Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">5. Reichweitenmessung</h2>
            <p className="mt-3">
              Wir erfassen einfache, eigene Besuchsstatistiken, um zu verstehen,
              welche Seiten aufgerufen werden und zu welchen Zeiten die Website
              genutzt wird. Dabei werden Seitenpfad, Zeitpunkt, Referrer,
              Sprache, User-Agent und eine zufällig erzeugte Sitzungskennung im
              lokalen Speicher Ihres Browsers verarbeitet. Diese Statistik dient
              ausschließlich dem Betrieb und der Verbesserung der Website. Sie
              können die Speicherung der Sitzungskennung durch Löschen des
              lokalen Speichers in Ihrem Browser entfernen; bei aktivem
              „Do Not Track“ wird kein Besuch erfasst.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">6. Karten</h2>
            <p className="mt-3">
              Diese Website verwendet OpenStreetMap-Karten zur Darstellung der
              Lage. Beim Aufruf der Karte können technische Daten wie Ihre
              IP-Adresse an Server der OpenStreetMap Foundation oder deren
              technische Dienstleister übertragen werden.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">7. Hosting und technische Dienstleister</h2>
            <p className="mt-3">
              Die Website wird über technische Dienstleister betrieben. Dabei
              können Server-Logdaten und technische Nutzungsdaten verarbeitet
              werden, um die Website auszuliefern, abzusichern und Fehler zu
              analysieren. Mit Dienstleistern, die personenbezogene Daten in
              unserem Auftrag verarbeiten, werden entsprechende Vereinbarungen
              zur Auftragsverarbeitung geschlossen.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">8. Speicherdauer</h2>
            <p className="mt-3">
              Wir speichern personenbezogene Daten nur so lange, wie dies für
              die jeweiligen Zwecke erforderlich ist oder gesetzliche
              Aufbewahrungspflichten bestehen. Reservierungs- und
              Geschäftsunterlagen können aufgrund handels- und steuerrechtlicher
              Pflichten länger aufbewahrt werden.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl">9. Ihre Rechte</h2>
            <p className="mt-3">
              Sie haben jederzeit das Recht auf Auskunft, Berichtigung,
              Löschung, Einschränkung der Verarbeitung sowie das Recht auf
              Datenübertragbarkeit und Widerspruch. Außerdem haben Sie das
              Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
