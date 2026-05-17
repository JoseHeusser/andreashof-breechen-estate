// Repackages the vite build output into Vercel's Build Output API (v3) layout.
// Run after `vite build`. Produces .vercel/output/ which Vercel deploys as-is,
// skipping its own framework detection.
//
//   .vercel/output/
//     config.json            (routing: static first, fallback to /index function)
//     static/                (= dist/client/)
//     functions/index.func/  (Node.js function; full server bundle inlined via esbuild)
//
// We bundle dist/server/server.js (and its chunks) into a single ESM file so the
// function folder is self-contained — Vercel's Build Output API does not auto-
// resolve node_modules at runtime.
import { mkdir, rm, cp, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import * as esbuild from "esbuild";

const root = process.cwd();
const dist = join(root, "dist");
const distClient = join(dist, "client");
const distServer = join(dist, "server");
const outDir = join(root, ".vercel", "output");
const outStatic = join(outDir, "static");
const outFn = join(outDir, "functions", "index.func");

if (!existsSync(distClient) || !existsSync(distServer)) {
  console.error("[build-vercel] dist/client or dist/server missing — run `vite build` first.");
  process.exit(1);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outStatic, { recursive: true });
await mkdir(outFn, { recursive: true });

// 1. Static assets
await cp(distClient, outStatic, { recursive: true });

// 2. Bundle the server entry — inline every dependency so the function is
//    self-contained. Only Node built-ins stay external.
const bundleResult = await esbuild.build({
  entryPoints: [join(distServer, "server.js")],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  outfile: join(outFn, "bundle.mjs"),
  external: [
    "node:*",
    "async_hooks",
    "buffer",
    "crypto",
    "events",
    "fs",
    "http",
    "https",
    "net",
    "os",
    "path",
    "stream",
    "tls",
    "url",
    "util",
    "zlib",
  ],
  conditions: ["import", "node", "default"],
  mainFields: ["module", "main"],
  // Force production build of React (avoids pulling the dev/devtools
  // bundle that does `require("util")` at module init).
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  // ESM output needs `require` for CJS deps that do dynamic require()s.
  banner: {
    js: `import { createRequire as __cr } from "node:module"; const require = __cr(import.meta.url);`,
  },
  logLevel: "warning",
  metafile: true,
  minify: true,
});

const bundleSizeKb = Object.values(bundleResult.metafile.outputs).reduce(
  (sum, o) => sum + o.bytes,
  0,
) / 1024;

// 3. Node-runtime entry — adapt the Web Fetch handler to Node's IncomingMessage/ServerResponse.
const entry = `import server from "./bundle.mjs";
import { Readable } from "node:stream";

export default async function handler(req, res) {
  const url = new URL(req.url, \`http://\${req.headers.host ?? "localhost"}\`);
  const method = req.method ?? "GET";

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      for (const item of v) headers.append(k, item);
    } else {
      headers.set(k, v);
    }
  }

  const hasBody = method !== "GET" && method !== "HEAD";
  const request = new Request(url, {
    method,
    headers,
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: "half",
  });

  let response;
  try {
    response = await server.fetch(request, {}, {});
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end("Internal Server Error");
    return;
  }

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const reader = response.body.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      res.write(value);
    }
  } finally {
    res.end();
  }
}
`;
await writeFile(join(outFn, "index.mjs"), entry, "utf8");

await writeFile(
  join(outFn, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
    },
    null,
    2,
  ),
);

// .vercel/output/functions/index.func/ must contain a package.json declaring
// "type":"module" so .mjs imports resolve correctly under Vercel's Node launcher.
await writeFile(
  join(outFn, "package.json"),
  JSON.stringify({ type: "module" }, null, 2),
);

// 4. Routing — serve static first, fall back to the function for everything else.
const staticEntries = await readdir(outStatic, { withFileTypes: true });
const staticHandles = staticEntries
  .filter((e) => !e.name.startsWith("."))
  .map((e) =>
    e.isDirectory()
      ? { src: `^/${e.name}/(.*)$`, dest: `/${e.name}/$1` }
      : { src: `^/${e.name}$`, dest: `/${e.name}` },
  );

const config = {
  version: 3,
  routes: [
    { handle: "filesystem" },
    ...staticHandles,
    { src: "/(.*)", dest: "/index" },
  ],
};
await writeFile(join(outDir, "config.json"), JSON.stringify(config, null, 2));

console.log("[build-vercel] wrote .vercel/output/");
console.log(`  static files: ${staticEntries.length} top-level entries`);
console.log(`  function: index.func (nodejs20.x, bundle ~${bundleSizeKb.toFixed(0)} KB)`);
