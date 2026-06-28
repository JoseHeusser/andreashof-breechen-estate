import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

// Quick review page for unused photos sitting in public/galerie/available/.
// Lives under /admin so it's gated by the same login.
export const Route = createFileRoute("/admin/available")({
  head: () => ({
    meta: [
      { title: "Available Photos · Andreashof Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AvailablePage,
});

const IMAGES = [
  "IMG_0164.jpg",
  "IMG_0327.jpg",
  "IMG_3868.jpg",
  "IMG_3925.jpg",
  "IMG_5427.jpg",
  "IMG_8398.jpg",
  "IMG_8418.jpg",
  "IMG_8938.jpg",
  "IMG_9645.jpg",
  "IMG_9729.jpg",
];

const VIDEOS = ["IMG_8845.MOV", "IMG_8881.MOV", "IMG_9682.MOV"];

function AvailablePage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!data.session) {
        nav({ to: "/admin/login" });
        return;
      }
      setReady(true);
    })();
  }, [nav]);

  if (!ready) return <div className="p-10 text-muted-foreground">…</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/admin" className="font-display text-xl">
            ← Andreashof Admin
          </Link>
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {IMAGES.length + VIDEOS.length} verfügbare Medien
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-3xl font-light">Photos zum Reviewen</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Nicht im Online-Auftritt verwendete Fotos. Klick auf ein Bild öffnet die Vollauflösung in
          einem neuen Tab.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {IMAGES.map((name) => {
            const href = `/galerie/available/${name}`;
            return (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden border border-border bg-card"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={href}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-mono text-xs text-muted-foreground">{name}</span>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-sage-deep opacity-0 transition-opacity group-hover:opacity-100">
                    Öffnen
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {VIDEOS.length > 0 ? (
          <>
            <h2 className="mt-16 font-display text-2xl font-light">Videos</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {VIDEOS.map((name) => (
                <div key={name} className="border border-border bg-card">
                  <video
                    controls
                    preload="metadata"
                    className="aspect-video w-full bg-black object-contain"
                    src={`/galerie/available/${name}`}
                  />
                  <div className="px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground">{name}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
