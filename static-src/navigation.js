/**
 * Zedda documentation navigation tree.
 *
 * Every section here corresponds to actual content in the Zedda repository
 * (audited at commit f969fe7, tag v0.4.8). No invented sections.
 *
 * URLs use .html extension for maximum static-host compatibility
 * (GitHub Pages, Netlify, S3, etc. all serve .html files directly).
 */

const navigation = [
  {
    type: "leaf",
    id: "home",
    label: "Home",
    title: "Zedda",
    description: "Zero Effort Data Discovery & Analytics",
    get url() { return "index.html"; },
  },
  {
    type: "group",
    id: "getting-started",
    label: "Getting Started",
    defaultOpen: true,
    children: [
      {
        type: "leaf",
        id: "introduction",
        label: "Introduction",
        title: "Introduction",
        description: "What Zedda is, what it does, and when to use it.",
        get url() { return "introduction.html"; },
      },
      {
        type: "leaf",
        id: "installation",
        label: "Installation",
        title: "Installation",
        description: "Install Zedda via pip on Linux, macOS, Windows, and Python 3.9–3.14.",
        get url() { return "installation.html"; },
      },
      {
        type: "leaf",
        id: "quickstart",
        label: "Quick Start",
        title: "Quick Start",
        description: "Profile, scan, compare, clean, and ask questions about your data in under a minute.",
        get url() { return "quickstart.html"; },
      },
    ],
  },
  {
    type: "group",
    id: "guides",
    label: "Guides",
    defaultOpen: true,
    children: [
      {
        type: "leaf",
        id: "guides/profiling",
        label: "Profiling Datasets",
        title: "Profiling Datasets",
        description: "Use zd.profile and zd.scan to produce EDA reports in the terminal or as structured data.",
        get url() { return "guides/profiling.html"; },
      },
      {
        type: "leaf",
        id: "guides/comparing",
        label: "Comparing Datasets",
        title: "Comparing Datasets",
        description: "Detect schema drift, distribution shift, and missing columns between two datasets.",
        get url() { return "guides/comparing.html"; },
      },
      {
        type: "leaf",
        id: "guides/cleaning",
        label: "Cleaning & Fixing",
        title: "Cleaning & Fixing",
        description: "Generate copy-paste pandas fix code or let Zedda auto-clean with backups and audit trails.",
        get url() { return "guides/cleaning.html"; },
      },
      {
        type: "leaf",
        id: "guides/ml-readiness",
        label: "ML Readiness",
        title: "ML Readiness",
        description: "Score how ready a dataset is for ML training and get a copy-paste fix block.",
        get url() { return "guides/ml-readiness.html"; },
      },
      {
        type: "leaf",
        id: "guides/ai-qa",
        label: "AI Q&A",
        title: "AI Q&A",
        description: "Ask plain-English questions about a dataset. Offline patterns first, optional LLM fallback.",
        get url() { return "guides/ai-qa.html"; },
      },
      {
        type: "leaf",
        id: "guides/reports",
        label: "HTML Reports",
        title: "HTML Reports",
        description: "Generate self-contained, offline HTML EDA reports with zero external network requests.",
        get url() { return "guides/reports.html"; },
      },
    ],
  },
  {
    type: "leaf",
    id: "cli",
    label: "CLI Reference",
    title: "CLI Reference",
    description: "The zedda command-line tool — 11 subcommands for profiling, scanning, fixing, cleaning, merging, and more.",
    get url() { return "cli.html"; },
  },
  {
    type: "group",
    id: "api",
    label: "Python API",
    defaultOpen: true,
    children: [
      {
        type: "leaf",
        id: "api/overview",
        label: "Overview",
        title: "Python API Overview",
        description: "The 11 public functions in zedda, plus ZeddaError and DatasetProfileWrapper.",
        get url() { return "api/overview.html"; },
      },
      {
        type: "leaf",
        id: "api/scan",
        label: "scan()",
        title: "zedda.scan()",
        description: "Silent dataset scan — returns a DatasetProfile without printing.",
        get url() { return "api/scan.html"; },
      },
      {
        type: "leaf",
        id: "api/profile",
        label: "profile()",
        title: "zedda.profile()",
        description: "Scan and print a full Rich terminal EDA report.",
        get url() { return "api/profile.html"; },
      },
      {
        type: "leaf",
        id: "api/compare",
        label: "compare()",
        title: "zedda.compare()",
        description: "Compare two datasets for schema drift, distribution shift, and target-column health.",
        get url() { return "api/compare.html"; },
      },
      {
        type: "leaf",
        id: "api/ml-ready",
        label: "ml_ready()",
        title: "zedda.ml_ready()",
        description: "Score ML readiness (0–100) and emit a copy-paste fix block.",
        get url() { return "api/ml-ready.html"; },
      },
      {
        type: "leaf",
        id: "api/warnings",
        label: "warnings()",
        title: "zedda.warnings()",
        description: "Print every data quality warning, severity-ranked, with inline fix code.",
        get url() { return "api/warnings.html"; },
      },
      {
        type: "leaf",
        id: "api/collect-warnings",
        label: "collect_warnings()",
        title: "zedda.collect_warnings()",
        description: "Programmatic warnings — returns a structured list of dicts for CI/CD pipelines.",
        get url() { return "api/collect-warnings.html"; },
      },
      {
        type: "leaf",
        id: "api/fix",
        label: "fix()",
        title: "zedda.fix()",
        description: "Generate copy-paste pandas fix code, or apply fixes in place.",
        get url() { return "api/fix.html"; },
      },
      {
        type: "leaf",
        id: "api/clean",
        label: "clean()",
        title: "zedda.clean()",
        description: "Auto-clean a dataset with backup, audit trail, and one-call undo.",
        get url() { return "api/clean.html"; },
      },
      {
        type: "leaf",
        id: "api/merge",
        label: "merge()",
        title: "zedda.merge()",
        description: "Combine multiple files with schema validation, duplicate detection, and drift flagging.",
        get url() { return "api/merge.html"; },
      },
      {
        type: "leaf",
        id: "api/ask",
        label: "ask()",
        title: "zedda.ask()",
        description: "Plain-English question answering with offline patterns + optional LLM fallback.",
        get url() { return "api/ask.html"; },
      },
      {
        type: "leaf",
        id: "api/report",
        label: "report()",
        title: "zedda.report()",
        description: "Generate a self-contained offline HTML EDA report.",
        get url() { return "api/report.html"; },
      },
      {
        type: "leaf",
        id: "api/zedda-error",
        label: "ZeddaError",
        title: "ZeddaError",
        description: "Base exception class for all user-facing Zedda errors.",
        get url() { return "api/zedda-error.html"; },
      },
      {
        type: "leaf",
        id: "api/dataset-profile",
        label: "DatasetProfile",
        title: "DatasetProfile",
        description: "The profile object returned by scan() and profile() — every attribute documented.",
        get url() { return "api/dataset-profile.html"; },
      },
    ],
  },
  {
    type: "group",
    id: "cpp-api",
    label: "C++ API",
    defaultOpen: true,
    children: [
      {
        type: "leaf",
        id: "cpp-api/overview",
        label: "Overview",
        title: "C++ API Overview",
        description: "Headers under include/zedda/ — namespace zedda, C++17, no external runtime deps.",
        get url() { return "cpp-api/overview.html"; },
      },
      {
        type: "leaf",
        id: "cpp-api/column-accumulator",
        label: "ColumnAccumulator",
        title: "ColumnAccumulator",
        description: "Welford online accumulator for column statistics (mean, variance, skewness, kurtosis).",
        get url() { return "cpp-api/column-accumulator.html"; },
      },
      {
        type: "leaf",
        id: "cpp-api/correlation-engine",
        label: "CorrelationEngine",
        title: "Correlation Engine",
        description: "Online covariance accumulator and Pearson r computation.",
        get url() { return "cpp-api/correlation-engine.html"; },
      },
      {
        type: "leaf",
        id: "cpp-api/profile-result",
        label: "ProfileResult",
        title: "ProfileResult",
        description: "ColumnProfile and DatasetProfile structs — the finalized scan output.",
        get url() { return "cpp-api/profile-result.html"; },
      },
      {
        type: "leaf",
        id: "cpp-api/hyperloglog",
        label: "HyperLogLog",
        title: "HyperLogLog",
        description: "14-bit HLL cardinality estimator with merge support (16 KB memory).",
        get url() { return "cpp-api/hyperloglog.html"; },
      },
      {
        type: "leaf",
        id: "cpp-api/mmap-reader",
        label: "MmapFile",
        title: "MmapFile",
        description: "Cross-platform RAII memory-mapped file reader (POSIX + Win32).",
        get url() { return "cpp-api/mmap-reader.html"; },
      },
      {
        type: "leaf",
        id: "cpp-api/simd-scanner",
        label: "SimdScanner",
        title: "SIMD Scanner",
        description: "AVX2 / AVX-512 / scalar CSV field scanner with runtime CPU dispatch.",
        get url() { return "cpp-api/simd-scanner.html"; },
      },
      {
        type: "leaf",
        id: "cpp-api/stream-reader",
        label: "CsvStreamReader",
        title: "CsvStreamReader",
        description: "Constant-memory chunked CSV reader with configurable delimiter, quote, and null string.",
        get url() { return "cpp-api/stream-reader.html"; },
      },
      {
        type: "leaf",
        id: "cpp-api/profile-builder",
        label: "ProfileBuilder",
        title: "ProfileBuilder",
        description: "Multi-threaded orchestrator — builds a DatasetProfile from a CSV file.",
        get url() { return "cpp-api/profile-builder.html"; },
      },
      {
        type: "leaf",
        id: "cpp-api/arrow-profiler",
        label: "ArrowProfiler",
        title: "ArrowProfiler",
        description: "Profile datasets from Arrow batches via the Arrow C Data Interface.",
        get url() { return "cpp-api/arrow-profiler.html"; },
      },
      {
        type: "leaf",
        id: "cpp-api/parsing-utils",
        label: "Parsing Utils",
        title: "Parsing Utilities",
        description: "fast_atod, fast_is_null, fast_detect_type, fast_parse_bool.",
        get url() { return "cpp-api/parsing-utils.html"; },
      },
    ],
  },
  {
    type: "leaf",
    id: "configuration",
    label: "Configuration",
    title: "Configuration",
    description: "Environment variables Zedda reads at runtime — ZEDDA_AI_KEY, ZEDDA_AI_ENDPOINT, ZEDDA_FORCE_SCALAR.",
    get url() { return "configuration.html"; },
  },
  {
    type: "leaf",
    id: "architecture",
    label: "Architecture",
    title: "Architecture",
    description: "How the C++17 streaming engine works — Welford, HyperLogLog, SIMD, mmap, Arrow.",
    get url() { return "architecture.html"; },
  },
  {
    type: "leaf",
    id: "examples",
    label: "Examples",
    title: "Examples",
    description: "The Titanic quickstart notebook — profile, warnings, and clean in three calls.",
    get url() { return "examples.html"; },
  },
  {
    type: "leaf",
    id: "benchmarks",
    label: "Benchmarks",
    title: "Benchmarks",
    description: "Synthetic 31-column CSV at 100K and 1M rows — scalar vs SIMD pipeline timings.",
    get url() { return "benchmarks.html"; },
  },
  {
    type: "group",
    id: "contributing",
    label: "Contributing",
    defaultOpen: true,
    children: [
      {
        type: "leaf",
        id: "contributing/setup",
        label: "Development Setup",
        title: "Development Setup",
        description: "Clone, build, and test Zedda from source with CMake, Ninja, and scikit-build-core.",
        get url() { return "contributing/setup.html"; },
      },
      {
        type: "leaf",
        id: "contributing/standards",
        label: "Coding Standards",
        title: "Coding Standards",
        description: "Ruff, mypy, clang-format, and the project's pre-commit hooks.",
        get url() { return "contributing/standards.html"; },
      },
      {
        type: "leaf",
        id: "contributing/structure",
        label: "Project Structure",
        title: "Project Structure",
        description: "Directory layout — python/, src/, include/, tests/, benchmarks/, docs/.",
        get url() { return "contributing/structure.html"; },
      },
      {
        type: "leaf",
        id: "contributing/security",
        label: "Security",
        title: "Security",
        description: "Supported versions, vulnerability reporting SLA, and security hardening in place.",
        get url() { return "contributing/security.html"; },
      },
      {
        type: "leaf",
        id: "contributing/releasing",
        label: "Releasing",
        title: "Releasing",
        description: "The 6-step release process and the hotfix flow.",
        get url() { return "contributing/releasing.html"; },
      },
    ],
  },
  {
    type: "leaf",
    id: "changelog",
    label: "Changelog",
    title: "Changelog",
    description: "All Zedda releases from 0.1.0 to 0.4.8 — Keep-a-Changelog format.",
    get url() { return "changelog.html"; },
  },
  {
    type: "leaf",
    id: "license",
    label: "License & Notices",
    title: "License & Third-Party Notices",
    description: "MIT license plus third-party notices for fast_float, nanobind, BS::thread_pool, PyArrow, Rich, Typer, requests.",
    get url() { return "license.html"; },
  },
  {
    type: "group",
    id: "legal-policies",
    label: "Legal Policies",
    defaultOpen: true,
    children: [
      {
        type: "leaf",
        id: "privacy",
        label: "Privacy Policy",
        title: "Privacy Policy",
        description: "Zedda Privacy Policy and Zero-Telemetry Local Data Safety Standards.",
        get url() { return "privacy.html"; },
      },
      {
        type: "leaf",
        id: "cookies",
        label: "Cookie Policy",
        title: "Cookie Policy",
        description: "Zedda Cookie & Local Storage Policy.",
        get url() { return "cookies.html"; },
      },
    ],
  },
];

