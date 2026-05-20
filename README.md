# Andreashof Breechen Estate

Property listing and reservation site for a German short-term-stay estate. Built and delivered as a client project.

> 🔗 **Live:** <https://andreashof-breechen-estate.vercel.app>

## Overview

Bilingual marketing and reservations site featuring:

- Property and room showcase with gallery
- Reservation flow
- Multilingual UI (German / English)
- All required German legal pages — Impressum, Datenschutz, AGB
- SEO sitemap

## Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (full-stack React)
- **Build:** Vite + Cloudflare Vite Plugin (edge-ready)
- **Language:** TypeScript
- **UI:** [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS
- **Forms & validation:** `react-hook-form` + `@hookform/resolvers`
- **i18n:** Custom language provider with locale JSON files
- **Package manager:** Bun
- **Deployment:** Vercel (with edge-rendering via Cloudflare-compatible build)

## Routes

```
/                  Home / property overview
/zimmer            Rooms & accommodation
/reservations      Booking flow
/datenschutz       Privacy policy (DE)
/agb               Terms & conditions (DE)
/impressum         Legal imprint (DE)
/sitemap.xml       SEO sitemap
```

## Local development

```bash
bun install
bun dev
```

## Build

```bash
bun run build
```

## License

MIT — see [LICENSE](./LICENSE).

---

Delivered by [Jose Heusser](https://github.com/JoseHeusser) · [Oxidelabs](https://oxidelabs.cl) · AI-assisted development with Claude Code & Cursor.
