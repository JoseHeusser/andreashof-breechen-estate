import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { AdminLangSwitcher } from "@/components/admin/admin-lang-switcher";

// Default domain appended when the user types a bare username (e.g. "andrea")
// instead of a full email. Supabase only supports email-based auth, so we
// translate behind the scenes.
const DEFAULT_DOMAIN = "andreashof-breechen.de";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin · Andreashof" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/admin" });
    });
  }, [nav]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-20 relative">
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <AdminLangSwitcher />
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr(null);
          const email = username.includes("@") ? username : `${username}@${DEFAULT_DOMAIN}`;
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
        <h1 className="font-display text-3xl font-light">{t("admin.login.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("admin.login.subtitle")}</p>

        <div className="mt-8">
          <label htmlFor="username" className="eyebrow">{t("admin.login.username")}</label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="andrea"
            className="mt-2 w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-sage-deep"
          />
        </div>
        <div className="mt-6">
          <label htmlFor="password" className="eyebrow">{t("admin.login.password")}</label>
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
          {busy ? t("admin.saving") : t("admin.login.submit")}
        </button>

        <Link to="/" className="mt-8 block text-center text-xs text-muted-foreground hover:text-sage-deep">
          {t("admin.login.backToSite")}
        </Link>
      </form>
    </div>
  );
}
