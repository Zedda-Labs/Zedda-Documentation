/**
 * Extract markdown content from the previous turn's TypeScript content files
 * and write them as standalone .md files in static-src/content/.
 *
 * Each TS file exports DocPageContent objects with a `body` field containing
 * markdown. This script reads those files, parses out the bodies, and writes
 * them to individual .md files keyed by the navigation id.
 */

const fs = require("fs");
const path = require("path");

const SRC = "/home/z/my-project/src/lib/docs/content";
const OUT = "/home/z/my-project/static-src/content";
fs.mkdirSync(OUT, { recursive: true });

// Read all content files
const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".ts"));

// Build a map of exportName -> body by parsing each TS file
const exportBodies = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(SRC, file), "utf8");
  // Find each export: `export const NAME: DocPageContent = { body: `...` ... }`
  // The body is a template literal — we extract it by finding `body: \`` and
  // then scanning for the matching closing backtick (handling escaped \`).
  const exportRegex = /export\s+const\s+(\w+)\s*:\s*DocPageContent\s*=\s*\{/g;
  let em;
  while ((em = exportRegex.exec(content)) !== null) {
    const name = em[1];
    const afterBrace = content.slice(em.index + em[0].length);
    const bodyStart = afterBrace.indexOf("body: `");
    if (bodyStart === -1) continue;
    const literalStart = bodyStart + "body: ".length;
    // Scan for closing backtick (not escaped)
    let i = literalStart + 1; // skip opening backtick
    while (i < afterBrace.length) {
      if (afterBrace[i] === "\\") { i += 2; continue; }
      if (afterBrace[i] === "`") break;
      i++;
    }
    const body = afterBrace.slice(literalStart + 1, i);
    // Unescape \` -> ` and \\ -> \
    exportBodies[name] = body.replace(/\\`/g, "`").replace(/\\\\/g, "\\");
  }

}

console.log("Found exports:", Object.keys(exportBodies));

// Map export names to navigation IDs
const exportToId = {
  homePage: "home",
  introduction: "introduction",
  installation: "installation",
  quickstart: "quickstart",
  profiling: "guides/profiling",
  comparing: "guides/comparing",
  cleaning: "guides/cleaning",
  mlReadiness: "guides/ml-readiness",
  aiQa: "guides/ai-qa",
  reports: "guides/reports",
  cliPage: "cli",
  apiOverview: "api/overview",
  apiScan: "api/scan",
  apiProfile: "api/profile",
  apiCompare: "api/compare",
  apiMlReady: "api/ml-ready",
  apiWarnings: "api/warnings",
  apiCollectWarnings: "api/collect-warnings",
  apiFix: "api/fix",
  apiClean: "api/clean",
  apiMerge: "api/merge",
  apiAsk: "api/ask",
  apiReport: "api/report",
  apiZeddaError: "api/zedda-error",
  apiDatasetProfile: "api/dataset-profile",
  cppOverview: "cpp-api/overview",
  cppColumnAccumulator: "cpp-api/column-accumulator",
  cppCorrelationEngine: "cpp-api/correlation-engine",
  cppProfileResult: "cpp-api/profile-result",
  cppHyperLogLog: "cpp-api/hyperloglog",
  cppMmapReader: "cpp-api/mmap-reader",
  cppSimdScanner: "cpp-api/simd-scanner",
  cppStreamReader: "cpp-api/stream-reader",
  cppProfileBuilder: "cpp-api/profile-builder",
  cppArrowProfiler: "cpp-api/arrow-profiler",
  cppParsingUtils: "cpp-api/parsing-utils",
  configurationPage: "configuration",
  architecturePage: "architecture",
  examplesPage: "examples",
  benchmarksPage: "benchmarks",
  contributingSetup: "contributing/setup",
  contributingStandards: "contributing/standards",
  contributingStructure: "contributing/structure",
  contributingSecurity: "contributing/security",
  contributingReleasing: "contributing/releasing",
  changelogPage: "changelog",
  licensePage: "license",
};

let count = 0;
for (const [exportName, id] of Object.entries(exportToId)) {
  const body = exportBodies[exportName];
  if (!body) {
    console.warn(`Missing export: ${exportName} (expected for id: ${id})`);
    continue;
  }
  const outPath = path.join(OUT, `${id}.md`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, body);
  count++;
  console.log(`✓ ${id}.md`);
}

console.log(`\nWrote ${count} markdown files to ${OUT}`);
