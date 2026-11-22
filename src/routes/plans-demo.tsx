import { seo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { PlanClickDemo } from "@/components/plan-click-demo";

export const Route = createFileRoute("/plans-demo")({
  head: () =>
    seo({
      title: "Plans Demo · Andreashof Breechen",
      path: "/plans-demo",
      robots: "noindex,nofollow",
    }),
  component: PlansDemoPage,
});

function PlansDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground">
        <SiteHeader tone="light" />
        <div className="h-[88px] md:h-[104px]" />
      </div>
      <PlanClickDemo />
      <SiteFooter />
    </div>
  );
}
