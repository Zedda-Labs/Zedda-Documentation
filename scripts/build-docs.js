/**
 * Zedda documentation — static site generator.
 *
 * Reads Markdown files from static-src/content/, renders them to standalone
 * HTML pages with a shared layout, generates a search index, and writes
 * everything to public/docs/ for GitHub Pages deployment.
 *
 * The output is pure static HTML + CSS + JS. No framework runtime, no SSR,
 * no hydration. Suitable for any static host (GitHub Pages, Netlify, S3, etc).
 *
 * Run with: node scripts/build-docs.js
 */

const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");
const anchor = require("markdown-it-anchor");
const linkAttributes = require("markdown-it-link-attributes");
const hljs = require("highlight.js");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "static-src");
const CONTENT = path.join(SRC, "content");
const TEMPLATES = path.join(SRC, "templates");
const ASSETS_SRC = path.join(SRC, "assets");
const OUT = path.join(ROOT, "public", "docs");

// --- Navigation tree (source of truth for sidebar + breadcrumbs + prev/next) ---
const navigation = require(path.join(SRC, "navigation.js"));

// --- Markdown renderer ---
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        // Wrap in <pre><code> with language class for our CSS to target
        return `<pre class="hljs code-block-pre" tabindex="0"><code class="language-${lang}">${highlighted}</code></pre>`;
      } catch (e) {
        console.warn(`highlight error for lang ${lang}:`, e.message);
      }
    }
    // Fallback: escaped, no highlighting
    return `<pre class="hljs code-block-pre" tabindex="0"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

// Plugin: add IDs to headings (for anchor links + TOC)
md.use(anchor, {
  permalink: anchor.permalink.linkInsideHeader({
    symbol: "#",
    placement: "before",
    ariaHidden: true,
  }),
  slugify: (s) =>
    s
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-"),
});

// Plugin: external links get target=_blank + rel
md.use(linkAttributes, {
  attrs: {
    target: "_blank",
    rel: "noopener noreferrer",
  },
  matcher(href) {
    return /^https?:\/\//.test(href);
  },
});

// Custom renderer: convert internal doc links like [text](#installation)
// into proper relative links. We do this in a post-processing step.
function rewriteInternalLinks(html) {
  // Match href="#something" where something is a known route id or anchor
  return html.replace(/href="#([a-z0-9/-]+)"/gi, (match, frag) => {
    // If it looks like a route id (contains / or matches our nav), link to the page
    const route = navigation.findLeaf(frag);
    if (route) {
      return `href="${route.url}"`;
    }
    // Otherwise it's an in-page anchor — leave it
    return match;
  });
}

// --- Layout template ---
const layoutTemplate = fs.readFileSync(path.join(TEMPLATES, "layout.html"), "utf8");

function renderLayout({
  title,
  description,
  body,
  navTree,
  currentId,
  breadcrumbs,
  prevNext,
  toc,
  version,
  repoUrl,
  isHome,
}) {
  // Render the sidebar HTML
  const sidebarHtml = renderSidebar(navTree, currentId);
  const tocHtml = renderToc(toc);
  const breadcrumbHtml = renderBreadcrumbs(breadcrumbs);
  const prevNextHtml = renderPrevNext(prevNext);

  const fullTitle = isHome ? `${title} — Zero Effort Data Discovery & Analytics` : `${title} — Zedda Docs`;

  // For home page: don't render the standard content header (body is the page)
  // For other pages: render the title + description header
  const contentHeader = isHome
    ? ""
    : `<header class="content-header">
         <h1 class="content-title">${escapeHtml(title)}</h1>
         <p class="content-description">${escapeHtml(description)}</p>
       </header>`;

  // Compute the base href for this page — the relative path from the page
  // to the docs root. For /docs/index.html → "./", for /docs/cpp-api/simd-scanner.html → "../".
  // With <base>, all relative URLs resolve from this path.
  const subdirs = isHome ? 0 : (currentId.match(/\//g) || []).length;
  const baseHref = subdirs === 0 ? "./" : "../".repeat(subdirs);

  return layoutTemplate
    .replace(/{{TITLE}}/g, escapeHtml(fullTitle))
    .replace(/{{DESCRIPTION}}/g, escapeHtml(description || ""))
    .replace(/{{PAGE_TITLE}}/g, escapeHtml(title))
    .replace(/{{BASE_HREF}}/g, baseHref)
    .replace("{{CONTENT_HEADER}}", contentHeader)
    .replace("{{BODY}}", body)
    .replace("{{SIDEBAR}}", sidebarHtml)
    .replace("{{TOC}}", tocHtml)
    .replace("{{BREADCRUMBS}}", breadcrumbHtml)
    .replace("{{PREV_NEXT}}", prevNextHtml)
    .replace(/{{VERSION}}/g, version)
    .replace(/{{REPO_URL}}/g, repoUrl)
    .replace(/{{CURRENT_ID}}/g, currentId)
    .replace(/{{IS_HOME}}/g, isHome ? "true" : "false")
    .replace(/{{BODY_CLASS}}/g, isHome ? "page-home" : "page-doc");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSidebar(tree, currentId) {
  let html = '<nav class="sidebar-nav" aria-label="Documentation">\n';
  for (const node of tree) {
    html += renderSidebarNode(node, currentId, 0);
  }
  html += "</nav>\n";
  return html;
}

function renderSidebarNode(node, currentId, level) {
  if (node.type === "leaf") {
    if (node.id === "home") return "";
    const isActive = currentId === node.id;
    const indent = `style="--depth: ${level}"`;
    return `  <a href="${node.url}" class="sidebar-link${isActive ? " sidebar-link--active" : ""}" ${indent} aria-current="${isActive ? "page" : "false"}">${escapeHtml(node.label)}</a>\n`;
  }
  // Group
  const hasActiveChild = navigation.groupHasLeaf(node, currentId);
  const open = hasActiveChild || node.defaultOpen;
  let html = `  <details class="sidebar-group${open ? " sidebar-group--open" : ""}" ${open ? "open" : ""}>\n`;
  html += `    <summary class="sidebar-group-title">${escapeHtml(node.label)}</summary>\n`;
  html += `    <div class="sidebar-group-children">\n`;
  for (const child of node.children) {
    html += renderSidebarNode(child, currentId, level + 1);
  }
  html += `    </div>\n  </details>\n`;
  return html;
}

function renderToc(toc) {
  if (!toc || toc.length < 2) return "";
  let html = '<nav class="toc" aria-label="On this page">\n';
  html += '  <p class="toc-title">On this page</p>\n  <ul class="toc-list">\n';
  for (const item of toc) {
    html += `    <li class="toc-item toc-item--h${item.level}"><a href="#${item.id}" class="toc-link">${escapeHtml(item.text)}</a></li>\n`;
  }
  html += "  </ul>\n</nav>\n";
  return html;
}

function renderBreadcrumbs(breadcrumbs) {
  if (!breadcrumbs || breadcrumbs.length === 0) return "";
  let html = '<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>';
  for (let i = 0; i < breadcrumbs.length; i++) {
    const crumb = breadcrumbs[i];
    const isLast = i === breadcrumbs.length - 1;
    html += "<li>";
    if (isLast) {
      html += `<span aria-current="page">${escapeHtml(crumb.label)}</span>`;
    } else {
      html += `<a href="${crumb.url}">${escapeHtml(crumb.label)}</a>`;
    }
    html += "</li>";
  }
  html += "</ol></nav>";
  return html;
}

function renderPrevNext(prevNext) {
  if (!prevNext || (!prevNext.prev && !prevNext.next)) return "";
  let html = '<nav class="prev-next" aria-label="Pagination">';
  if (prevNext.prev) {
    html += `<a href="${prevNext.prev.url}" class="prev-next-card prev-next-card--prev">
      <span class="prev-next-label">Previous</span>
      <span class="prev-next-title">${escapeHtml(prevNext.prev.label)}</span>
    </a>`;
  } else {
    html += "<span class=\"prev-next-spacer\"></span>";
  }
  if (prevNext.next) {
    html += `<a href="${prevNext.next.url}" class="prev-next-card prev-next-card--next">
      <span class="prev-next-label">Next</span>
      <span class="prev-next-title">${escapeHtml(prevNext.next.label)}</span>
    </a>`;
  } else {
    html += "<span class=\"prev-next-spacer\"></span>";
  }
  html += "</nav>";
  return html;
}

// --- Extract TOC from rendered HTML ---
function extractToc(html) {
  const toc = [];
  const regex = /<h([23])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const level = parseInt(m[1], 10);
    const id = m[2];
    // Strip any nested HTML (anchor permalink symbols etc.)
    const text = m[3]
      .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, "$1")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (text) {
      toc.push({ level, id, text });
    }
  }
  return toc;
}

// --- Extract first paragraph as description (if no frontmatter description) ---
function extractDescription(html) {
  const m = html.match(/<p>([\s\S]*?)<\/p>/i);
  if (!m) return "";
  return m[1].replace(/<[^>]+>/g, "").trim().slice(0, 200);
}

// --- Search index ---
const searchIndex = [];

// --- Build ---
function build() {
  // Clean output
  if (fs.existsSync(OUT)) {
    fs.rmSync(OUT, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });

  // Copy assets (CSS, JS, images)
  copyDir(ASSETS_SRC, path.join(OUT, "assets"));
  // Also copy any page-specific subdirectories
  copyDir(CONTENT, path.join(OUT, "_content"), { onlyFiles: false, filter: (f) => !f.endsWith(".md") });

  const leaves = navigation.flattenLeaves();
  const version = "0.4.8";
  const repoUrl = "https://github.com/Zedda-Labs/Zedda";

  for (const leaf of leaves) {
    const mdPath = path.join(CONTENT, `${leaf.id}.md`);
    let markdownSource;
    try {
      markdownSource = fs.readFileSync(mdPath, "utf8");
    } catch (e) {
      console.warn(`Missing content file for route "${leaf.id}" — expected ${mdPath}`);
      continue;
    }

    // Parse frontmatter (we use it minimally — title/description override)
    let frontmatter = {};
    let body = markdownSource;
    if (markdownSource.startsWith("---")) {
      const end = markdownSource.indexOf("---", 3);
      if (end > 0) {
        const fm = markdownSource.slice(3, end);
        body = markdownSource.slice(end + 3).replace(/^\n+/, "");
        // Simple frontmatter parse (key: value)
        for (const line of fm.split("\n")) {
          const m = line.match(/^(\w+):\s*(.*)$/);
          if (m) frontmatter[m[1]] = m[2].replace(/^["']|["']$/g, "");
        }
      }
    }

    // Preprocess: convert ::::note / ::::tip / ::::warning / ::::danger blocks
    const { text: preprocessedBody, blocks: calloutBlocks } = preprocessCallouts(body);

    // Render markdown
    let html = md.render(preprocessedBody);

    // Post-process: substitute callout placeholders with rendered callout HTML
    html = postprocessCallouts(html, calloutBlocks);

    // Rewrite internal links
    html = rewriteInternalLinks(html);

    // Extract TOC (only h2 and h3 — h1 is the page title, rendered separately)
    const toc = extractToc(html);

    // Determine page title and description
    const title = frontmatter.title || leaf.title;
    const description = frontmatter.description || leaf.description || extractDescription(html);

    // Build breadcrumbs
    const parentGroup = navigation.findParentGroup(leaf.id);
    const breadcrumbs = [];
    if (leaf.id !== "home") {
      breadcrumbs.push({ label: "Home", url: "index.html" });
      if (parentGroup) {
        breadcrumbs.push({ label: parentGroup.label, url: leaf.url });
      }
      breadcrumbs.push({ label: leaf.label, url: leaf.url });
    }

    // Prev/next
    const prevNext = navigation.getPrevNext(leaf.id);
    const pnClean = {};
    if (prevNext.prev && prevNext.prev.id !== "home") {
      pnClean.prev = { label: prevNext.prev.label, url: prevNext.prev.url };
    }
    if (prevNext.next && prevNext.next.id !== "home") {
      pnClean.next = { label: prevNext.next.label, url: prevNext.next.url };
    }

    // For home page: don't strip H1, don't add content header (the body IS the page)
    // For other pages: strip the first H1 (it's rendered separately in the layout header)
    const isHome = leaf.id === "home";
    if (!isHome) {
      html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "").replace(/^\s+/, "");
    }

    // Render full page
    const fullHtml = renderLayout({
      title,
      description,
      body: html,
      navTree: navigation.navigation,
      currentId: leaf.id,
      breadcrumbs: isHome ? [] : breadcrumbs,
      prevNext: isHome ? {} : pnClean,
      toc: isHome ? [] : toc,
      version,
      repoUrl,
      isHome,
    });

    // Write to output — flat .html files for maximum static-host compat.
    // e.g. installation → public/docs/installation.html
    //      api/scan → public/docs/api/scan.html
    const outDir = path.join(OUT, path.dirname(leaf.id === "home" ? "index" : leaf.id));
    fs.mkdirSync(outDir, { recursive: true });
    const outName = leaf.id === "home" ? "index.html" : path.basename(leaf.id) + ".html";
    const outPath = path.join(outDir, outName);
    fs.writeFileSync(outPath, fullHtml);
    console.log(`✓ ${leaf.id} → ${path.relative(ROOT, outPath)}`);

    // Add to search index
    if (!isHome) {
      // Strip HTML for the search body
      const plainText = html
        .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      searchIndex.push({
        id: leaf.id,
        title,
        description,
        group: parentGroup ? parentGroup.label : "",
        url: leaf.url,
        text: plainText.slice(0, 5000),
      });
    }
  }

  // Write search index
  fs.writeFileSync(
    path.join(OUT, "assets", "search-index.json"),
    JSON.stringify(searchIndex)
  );
  console.log(`✓ search index (${searchIndex.length} entries)`);

  // Write sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${searchIndex
  .map(
    (e) =>
      `  <url><loc>https://zedda.io/${e.id}.html</loc><changefreq>weekly</changefreq></url>`
  )
  .join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), sitemap);
  console.log("✓ sitemap.xml");

  // Write robots.txt
  fs.writeFileSync(
    path.join(OUT, "robots.txt"),
    "User-agent: *\nAllow: /\nSitemap: https://zedda.io/sitemap.xml\n"
  );
  console.log("✓ robots.txt");

  // Write a 404.html (GitHub Pages custom 404)
  const notFoundHtml = renderLayout({
    title: "Page Not Found",
    description: "The page you were looking for does not exist.",
    body:
      '<div class="not-found"><h1>404</h1><p>The page you were looking for does not exist.</p><a href="index.html" class="btn btn-primary">Back to home</a></div>',
    navTree: navigation.navigation,
    currentId: "",
    breadcrumbs: [{ label: "Home", url: "index.html" }, { label: "404", url: "./404.html" }],
    prevNext: {},
    toc: [],
    version,
    repoUrl,
    isHome: false,
  });
  fs.writeFileSync(path.join(OUT, "404.html"), notFoundHtml);
  console.log("✓ 404.html");

  // Write .nojekyll (so GitHub Pages doesn't process with Jekyll)
  fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
  console.log("✓ .nojekyll");

  console.log("\n✅ Build complete. Output: public/docs/");
}

