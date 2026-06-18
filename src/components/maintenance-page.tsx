import { useRef, useState } from "react";
import logo from "@/assets/logo-andreashof.jpeg";
import heroImg from "@/assets/hero-facade.jpeg";

const BYPASS_KEY = "andreashof.preview";
// Easter egg: 5 clicks on the logo within 3 s unlocks the real site.
// Same effect as visiting any URL with ?key=1782.
const UNLOCK_CLICKS = 5;
const UNLOCK_WINDOW_MS = 3000;

function unlock() {
  try {
    localStorage.setItem(BYPASS_KEY, "1");
  } catch {}
  window.location.reload();
}

/**
 * "Bald wieder geöffnet" / "Coming soon" page shown on every public
 * route while VITE_MAINTENANCE_MODE === 'true'. /admin/* and /api/*
 * always bypass — only the marketing pages are gated.
 *
 * Andrea-friendly bypass:
 *   • Visit any URL with ?key=1782   (handled in __root.tsx)
 *   • Tap the logo 5 times in 3 seconds
 */
export function MaintenancePage() {
  const clicksRef = useRef<number[]>([]);
  const [pop, setPop] = useState(false);

  const handleLogoClick = () => {
    const now = Date.now();
    clicksRef.current = [
      ...clicksRef.current.filter((t) => now - t < UNLOCK_WINDOW_MS),
      now,
    ];
    setPop(true);
    setTimeout(() => setPop(false), 180);
    if (clicksRef.current.length >= UNLOCK_CLICKS) unlock();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linen text-foreground">
      <img
        src={heroImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      {/* Soft cream tint on top — keeps the image visible but warm + bright */}
      <div className="absolute inset-0 bg-gradient-to-b from-linen/40 via-linen/30 to-linen/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(244,239,230,0.55)_100%)]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center md:px-10">
        <button
          type="button"
          onClick={handleLogoClick}
          aria-label="Andreashof Breechen"
          className={`group cursor-pointer transition-transform duration-150 ${
            pop ? "scale-95" : "scale-100"
          }`}
        >
          <img
            src={logo}
            alt="Andreashof Breechen"
            className="h-16 w-auto md:h-20"
          />
        </button>

        <p className="mt-12 text-[11px] uppercase tracking-[0.32em] text-foreground/55">
          Breechen · Vorpommern · Est. 1782
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-4xl font-light leading-[1.1] md:text-6xl">
          Bald wieder geöffnet.<br />
          <em className="italic text-sage-deep">Coming soon.</em>
        </h1>
        <p className="mt-8 max-w-md text-sm leading-relaxed text-foreground/70 md:text-base">
          Wir arbeiten an unserer neuen Webseite. Für Anfragen schreiben Sie uns gerne direkt.<br />
          <span className="text-foreground/55">We're updating our site. Inquiries by email anytime.</span>
        </p>

        <a
          href="mailto:willkommen@andreashof-breechen.de"
          className="mt-12 border border-foreground/80 px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          willkommen@andreashof-breechen.de
        </a>
      </div>
    </div>
  );
}
