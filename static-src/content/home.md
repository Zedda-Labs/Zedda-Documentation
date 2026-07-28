---
title: Zedda
description: Zero Effort Data Discovery & Analytics — a C++17-powered EDA and data cleaning engine for Python.
is_home: true
---

<!-- HERO SECTION (POLARS BACKGROUND + LIVE MAC OS TERMINAL) -->
<section class="hero-section">
<div class="hero-polars-bg">
  <div class="polars-glow-line polars-glow-1"></div>
  <div class="polars-glow-line polars-glow-2"></div>
  <div class="hero-light-glow hero-light-glow-1"></div>
  <div class="hero-light-glow hero-light-glow-2"></div>
  <div class="hero-light-glow hero-light-glow-3"></div>
</div>

<div class="hero-grid-container">
<div class="hero-left">
  <div class="hero-badge scroll-reveal">
    <span class="hero-badge-dot"></span>
    <span>C++17 engine · streams in constant memory</span>
  </div>

  <h1 class="hero-title scroll-reveal">
    Understand any dataset<br>
    before you write<br>
    a single line of <span class="highlight-blue">code.</span>
  </h1>

  <p class="hero-subtitle scroll-reveal">
    Zedda profiles, cleans and validates datasets from a single call. It scales from a 900-row CSV to a terabyte Parquet file — without changing how you use it.
  </p>

  <div class="hero-actions scroll-reveal">
    <a class="btn-hero-primary" href="quickstart.html">
      Get started
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
    </a>
    <div class="hero-install-pill">
      <span class="install-prefix">$</span>
      <code class="install-cmd">pip install zedda</code>
      <button class="copy-btn" type="button" aria-label="Copy install command" data-copy="pip install zedda">
        <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span class="copy-tooltip">Copied!</span>
      </button>
    </div>
  </div>
</div>

<div class="hero-right scroll-reveal">
  <div class="mac-terminal-window" id="hero-terminal">
    <div class="terminal-header">
      <div class="traffic-lights">
        <span class="t-dot t-red"></span>
        <span class="t-dot t-yellow"></span>
        <span class="t-dot t-green"></span>
      </div>
      <div class="terminal-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
        <span>python</span>
      </div>
      <div class="terminal-actions">
        <span class="t-status-dot"></span>
      </div>
    </div>
    <div class="terminal-body" id="terminal-body">
      <div id="terminal-content"></div>
      <div class="terminal-prompt-line">
        <span class="prompt-symbol">$</span>
        <span id="current-typing"></span><span class="blinking-cursor">█</span>
      </div>
    </div>
  </div>
</div>
</div>
</section>

<div class="landing-container">

<!-- FEATURES SECTION (IMAGE 3) -->
<section class="features-section" id="features">
<div class="section-header scroll-reveal">
<div class="section-tag">WHY ZEDDA</div>
<h2 class="section-heading">Ten functions. Zero setup. One import.</h2>
</div>

<div class="features-grid">
<!-- Card 1: Featured C++17 Core Card -->
<div class="feature-card feature-card-featured scroll-reveal">
<div class="card-icon-box">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>
</div>
<h3 class="feature-title">C++17 core, constant memory</h3>
<p class="feature-desc">The engine streams data instead of loading it. A 900-row CSV and a terabyte Parquet file use the same tiny memory footprint.</p>
</div>

<!-- Card 2: ML readiness score -->
<div class="feature-card scroll-reveal">
<div class="card-icon-box">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
</div>
<h3 class="feature-title">ML readiness score</h3>
<p class="feature-desc">Get a 0–100 score flagging the issues that quietly wreck model accuracy.</p>
</div>

<!-- Card 3: Drift detection -->
<div class="feature-card scroll-reveal">
<div class="card-icon-box">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
</div>
<h3 class="feature-title">Drift detection</h3>
<p class="feature-desc">Compare train vs. production data to catch schema and distribution drift early.</p>
</div>

<!-- Card 4: Safe auto-clean -->
<div class="feature-card scroll-reveal">
<div class="card-icon-box">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
</div>
<h3 class="feature-title">Safe auto-clean with audit trail</h3>
<p class="feature-desc">Impute, drop sparse columns and encode strings automatically — always with a backup and a JSON audit log so nothing is ever lost.</p>
</div>
</div>
</section>

