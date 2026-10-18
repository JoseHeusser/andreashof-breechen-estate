import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { installAdminFetch } from "@/lib/admin/auth-fetch";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { getBookingContract } from "@/lib/admin/server-fns";

export const Route = createFileRoute("/admin/vertrag/$id")({
  head: () => ({ meta: [{ title: "Mietvertrag · Andreashof" }] }),
  component: ContractPage,
});

function ContractPage() {
  const { id } = Route.useParams();
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!data.session) {
        setError("Nicht angemeldet.");
        return;
      }
      installAdminFetch();
      try {
        const res = await getBookingContract({ data: { id } });
        if (!cancelled) setHtml(res.html);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Printing the iframe (not the page) keeps the admin chrome out of the PDF.
  const print = () => {
    const win = frame.current?.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
  };

  return (
    <div className="min-h-screen bg-linen">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-6 py-4">
        <Link
          to="/admin"
          className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
        >
          ← Admin
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Drucken → „Als PDF sichern“, dann per E-Mail an den Gast senden.
          </span>
          <button
            onClick={print}
            disabled={!html}
            className="border border-foreground bg-foreground px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-background disabled:opacity-50"
          >
            Drucken / PDF
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {error && <p className="text-sm text-red-700">{error}</p>}
        {!html && !error && <p className="text-sm text-muted-foreground">Vertrag wird geladen…</p>}
        {html && (
          <iframe
            ref={frame}
            title="Mietvertrag"
            srcDoc={html}
            className="mx-auto h-[1500px] w-full max-w-4xl border border-border bg-white"
          />
        )}
      </main>
    </div>
  );
}
