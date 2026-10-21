import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { installAdminFetch } from "@/lib/admin/auth-fetch";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { getBookingContract } from "@/lib/admin/server-fns";

export const Route = createFileRoute("/admin/vertrag/$id")({
  head: () => ({ meta: [{ title: "Mietvertrag · Andreashof" }] }),
  component: ContractPage,
});

function ContractPage() {
  const { id } = Route.useParams();
  const [pdf, setPdf] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    (async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!data.session) {
        setError("Nicht angemeldet.");
        return;
      }
      installAdminFetch();
      try {
        const res = await getBookingContract({ data: { id } });
        if (cancelled) return;
        // The server sends the filled PDF as base64; a blob URL lets the
        // browser's own PDF viewer show it and the download keep its name.
        const bytes = Uint8Array.from(atob(res.pdfBase64), (c) => c.charCodeAt(0));
        objectUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
        setPdf({ url: objectUrl, filename: res.filename });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-6 py-4">
        <Link
          to="/admin"
          className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
        >
          ← Admin
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground">
            PDF herunterladen und im Admin per E-Mail an den Gast senden.
          </span>
          {pdf && (
            <a
              href={pdf.url}
              download={pdf.filename}
              className="border border-foreground bg-foreground px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-background"
            >
              PDF herunterladen
            </a>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-6">
        {error && <p className="text-sm text-red-700">{error}</p>}
        {!pdf && !error && <p className="text-sm text-muted-foreground">Vertrag wird erstellt…</p>}
        {pdf && (
          <iframe
            title="Mietvertrag"
            src={pdf.url}
            className="mx-auto min-h-[85vh] w-full max-w-5xl flex-1 border border-border bg-white"
          />
        )}
      </main>
    </div>
  );
}
