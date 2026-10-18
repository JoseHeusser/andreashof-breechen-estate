// Plain TanStack Start config. This used to go through
// @lovable.dev/vite-tanstack-config, but that wrapper lagged behind the
// framework and pinned a @tanstack/start-server-core version Vercel blocks
// (CVE-2026-102989). The wrapper only stacked these same plugins, so the
// config below replaces it one-for-one — minus its dev-only extras
// (component tagger, HMR gate, sandbox bridge), which we never used.
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  // VITE_* vars are inlined the same way the wrapper did it.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    define[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    define,
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        server: { entry: "server" },
        // Keep server-only modules out of the client bundle.
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      viteReact(),
    ],
  };
});