function preprocessCallouts(md) {
  // ::::variant\n...content...\n::::
  // We extract the callout blocks, render the inner content separately,
  // and substitute a placeholder that survives the main render. Then we
  // post-process to replace placeholders with the rendered callout HTML.
  // To keep this simple, we use a sentinel HTML comment that markdown-it
  // passes through.
  const blocks = [];
  let result = md;
  const re = /^::::(note|tip|warning|danger)\s*\n([\s\S]*?)\n::::\s*$/gm;
  result = result.replace(re, (match, variant, content) => {
    const idx = blocks.length;
    blocks.push({ variant, content });
    // Use an HTML comment as a pass-through placeholder
    return `<!--ZEDDA-CALLOUT-${idx}-->`;
  });
  return { text: result, blocks };
}

function postprocessCallouts(html, blocks) {
  return html.replace(/<!--ZEDDA-CALLOUT-(\d+)-->/g, (match, idxStr) => {
    const idx = parseInt(idxStr, 10);
    const block = blocks[idx];
    if (!block) return match;
    const inner = md.render(block.content);
    const labelMap = { note: "Note", tip: "Tip", warning: "Warning", danger: "Danger" };
    return `<div class="callout callout--${block.variant}">
      <div class="callout-title">${labelMap[block.variant]}</div>
      ${inner}
    </div>`;
  });
}

function copyDir(src, dest, opts = {}) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (opts.filter && !opts.filter(entry.name)) continue;
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath, opts);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

build();
