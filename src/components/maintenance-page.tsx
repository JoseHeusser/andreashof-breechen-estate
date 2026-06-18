import { useEffect } from "react";
import logo from "@/assets/logo-andreashof.jpeg";
import heroImg from "@/assets/hero-facade.jpeg";

const BYPASS_KEY = "andreashof.preview";
// Hidden access for Andrea on desktop: ↑ ↑ ↓ ↓ ← ← → →
// Impossible to trigger by accident. Mobile uses the ?key=1782 URL
// since touchscreens don't have arrow keys.
const UNLOCK_SEQUENCE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowLeft",
  "ArrowRight", "ArrowRight",
];

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
  // Arrow-key unlock listener — match the sequence anywhere on the page.
  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === UNLOCK_SEQUENCE[pos]) {
        pos++;
        if (pos === UNLOCK_SEQUENCE.length) {
          pos = 0;
          unlock();
        }
      } else {
        // Reset, but credit the keypress if it matches slot 0
        // (so a wrong key followed by the start of a fresh attempt works).
        pos = e.key === UNLOCK_SEQUENCE[0] ? 1 : 0;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-foreground text-white">
      <img
        src={heroImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      {/* Gentle dark gradient + soft vignette — keeps the image visible
          while ensuring legible white text */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.22)_100%)]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center md:px-10">
        <img
          src={logo}
          alt="Andreashof Breechen"
          className="h-16 w-auto mix-blend-screen md:h-20"
        />

        <p
          className="mt-12 text-[11px] uppercase tracking-[0.32em] text-white/80"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
        >
          Breechen · Vorpommern · Est. 1782
        </p>
        <h1
          className="mt-6 max-w-3xl font-display text-4xl font-light leading-[1.1] text-white md:text-6xl"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.55)" }}
        >
          Bald wieder geöffnet.<br />
          <em className="italic text-white/90">Coming soon.</em>
        </h1>
        <p
          className="mt-8 max-w-md text-sm leading-relaxed text-white/85 md:text-base"
          style={{ textShadow: "0 1px 14px rgba(0,0,0,0.45)" }}
        >
          Wir arbeiten an unserer neuen Webseite. Für Anfragen schreiben Sie uns gerne direkt.<br />
          <span className="text-white/65">We're updating our site. Inquiries by email anytime.</span>
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
