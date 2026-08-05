# Coding Standards

Zedda enforces coding standards via `ruff` (Python lint + format), `mypy` (Python type check), and `clang-format` (C++ format). All three run as pre-commit hooks and in CI.

## Python — ruff

Configured in `pyproject.toml [tool.ruff]`:

| Setting | Value |
|---|---|
| Target Python version | `py39` |
| Line length                | 88            |
| Excludes                       | `extern/` |

Selected rule sets:

- `E` — pycodestyle errors
- `F` — pyflakes
- `W` — pycodestyle warnings
- `I` — isort
- `UP` — pyupgrade
- `B` — flake8-bugbear
- `SIM` — flake8-simplify
- `S` — flake8-bandit (security)

Notable ignores:

- `S101` — `assert` is allowed (used in tests)

Format options:

- Double quotes
- 4-space indent
- Trailing commas

Run:

```bash
ruff check .
ruff format .
```

## Python — mypy

Configured in `pyproject.toml [tool.mypy]`:

| Setting | Value |
|---|---|
| `python_version`           | `3.10` |
| `warn_return_any`            | `True`        |
| `ignore_missing_imports` | `True`        |

`ignore_missing_imports` is required because the C++ extension (`fasteda_core`) has no Python stubs.

Run:

```bash
mypy python/zedda
```

## C++ — clang-format

Configured in `.clang-format`:

| Setting | Value |
|---|---|
| Standard              | C++17                                  |
| Base style           | Google                                  |
| Indent width           | 4                                          |
| Column limit             | 100                                       |
| Pointer alignment    | Left (`int* p`)                        |
| Include sorting     | Yes                                        |

Custom brace-wrapping rules and sorted includes are also configured.

Run:

```bash
clang-format -i src/**/*.cpp include/zedda/**/*.hpp
```

Or check without modifying:

```bash
clang-format --dry-run --Werror src/**/*.cpp include/zedda/**/*.hpp
```

## Pre-commit hooks

Defined in `.pre-commit-config.yaml`:

| Hook | Version | Purpose |
|---|---|---|
| `pre-commit-hooks`            | v5.0.0              | Trailing whitespace, EOF newline, YAML / TOML / merge-conflict / large-file checks |
| `ruff-pre-commit`               | v0.9.1              | Lint + format |
| `mirrors-mypy`                   | v1.13.0         | Type check |
| `mirrors-clang-format` | v19.1.0         | C++ format |

Install once:

```bash
pre-commit install
```

Run manually:

```bash
pre-commit run --all-files
```

## Test coverage

Configured in `.coveragerc`:

| Setting | Value |
|---|---|
| Source                       | `python/zedda` |
| Branch coverage    | Enabled                   |
| `fail_under`            | `55`                       |
| Omit                          | `tests/`, `extern/`, stubs |

The comment in `.coveragerc` notes the target is 70% after the `__init__.py` delegation refactor is complete. Coverage rose from 58.2% → 66.9% across the Batch 44–63 refactoring (per CHANGELOG).

## Pytest configuration

Configured in `pyproject.toml [tool.pytest.ini_options]`:

| Setting | Value |
|---|---|
| `testpaths`        | `["tests"]` |
| `python_files` | `["test_*.py"]` |
| `addopts`              | `--tb=short -q` |

## Security rules

Beyond the lint rules, Zedda has explicit security hardening tracked under the `SEC-*` audit IDs. See [Security](#contributing/security) for the full policy.

Contributors should be aware of:

- **SEC-P01** — never interpolate column names into generated pandas code without `repr()`.
- **SEC-P02** — never use `str.startswith()` for path-traversal protection; use `Path.relative_to()`.
- **SEC-P03 / SEC-P04** — always redact API keys from error messages.
- **SEC-P05** — always escape dynamic values in the HTML report via `_esc()`.

## See also

- [Development Setup](#contributing/setup) — how to install the hooks.
- [Project Structure](#contributing/structure) — where each file lives.
- [Security](#contributing/security) — the full hardening surface.
