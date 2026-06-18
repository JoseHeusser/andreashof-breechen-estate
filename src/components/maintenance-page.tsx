import logo from "@/assets/logo-andreashof.jpeg";
import heroImg from "@/assets/hero-facade.jpeg";

/**
 * "Under construction" page shown on every public route while
 * VITE_MAINTENANCE_MODE === 'true'. /admin/* bypasses this so Andrea
 * can keep working. The page is bilingual (DE + EN) and intentionally
 * has no CTAs or nav — only a discreet contact line.
 */
export function MaintenancePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-foreground text-white">
      <img
        src={heroImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center md:px-10">
        <img
          src={logo}
          alt="Andreashof Breechen"
          className="h-16 w-auto mix-blend-screen md:h-20"
        />

        <p className="mt-12 text-[11px] uppercase tracking-[0.32em] text-white/70">
          Breechen · Vorpommern · Est. 1782
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-4xl font-light leading-[1.1] md:text-6xl">
          Bald wieder geöffnet.<br />
          <em className="italic text-white/85">Coming soon.</em>
        </h1>
        <p className="mt-8 max-w-md text-sm leading-relaxed text-white/75 md:text-base">
          Wir arbeiten an unserer neuen Webseite. Für Anfragen schreiben Sie uns gerne direkt.<br />
          <span className="text-white/55">We're updating our site. Inquiries by email anytime.</span>
        </p>

        <a
          href="mailto:willkommen@andreashof-breechen.de"
          className="mt-12 border border-white/80 px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-white transition-colors hover:bg-white hover:text-foreground"
        >
          willkommen@andreashof-breechen.de
        </a>
      </div>
    </div>
  );
}
