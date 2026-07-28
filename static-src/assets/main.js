/* =========================================================================
   Zedda Documentation — Client JavaScript
   =========================================================================
   Single file. No dependencies. Handles:
     - Theme toggle (system / light / dark) with localStorage
     - Search modal (loads search-index.json, filters client-side)
     - Sidebar drawer on mobile
     - Collapsible sidebar groups (preserved in localStorage)
     - TOC scroll-spy (highlights current heading)
     - Code block copy buttons (injected after render)
     - Keyboard shortcuts: / or Ctrl+K to focus search, Esc to close
   ========================================================================= */

(function () {
  "use strict";

  // -----------------------------------------------------------------------
  // Theme toggle (Light ☀️ / Dark 🌙)
  // -----------------------------------------------------------------------
  const THEME_KEY = "zedda-theme";

  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }

  function setTheme(theme) {
    applyTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  function toggleTheme(e) {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";

    // Calculate click coordinates
    let x, y;
    if (e && e.clientX !== undefined && e.clientY !== undefined) {
      x = e.clientX;
      y = e.clientY;
    } else {
      const toggle = document.getElementById("theme-toggle");
      const rect = toggle ? toggle.getBoundingClientRect() : { left: window.innerWidth - 40, top: 20, width: 30, height: 30 };
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // View Transitions API (Circular Expanding Animation)
    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        setTheme(next);
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ];
        document.documentElement.animate(
          { clipPath: clipPath },
          {
            duration: 550,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)"
          }
        );
      });
      return;
    }

    // Fallback Circular Sweep Overlay
    let curtain = document.getElementById("theme-sweep-curtain");
    if (!curtain) {
      curtain = document.createElement("div");
      curtain.id = "theme-sweep-curtain";
      curtain.className = "theme-sweep-curtain";
      document.body.appendChild(curtain);
    }

    curtain.style.backgroundColor = next === "dark" ? "#15161a" : "#ffffff";
    curtain.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    curtain.classList.add("sweeping");

    requestAnimationFrame(() => {
      curtain.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
    });

    setTimeout(() => {
      setTheme(next);
      setTimeout(() => {
        curtain.classList.remove("sweeping");
        curtain.style.clipPath = "";
      }, 100);
    }, 450);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(getStoredTheme());
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", (e) => toggleTheme(e));
    }
  });

  // -----------------------------------------------------------------------
  // Sidebar drawer (mobile)
  // -----------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const toggle = document.getElementById("sidebar-toggle");
    if (!sidebar || !toggle) return;

    function openSidebar() {
      sidebar.classList.add("is-open");
      if (overlay) overlay.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function closeSidebar() {
      sidebar.classList.remove("is-open");
      if (overlay) overlay.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    toggle.addEventListener("click", () => {
      if (sidebar.classList.contains("is-open")) closeSidebar();
      else openSidebar();
    });
    if (overlay) overlay.addEventListener("click", closeSidebar);

    // Close sidebar when a link is clicked (mobile)
    sidebar.addEventListener("click", (e) => {
      if (e.target.matches("a.sidebar-link") && window.innerWidth <= 900) {
        closeSidebar();
      }
    });

    // Close on Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("is-open")) {
        closeSidebar();
      }
    });
  });

  // -----------------------------------------------------------------------
  // Sidebar group state — preserve open/closed in localStorage
  // -----------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "zedda-sidebar-groups";
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (e) {}

    document.querySelectorAll(".sidebar-group").forEach((group) => {
      // Use the title text as a key
      const titleEl = group.querySelector(".sidebar-group-title");
      if (!titleEl) return;
      const key = titleEl.textContent.trim();

      // If we have a saved state, apply it (but always open if it contains the active page)
      const hasActive = group.querySelector(".sidebar-link--active");
      if (!hasActive && key in saved) {
        group.open = saved[key];
      }

      group.addEventListener("toggle", () => {
        saved[key] = group.open;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (e) {}
      });
    });
  });

  // -----------------------------------------------------------------------
  // Code block copy buttons
  // -----------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    function wrapPre(pre) {
      // Skip if already wrapped
      if (pre.parentElement && pre.parentElement.classList.contains("code-block-wrapper")) return;

      const code = pre.querySelector("code");
      const lang = (code && code.className.match(/language-(\w+)/) || [])[1] || "text";
      const text = code ? code.textContent : pre.textContent;

      // Create wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // Create header
      const header = document.createElement("div");
      header.className = "code-block-header";
      const label = document.createElement("span");
      label.textContent = lang;

      const copyBtn = document.createElement("button");
      copyBtn.className = "code-block-copy";
      copyBtn.type = "button";
      copyBtn.setAttribute("aria-label", "Copy code");
      copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy</span>';
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.classList.add("copied");
          copyBtn.querySelector("span").textContent = "Copied";
          setTimeout(() => {
            copyBtn.classList.remove("copied");
            copyBtn.querySelector("span").textContent = "Copy";
          }, 1500);
        } catch (e) {
          // Fallback for non-secure contexts
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (e2) {}
          document.body.removeChild(ta);
        }
      });

      header.appendChild(label);
      header.appendChild(copyBtn);
      wrapper.insertBefore(header, pre);
    }

    // Wrap all <pre> elements (whether or not they have the code-block-pre class)
    document.querySelectorAll("pre").forEach(wrapPre);
  });

  // -----------------------------------------------------------------------
  // TOC scroll-spy
  // -----------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const tocLinks = Array.from(document.querySelectorAll(".toc-link"));
    if (tocLinks.length === 0) return;

    const headings = tocLinks
      .map((link) => {
        const id = link.getAttribute("href").slice(1);
        return document.getElementById(id);
      })
      .filter(Boolean);

    if (headings.length === 0) return;

    let activeLink = null;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost heading currently visible
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          const newActive = tocLinks.find((l) => l.getAttribute("href") === "#" + id);
          if (newActive && newActive !== activeLink) {
            if (activeLink) activeLink.classList.remove("active");
            newActive.classList.add("active");
            activeLink = newActive;
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] }
    );

    headings.forEach((h) => observer.observe(h));
  });

  // -----------------------------------------------------------------------
  // Search
  // -----------------------------------------------------------------------
  const SEARCH_INDEX_URL = "assets/search-index.json";
  let searchIndex = null;
  let searchIndexLoading = null;

  function loadSearchIndex() {
    if (searchIndex) return Promise.resolve(searchIndex);
    if (searchIndexLoading) return searchIndexLoading;
    searchIndexLoading = fetch(SEARCH_INDEX_URL)
      .then((r) => r.json())
      .then((data) => { searchIndex = data; return data; });
    return searchIndexLoading;
  }

  function tokenize(s) {
    return s.toLowerCase().split(/[^a-z0-9_]+/i).filter((t) => t.length > 1);
  }

  function search(query, limit) {
    if (!searchIndex || !query.trim()) return [];
    const qTokens = tokenize(query);
    if (qTokens.length === 0) return [];
    const results = [];
    for (const entry of searchIndex) {
      let score = 0;
      const titleTokens = tokenize(entry.title);
      const descTokens = tokenize(entry.description);
      const bodyTokens = tokenize(entry.text);
      for (const qt of qTokens) {
        // Title
        for (const tt of titleTokens) {
          if (tt === qt) score += 100;
          else if (tt.startsWith(qt)) score += 50;
          else if (tt.includes(qt)) score += 25;
        }
        // Description
        for (const dt of descTokens) {
          if (dt === qt) score += 50;
          else if (dt.startsWith(qt)) score += 25;
          else if (dt.includes(qt)) score += 10;
        }
        // Group
        if (entry.group && entry.group.toLowerCase().includes(qt)) score += 20;
        // Body (capped)
        let bodyHits = 0;
        for (const bt of bodyTokens) {
          if (bt === qt) { score += 5; bodyHits++; if (bodyHits >= 10) break; }
          else if (bt.startsWith(qt)) { score += 2; bodyHits++; if (bodyHits >= 10) break; }
        }
      }
      if (score > 0) results.push({ entry, score });
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit || 15);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("search-modal");
    const input = document.getElementById("search-input");
    const resultsEl = document.getElementById("search-results");
    const trigger = document.getElementById("search-trigger");
    if (!modal || !input) return;

    let activeIndex = -1;
    let currentResults = [];

    function openSearch() {
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      input.value = "";
      resultsEl.innerHTML = '<div class="search-results-empty">Start typing to search…</div>';
      currentResults = [];
      activeIndex = -1;
      setTimeout(() => input.focus(), 50);
      // Preload the index
      loadSearchIndex().catch(() => {});
    }

    function closeSearch() {
      modal.hidden = true;
      document.body.style.overflow = "";
    }

    function renderResults(query) {
      if (!query.trim()) {
        resultsEl.innerHTML = '<div class="search-results-empty">Start typing to search…</div>';
        currentResults = [];
        return;
      }
      const results = search(query, 20);
      currentResults = results;
      activeIndex = -1;
      if (results.length === 0) {
        resultsEl.innerHTML = '<div class="search-results-empty">No results found.</div>';
        return;
      }
      resultsEl.innerHTML = results.map((r, i) => {
        const e = r.entry;
        return `<a class="search-result" href="${e.url}" data-idx="${i}" role="option">
          <div class="search-result-title">${escapeHtml(e.title)}${e.group ? `<span class="search-result-group">${escapeHtml(e.group)}</span>` : ""}</div>
          ${e.description ? `<div class="search-result-description">${escapeHtml(e.description)}</div>` : ""}
        </a>`;
      }).join("");
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function updateActive() {
      const items = resultsEl.querySelectorAll(".search-result");
      items.forEach((el, i) => {
        el.classList.toggle("search-result--active", i === activeIndex);
        if (i === activeIndex) el.scrollIntoView({ block: "nearest" });
      });
    }

    // Trigger button
    trigger.addEventListener("click", openSearch);
    // Click on backdrop
    modal.querySelectorAll("[data-close-search]").forEach((el) => el.addEventListener("click", closeSearch));

    // Input handling
    input.addEventListener("input", () => renderResults(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentResults.length === 0) return;
        activeIndex = Math.min(activeIndex + 1, currentResults.length - 1);
        updateActive();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentResults.length === 0) return;
        activeIndex = Math.max(activeIndex - 1, -1);
        updateActive();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && currentResults[activeIndex]) {
          window.location.href = currentResults[activeIndex].entry.url;
        } else if (currentResults.length > 0) {
          window.location.href = currentResults[0].entry.url;
        }
      }
    });

    // Click on a result
    resultsEl.addEventListener("click", (e) => {
      const item = e.target.closest(".search-result");
      if (item) {
        e.preventDefault();
        const idx = parseInt(item.dataset.idx, 10);
        if (currentResults[idx]) window.location.href = currentResults[idx].entry.url;
      }
    });

    // Global keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // / or Ctrl+K / Cmd+K opens search
      if ((e.key === "/" && !isTextInput(e.target)) || ((e.ctrlKey || e.metaKey) && e.key === "k")) {
        e.preventDefault();
        openSearch();
        return;
      }
      // Esc closes
      if (e.key === "Escape" && !modal.hidden) {
        closeSearch();
      }
    });

    function isTextInput(t) {
      if (!t) return false;
      return t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable;
    }
  });

  // -----------------------------------------------------------------------
  // Landing Page Animations & Interactivity
  // -----------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // 1. Copy Buttons Handler
    document.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const text = btn.getAttribute("data-copy") || "pip install zedda";
        try {
          await navigator.clipboard.writeText(text);
          btn.classList.add("copied");
          setTimeout(() => btn.classList.remove("copied"), 1800);
        } catch (e) {
          console.warn("Failed to copy text: ", e);
        }
      });
    });

    // 2. Sticky Navbar Scroll Effect
    const topbar = document.querySelector(".topbar");
    if (topbar) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
          topbar.classList.add("topbar-scrolled");
        } else {
          topbar.classList.remove("topbar-scrolled");
        }
      });
    }

    // 3. Scroll Reveal Animation
    const revealElements = document.querySelectorAll(".scroll-reveal");
    if (revealElements.length > 0 && "IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );
      revealElements.forEach((el) => revealObserver.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add("is-visible"));
    }

    // 4. Count-up Animation for Stat Numbers & Live PyPI Fetcher
    const liveDownloadEl = document.getElementById("live-pypi-downloads");
    if (liveDownloadEl) {
      fetch("https://pypistats.org/api/packages/zedda/recent")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data && data.data.last_month) {
            liveDownloadEl.setAttribute("data-target", data.data.last_month.toString());
          }
        })
        .catch(() => {});
    }

    const statValues = document.querySelectorAll(".stat-value");
    if (statValues.length > 0 && "IntersectionObserver" in window) {
      const statsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              if (el.dataset.animated) return;
              el.dataset.animated = "true";

              const target = parseInt(el.getAttribute("data-target"), 10) || 0;
              const suffix = el.getAttribute("data-suffix") || "";
              const duration = 1200; // ms
              const startTime = performance.now();

              function updateCount(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // easeOutExpo curve for fast initial count up
                const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const currentVal = Math.floor(easeProgress * target);

                el.textContent = currentVal.toLocaleString() + suffix;

                if (progress < 1) {
                  requestAnimationFrame(updateCount);
                } else {
                  el.textContent = target.toLocaleString() + suffix;
                }
              }

              requestAnimationFrame(updateCount);
            }
          });
        },
        { threshold: 0.3 }
      );

      statValues.forEach((el) => statsObserver.observe(el));
    }

    // 4b. Production Live PyPI Stats Fetcher (5-Minute Refresh, No Fake Increases)
    const downloadsEl = document.getElementById("live-pypi-downloads");
    const installsEl = document.getElementById("live-pypi-installs");

    if (downloadsEl || installsEl) {
      const numberFormatter = new Intl.NumberFormat("en-US");

      async function syncPyPIApi() {
        try {
          const res = await fetch("https://pypistats.org/api/packages/zedda/overall");
          if (res.ok) {
            const json = await res.json();
            if (json && Array.isArray(json.data)) {
              let totalWithMirrors = 0;
              let totalWithoutMirrors = 0;

              json.data.forEach((row) => {
                if (row.category === "with_mirrors") totalWithMirrors += row.downloads;
                if (row.category === "without_mirrors") totalWithoutMirrors += row.downloads;
              });

              if (totalWithMirrors > 0 && downloadsEl) {
                downloadsEl.setAttribute("data-target", totalWithMirrors);
                downloadsEl.textContent = numberFormatter.format(totalWithMirrors) + "+";
              }
              if (totalWithoutMirrors > 0 && installsEl) {
                installsEl.setAttribute("data-target", totalWithoutMirrors);
                installsEl.textContent = numberFormatter.format(totalWithoutMirrors) + "+";
              }
            }
          }
        } catch (e) {
          // Graceful fallback to static target
        }
      }

      // Initial PyPI Sync & Automatic Refresh every 5 minutes (300,000 ms)
      syncPyPIApi();
      setInterval(syncPyPIApi, 300000);
    }

    // 5. Dynamic Active Sidebar Link Highlight & Scroll Preservation
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      const currentUrl = window.location.pathname;
      const links = sidebar.querySelectorAll("a.sidebar-link");
      let activeLink = null;

      links.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href) return;
        
        const resolvedPath = new URL(href, window.location.href).pathname;
        if (currentUrl.endsWith(resolvedPath) || (resolvedPath.length > 5 && currentUrl.includes(resolvedPath))) {
          links.forEach((l) => {
            l.classList.remove("sidebar-link--active");
            l.setAttribute("aria-current", "false");
          });
          link.classList.add("sidebar-link--active");
          link.setAttribute("aria-current", "page");
          activeLink = link;
          
          const parentGroup = link.closest("details.sidebar-group");
          if (parentGroup) parentGroup.open = true;
        }
      });

      // Clear scroll position memory when clicking topbar links so it auto-scrolls to new section
      document.querySelectorAll(".topbar-nav-link").forEach((topLink) => {
        topLink.addEventListener("click", () => {
          sessionStorage.removeItem("zedda-sidebar-scroll");
        });
      });

      // Restore saved scroll position OR keep upper items (Getting Started & Guides) visible at top
      const savedScroll = sessionStorage.getItem("zedda-sidebar-scroll");
      if (savedScroll !== null && savedScroll !== "0") {
        sidebar.scrollTop = parseInt(savedScroll, 10);
      } else if (activeLink) {
        const activeTopInSidebar = activeLink.offsetTop;
        if (activeTopInSidebar < sidebar.clientHeight * 0.6) {
          sidebar.scrollTop = 0;
        } else {
          sidebar.scrollTop = Math.max(0, activeTopInSidebar - 120);
        }
      }

      // Save scroll position on user scroll
      sidebar.addEventListener("scroll", () => {
        sessionStorage.setItem("zedda-sidebar-scroll", sidebar.scrollTop.toString());
      }, { passive: true });
    }

    // 6. Ultra-Realistic macOS Interactive Live Typing Terminal
    const termWindow = document.getElementById("hero-terminal");
    const termContent = document.getElementById("terminal-content");
    const termTyping = document.getElementById("current-typing");
    const termBody = document.getElementById("terminal-body");

    if (termWindow && termContent && termTyping) {
      // 3D Parallax Tilt Effect on Mouse Move
      termWindow.addEventListener("mousemove", (e) => {
        const rect = termWindow.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = (-y / rect.height) * 10;
        const rotateY = (x / rect.width) * 10;
        termWindow.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      termWindow.addEventListener("mouseleave", () => {
        termWindow.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
      });

      // Terminal Command Execution Sequences (Compact 5-Line Max Output)
      const commands = [
        {
          cmd: "pip install zedda",
          outputs: [
            { text: "Downloading wheels...", cls: "term-cyan" },
            { text: "✓ Successfully installed zedda-v0.4.8", cls: "term-success" }
          ]
        },
        {
          cmd: "python demo.py",
          outputs: [
            { text: "Found 125,000 rows × 34 columns", cls: "term-cyan" },
            { text: "✓ Analysis completed in 0.04s.", cls: "term-success" }
          ]
        },
        {
          cmd: "zedda profile sales.csv",
          outputs: [
            { text: "Rows: 125,000 | Missing: 2.1% | Memory: 18MB", cls: "term-cyan" },
            { text: "✓ Generated interactive report.", cls: "term-success" }
          ]
        },
        {
          cmd: "zedda clean sales.csv",
          outputs: [
            { text: "Normalizing columns & scaling data...", cls: "term-output" },
            { text: "✓ Saved dataset with JSON audit trail.", cls: "term-success" }
          ]
        }
      ];

      let cmdIdx = 0;

      async function runTerminalSequence() {
        while (true) {
          const current = commands[cmdIdx];
          termTyping.textContent = "";

          // Keep max 4 lines in history before typing new command so total stays <= 5-6 lines
          while (termContent.children.length > 3) {
            termContent.removeChild(termContent.firstChild);
          }

          // Type command char by char
          for (let i = 0; i < current.cmd.length; i++) {
            termTyping.textContent += current.cmd[i];
            termBody.scrollTop = termBody.scrollHeight;
            const speed = 40 + Math.random() * 30; // 40-70ms typing speed
            await new Promise((r) => setTimeout(r, speed));
          }

          // Random delay before pressing Enter
          await new Promise((r) => setTimeout(r, 450 + Math.random() * 200));

          // Append command to content history
          const cmdLine = document.createElement("div");
          cmdLine.className = "terminal-line term-cmd-line";
          cmdLine.innerHTML = `<span class="prompt-symbol">$</span> ${current.cmd}`;
          termContent.appendChild(cmdLine);
          termTyping.textContent = "";

          // Show output lines one by one
          for (const out of current.outputs) {
            await new Promise((r) => setTimeout(r, 200 + Math.random() * 120));
            const outLine = document.createElement("div");
            outLine.className = `terminal-line ${out.cls}`;
            outLine.textContent = out.text;
            termContent.appendChild(outLine);

            // Keep max 5 lines total
            while (termContent.children.length > 5) {
              termContent.removeChild(termContent.firstChild);
            }
            termBody.scrollTop = termBody.scrollHeight;
          }

          // Pause after completing sequence
          await new Promise((r) => setTimeout(r, 2400));

          cmdIdx = (cmdIdx + 1) % commands.length;
        }
      }

      runTerminalSequence();
    }

    // 7. Robust Anchor Smooth Scrolling & TOC ScrollSpy Engine
    const tocLinks = document.querySelectorAll(".toc-link, a[href^='#']");
    tocLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || href === "#" || !href.startsWith("#")) return;
        
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          const topbarHeight = 80;
          const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - topbarHeight;
          
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: "smooth"
          });
          
          if (history.pushState) {
            history.pushState(null, "", href);
          } else {
            window.location.hash = href;
          }

          document.querySelectorAll(".toc-link").forEach((l) => {
            l.classList.remove("toc-link--active", "active");
            l.removeAttribute("aria-current");
          });
          if (link.classList.contains("toc-link")) {
            link.classList.add("toc-link--active", "active");
            link.setAttribute("aria-current", "location");
          }
        }
      });
    });

    // ScrollSpy with IntersectionObserver
    const headings = Array.from(document.querySelectorAll(".content-body h2[id], .content-body h3[id], .content-body h4[id]"));
    if (headings.length > 0 && "IntersectionObserver" in window) {
      const headingMap = new Map();
      document.querySelectorAll(".toc-link").forEach((l) => {
        const href = l.getAttribute("href");
        if (href && href.startsWith("#")) {
          headingMap.set(href.slice(1), l);
        }
      });

      const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            const activeTocLink = headingMap.get(id);
            if (activeTocLink) {
              document.querySelectorAll(".toc-link").forEach((l) => {
                l.classList.remove("toc-link--active", "active");
                l.removeAttribute("aria-current");
              });
              activeTocLink.classList.add("toc-link--active", "active");
              activeTocLink.setAttribute("aria-current", "location");
            }
          }
        });
      }, {
        root: null,
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0
      });

      headings.forEach((h) => spyObserver.observe(h));
    }
  });
})();