function flattenLeaves(nodes = navigation) {
  const out = [];
  for (const n of nodes) {
    if (n.type === "leaf") out.push(n);
    else out.push(...flattenLeaves(n.children));
  }
  return out;
}

function findLeaf(id, nodes = navigation) {
  for (const n of nodes) {
    if (n.type === "leaf") {
      if (n.id === id) return n;
    } else {
      const found = findLeaf(id, n.children);
      if (found) return found;
    }
  }
  return undefined;
}

function findParentGroup(id, nodes = navigation) {
  for (const n of nodes) {
    if (n.type === "group") {
      for (const child of n.children) {
        if (child.type === "leaf" && child.id === id) return n;
        if (child.type === "group") {
          const deeper = findParentGroup(id, [child]);
          if (deeper) return deeper;
        }
      }
    }
  }
  return undefined;
}

function getPrevNext(id) {
  const flat = flattenLeaves();
  const idx = flat.findIndex((l) => l.id === id);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? flat[idx - 1] : undefined,
    next: idx < flat.length - 1 ? flat[idx + 1] : undefined,
  };
}

function groupHasLeaf(group, id) {
  for (const child of group.children) {
    if (child.type === "leaf" && child.id === id) return true;
    if (child.type === "group" && groupHasLeaf(child, id)) return true;
  }
  return false;
}

module.exports = {
  navigation,
  flattenLeaves,
  findLeaf,
  findParentGroup,
  getPrevNext,
  groupHasLeaf,
};
