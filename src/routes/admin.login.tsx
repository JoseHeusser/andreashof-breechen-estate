import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin · Andreashof" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // If already logged in, go straight to dashboard.
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/admin" });
    });
  }, [nav]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr(null);
          const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
          setBusy(false);
          if (error) {
            setErr(error.message);
            return;
          }
          nav({ to: "/admin" });
        }}
        className="w-full max-w-sm border border-border bg-card p-10"
      >
        <h1 className="font-display text-3xl font-light">Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">Andreashof Breechen</p>

        <div className="mt-8">
          <label htmlFor="email" className="eyebrow">E-Mail</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-sage-deep"
          />
        </div>
        <div className="mt-6">
          <label htmlFor="password" className="eyebrow">Passwort</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-sage-deep"
          />
        </div>

        {err && <p className="mt-6 text-sm text-red-700">{err}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-10 w-full border border-foreground bg-foreground py-3 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-sage-deep hover:border-sage-deep disabled:opacity-50"
        >
          {busy ? "..." : "Anmelden"}
        </button>

        <Link to="/" className="mt-8 block text-center text-xs text-muted-foreground hover:text-sage-deep">
          ← Zur Webseite
        </Link>
      </form>
    </div>
  );
}
