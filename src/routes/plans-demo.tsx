import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { PlanClickDemo } from "@/components/plan-click-demo";

export const Route = createFileRoute("/plans-demo")({
  head: () => ({
    meta: [{ title: "Plans Demo · Andreashof Breechen" }],
    links: [{ rel: "canonical", href: "/plans-demo" }],
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