<!-- STATS SECTION (IMAGE 4 - COUNT-UP ON SCROLL) -->
<section class="stats-section">
<div class="stats-grid">
<div class="stat-card scroll-reveal">
<div class="stat-value" id="live-pypi-downloads" data-target="48067" data-suffix="+">0</div>
<div class="stat-label">Total downloads <span class="live-dot-badge"><span class="live-pulse"></span>Live</span></div>
</div>
<div class="stat-card scroll-reveal">
<div class="stat-value" id="live-pypi-installs" data-target="16692" data-suffix="+">0</div>
<div class="stat-label">PyPI installs</div>
</div>
<div class="stat-card scroll-reveal">
<div class="stat-value" data-target="10">0</div>
<div class="stat-label">One-call functions</div>
</div>
<div class="stat-card scroll-reveal">
<div class="stat-value" data-target="3">0</div>
<div class="stat-label">Builders behind it</div>
</div>
</div>
</section>

<!-- MANIFESTO SECTION (IMAGE 5) -->
<section class="manifesto-section" id="manifesto">
<div class="manifesto-header scroll-reveal">
<div class="section-tag">MANIFESTO</div>
</div>
<div class="manifesto-list">
<div class="manifesto-item scroll-reveal">
<div class="manifesto-num">01</div>
<div class="manifesto-body">
<h3 class="manifesto-title">Discovery should be free</h3>
<p class="manifesto-desc">You should be able to look inside any dataset in one line — no boilerplate, no 40-cell notebook, no guessing.</p>
</div>
</div>

<div class="manifesto-item scroll-reveal">
<div class="manifesto-num">02</div>
<div class="manifesto-body">
<h3 class="manifesto-title">Scale should be invisible</h3>
<p class="manifesto-desc">The same call that profiles a 900-row CSV should profile a terabyte of Parquet. You change the file, not your code.</p>
</div>
</div>

<div class="manifesto-item scroll-reveal">
<div class="manifesto-num">03</div>
<div class="manifesto-body">
<h3 class="manifesto-title">Cleaning should be honest</h3>
<p class="manifesto-desc">Every fix is logged, every original is backed up. Automation you can actually trust in production.</p>
</div>
</div>
</div>
</section>

<!-- CTA SECTION (IMAGE 6) -->
<section class="cta-section scroll-reveal">
<div class="cta-card">
<div class="cta-bg-grid"></div>
<div class="cta-bg-glow"></div>

<div class="cta-sparkle">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
</div>
<h2 class="cta-title">Profile your first dataset in 30 seconds.</h2>

<div class="cta-actions">
<div class="cta-install-pill">
<span class="install-prefix">$</span>
<code class="install-cmd">pip install zedda</code>
<button class="copy-btn" type="button" aria-label="Copy command" data-copy="pip install zedda">
<svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
<span class="copy-tooltip">Copied!</span>
</button>
</div>
<a class="btn-cta-primary" href="quickstart.html">
Read the docs
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
</a>
</div>
</div>
</section>

</div>

<!-- LANDING FOOTER (IMAGE 7) - OUTSIDE CONTAINER FOR FULL WIDTH -->
<footer class="landing-footer">
<div class="watermark-bg scroll-reveal" aria-hidden="true">ZEDDA</div>

<div class="landing-footer-inner">
<div class="landing-footer-brand">
<img class="brand-logo brand-logo--light" src="assets/logo.png" alt="Zedda" width="140">
<img class="brand-logo brand-logo--dark" src="assets/logo-dark.png" alt="Zedda" width="140">
</div>

<p class="landing-footer-text">
Zero Effort Data Discovery & Analytics. Profile, clean and validate datasets from a single Python call — from a 900-row CSV to terabyte-scale Parquet.
</p>

<div class="landing-footer-socials">
<a href="https://github.com/Zedda-Labs/Zedda" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
</a>
<a href="https://pypi.org/project/zedda" target="_blank" rel="noopener noreferrer" aria-label="PyPI" title="PyPI">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
</a>
<a href="https://x.com/Zeddalabs" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" title="Twitter / X">
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
</a>
<a href="https://www.linkedin.com/company/zedda-labs/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z"></path></svg>
</a>
</div>

<div class="landing-footer-legal-bar">
<span class="copyright-item">© 2026 Zedda Labs</span>
<span class="legal-dot">•</span>
<a class="legal-item-link" href="mailto:zeddalabs@gmail.com" title="Send email to zeddalabs@gmail.com">
Contact Us
</a>
<span class="legal-dot">•</span>
<a class="legal-item-link" href="privacy.html">Privacy Policy</a>
<span class="legal-dot">•</span>
<a class="legal-item-link" href="cookies.html">Cookie Policy</a>
</div>
</div>
</footer>
