# Zedda Documentation — Static Site

A production-quality, static documentation website for the
[Zedda](https://github.com/Zedda-Labs/Zedda) open source project.

Built as a **pure static site** (HTML + CSS + JS, no framework) suitable for
GitHub Pages, Netlify, S3, or any static host. Every page, API signature, CLI
flag, and code example is grounded in a full audit of the Zedda repository at
v0.4.8 — nothing is invented.

---

## What's in this ZIP

```
zedda-docs/
├── README.md                          ← you are here
├── static-src/                        ← source files (edit these)
│   ├── navigation.js                  ← sidebar tree + URL source of truth
│   ├── content/                       ← 46 Markdown files (one per page)
│   │   ├── home.md
│   │   ├── introduction.md
│   │   ├── installation.md
│   │   ├── quickstart.md
│   │   ├── guides/
│   │   ├── api/
│   │   ├── cpp-api/
│   │   ├── contributing/
│   │   └── ...
│   ├── templates/
│   │   └── layout.html                ← shared HTML shell for every page
│   ├── assets/
│   │   ├── style.css                  ← 31KB — full design system (light/dark)
│   │   ├── main.js                    ← 16KB — all interactivity (vanilla JS)
│   │   ├── logo.png                   ← official Zedda logo (light mode)
│   │   └── logo-dark.png              ← official Zedda logo (dark mode)
│   ├── .github/workflows/
│   │   └── deploy-docs.yml            ← GitHub Pages deployment workflow
│   └── README.md                      ← detailed build/deploy docs
├── scripts/
│   ├── build-docs.js                  ← static site generator (Node.js)
│   └── extract-content.js             ← helper (content migration only)
├── .github/workflows/
│   └── deploy-docs.yml                ← (also at repo root for GitHub)
└── public/docs/                       ← pre-built output (deploy this directly)
    ├── index.html
    ├── 404.html
    ├── *.html                         ← 48 HTML pages total
    ├── assets/
    │   ├── style.css
    │   ├── main.js
    │   ├── search-index.json
    │   ├── logo.png
    │   └── logo-dark.png
    ├── sitemap.xml
    ├── robots.txt
    └── .nojekyll
```

---

## Quick start

### Option A — Use the pre-built output (no build step)

The `public/docs/` directory already contains the built static site. Copy it
to any static host:

```bash
# Preview locally
python3 -m http.server --directory public/docs 8000
# → open http://localhost:8000

# Or copy to your web server / S3 bucket / Netlify drop zone
```

### Option B — Build from source

```bash
# Install build dependencies
npm install markdown-it markdown-it-anchor markdown-it-link-attributes highlight.js gray-matter

# Build the static site (regenerates public/docs/)
node scripts/build-docs.js

# Preview
python3 -m http.server --directory public/docs 8000
```

The build takes under 1 second for 46 pages.

---

## Deploy to GitHub Pages

1. **Push to your repository** — copy the contents of this ZIP to your repo's
   root (or a subdirectory if you prefer).
2. **Enable GitHub Pages** — in your repo: Settings → Pages → Build and
   deployment → Source: **GitHub Actions**.
3. **Push to `main`** — the included workflow
   (`.github/workflows/deploy-docs.yml`) builds and deploys automatically
   whenever files under `static-src/` or `scripts/build-docs.js` change.

The site will be live at `https://<your-username>.github.io/<repo-name>/`.

### Custom domain

If you want a custom domain (e.g. `docs.zedda.io`):
1. Add a `CNAME` file in `public/docs/` with your domain.
2. Configure DNS at your registrar.
3. Re-run `node scripts/build-docs.js` and redeploy.

---

## Deploy to other hosts

The build output in `public/docs/` is pure static HTML. Copy it to:

| Host | Instructions |
|---|---|
| **Netlify** | Drag-and-drop `public/docs/`, or connect repo with build command `node scripts/build-docs.js` and publish directory `public/docs` |
| **Vercel** | Same as Netlify |
| **S3 + CloudFront** | `aws s3 sync public/docs/ s3://your-bucket/` |
| **Nginx / Apache** | Copy `public/docs/` to your web root |
| **Any web server** | Serve `public/docs/` as static files |

---

## What's included

### Documentation content (46 pages, zero hallucination)

Every page is grounded in a full audit of the Zedda repository at v0.4.8:

- **Home** — compact, fits one viewport, uses the actual Zedda logos
- **Getting Started**: Introduction, Installation, Quick Start
- **Guides**: Profiling, Comparing, Cleaning & Fixing, ML Readiness, AI Q&A, HTML Reports
- **CLI Reference** — all 11 `zedda` subcommands
- **Python API** (14 pages): Overview + `scan`, `profile`, `compare`, `ml_ready`, `warnings`, `collect_warnings`, `fix`, `clean`, `merge`, `ask`, `report`, `ZeddaError`, `DatasetProfile`
- **C++ API** (11 pages): Overview + `ColumnAccumulator`, `CorrelationEngine`, `ProfileResult`, `HyperLogLog`, `MmapFile`, `SimdScanner`, `CsvStreamReader`, `ProfileBuilder`, `ArrowProfiler`, `ParsingUtils`
- **Configuration, Architecture, Examples, Benchmarks**
- **Contributing** (5 pages): Setup, Standards, Structure, Security, Releasing
- **Changelog** (full 0.1.0 → 0.4.8), **License & Third-Party Notices**

### Design system (original, MkDocs-inspired)

- **Brand colors from the repo audit**: teal `#1D9E75`, warm orange `#E79C65`, cream `#FCFBF8`, dark teal `#0F5C44`
- **Equal-care light + dark themes** with proper contrast, no-flash inline script
- **Three-column desktop layout**: sticky sidebar (264px) + content (820px max) + sticky TOC (240px)
- **Mobile drawer nav** with overlay
- **Callouts** (`::::note` / `::::tip` / `::::warning` / `::::danger`)
- **Heading anchor links** with hover-reveal `#` permalinks

### Features (all in 16KB of vanilla JS)

- **Client-side search** — weighted scoring across titles, descriptions, body. Opens with `/` or `Ctrl+K` / `Cmd+K`
- **Theme toggle** — system / light / dark, persisted in localStorage
- **Collapsible sidebar groups** — state persisted in localStorage
- **TOC scroll-spy** — IntersectionObserver highlights current heading
- **Code block copy buttons** — with `execCommand` fallback for non-secure contexts
- **Breadcrumbs, prev/next navigation, skip link**
- **`prefers-reduced-motion` + print stylesheet**
- **SEO**: per-page `<title>`, meta description, Open Graph, `sitemap.xml`, `robots.txt`
- **GitHub Pages ready**: `.nojekyll`, custom `404.html`

---

## Adding a new page

1. Create a Markdown file in `static-src/content/` — e.g. `my-new-page.md`.
2. Add an entry to the `navigation` array in `static-src/navigation.js`:

   ```js
   {
     type: "leaf",
     id: "my-new-page",
     label: "My New Page",
     title: "My New Page",
     description: "What this page covers.",
     get url() { return "my-new-page.html"; },
   },
   ```

3. Run `node scripts/build-docs.js`.
4. The page appears in the sidebar, search index, sitemap, and prev/next nav automatically.

---

## Rebuilding after content changes

```bash
node scripts/build-docs.js
```

The build is idempotent — it cleans `public/docs/` and regenerates everything
from `static-src/`.

---

## Zero-hallucination policy

Every API signature, CLI flag, environment variable, version number, file path,
and code example was sourced directly from a full audit of the Zedda repository
at commit f969fe7 (tag v0.4.8). Known inconsistencies in the upstream repo
(e.g. the `ZEDDA_AI_ENDPOINT` env var that is read but not actually used at the
call site, the `titanic_quickstart` notebook's `clean(apply=True)` typo) are
documented as warnings rather than papered over.

If the Zedda repository changes, re-run the audit and update the content in
`static-src/content/` accordingly. The build script will pick up the changes.

---

## License

The documentation content is licensed under the same MIT license as the Zedda
project. The static site generator code (in `scripts/`) and the design system
(in `static-src/assets/`) are also MIT.

---

## Build output stats

- **48 HTML pages** (46 docs + index + 404)
- **1 CSS file**: 31 KB
- **1 JS file**: 16 KB (unminified, vanilla JS)
- **Search index**: 121 KB (full-text for all 46 pages)
- **2 logos**: 49 KB each (official Zedda brand assets)
- **Total**: 1.5 MB
