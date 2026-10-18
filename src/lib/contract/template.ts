import type { Booking } from "@/lib/supabase/types";

/**
 * Ferienhaus-Mietvertrag — digitised from Andrea's original
 * "mietvertrag_Andreashof Breechen Prototyp odt.odt".
 *
 * The wording of every § is kept verbatim; only the blanks (…......) are
 * filled from the booking. Everything the guest must fill in by hand
 * (address, bank details for the deposit refund, signatures) stays as a
 * printed line.
 *
 * Rendered as HTML and printed to PDF from /admin/vertrag/$id.
 */

const BANK = {
  holder: "Andreashof Breechen",
  iban: "DE78 1005 0000 0190 9484 85",
  bic: "BELADEBEXXX",
  bank: "Berliner Sparkasse",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function nights(arrival: string, departure: string): number {
  const a = new Date(arrival + "T00:00:00Z").getTime();
  const d = new Date(departure + "T00:00:00Z").getTime();
  return Math.max(1, Math.round((d - a) / 86400000));
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function euro(cents: number | null): string {
  if (cents == null) return blank(12);
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** A dotted blank the guest or Andrea fills in by hand. */
function blank(len = 20): string {
  return `<span class="blank">${"&nbsp;".repeat(len)}</span>`;
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function filled(value: string): string {
  return `<span class="filled">${escapeHtml(value)}</span>`;
}

export function contractFilename(b: Booking): string {
  const name = b.contact_name
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
  return `Mietvertrag-Andreashof-${name || "Gast"}-${b.arrival}.pdf`;
}

export function renderContractHtml(b: Booking): string {
  const n = nights(b.arrival, b.departure);
  const total = b.total_price_cents;
  const deposit = total != null ? Math.round(total * 0.5) : null;
  // Per § 3 (5): the balance is due before arrival — the AGB say 2 days.
  const balanceDue = formatDate(addDays(b.arrival, -2));

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Mietvertrag — ${escapeHtml(b.contact_name)}</title>
<style>
  @page { size: A4; margin: 20mm 18mm; }
  body { font-family: "Times New Roman", Times, serif; font-size: 11.5pt; line-height: 1.5; color: #000; margin: 0; }
  h1 { font-size: 17pt; letter-spacing: 0.35em; text-align: center; font-weight: 700; margin: 0; }
  h2 { font-size: 12pt; text-align: center; margin: 22px 0 2px; font-weight: 700; }
  h2 + p.caption { text-align: center; font-weight: 700; margin: 0 0 10px; }
  p { margin: 0 0 8px; }
  .party { margin: 18px 0; }
  .role { font-style: italic; }
  .blank { border-bottom: 1px dotted #000; display: inline-block; min-width: 60px; }
  .filled { font-weight: 600; }
  .bank td { padding: 1px 10px 1px 0; vertical-align: top; }
  .sign { margin-top: 42px; }
  .sign .line { border-top: 1px solid #000; width: 62mm; margin-top: 34px; padding-top: 4px; }
  section { page-break-inside: avoid; }
</style>
</head>
<body>
  <h1>F E R I E N H A U S</h1>
  <h1>M I E T V E R T R A G</h1>

  <p style="margin-top:22px;">Zwischen</p>
  <div class="party">
    <p><strong>Andreashof Breechen GbR,</strong></p>
    <p>Vertreten durch: Andrea Lietz-Kreher</p>
    <p>Anschrift: Mönchsheimer Weg 10, 15366 Hoppegarten</p>
    <p class="role">- nachfolgend Vermieter -</p>
  </div>

  <p>und</p>
  <div class="party">
    <p>${filled(b.contact_name)}</p>
    <p>Anschrift: ${blank(60)}</p>
    <p class="role">- nachfolgend Mieter -</p>
  </div>

  <p>über die Anmietung folgendes Mietobjektes: Ferienhaus</p>

  <section>
    <h2>§ 1</h2>
    <p class="caption">Mietgegenstand und Schlüssel</p>
    <p>(1) Der Vermieter vermietet an den Mieter folgende Unterkunft („Mietobjekt“):<br>
      Andreashof Breechen<br>Peenestraße 16<br>17506&nbsp; Breechen</p>
    <p>(2) Das Mietobjekt wird für insgesamt ${filled(String(b.guests))} Personen, vermietet. Das Mietobjekt ist kein Raucherobjekt.</p>
    <p>(3) Werden mehr Personen als oben genannt in dem Mietobjekt wohnen, dann entsteht folgende Gebühr Per Rechnung: 45 €/ Nacht</p>
    <p>(4) Das Mietobjekt ist vollständig eingerichtet und möbliert und wird mit folgender Ausstattung vermietet:<br>
      Anzahl Schlafzimmer: 11<br>Anzahl Wohnzimmer: 2<br>Anzahl Esszimmer: 2<br>Anzahl Küche: 2<br>Anzahl Badezimmer: 7<br>
      Die Gartenmitbenutzung ist gestattet.<br>Größe der Mieträume: ca. 640 qm</p>
    <p>(5) Der Mieter erhält für die Dauer der Mietzeit folgende Schlüssel:<br>1 Wohnungsschlüssel</p>
  </section>

  <section>
    <h2>§ 2</h2>
    <p class="caption">Mietzeit, An- und Abreise</p>
    <p>Das Mietobjekt wird für die Zeit vom ${filled(formatDate(b.arrival))} bis zum ${filled(formatDate(b.departure))} an den Mieter vermietet. Dies sind insgesamt ${filled(String(n))} Nächte.</p>
    <p>(2) Die Anreise erfolgt am Anreisetag ab 11 Uhr.</p>
    <p>(3) Die Abreise erfolgt am Abreisetag bis 16 Uhr, nach Rücksprache bis spätestens 16 Uhr.</p>
    <p>(4) Sollte die Anreise nach 20 Uhr erfolgen, so muss der Mieter dem Vermieter dies mitteilen. Der Mieter wird gebeten, unmittelbar nach seiner Ankunft die im Mietobjekt befindliche Inventarliste zu überprüfen und etwaige Fehlbestände spätestens an dem der Ankunft folgenden Tag dem Vermieter oder der von diesem benannten Kontaktperson mitzuteilen. Am Abreisetag wird der Mieter das Mietobjekt dem Vermieter bis spätestens 16 Uhr geräumt in besenreinem Zustand übergeben. Dabei hat der Mieter noch folgende Arbeiten selbst zu erledigen: Abziehen der Bettwäsche, Spülen des Geschirrs und Entleeren der Papierkörbe und Mülleimer.</p>
  </section>

  <section>
    <h2>§ 3</h2>
    <p class="caption">Mietpreis und Zahlungsweise</p>
    <p>Der Grundmietpreis beträgt (in Euro): ${total != null ? filled(euro(total)) : blank(16)}</p>
    <p>(2) Es entstehen noch folgende Nebenkosten:<br>
      1. Bett- und Badewäsche, Strom, Gas, Wasser ist im Preis enthalten.<br>
      2. Kosten für Haustiere: ${b.pets > 0 ? filled(String(b.pets)) : blank(10)} Haustiere</p>
    <p>(3) Der Gesamtpreis für die Miete für das Mietobjekt beträgt: ${total != null ? filled(euro(total)) : blank(16)}</p>
    <p>(4) Die Zahlung des Mietpreises erfolgt - per Überweisung - auf folgendes Konto:</p>
    <table class="bank">
      <tr><td>Kontoinhaber:</td><td>${BANK.holder}</td></tr>
      <tr><td>IBAN:</td><td>${BANK.iban}</td></tr>
      <tr><td>BIC:</td><td>${BANK.bic}</td></tr>
      <tr><td>Bankinstitut:</td><td>${BANK.bank}</td></tr>
    </table>
    <p>(5) Eine Anzahlung von 50 %${deposit != null ? ` (${euro(deposit)})` : ""} ist sofort fällig. Die Restzahlung erfolgt bis spätestens zum: ${filled(balanceDue)}</p>
    <p>(6) Nach Ende der Mietzeit hat der Mieter das Mietobjekt in einem ordnungsgemäßen Zustand an den Vermieter zu übergeben und die Schlüssel in die Schlüsselbox zu verstauen.</p>
  </section>

  <section>
    <h2>§ 4</h2>
    <p class="caption">Kaution</p>
    <p>(1) Die Kaution in Höhe von 500 € ist mit der Zahlung zu entrichten und wird nach der Mietzeit abzüglich etwaiger Verbrauchskosten per Überweisung innerhalb von 10 Tagen erstattet.</p>
    <p>(2) Die Kaution wird nicht verzinst.</p>
    <p>(3) Die Rücküberweisung der Kaution erfolgt auf folgendes Konto:</p>
    <table class="bank">
      <tr><td>Kontoinhaber:</td><td>${blank(40)}</td></tr>
      <tr><td>IBAN:</td><td>${blank(40)}</td></tr>
      <tr><td>BIC:</td><td>${blank(40)}</td></tr>
      <tr><td>Bankinstitut:</td><td>${blank(40)}</td></tr>
    </table>
  </section>

  <section>
    <h2>§ 5</h2>
    <p class="caption">Abfall</p>
    <p>Der Mieter ist verpflichtet, jeglichen entstanden Abfall in folgender Weise zu entsorgen:<br>
      Bitte die Mülleimer leeren, Biomüll gerne in den Bio-Mülleimer<br>
      Gelbe Säcke neben der Mülltonne abstellen.</p>
  </section>

  <section>
    <h2>§ 6</h2>
    <p class="caption">Sorgfaltspflichten</p>
    <p>(1) Der Mieter und seine Angehörigen haben die Räumlichkeiten des Mietobjektes und die Einrichtungsgegenstände pfleglich zu behandeln. Für die schuldhafte Beschädigung von Einrichtungsgegenständen, Mieträumen oder des Gebäudes sowie der zu den Mieträumen oder dem Gebäude gehörenden Anlage ist der Mieter ersatzpflichtig. Dies gilt nur, wenn diese schuldhaften Beschädigungen vom Mieter, einer Begleitperson oder Besuchern des Mieters verursacht wurden. In den Mieträumen entstandene Schäden, soweit er nicht selbst zur Beseitigung verpflichtet ist, müssen dem Vermieter (oder einer Kontaktstelle) unverzüglich mitgeteilt werden. Die Mieter sind verpflichtet, bei Bezug der Räumlichkeiten die Einrichtung auf ihre Vollständigkeit und Gebrauchstauglichkeit hin zu überprüfen und jegliche Mangelhaftigkeit unverzüglich gegenüber dem Vermieter geltend zu machen.</p>
    <p>Der Vermieter haftet für die Richtigkeit der Beschreibung des Mietobjektes und ist verpflichtet, die vertraglich vereinbarten Leistungen ordnungsgemäß zu erbringen und während der gesamten Mietzeit zu erhalten. Der Vermieter haftet nicht gemäß § 536a BGB. Die Haftung des Vermieters für Sachschäden aus unerlaubter Handlung ist ausgeschlossen, soweit sie nicht auf einer vorsätzlichen oder grob fahrlässigen Pflichtverletzung des Vermieters oder seines Erfüllungsgehilfen beruhen. Der Vermieter haftet nicht in Fällen höherer Gewalt (z.B. Brand, Überschwemmung etc.).</p>
    <p>Der Mieter ist verpflichtet, sämtliche entstandene Schäden an Einrichtung, Ausstattung und Gebäude unverzüglich dem Vermieter mitzuteilen.</p>
  </section>

  <section>
    <h2>§ 7</h2>
    <p class="caption">Rücktritt durch den Mieter</p>
    <p>(1) Der Mieter ist berechtigt, vor Mietbeginn vom Vertrag zurückzutreten. Dieser Rücktritt muss dem Vermieter schriftlich zugehen. Maßgeblich ist der Zeitpunkt des Zugangs der Rücktrittserklärung beim Vermieter.</p>
    <p>(2) Tritt der Mieter vom Vertrag zurück, so hat er pauschalen Ersatz für die beim Vermieter bereits entstandenen Aufwendungen und den entgangenen Gewinn in der nachfolgenden Höhe zu leisten:<br>
      Rücktritt bis zum 60. Tag vor Reiseantritt, danach 50%</p>
    <p>(3) Dem Mieter bleibt der Nachweis vorbehalten, dass bei dem Vermieter kein oder ein wesentlich geringerer Schaden entstanden ist. Der Mieter kann bei Rücktritt vom Vertrag einen Ersatzmieter benennen, der bereit ist, an seiner Stelle in das bestehende Vertragsverhältnis einzutreten. Der Vermieter kann dem Eintritt des Dritten widersprechen, wenn dieser wirtschaftlich oder persönlich unzuverlässig erscheint. Tritt ein Dritter in den Mietvertrag ein, so haften er und der bisherige Mieter dem Vermieter als Gesamtschuldner für den Mietpreis und die durch den Eintritt des Dritten entstehenden Mehrkosten. Der Vermieter hat nach Treu und Glauben eine nicht in Anspruch genommene Unterkunft anderweitig zu vermieten und muss sich das dadurch Ersparte auf die von ihm geltend gemachten Stornogebühren anrechnen lassen. Der Abschluss einer Reiserücktrittsversicherung wird dem Mieter empfohlen.</p>
  </section>

  <section>
    <h2>§ 8</h2>
    <p class="caption">Kündigung durch den Vermieter</p>
    <p>Der Vermieter kann das Vertragsverhältnis vor oder nach Beginn der Mietzeit ohne Einhaltung einer Frist kündigen, wenn der Mieter trotz vorheriger Mahnung die vereinbarten Zahlungen (Anzahlung, Restzahlung und Kaution) nicht fristgemäß leistet oder sich ansonsten in einem solchen Maße vertragswidrig verhält, dass dem Vermieter eine Fortsetzung des Vertragsverhältnisses nicht zuzumuten ist. In diesem Falle kann der Vermieter von dem Mieter Ersatz der bis zur Kündigung entstandenen Aufwendungen und des entgangenen Gewinns verlangen.</p>
  </section>

  <section>
    <h2>§ 9</h2>
    <p class="caption">Vertragsaufhebung auf Grund außergewöhnlichen Umständen</p>
    <p>Der Mietvertrag kann von beiden Seiten gekündigt werden, wenn die Erfüllung des Vertrages infolge bei Vertragsabschluss nicht vorhersehbarer höherer Gewalt erheblich erschwert, gefährdet oder beeinträchtigt wird. Beide Vertragsparteien werden von ihren vertraglichen Verpflichtungen frei. Sie müssen jedoch der jeweils anderen Vertragspartei bereits erbrachte Leistungen erstatten.</p>
  </section>

  <section>
    <h2>§ 10</h2>
    <p class="caption">Tierhaltung</p>
    <p>Tiere, insbesondere Hunde, Katzen und dergleichen dürfen nur bei ausdrücklicher Erlaubnis des Vermieters im Mietvertrag gehalten oder zeitweilig verwahrt werden. Die Erlaubnis gilt nur für den Einzelfall. Sie kann widerrufen werden, wenn Unzuträglichkeiten eintreten. Der Mieter haftet für alle durch die Tierhaltung entstehenden Schäden. Es wird nur nach Absprache ein Hund genehmigt.</p>
  </section>

  <section>
    <h2>§ 11</h2>
    <p class="caption">Hausordnung</p>
    <p>(1) Die Mieter sind generell zu gegenseitiger Rücksichtnahme aufgefordert. Insbesondere sind störende Geräusche, namentlich lautes Türwerfen und solche Tätigkeiten, die die Dorfbewohner durch den entstehenden Lärm belästigen und die häusliche Ruhe beeinträchtigen, zu vermeiden. Musizieren und andere laute Geräusche sind in der Zeit von 00 Uhr - 07 Uhr zu unterlassen. Rundfunk-, Fernseh- und Phonogeräte sind nur auf Zimmerlautstärke einzustellen.</p>
  </section>

  <section>
    <h2>§ 12</h2>
    <p class="caption">Änderungen des Vertrages</p>
    <p>Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Dies gilt auch für die Änderung dieser Schriftformklausel.</p>
  </section>

  <section>
    <h2>§ 13</h2>
    <p class="caption">Salvatorische Klausel</p>
    <p>Sollten einzelne Bestimmungen dieses Vertrages unwirksam oder undurchführbar sein oder nach Vertragsschluss unwirksam oder undurchführbar werden, so wird dadurch die Wirksamkeit des Vertrages im Übrigen nicht berührt. An die Stelle der unwirksamen oder undurchführbaren Bestimmung soll diejenige wirksame und durchführbare Regelung treten, deren Wirkungen der wirtschaftlichen Zielsetzung möglichst nahe kommen, welche die Vertragsparteien mit der unwirksamen bzw. undurchführbaren Bestimmung verfolgt haben.</p>
    <p>(2) Der Mietvertrag über die anliegend beschriebene Ferienwohnung/Ferienhaus ist verbindlich geschlossen, wenn der in der Anlage beigefügte Mietvertrag vom Mieter unterschrieben dem Vermieter zugegangen ist. Die Ferienwohnung/das Ferienhaus wird dem Mieter für die angegebene Vertragsdauer ausschließlich zur Nutzung für Urlaubszwecke vermietet und darf nur mit der im Mietvertrag angegebenen maximalen Personenzahl belegt werden.</p>
    <p>(3) Es findet deutsches Recht Anwendung. Für alle Streitigkeiten aus diesem Vertragsverhältnis ist das Amtsgericht zuständig, in dessen Bezirk der Beklagte seinen allgemeinen Gerichtsstand hat. Für Klagen des Vermieters gegen Kaufleute, juristische Personen des öffentlichen oder privaten Rechts oder Personen, die keinen allgemeinen Gerichtsstand in Deutschland haben oder die nach Abschluss des Vertrages ihren Wohnsitz oder gewöhnlichen Aufenthaltsort ins Ausland verlegt haben oder deren Wohnsitz oder gewöhnlicher Aufenthaltsort zum Zeitpunkt der Klageerhebung nicht bekannt ist, wird der Wohnsitz des Vermieters als ausschließlicher Gerichtsstand vereinbart.</p>
  </section>

  <div class="sign">
    <p>Hoppegarten, ${blank(30)}</p>
    <div class="line">Unterschrift des Vermieters</div>
    <div class="line">Unterschrift des Mieters</div>
  </div>
</body>
</html>`;
}
