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
    <div className="relative flex min-h-screen items-start justify-center bg-background px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-12 md:items-center md:py-20">
      <div className="absolute top-4 right-3 sm:top-5 sm:right-5 md:top-6 md:right-6">
        <AdminLangSwitcher className="text-[11px] tracking-[0.2em] [&_button>span]:min-h-11 sm:text-[11px]" />
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
        className="mt-12 w-full max-w-sm border border-border bg-card p-5 sm:mt-14 sm:p-8 md:mt-0 md:p-10"
      >
        <h1 className="font-display text-[2rem] leading-none font-light sm:text-3xl">{t("admin.login.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("admin.login.subtitle")}</p>

        <div className="mt-6 sm:mt-8">
          <label htmlFor="username" className="eyebrow">{t("admin.login.username")}</label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="andrea"
            className="mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-base outline-none focus:border-sage-deep focus-visible:ring-2 focus-visible:ring-sage-deep/20"
          />
        </div>
        <div className="mt-5 sm:mt-6">
          <label htmlFor="password" className="eyebrow">{t("admin.login.password")}</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-base outline-none focus:border-sage-deep focus-visible:ring-2 focus-visible:ring-sage-deep/20"
          />
        </div>

        {err && <p className="mt-6 text-sm text-red-700">{err}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-8 min-h-11 w-full border border-foreground bg-foreground px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-background hover:border-sage-deep hover:bg-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-deep/40 disabled:opacity-50 sm:mt-10"
        >
          {busy ? t("admin.saving") : t("admin.login.submit")}
        </button>

        <Link to="/" className="mt-6 block min-h-11 py-3 text-center text-sm text-muted-foreground hover:text-sage-deep sm:mt-8 sm:text-xs">
          {t("admin.login.backToSite")}
        </Link>
      </form>
    </div>
  );
}
