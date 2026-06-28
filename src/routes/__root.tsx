import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { useEffect, useState } from "react";
import appCss from "../styles.css?url";
import { LangProvider } from "@/i18n/lang-provider";
import { useSmoothAnchorScroll } from "@/hooks/use-smooth-anchor-scroll";
import { useRevealPage } from "@/hooks/use-reveal-page";
import { useRouterState } from "@tanstack/react-router";
import { FloatingLangSwitcher } from "@/components/floating-lang-switcher";
import { MaintenancePage } from "@/components/maintenance-page";
import { APPLE_TOUCH_ICON, FAVICON_ICO, FAVICON_SVG } from "@/lib/logos";

// Public site is hidden behind a "coming soon" page when this env var is true.
// /admin/* and /api/* always bypass so Andrea can keep working and the iCal
// feed for Airbnb stays live. Flip to "false" (or remove) in Vercel to release.
const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === "true";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: FAVICON_SVG, type: "image/svg+xml" },
      { rel: "icon", href: FAVICON_ICO, sizes: "any" },
      { rel: "apple-touch-icon", href: APPLE_TOUCH_ICON },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// Bulletproof reveal fallback — runs before React hydrates so that
// .reveal sections always become visible, even if the React-side
// IntersectionObserver fails (slow hydration on Safari, JS error, etc.).
const REVEAL_FALLBACK_SCRIPT = `(function(){
  function show(){
    var els=document.querySelectorAll('.reveal:not(.is-visible)');
    for(var i=0;i<els.length;i++)els[i].classList.add('is-visible');
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){setTimeout(show,900);});
  } else {
    setTimeout(show,900);
  }
})();`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <noscript>
          {/* If JS is disabled or broken, never hide content. */}
          <style>{`.reveal{opacity:1!important;transform:none!important;}`}</style>
        </noscript>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_FALLBACK_SCRIPT }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// Preview key — when the URL has ?key=PREVIEW_KEY or the easter-egg
// (5 logo clicks on the maintenance page) was triggered, a flag in
// localStorage lets the visitor through the gate on every subsequent
// page load. The flag is per-device.
const PREVIEW_KEY = "1782";
const PREVIEW_STORAGE = "andreashof.preview";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const bypass = pathname.startsWith("/admin") || pathname.startsWith("/api");

  // Server-side check: if the URL already carries ?key=PREVIEW_KEY, treat
  // the visit as authorised before any JS hydrates. Safari ITP can
  // randomly drop localStorage; this guarantees a working bypass.
  const hasPreviewKey =
    typeof searchStr === "string" && searchStr.includes(`key=${PREVIEW_KEY}`);

  // SSR sees no localStorage — render the maintenance page first to match
  // the server, then flip after mount if the visitor is whitelisted.
  const [previewUnlocked, setPreviewUnlocked] = useState(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("key") === PREVIEW_KEY) {
        localStorage.setItem(PREVIEW_STORAGE, "1");
        // Strip the param so the URL stays clean and shareable.
        params.delete("key");
        const qs = params.toString();
        const next = window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
        window.history.replaceState({}, "", next);
      }
      if (localStorage.getItem(PREVIEW_STORAGE) === "1") setPreviewUnlocked(true);
    } catch {
      // localStorage unavailable (Safari private mode etc.) — stay gated.
    }
  }, []);

  const showMaintenance =
    MAINTENANCE_MODE && !bypass && !previewUnlocked && !hasPreviewKey;

  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <PageVisitTracker />
        {showMaintenance ? (
          <MaintenancePage />
        ) : (
          <>
            <GlobalScrollEffects />
            <FloatingLangSwitcher />
            <Outlet />
          </>
        )}
      </LangProvider>
    </QueryClientProvider>
  );
}

const ANALYTICS_SESSION_STORAGE = "andreashof.analyticsSession";

function PageVisitTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    if (navigator.doNotTrack === "1") return;

    let sessionId = "";
    try {
      sessionId = localStorage.getItem(ANALYTICS_SESSION_STORAGE) ?? "";
      if (!sessionId) {
        sessionId =
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(ANALYTICS_SESSION_STORAGE, sessionId);
      }
    } catch {
      // Storage can be unavailable in private browsing. Counting the visit is
      // still useful; it simply won't contribute to the unique-session metric.
    }

    const payload = JSON.stringify({
      path: window.location.pathname,
      referrer: document.referrer,
      language: navigator.language,
      sessionId,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/track-visit", blob);
      return;
    }

    fetch("/api/track-visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}

function GlobalScrollEffects() {
  // Render nothing during SSR — everything in this subtree is browser-only
  // (event listeners, IntersectionObserver). Keeping it out of the SSR tree
  // means it can't contribute to any hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <ClientScrollEffects />;
}

function ClientScrollEffects() {
  useSmoothAnchorScroll();
  // Re-run reveal observers when the route changes so new sections fade in too.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <RevealScanner key={pathname} />;
}

function RevealScanner() {
  useRevealPage();
  return null;
}
