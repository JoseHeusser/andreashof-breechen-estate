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
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bypass = pathname.startsWith("/admin") || pathname.startsWith("/api");
  const showMaintenance = MAINTENANCE_MODE && !bypass;

  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
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
