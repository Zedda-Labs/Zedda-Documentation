# Installation

Zedda ships as a single Python wheel with a C++17 extension. The base install has zero native runtime dependencies — Parquet, fuzzy matching, and AI Q&A are opt-in extras.

## Requirements

- **Python** 3.9, 3.10, 3.11, 3.12, 3.13, or 3.14
- **pip** ≥ 22.3 (for abi3 wheel recognition)
- **Operating system**: Linux, macOS, or Windows

::::note
Python 3.13 free-threaded (cp313t) is **not yet supported** — use the standard Python 3.13 build.
::::

## Install from PyPI

```bash
pip install --upgrade pip                  # Ensure pip >= 22.3 for abi3 wheel recognition
pip install zedda                          # CSV only — zero native deps
pip install "zedda[parquet]"               # adds Parquet/Arrow/Feather support
pip install "zedda[clean]"                 # adds fuzzy typo detection
pip install "zedda[ai]"                    # adds AI Q&A (zd.ask with Groq/OpenAI)
pip install "zedda[parquet,clean,ai]"      # everything together
```

## What each extra gives you

| Extra | Adds | When to install |
|---|---|---|
| _(base)_ | CSV profiling, scanning, compare, fix, clean, merge, warnings, report | Always |
| `[parquet]` | `pyarrow` ≥ 14.0.1 — Parquet / Arrow / Feather input, DataFrame input | You read Parquet, or pass pandas / polars DataFrames |
| `[clean]` | `thefuzz` ≥ 0.22 — fuzzy typo detection in `zd.clean()` | You want typo clustering in auto-clean |
| `[ai]` | `requests` ≥ 2.31 — LLM fallback for `zd.ask()` and `zedda run --ai` | You want online Q&A via Groq / OpenAI-compatible endpoints |

## Platform support

| Platform | Base install | `[parquet]` extra |
|---|---|---|
| Linux x86_64 (glibc ≥ 2.17 / musl) | ✅ prebuilt wheel | ✅ prebuilt pyarrow wheel |
| Linux ARM64 (aarch64) | ✅ prebuilt wheel | ✅ prebuilt pyarrow wheel |
| macOS Intel (x86_64) | ✅ prebuilt wheel | ✅ prebuilt pyarrow wheel |
| macOS Apple Silicon (ARM64) | ✅ prebuilt wheel | ✅ prebuilt pyarrow wheel |
| Windows x86_64 | ✅ prebuilt wheel | ✅ prebuilt pyarrow wheel |
| Windows ARM64 | ✅ prebuilt wheel | ⚠️ pyarrow has no win_arm64 wheel — Parquet requires manual build |

## Conda users

::::warning
Zedda is **not yet on conda-forge**. Install via pip inside your conda environment:

```bash
conda activate myenv
pip install zedda
```
::::

## Verify the install

```bash
zedda version
```

You should see `0.4.8` (or the version you installed). To make sure the native extension loaded, run:

```bash
python -c "import zedda as zd; print(zd.__version__)"
```

## Install from source

Use this if you are contributing, debugging, or building for an unsupported platform. C++17 build tools (`cmake` and `ninja`) are required.

```bash
git clone https://github.com/Zedda-Labs/Zedda.git --recursive
cd Zedda
# C++17 build tools (cmake, ninja) are required
pip install cmake ninja
pip install -e ".[dev]"
pytest tests/
```

The `--recursive` flag is required because Zedda vendors two submodules:

- `extern/nanobind` — C++ → Python bindings
- `extern/thread-pool` — BS::thread_pool (also vendored at `include/zedda/BS_thread_pool.hpp`)

See [Development Setup](#contributing/setup) for the full contributor workflow including pre-commit hooks and CMake build options.

## Docker

A multi-arch Docker image (`linux/amd64` and `linux/arm64`) is published on every tagged release:

- `ghcr.io/zedda-labs/zedda`
- `docker.io/zeddalabs/zedda` (Docker Hub)

The runtime image is ~200 MB, runs as a non-root user (`zedda`, uid 1000), and includes a 5-minute health check.

```bash
docker run --rm -v "$PWD:/data" ghcr.io/zedda-labs/zedda:0.4.8 \
  zedda run /data/titanic.csv
```

## Troubleshooting

### `pip install` fails with a CMake error

You likely got a source tarball instead of a wheel. Make sure your pip is ≥ 22.3 and that your platform is in the support matrix above. If you are on Windows ARM64, Parquet is not available prebuilt — install the base package and skip the `[parquet]` extra.

### `ImportError: fasteda_core`

The C++ extension is named `fasteda_core` for backwards-compatibility (it will be renamed `zedda_core` in v0.6.0). If the import fails on a fresh install, your wheel did not match your Python version. Run `python -c "import sys; print(sys.version)"` and confirm it is 3.9–3.14 (not cp313t).

### Parquet raises `ZeddaError` mentioning pyarrow

Install the `[parquet]` extra: `pip install "zedda[parquet]"`. The error message itself suggests this — Zedda only requires `pyarrow` when you actually pass a `.parquet` / `.arrow` / `.feather` file or a pandas / polars DataFrame.

## Next steps

- [Quick Start](#quickstart) — profile your first dataset in 30 seconds.
- [CLI Reference](#cli) — every `zedda` subcommand.
- [Python API](#api/overview) — the 11 public functions.
