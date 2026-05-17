// Repackages the vite build output into Vercel's Build Output API (v3) layout.
// Run after `vite build`. Produces .vercel/output/ which Vercel deploys as-is,
// skipping its own framework detection.
//
//   .vercel/output/
//     config.json            (routing: static first, fallback to /index function)
//     static/                (= dist/client/)
//     functions/index.func/  (Edge function wrapping dist/server/server.js)
import { mkdir, rm, cp, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

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
await mkdir(outDir, { recursive: true });

// 1. Static assets — copy dist/client/ → .vercel/output/static/
await cp(distClient, outStatic, { recursive: true });

// 2. Edge function — bundle server.js + its asset chunks into one folder.
await mkdir(outFn, { recursive: true });
await cp(distServer, outFn, { recursive: true });

// Tiny ESM entry that re-exports the fetch handler in the shape Vercel Edge expects.
const entry = `import server from "./server.js";
export default async function (request, ctx) {
  return server.fetch(request, {}, ctx);
}
`;
await writeFile(join(outFn, "index.js"), entry, "utf8");

await writeFile(
  join(outFn, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "edge",
      entrypoint: "index.js",
    },
    null,
    2,
  ),
);

// 3. Routing config — serve static first, fall back to the function.
//    Generate explicit rewrites for each static top-level path so they shortcut the function.
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
console.log(`  function: index.func (edge runtime)`);
