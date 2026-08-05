# Development Setup

This page covers cloning, building, testing, and contributing to Zedda. For the public install path, see [Installation](#installation).

## Prerequisites

- **Python** 3.9–3.14 (not cp313t)
- **C++17 compiler** — GCC ≥ 9, Clang ≥ 10, or MSVC ≥ 2019
- **CMake** ≥ 3.21
- **Ninja** (recommended)
- **Git** (with submodule support)

## Clone with submodules

```bash
git clone https://github.com/Zedda-Labs/Zedda.git --recursive
cd Zedda
```

The `--recursive` flag is required because Zedda vendors two submodules:

- `extern/nanobind` — C++ → Python bindings
- `extern/thread-pool` — BS::thread_pool (also vendored at `include/zedda/BS_thread_pool.hpp`)

If you forgot `--recursive`:

```bash
git submodule update --init --recursive
```

## Install build dependencies

```bash
pip install cmake ninja
```

## Editable install with dev extras

```bash
pip install -e ".[dev]"
```

The `[dev]` extra installs:

- `pytest`, `pytest-cov` — testing + coverage
- `pandas`, `numpy`, `polars` — for DataFrame input tests
- `ruff`, `mypy`, `types-requests` — lint + typecheck
- `pre-commit` — git hooks
- `cibuildwheel` — for building release wheels

## Run the tests

```bash
pytest tests/
```

The test suite has 222+ tests across:

- 9 C++ test executables in `tests/cpp/` (registered with `add_test()` for ctest, CI-C3 fix)
- 17 Python pytest files in `tests/python/`
- 1 fuzz harness in `tests/fuzz/` (libFuzzer, built only with `-DZEDDA_BUILD_FUZZERS=ON`)
- 2 standalone Python test scripts in `tests/` (`test_phase3.py`, `test_hotfix_0_4_5.py`)

For C++ tests only:

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
cd build && ctest --output-on-failure
```

## Pre-commit hooks

Install once:

```bash
pre-commit install
```

The hooks (defined in `.pre-commit-config.yaml`) run on every commit:

- **pre-commit-hooks v5.0.0** — trailing whitespace, EOF newline, YAML / TOML / merge-conflict / large-file checks
- **ruff-pre-commit v0.9.1** — lint + format
- **mirrors-mypy v1.13.0** — type check
- **mirrors-clang-format v19.1.0** — C++ formatting

To run all hooks manually:

```bash
pre-commit run --all-files
```

See [Coding Standards](#contributing/standards) for the lint / typecheck / format rules.

## CMake build options

| Option | Default | Effect |
|---|---|---|
| `CMAKE_BUILD_TYPE`                                   | `Release` (if unset) | Build type — `Release` enables LTO via `check_ipo_supported()` (PERF-2) |
| `ZEDDA_BUILD_FUZZERS`                          | `OFF`                  | Build the libFuzzer harness with `-fsanitize=fuzzer,address` |
| `FETCHCONTENT_UPDATES_DISCONNECTED` | `ON`                 | scikit-build-core sets this to avoid re-fetching nanobind on every build |
| `MACOSX_DEPLOYMENT_TARGET`              | `10.14`              | Forced to 10.14 for C++17 aligned allocation required by nanobind |

## Build a wheel locally

```bash
pip install build
python -m build --wheel
```

The wheel will be in `dist/`. For cross-platform / cross-Python wheels, the project uses `cibuildwheel` in CI — see [`.github/workflows/release.yml`](https://github.com/Zedda-Labs/Zedda/blob/main/.github/workflows/release.yml).

## Docker dev environment

A multi-stage Dockerfile is provided:

```bash
docker build -t zedda-dev .
docker run --rm -it -v "$PWD:/src" zedda-dev bash
```

The builder stage uses `python:3.14-slim` + build-essential + cmake + ninja + git. The runtime stage is ~200 MB and runs as a non-root user (`zedda`, uid 1000, CI-H4).

## Running CI checks locally

The CI pipeline (defined in [`.github/workflows/ci.yml`](https://github.com/Zedda-Labs/Zedda/blob/main/.github/workflows/ci.yml)) runs these checks:

```bash
# Lint
ruff check .

# Typecheck
mypy python/zedda

# C++ format check
clang-format --dry-run --Werror src/**/*.cpp include/zedda/**/*.hpp

# Tests
pytest tests/

# C++ tests
cmake -S . -B build && cmake --build build && (cd build && ctest)

# Coverage
pytest --cov=zedda --cov-fail-under=55 tests/
```

The `fail_under=55` threshold is in `.coveragerc`; the comment notes the target is 70% after the `__init__.py` delegation refactor is complete.

## Filing issues and PRs

- Bug reports and feature requests: use the [issue templates](https://github.com/Zedda-Labs/Zedda/issues/new/choose) (\.github/ISSUE_TEMPLATE/`)
- Pull requests: follow the [PR template](https://github.com/Zedda-Labs/Zedda/blob/main/.github/PULL_REQUEST_TEMPLATE.md)
- Code ownership: see [`.github/CODEOWNERS`](https://github.com/Zedda-Labs/Zedda/blob/main/.github/CODEOWNERS) — `@tirthpatel90` and `@prince3235` own the core

See [CONTRIBUTING.md](https://github.com/Zedda-Labs/Zedda/blob/main/CONTRIBUTING.md) for the full contributor guide and [Code of Conduct](https://github.com/Zedda-Labs/Zedda/blob/main/CODE_OF_CONDUCT.md) (Contributor Covenant 2.1, contact `zeddalabs@gmail.com`).

## See also

- [Coding Standards](#contributing/standards) — ruff, mypy, clang-format rules.
- [Project Structure](#contributing/structure) — directory layout.
- [Releasing](#contributing/releasing) — the 6-step release process.
