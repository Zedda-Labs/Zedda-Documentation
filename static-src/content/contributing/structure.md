# Project Structure

Zedda's repository is organised so that each concern has a clear home.

```
Zedda/
├── .clang-format              # C++17 Google-based, 4-space indent, 100-col
├── .coveragerc                # pytest-cov config (source=python/zedda, fail_under=55)
├── .github/                   # CI workflows, issue templates, CODEOWNERS
├── .gitmodules                # nanobind + thread-pool submodules
├── .pre-commit-config.yaml    # ruff, mypy, clang-format hooks
├── CHANGELOG.md               # Keep-a-Changelog format
├── CITATION.cff               # cff-version 1.2.0
├── CMakeLists.txt             # 286 lines — root CMake build
├── CODE_OF_CONDUCT.md         # Contributor Covenant 2.1
├── CONTRIBUTING.md            # Dev setup, project structure, coding standards
├── Dockerfile                 # Multi-stage builder + runtime (~200MB)
├── LICENSE                    # MIT
├── README.md                  # Project overview
├── RELEASING.md               # 6-step release process + hotfix flow
├── SECURITY.md                # Supported versions + 4-tier SLA
├── THIRD_PARTY_NOTICES.md     # 7 dependencies with versions/licenses/URLs
├── bump.py                    # Version-bump helper (0.4.7 → 0.4.8)
├── pyproject.toml             # scikit-build-core backend
├── benchmarks/
│   └── bench_main.cpp         # 303 lines — synthetic 31-col CSV timing
├── conda-recipe/
│   └── meta.yaml              # conda-forge-style recipe (version 0.4.5 — stale)
├── docs/                      # Existing markdown docs
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── GETTING_STARTED.md
│   ├── GUIDE.md
│   ├── logo.png               # light-mode logo
│   ├── logo-dark.png          # dark-mode logo
│   └── images/                # demo screenshots (orphaned — not referenced)
├── examples/
│   └── titanic_quickstart.ipynb
├── extern/                    # git submodules
│   ├── nanobind/              # C++ → Python bindings
│   └── thread-pool/           # BS::thread_pool (also vendored at include/zedda/)
├── include/zedda/             # Public C++ headers
│   ├── arrow_profiler.hpp
│   ├── simd_scanner.hpp
│   ├── hyperloglog.hpp
│   ├── profile_result.hpp
│   ├── parsing_utils.hpp
│   ├── correlation_engine.hpp
│   ├── stream_reader.hpp
│   ├── mmap_reader.hpp
│   ├── profile_builder.hpp
│   ├── column_accumulator.hpp
│   ├── BS_thread_pool.hpp     # vendored third-party
│   └── fast_float/            # vendored third-party v8.0.0
├── python/zedda/              # Python package
│   ├── __init__.py            # ~4,300 lines — public API + Rich rendering
│   ├── cli.py                 # ~550 lines — Typer CLI with 11 commands
│   ├── report.py              # ~870 lines — HTML report generator
│   ├── ai_insights.py         # 47 lines — get_insights() for --ai
│   ├── _constants.py          # 91 lines — Arrow sizes, ASK allowlists, AI config
│   ├── _format.py             # 95 lines — formatting helpers
│   ├── _warnings.py           # 181 lines — issue detection
│   ├── _resolve.py            # 103 lines — input resolution
│   ├── _scan.py               # 174 lines — count_lines + scan_arrow
│   ├── _compare.py            # 199 lines — schema diff, distribution shift
│   ├── _ml_ready.py           # 199 lines — ML readiness scoring
│   ├── _fix.py                # 130 lines — fix-code generation
│   ├── _clean.py              # 213 lines — backup, cleaning, audit, undo
│   ├── _merge.py              # 93 lines — schema check, combine
│   ├── _ask.py                # 176 lines — offline patterns
│   └── py.typed               # PEP 561 marker
├── src/
│   ├── bindings/
│   │   └── bindings.cpp       # 127 lines — NB_MODULE(fasteda_core)
│   └── core/
│       ├── arrow_profiler.cpp # 485 lines — Arrow C Data Interface consumer
│       ├── mmap_reader.cpp    # 221 lines — POSIX + Win32 mmap
│       ├── profile_builder.cpp# 796 lines — multi-threaded orchestrator
│       ├── simd_scanner.cpp   # 324 lines — AVX2/AVX-512 + dispatch
│       └── stream_reader.cpp  # 758 lines — CSV streaming engine
└── tests/
    ├── cpp/                   # 9 C++ test executables
    ├── python/                # 17 pytest files
    ├── fuzz/
    │   └── fuzz_csv_parser.cpp # libFuzzer harness
    ├── test_phase3.py         # integration smoke test
    └── test_hotfix_0_4_5.py   # regression tests for v0.4.5 hotfixes
```

## Key files at a glance

| File | Lines | Purpose |
|---|---|---|
| `python/zedda/__init__.py`                | ~4,300 | Public Python API + Rich rendering layer |
| `python/zedda/cli.py`                              | ~550     | Typer CLI with 11 commands |
| `python/zedda/report.py`                          | ~870     | HTML report generator |
| `src/core/profile_builder.cpp`              | 796     | Multi-threaded orchestrator |
| `src/core/stream_reader.cpp`                    | 758     | CSV streaming engine |
| `src/core/arrow_profiler.cpp`                | 485     | Arrow C Data Interface consumer |
| `src/core/simd_scanner.cpp`                       | 324     | AVX2 / AVX-512 + dispatch |
| `src/core/mmap_reader.cpp`                       | 221     | POSIX + Win32 mmap |
| `src/bindings/bindings.cpp`                    | 127     | nanobind NB_MODULE(fasteda_core) |
| `CMakeLists.txt`                                          | 286     | Root CMake build |

## Where things live

- **Adding a new public Python function?** Put it in `python/zedda/__init__.py` and add it to `__all__`. Delegate the heavy logic to a new `python/zedda/_your_module.py`.
- **Adding a new CLI command?** Add a `@app.command()` function in `python/zedda/cli.py`.
- **Adding a new C++ header?** Put it in `include/zedda/your_header.hpp` in namespace `zedda`. Add the source file in `src/core/your_header.cpp` and add it to `FASTEDA_SOURCES` in `CMakeLists.txt`.
- **Adding a new C++ test?** Put it in `tests/cpp/test_your_thing.cpp` and register it with `add_test()` in `CMakeLists.txt` (CI-C3).
- **Adding a new Python test?** Put it in `tests/python/test_your_thing.py`. pytest discovers it automatically.

## Audit-fix provenance

The codebase is heavily annotated with audit-fix identifiers (e.g. `FIX P-C1`, `FIX C-H1`, `FIX CI-M20`, `SEC-P02`, `ISS-016`, `Batch 7`). These appear in comments throughout `__init__.py`, `CMakeLists.txt`, workflow files, and test files.

`tests/python/test_audit_regression.py` is structured as a 1:1 mapping between these finding IDs and test classes (`TestPathTraversalPC1`, `TestFixAllNullPC3`, `TestCleanDataFramePC4`, etc.). When fixing a new audit issue, follow the same convention.

## See also

- [Development Setup](#contributing/setup) — how to build and test.
- [Coding Standards](#contributing/standards) — ruff, mypy, clang-format.
- [Architecture](#architecture) — how the pieces fit together at runtime.
