# Security

Zedda has systematic security hardening, tracked under the `SEC-*` audit IDs. This page documents the supported versions, the reporting SLA, and the hardening in place.

## Supported versions

| Version | Supported          |
|---|---|
| 0.4.x     | ✅ Yes                   |
| 0.3.x     | ❌ No (never released) |
| 0.2.x     | ❌ No                    |
| 0.1.x     | ❌ No                    |

## Reporting a vulnerability

Email security concerns to `zeddalabs@gmail.com`. Do **not** open a public GitHub issue for security reports.

## Vulnerability response SLA

| Tier | Severity | Response time |
|---|---|---|
| 1 | Critical (RCE, data exfiltration)        | 24 hours to acknowledge, 7 days to fix |
| 2 | High (sandbox escape, path traversal)    | 48 hours to acknowledge, 14 days to fix |
| 3 | Medium (info leak, DoS)                          | 72 hours to acknowledge, 30 days to fix |
| 4 | Low (hardening suggestions)                       | Best-effort |

## Hardening in place

### Path safety (SEC-P02)

[`scan()`](#api/scan) enforces two path-safety rules:

1. **Null-byte rejection.** If the path string contains a `\0`, [`ZeddaError`](#api/zedda-error) is raised immediately.
2. **Symlink resolution + `allowed_dir` check.** Symlinks are resolved before the `allowed_dir` check. The check uses `Path.relative_to()` — **not** `str.startswith()` — to defeat path-traversal attacks. `str.startswith("/var/uploads")` would also accept `/var/uploads-secret/`; `Path.relative_to()` does not.

### Column-name safety (SEC-P01)

Generated pandas fix code uses `safe_col_name()` (in `_format`) which calls `repr()` on the column name. A column named `"]; os.system("rm -rf /"); #` would be rendered as `'\'\']; os.system(\'rm -rf /\'); #'` — a valid Python string literal, not executed code.

### API key redaction (SEC-P03, SEC-P04)

API keys matching `sk-[A-Za-z0-9]{20,}` are replaced with `sk-***REDACTED***` in all error messages. The redaction is applied in the `ask()` error path and in `cli.py`.

### HTML report XSS prevention (SEC-P05)

The HTML report generator (`python/zedda/report.py`) escapes every dynamic value via the internal `_esc()` function. The test suite (`tests/python/test_report.py`) includes a regression test where a column named `<script>alert(1)</script>` is verified to be rendered as escaped text, not executed.

The report also makes **no outbound network requests** — verified by an integration test that mocks the network and asserts zero calls.

### ask() input validation (SEC-Q01 through SEC-Q07)

[`ask()`](#api/ask) validates its inputs before doing anything:

| ID | Hardening |
|---|---|
| SEC-Q01 | Path validation — extension must be in `{.csv, .parquet, .arrow, .feather}` |
| SEC-Q02 | Blocked OS roots — `/etc`, `/proc`, `/sys`, `/root`, `C:/Windows`, etc. |
| SEC-Q03 | Question sanitisation — control chars stripped |
| SEC-Q04 | Question length cap — 500 characters |
| SEC-Q05 | API key from env only — never from a file or CLI flag |
| SEC-Q06 | API key redaction in errors (SEC-P03 / SEC-P04) |
| SEC-Q07 | 10-second timeout on LLM requests |

### Memory safety (SEC-C01, SEC-C03, SEC-C07)

| ID | Hardening |
|---|---|
| SEC-C01 | `MAX_CORR_COLS = 1000` in the Arrow profiler — prevents OOM on correlation matrix |
| SEC-C03 | Defensive `n < 1` guard in the Welford update |
| SEC-C07 | Arrow pointer validation — `release != nullptr`, schema/array column-count match |

### Compiler hardening (SEC-08)

All GCC/Clang builds enable:

- `-D_FORTIFY_SOURCE=2` — buffer overflow detection in glibc
- `-fstack-protector-strong` — stack canaries
- `-fPIC` — position-independent code (required for ASLR)

### CI hardening (CI-H1, CI-H3, CI-H4)

| ID | Hardening |
|---|---|
| CI-H1 | `pypa/gh-action-pypi-publish` SHA-pinned in release workflow |
| CI-H3 | Dependency review is blocking — `fail-on-severity: high` |
| CI-H4 | Docker runs as non-root (uid 1000) |

### Continuous security testing

The CI pipeline runs:

- **CodeQL** — C++ + Python analysis, weekly and on PRs (`.github/workflows/codeql.yml`)
- **OpenSSF Scorecard** — weekly (`.github/workflows/scorecard.yml`)
- **Dependency review** — blocking, on every PR (`.github/workflows/dependency-review.yml`)
- **pip-audit** — nightly, scans installed dependencies for known CVEs (`.github/workflows/nightly.yml`)
- **Trivy** — scans Docker image on release, blocks HIGH/CRITICAL CVEs (`.github/workflows/docker.yml`)
- **libFuzzer** — 10-minute nightly fuzz of the CSV parser with ASan (`.github/workflows/fuzz.yml`)
- **ASan + UBSan** — nightly build with address + undefined behavior sanitizers (`.github/workflows/nightly.yml`)
- **TSan** — nightly build with thread sanitizer (`.github/workflows/nightly.yml`)

## See also

- [Configuration](#configuration) — `ZEDDA_AI_KEY`, `ZEDDA_FORCE_SCALAR`.
- [Python API: ZeddaError](#api/zedda-error) — what raises what.
- [SECURITY.md](https://github.com/Zedda-Labs/Zedda/blob/main/SECURITY.md) — the source-of-truth policy.
