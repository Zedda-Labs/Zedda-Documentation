# Zedda Documentation — Static Site

A production-quality, static documentation website for the
[Zedda](https://github.com/Zedda-Labs/Zedda) open source project.

Built as a **pure static site** (HTML + CSS + JS, no framework) suitable for
GitHub Pages, Netlify, S3, or any static host. Every page, API signature, CLI
flag, and code example is grounded in a full audit of the Zedda repository at
v0.4.8 — nothing is invented.

## Quick start

```bash
# Install build dependencies
npm install markdown-it markdown-it-anchor markdown-it-link-attributes highlight.js gray-matter

# Build the static site to public/docs/
node scripts/build-docs.js

# Preview locally (any static server works)
python3 -m http.server --directory public/docs 8000
# → open http://localhost:8000
```

The build output is in `public/docs/`. Copy that directory to any static host.

## Project structure

```
static-src/
├── navigation.js          # Source of truth for the sidebar tree + URLs
├── content/               # Markdown source for every doc page
│   ├── home.md
│   ├── introduction.md
│   ├── installation.md
│   ├── quickstart.md
│   ├── guides/
│   ├── api/
│   ├── cpp-api/
│   ├── contributing/
│   └── ...
├── templates/
│   └── layout.html        # Shared HTML shell for every page
└── assets/
    ├── style.css          # Single CSS file (design system + themes + syntax)
    ├── main.js            # Single JS file (theme, search, sidebar, TOC, copy)
    ├── logo.png           # Official Zedda logo (light mode)
    └── logo-dark.png      # Official Zedda logo (dark mode)

scripts/
├── build-docs.js          # Static site generator (Node.js + markdown-it)
└── extract-content.js     # Helper: extract .md from the old TS content files

public/docs/               # Build output (deploy this directory)
```

## Design philosophy

This site follows the documentation philosophy of Material for MkDocs
(readability, navigation, hierarchy, search-first UX) but with its own original
visual identity grounded in Zedda's brand palette:

- **Teal `#1D9E75`** — primary brand color (from the PyPI badge)
- **Warm orange `#E79C65`** — accent (from the CLI ASCII banner)
- **Cream `#FCFBF8`** — light mode background (from the HTML report)
- **Deep warm slate** — dark mode background (equal care, not an afterthought)

### What's included

- **46 documentation pages** covering every public Python function, every C++
  header, the CLI, configuration, architecture, benchmarks, contributing, the
  full changelog, and license notices.
- **Compact homepage** that fits within one viewport — its only job is routing
  users into the docs.
- **Three-column layout** on desktop: sticky sidebar, content, sticky TOC.
- **Mobile drawer nav** with overlay.
- **Client-side search** — weighted scoring across titles, descriptions, and
  body text. Opens with `/` or `Ctrl+K` / `Cmd+K`.
- **Syntax highlighting** via highlight.js, applied at build time (zero client
  JS for highlighting).
- **Code blocks with copy buttons** — injected client-side, with a fallback for
  non-secure contexts.
- **Callouts** (`::::note`, `::::tip`, `::::warning`, `::::danger`) —
  MkDocs-style admonitions, rendered as colored blocks.
- **Anchor links** on every heading, with hover-reveal `#` permalinks.
- **TOC scroll-spy** — the right-rail TOC highlights the current heading via
  IntersectionObserver.
- **Breadcrumbs** on every page.
- **Prev/next navigation** at the bottom of every page.
- **Light / dark / system theme** toggle with localStorage persistence and
  no-flash inline script.
- **Collapsible sidebar groups** with state persisted in localStorage.
- **Accessibility**: semantic HTML, skip link, keyboard nav, focus rings,
  ARIA labels, `prefers-reduced-motion` support.
- **SEO**: per-page `<title>`, meta description, Open Graph tags, sitemap.xml,
  robots.txt.
- **GitHub Pages ready**: `.nojekyll` file, `404.html` custom error page.

## Deploy to GitHub Pages

The included workflow (`.github/workflows/deploy-docs.yml`) builds and deploys
automatically on push to `main` when files under `static-src/` or
`scripts/build-docs.js` change.

To set up:

1. Push this directory structure to your repository's `main` branch.
2. In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow will build and deploy on the next push.

The site will be available at `https://<your-username>.github.io/<repo-name>/`.

## Deploy to other hosts

The build output in `public/docs/` is pure static HTML. Copy it to:

- **Netlify**: drag-and-drop the `public/docs/` folder, or connect the repo
  with build command `node scripts/build-docs.js` and publish directory
  `public/docs`.
- **Vercel**: same as Netlify.
- **S3 / CloudFront**: `aws s3 sync public/docs/ s3://your-bucket/`
- **Any web server**: copy `public/docs/` to your web root.

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
4. The page appears in the sidebar, search index, sitemap, and prev/next nav
   automatically.

## Rebuilding after content changes

```bash
node scripts/build-docs.js
```

The build is idempotent — it cleans `public/docs/` and regenerates everything
from `static-src/`. Takes under 1 second for 46 pages.

## Zero-hallucination policy

Every API signature, CLI flag, environment variable, version number, file path,
and code example was sourced directly from a full audit of the Zedda repository
at commit f969fe7 (tag v0.4.8). Known inconsistencies in the upstream repo
(e.g. the `ZEDDA_AI_ENDPOINT` env var that is read but not actually used at the
call site, the titanic_quickstart notebook's `clean(apply=True)` typo) are
documented as warnings rather than papered over.

If the Zedda repository changes, re-run the audit and update the content in
`static-src/content/` accordingly. The build script will pick up the changes.

## License

The documentation content is licensed under the same MIT license as the Zedda
project. The static site generator code (in `scripts/`) and the design system
(in `static-src/assets/`) are also MIT.
