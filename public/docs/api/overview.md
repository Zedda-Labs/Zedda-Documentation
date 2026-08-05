# Python API Overview

The Zedda Python package exposes a small, flat API. Every public function is a top-level attribute of `zedda` (typically imported as `zd`).

```python
import zedda as zd
```

## Public API surface

```python
__all__ = [
    "profile", "scan", "compare", "ml_ready", "warnings", "fix", "clean",
    "merge", "ask", "report", "export", "collect_warnings",
    "ZeddaError", "__version__",
]
```

| Function | Returns | Prints | Purpose |
|---|---|---|---|
| [`scan()`](#api/scan)             | `DatasetProfile`           | No      | Silent scan |
| [`profile()`](#api/profile)       | `DatasetProfile`           | Yes     | Scan + Rich report |
| [`compare()`](#api/compare)       | `None`                       | Yes     | Schema + distribution diff |
| [`ml_ready()`](#api/ml-ready)     | `None`                       | Yes     | ML readiness score + fix block |
| [`warnings()`](#api/warnings)     | `None`                       | Yes     | Ranked warning list |
| [`collect_warnings()`](#api/collect-warnings) | `list[dict]`  | No      | Programmatic warnings |
| [`fix()`](#api/fix)               | `None` or `DataFrame`  | Yes     | Generate or apply fix code |
| [`clean()`](#api/clean)           | `DataFrame` or `None`  | Yes     | Auto-clean with backup + audit |
| [`merge()`](#api/merge)           | `DataFrame`               | Yes     | Combine multiple files |
| [`ask()`](#api/ask)               | `str` or `None`           | Configurable | Plain-English Q&A |
| [`report()`](#api/report)         | `str` (path)               | No      | Self-contained HTML report |
| [`export`](#api/report)           | `str` (path)               | No      | Alias of `report()` |

## Module constants

```python
zedda.__version__   # "0.4.8"
zedda.__author__    # "zedda contributors"
```

## Accepted input types

Every function that takes a `path` argument also accepts:

- `str` — file path
- `pathlib.Path` — file path
- `pandas.DataFrame` — written to a temporary Parquet file (requires `[parquet]` extra)
- `polars.DataFrame` — written via polars' own Arrow writer (no extra needed)

Accepted file extensions: `.csv`, `.parquet`, `.arrow`, `.feather`. The latter three require `pyarrow` (install with `pip install "zedda[parquet]"`).

## Exceptions

All user-facing errors raise [`ZeddaError`](#api/zedda-error). Catch this for bad paths, unsupported extensions, missing dependencies, and scan errors.

```python
from zedda import ZeddaError

try:
    zd.scan("missing.csv")
except ZeddaError as e:
    print(f"scan failed: {e}")
```

## Internal modules

The package is organised into internal modules. These are importable but **not** in `__all__`:

| Module | Responsibility |
|---|---|
| `zedda._constants`   | Arrow struct sizes, ASK allowlists, AI config |
| `zedda._format`        | Number / CI / scan-time formatting, quality label, safe column name |
| `zedda._warnings`    | Issue detection + `collect_warnings()` |
| `zedda._resolve`      | Input resolution (path / DataFrame → file) |
| `zedda._scan`            | `count_lines()` + `scan_arrow()` |
| `zedda._compare`     | Schema diff, distribution shift, verdict |
| `zedda._ml_ready`  | ML readiness scoring |
| `zedda._fix`               | Fix-code generation + apply |
| `zedda._clean`           | Backup, cleaning, audit trail, undo |
| `zedda._merge`          | Schema check, overlap, combine |
| `zedda._ask`                | Offline question patterns |
| `zedda.ai_insights`  | `get_insights()` for `zedda run --ai` |
| `zedda.report`            | `render_html()` + `report()` |

The native C++ extension is imported as `zedda.fasteda_core` (the legacy name; will become `zedda_core` in v0.6.0). You normally do not need to import it directly.

## Common arguments

Several arguments appear on multiple functions:

| Argument | Type | Default | Meaning |
|---|---|---|---|
| `path`                 | `str` / `Path` / `DataFrame` | _(required)_ | Input dataset |
| `sample_size`    | `int` or `None`                       | `None`                | Sample size in rows. `None` = scan whole file (auto-samples 2M rows if file > 1 GB). |
| `correlate`        | `bool`                                            | `False`               | Force O(N²) correlation even when numeric cols > 50. |

## Next steps

- [DatasetProfile](#api/dataset-profile) — every attribute of the profile object.
- [ZeddaError](#api/zedda-error) — when and why it is raised.
- [Guides](#guides/profiling) — practical walkthroughs.
