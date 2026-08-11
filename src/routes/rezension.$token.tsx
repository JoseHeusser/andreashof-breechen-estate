import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { checkReviewToken, createReview } from "@/lib/admin/server-fns";
import type { ReviewLanguage } from "@/lib/supabase/types";

// Public review-submission page. URL: /rezension/<token>
// The token is checked server-side in beforeLoad and again on submit.
// noindex meta so the page never lands in search.

export const Route = createFileRoute("/rezension/$token")({
  beforeLoad: async ({ params }) => {
    const { valid } = await checkReviewToken({ data: { token: params.token } });
    if (!valid) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Bewertung hinterlassen · Andreashof Breechen" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LeaveReviewPage,
});

function LeaveReviewPage() {
  const { token } = Route.useParams();
  const { i18n } = useTranslation();
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lang = (i18n.language?.slice(0, 2) as ReviewLanguage) || "de";
  const copy = COPY[lang] ?? COPY.de;
  const canSubmit = name.trim().length > 0 && quote.trim().length >= 20 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await createReview({
        data: {
          token,
          guestName: name.trim(),
          quote: quote.trim(),
          rating,
          language: lang,
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>

      <section className="px-5 pt-16 pb-24 md:px-10 md:pt-24 md:pb-32">
        <div className="mx-auto max-w-2xl">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="mt-6 font-display text-[2.2rem] font-light leading-[1.1] md:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
            {copy.body}
          </p>

          {submitted ? (
            <div className="mt-12 border border-sage bg-sage/10 p-8">
              <h2 className="font-display text-2xl font-light">{copy.thanksTitle}</h2>
              <p className="mt-4 text-base leading-relaxed text-foreground/85">
                {copy.thanksBody}
              </p>
              <Link
                to="/"
                className="mt-8 inline-block border border-foreground bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-background transition-colors hover:bg-sage-deep hover:border-sage-deep"
              >
                {copy.thanksCta}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-12 space-y-6">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {copy.labelName}
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={copy.placeholderName}
                  className="mt-2 w-full border border-border bg-background px-4 py-3 text-base outline-none transition-colors focus:border-sage-deep"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {copy.labelQuote}
                </label>
                <textarea
                  required
                  minLength={20}
                  maxLength={1200}
                  rows={7}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder={copy.placeholderQuote}
                  className="mt-2 w-full resize-y border border-border bg-background px-4 py-3 text-base leading-relaxed outline-none transition-colors focus:border-sage-deep"
                  disabled={submitting}
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground/70">
                  {quote.length} / 1200
                </p>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {copy.labelRating}
                </label>
                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      aria-label={`${n} ★`}
                      className={`h-11 w-11 border transition-all ${
                        rating >= n
                          ? "border-sage-deep bg-sage-deep text-background"
                          : "border-border bg-background text-muted-foreground hover:border-sage-deep"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {error ? (
                <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="min-h-11 border border-foreground bg-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.22em] text-background transition-colors hover:bg-sage-deep hover:border-sage-deep disabled:cursor-not-allowed disabled:opacity-40 md:tracking-[0.28em]"
              >
                {submitting ? copy.submitLoading : copy.submit}
              </button>

              <p className="text-[11px] text-muted-foreground/70">{copy.moderationNote}</p>
            </form>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

const COPY = {
  de: {
    eyebrow: "Ihre Bewertung",
    title: "Erzählen Sie, wie war Ihr Aufenthalt.",
    body: "Wir freuen uns über jede Rückmeldung. Ihre Zeilen erscheinen — nach kurzer Sichtung durch uns — im Bewertungsteil unserer Startseite.",
    labelName: "Ihr Name",
    placeholderName: "Vorname und (optional) Nachname",
    labelQuote: "Ihre Bewertung",
    placeholderQuote: "Was hat Sie überrascht? Was werden Sie in Erinnerung behalten?",
    labelRating: "Bewertung",
    submit: "Bewertung absenden",
    submitLoading: "wird gesendet…",
    moderationNote:
      "Wir lesen jede Bewertung, bevor sie veröffentlicht wird. Sie muss keine perfekten Sätze sein — was ehrlich ist, hilft am meisten.",
    thanksTitle: "Vielen Dank.",
    thanksBody:
      "Wir haben Ihre Bewertung erhalten und freuen uns sehr. Sobald wir sie kurz durchgesehen haben, erscheint sie auf der Startseite.",
    thanksCta: "Zurück zur Startseite",
    errorGeneric: "Etwas ist schiefgelaufen — bitte versuchen Sie es noch einmal.",
  },
  en: {
    eyebrow: "Your review",
    title: "Tell us how it was.",
    body: "We love every reply. After a quick look-through, your words appear in the reviews section on our home page.",
    labelName: "Your name",
    placeholderName: "First name (and last name if you like)",
    labelQuote: "Your review",
    placeholderQuote: "What surprised you? What will you remember?",
    labelRating: "Rating",
    submit: "Send review",
    submitLoading: "sending…",
    moderationNote:
      "We read every review before it goes live. It doesn't need to be polished — honest reads best.",
    thanksTitle: "Thank you.",
    thanksBody:
      "Your review is with us. As soon as we've had a quick look, it will appear on the home page.",
    thanksCta: "Back to the home page",
    errorGeneric: "Something went wrong — please try again.",
  },
  es: {
    eyebrow: "Tu reseña",
    title: "Cuéntanos cómo fue.",
    body: "Nos encanta leer cada respuesta. Después de una breve revisión, tus palabras aparecen en la sección de reseñas de nuestra portada.",
    labelName: "Tu nombre",
    placeholderName: "Nombre (y apellido si quieres)",
    labelQuote: "Tu reseña",
    placeholderQuote: "¿Qué te sorprendió? ¿Qué vas a recordar?",
    labelRating: "Puntuación",
    submit: "Enviar reseña",
    submitLoading: "enviando…",
    moderationNote:
      "Leemos cada reseña antes de publicarla. No hace falta redacción perfecta — lo honesto se lee mejor.",
    thanksTitle: "Gracias.",
    thanksBody:
      "Tu reseña llegó. En cuanto le echemos un vistazo, aparecerá en la portada.",
    thanksCta: "Volver al inicio",
    errorGeneric: "Algo salió mal — inténtalo de nuevo.",
  },
} as const;
