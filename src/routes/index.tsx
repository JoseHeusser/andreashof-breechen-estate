import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, lazy, Suspense } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import heroImg from "@/assets/hero-facade.jpeg";
import salonImg from "@/assets/interior-salon.jpg";
import diningImg from "@/assets/dining-room.jpg";
import bedroomImg from "@/assets/bedroom.jpg";
import gardenImg from "@/assets/garden.jpg";
import nookImg from "@/assets/nook.jpg";
import kitchenImg from "@/assets/kitchen.jpg";

const LocationMap = lazy(() =>
  import("@/components/location-map").then((m) => ({ default: m.LocationMap })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Andreashof Breechen — Historisches Gutshaus in Vorpommern" },
      {
        name: "description",
        content:
          "Gustavianisches Gutshaus aus dem 18. Jahrhundert in Gützkow, Vorpommern. Komplett mietbar für bis zu 21 Gäste — Familien, Hochzeiten, Retreats.",
      },
      { property: "og:title", content: "Andreashof Breechen — Historisches Gutshaus" },
      {
        property: "og:description",
        content:
          "Ein stilles, lichtdurchflutetes Gutshaus im gustavianischen Stil. Für bis zu 21 Gäste.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroImg },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const uses = [
  {
    title: "Familienfeste",
    body: "Großzügige gemeinsame Räume und zehn Schlafzimmer — Raum für drei Generationen unter einem Dach.",
  },
  {
    title: "Hochzeiten",
    body: "Symmetrische Fassade, ein Lindenallee-Garten und ein langer Tisch für 21 Gäste. Ein Tag, der bleibt.",
  },
  {
    title: "Retreats & Workshops",
    body: "Stille, weite Felder, hohe Räume. Ein Ort für Teams, Schreibklausuren und stille Tage.",
  },
];

const rooms = [
  { n: "I", name: "Lindenzimmer", bed: "Doppelbett", view: "Allee" },
  { n: "II", name: "Gartensuite", bed: "Doppelbett", view: "Südgarten" },
  { n: "III", name: "Giebelzimmer", bed: "Doppelbett", view: "Hof" },
  { n: "IV", name: "Salonzimmer", bed: "Doppelbett", view: "Park" },
  { n: "V", name: "Kammer Hesse", bed: "Doppelbett", view: "Felder" },
  { n: "VI", name: "Kammer Storch", bed: "2× Einzel", view: "Hof" },
  { n: "VII", name: "Mansarde Nord", bed: "2× Einzel", view: "Dachfenster" },
  { n: "VIII", name: "Mansarde Süd", bed: "Doppelbett", view: "Garten" },
  { n: "IX", name: "Bibliothekszimmer", bed: "Doppelbett", view: "Bibliothek" },
  { n: "X", name: "Gesindekammer", bed: "Einzel + Sofa", view: "Innenhof" },
];

const amenities = [
  "Voll ausgestattete Landhausküche",
  "Esstisch für 21 Personen",
  "Salon mit offenem Kamin",
  "Bibliothek mit Leseplätzen",
  "Kostenfreies WLAN im ganzen Haus",
  "Bettwäsche & Handtücher inklusive",
  "Kostenfreie Parkplätze auf dem Hof",
  "Großer Garten mit Lindenallee",
  "Lagerfeuerstelle & Terrasse",
  "Wickeltisch & Hochstühle auf Anfrage",
];

const nearby = [
  { place: "Ostsee", time: "≈ 30 Min" },
  { place: "Greifswald Altstadt", time: "≈ 20 Min" },
  { place: "Insel Usedom", time: "≈ 45 Min" },
  { place: "Flughafen Heringsdorf", time: "≈ 50 Min" },
  { place: "Berlin", time: "≈ 2 h 30 Min" },
];

const reviews = [
  {
    q: "Wir waren 19 Personen über vier Generationen — niemand musste sich einengen. Das Haus atmet Ruhe.",
    a: "Familie Möller, Hamburg",
  },
  {
    q: "Unsere Hochzeit im Garten unter den Linden. Das Licht im Salon am Abend war unbeschreiblich.",
    a: "Lea & Jonas",
  },
  {
    q: "Drei Tage Strategie-Retreat. Stille, weite Felder, hervorragende Küche. Wir kommen wieder.",
    a: "Henning K., Berlin",
  },
];

const faqs = [
  {
    q: "Kann man Teile des Hauses mieten oder nur das ganze Haus?",
    a: "Der Andreashof wird ausschließlich als Ganzes vermietet, um die besondere Atmosphäre für Ihre Gruppe zu wahren.",
  },
  {
    q: "Sind Hochzeiten und Feiern erlaubt?",
    a: "Ja. Wir empfangen regelmäßig Hochzeiten, Familienfeste und private Feiern. Gerne empfehlen wir Caterer und lokale Dienstleister.",
  },
  {
    q: "Gibt es Parkplätze?",
    a: "Auf dem Innenhof stehen kostenfreie Parkplätze für bis zu zwölf Fahrzeuge zur Verfügung.",
  },
  {
    q: "Sind Haustiere erlaubt?",
    a: "Gut erzogene Hunde sind nach Absprache willkommen. Bitte geben Sie uns bei der Anfrage Bescheid.",
  },
  {
    q: "Wie ist die Stornierungsrichtlinie?",
    a: "Kostenfreie Stornierung bis 60 Tage vor Anreise. Details finden Sie in unseren AGB.",
  },
  {
    q: "Wie läuft der Check-in?",
    a: "Persönliche Begrüßung am Anreisetag ab 16:00 Uhr. Schlüsselübergabe und Hausführung inklusive.",
  },
];

function Home() {
  const [open, setOpen] = useState<number | null>(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div id="top" className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Fassade des Andreashof Breechen mit Fachwerkgiebel"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/60" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-end px-6 pb-24 text-center md:px-10 md:pb-32">
          <span className="eyebrow text-foreground/80">
            Gützkow · Mecklenburg-Vorpommern · Est. 1782
          </span>
          <h1 className="mt-6 font-display text-5xl font-light leading-[1.05] text-foreground md:text-7xl lg:text-[5.5rem]">
            Ein Gutshaus,<br />
            <em className="italic text-sage-deep">stille Tage.</em>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-foreground/85 md:text-lg">
            Historisches gustavianisches Gutshaus aus dem 18. Jahrhundert.
            Komplett mietbar für bis zu 21 Gäste.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#anfrage"
              className="border border-foreground bg-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-sage-deep hover:border-sage-deep"
            >
              Anfrage senden
            </a>
            <a
              href="#haus"
              className="border border-foreground/70 px-8 py-3.5 text-[11px] uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-foreground/5"
            >
              Das Haus entdecken
            </a>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section id="haus" className="px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <span className="eyebrow">Willkommen</span>
            <span className="rule ml-4 align-middle" />
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-3xl font-light leading-[1.15] md:text-5xl">
              Ein Haus, das seit
              <em className="italic text-sage-deep"> zwei Jahrhunderten </em>
              empfängt.
            </h2>
            <div className="mt-10 grid gap-8 text-base leading-relaxed text-muted-foreground md:grid-cols-2 md:text-[1.05rem]">
              <p>
                Der Andreashof wurde 1782 als Gutshaus eines pommerschen
                Landadels errichtet. Die symmetrische Fassade, der hohe
                Fachwerkgiebel und die schlichten Proportionen erzählen vom
                gustavianischen Geschmack jener Zeit — einer skandinavischen
                Eleganz, die bis heute trägt.
              </p>
              <p>
                Hinter den hohen Fenstern: helle Räume, weiß lasierte Dielen,
                Leinen und Stein. Genug Platz für 21 Gäste, und doch eine
                Stille, die nicht endet, wenn der letzte Wagen ankommt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* USES */}
      <section className="px-6 pb-28 md:px-10 md:pb-40">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {uses.map((u) => (
              <article
                key={u.title}
                className="border border-border bg-card p-10 transition-colors hover:border-sage"
              >
                <h3 className="font-display text-2xl font-light md:text-3xl">
                  {u.title}
                </h3>
                <div className="mt-5 h-px w-10 bg-sage" />
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  {u.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="galerie" className="bg-linen px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Galerie</span>
              <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">
                Licht, Linie, Leinen.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Eindrücke aus Salon, Esszimmer, Kammern und Garten —
              fotografiert im weichen Licht des Vorpommerschen Sommers.
            </p>
          </div>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 md:col-span-8">
              <img src={salonImg} alt="Salon im gustavianischen Stil" loading="lazy" className="h-[320px] w-full object-cover md:h-[520px]" />
            </div>
            <div className="col-span-6 md:col-span-4">
              <img src={bedroomImg} alt="Schlafzimmer mit Himmelbett" loading="lazy" className="h-[320px] w-full object-cover md:h-[520px]" />
            </div>
            <div className="col-span-6 md:col-span-4">
              <img src={nookImg} alt="Leseplatz am Fenster" loading="lazy" className="h-[260px] w-full object-cover md:h-[400px]" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <img src={diningImg} alt="Langer Esstisch für 21 Personen" loading="lazy" className="h-[260px] w-full object-cover md:h-[400px]" />
            </div>
            <div className="col-span-6 md:col-span-4">
              <img src={kitchenImg} alt="Landhausküche" loading="lazy" className="h-[260px] w-full object-cover md:h-[400px]" />
            </div>
            <div className="col-span-12">
              <img src={gardenImg} alt="Lindenallee im Garten" loading="lazy" className="h-[320px] w-full object-cover md:h-[480px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ROOMS */}
      <section id="zimmer" className="px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 grid gap-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <span className="eyebrow">Die Zimmer</span>
              <span className="rule ml-4 align-middle" />
            </div>
            <div className="md:col-span-8">
              <h2 className="font-display text-4xl font-light leading-[1.1] md:text-5xl">
                Zehn Kammern für
                <em className="italic text-sage-deep"> einundzwanzig </em>
                Gäste.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                Jedes Zimmer trägt einen Namen, jedes hat seinen Blick.
                Hohe Decken, weiß gestrichene Dielen, Leinenvorhänge.
              </p>
            </div>
          </div>

          <div className="border-t border-border">
            {rooms.map((r) => (
              <div
                key={r.n}
                className="group grid grid-cols-12 items-baseline gap-4 border-b border-border py-6 transition-colors hover:bg-linen/60"
              >
                <div className="col-span-2 font-display text-2xl italic text-sage-deep md:col-span-1 md:text-3xl">
                  {r.n}
                </div>
                <div className="col-span-10 md:col-span-5">
                  <h3 className="font-display text-xl font-light md:text-2xl">{r.name}</h3>
                </div>
                <div className="col-span-6 mt-2 text-sm text-muted-foreground md:col-span-3 md:mt-0">
                  {r.bed}
                </div>
                <div className="col-span-6 mt-2 text-sm text-muted-foreground md:col-span-3 md:mt-0 md:text-right">
                  Blick: {r.view}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AMENITIES */}
      <section className="bg-linen px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <span className="eyebrow">Ausstattung</span>
            <h2 className="mt-4 font-display text-4xl font-light leading-[1.1] md:text-5xl">
              Alles, was bleibt, ist da.
            </h2>
          </div>
          <div className="md:col-span-8">
            <ul className="grid gap-x-10 gap-y-5 md:grid-cols-2">
              {amenities.map((a) => (
                <li key={a} className="flex items-baseline gap-4 border-b border-border/60 pb-4">
                  <span className="h-px w-4 shrink-0 translate-y-2 bg-sage" />
                  <span className="text-[0.95rem] text-foreground/85">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section id="lage" className="px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <span className="eyebrow">Lage</span>
              <span className="rule ml-4 align-middle" />
            </div>
            <div className="md:col-span-8">
              <h2 className="font-display text-4xl font-light leading-[1.1] md:text-5xl">
                Zwischen Greifswald
                <em className="italic text-sage-deep"> und der Ostsee.</em>
              </h2>
            </div>
          </div>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              {mounted ? (
                <Suspense fallback={<div className="h-[520px] w-full bg-linen" />}>
                  <LocationMap />
                </Suspense>
              ) : (
                <div className="h-[520px] w-full bg-linen" />
              )}
            </div>
            <div className="md:col-span-5">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                Breechen 1 · 17506 Gützkow
              </p>
              <ul className="mt-8 border-t border-border">
                {nearby.map((p) => (
                  <li key={p.place} className="flex items-baseline justify-between border-b border-border py-4">
                    <span className="font-display text-xl">{p.place}</span>
                    <span className="text-sm text-muted-foreground">{p.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-linen px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow">Stimmen</span>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-light leading-[1.1] md:text-5xl">
            Was unsere Gäste zurücklassen.
          </h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {reviews.map((r, i) => (
              <figure key={i} className="border-t border-sage pt-8">
                <blockquote className="font-display text-xl font-light italic leading-snug text-foreground md:text-2xl">
                  „{r.q}"
                </blockquote>
                <figcaption className="mt-6 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  — {r.a}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="anfrage" className="px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="eyebrow">Anfrage</span>
            <h2 className="mt-4 font-display text-4xl font-light leading-[1.1] md:text-5xl">
              Schreiben Sie uns —
              <em className="italic text-sage-deep"> wir antworten persönlich.</em>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Erzählen Sie uns von Ihrem Anlass, Ihren Wünschen und der
              gewünschten Zeit. Wir melden uns innerhalb von 24 Stunden.
            </p>
            <div className="mt-10 space-y-2 text-sm">
              <p className="text-muted-foreground">Oder direkt:</p>
              <p><a href="mailto:willkommen@andreashof-breechen.de" className="hover:text-sage-deep">willkommen@andreashof-breechen.de</a></p>
              <p><a href="https://wa.me/4915112345678" className="hover:text-sage-deep">WhatsApp · +49 151 1234 5678</a></p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Vielen Dank — wir melden uns in Kürze.");
            }}
            className="md:col-span-7"
          >
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              <Field label="Name" name="name" required />
              <Field label="E-Mail" name="email" type="email" required />
              <Field label="Anreise" name="arrival" type="date" />
              <Field label="Abreise" name="departure" type="date" />
              <Field label="Gäste" name="guests" type="number" />
              <Field label="Anlass" name="occasion" placeholder="Hochzeit, Familienfeier, Retreat …" />
              <div className="md:col-span-2">
                <label className="eyebrow">Nachricht</label>
                <textarea
                  name="message"
                  rows={5}
                  className="mt-3 w-full border-0 border-b border-border bg-transparent py-3 font-sans text-base text-foreground outline-none transition-colors focus:border-sage-deep"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-12 w-full border border-foreground bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-background transition-colors hover:bg-sage-deep hover:border-sage-deep md:w-auto"
            >
              Anfrage senden
            </button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-linen px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <span className="eyebrow">Häufige Fragen</span>
            <h2 className="mt-4 font-display text-4xl font-light leading-[1.1] md:text-5xl">
              Bevor Sie schreiben.
            </h2>
          </div>
          <div className="md:col-span-8">
            <div className="border-t border-border">
              {faqs.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div key={i} className="border-b border-border">
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-baseline justify-between gap-6 py-6 text-left transition-colors hover:text-sage-deep"
                    >
                      <span className="font-display text-xl font-light md:text-2xl">
                        {f.q}
                      </span>
                      <span className="font-display text-2xl italic text-sage-deep">
                        {isOpen ? "—" : "·"}
                      </span>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: isOpen ? 240 : 0 }}
                    >
                      <p className="pb-6 pr-12 text-[0.95rem] leading-relaxed text-muted-foreground">
                        {f.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="eyebrow">
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-3 w-full border-0 border-b border-border bg-transparent py-3 font-sans text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-sage-deep"
      />
    </div>
  );
}
