# Quick Start

This page gets you from `pip install` to a clean dataset in under a minute. Every snippet here works against the Titanic CSV — feel free to substitute your own file.

## 1. Install

```bash
pip install zedda
```

For Parquet support or pandas DataFrame input, install with the `[parquet]` extra:

```bash
pip install "zedda[parquet]"
```

## 2. Profile a file

```bash
python -c "import zedda as zd; zd.profile('https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv')"
```

Or, in a script:

```python
import zedda as zd

zd.profile("data.csv")
```

Zedda prints a Rich-formatted EDA report to the terminal: dataset overview panel, data quality score, per-column table (type, nulls, unique, mean, stddev, min, max, skewness, kurtosis), smart warnings, and Pearson correlation alerts above |r| ≥ 0.7.

## 3. Use a DataFrame instead of a path

Every function accepts a pandas or polars DataFrame directly. A file path is never required.

```python
import pandas as pd
import zedda as zd

df = pd.read_csv("data.csv")
zd.profile(df)
```

For polars:

```python
import polars as pl
import zedda as zd

df = pl.read_csv("data.csv")
zd.profile(df)
```

::::note
Passing a DataFrame writes a temporary Parquet file under the hood, so the `[parquet]` extra is required for pandas. Polars DataFrames work without the extra because polars ships its own Arrow writer.
::::

## 4. Get a silent profile for CI/CD

```python
import zedda as zd

result = zd.scan("data.csv")
print(result.num_rows, result.num_cols)
print(result.overall_null_pct)
```

`scan()` returns a [`DatasetProfile`](#api/dataset-profile) without printing anything — ideal for asserting data quality in a pipeline.

## 5. List every warning

```python
import zedda as zd

zd.warnings("data.csv")
```

This prints every issue ranked by severity (critical → warning → info), each with inline fix code, plus a copy-paste block at the end and the overall quality score.

For programmatic access in CI, use [`collect_warnings()`](#api/collect-warnings):

```python
import zedda as zd

issues = zd.collect_warnings("data.csv")
critical = [i for i in issues if i["severity"] == "critical"]
assert not critical, f"{len(critical)} critical data quality issues"
```

## 6. Compare two snapshots

```python
import zedda as zd

zd.compare("train.csv", "test.csv")
```

Zedda prints a schema diff (added, removed, type-mismatched columns), null-rate changes, distribution shifts on numeric columns, new categories in categorical columns, and a final verdict: `PASS`, `REVIEW`, or `FAIL`.

## 7. Auto-clean with a backup

```python
import zedda as zd

zd.clean("data.csv", output="clean.csv")
# To restore the original:
zd.clean.undo("data.csv")
```

`clean()` writes a `.zedda-backup` of the original file (idempotent — never overwrites an existing backup), applies every auto-fixable warning, writes the cleaned file, and writes a JSON audit trail at `clean_cleaning_audit.json` in the output directory.

## 8. Ask a plain-English question

```python
import zedda as zd

zd.ask("data.csv", "any nulls here?")
```

By default `ask()` tries four offline pattern matchers first (row count, column count, null summary, single-column stat, correlation summary). If none match and the `ZEDDA_AI_KEY` environment variable is set, it falls back to an LLM call. See [AI Q&A](#guides/ai-qa) and [Configuration](#configuration).

## 9. Export an HTML report

```python
import zedda as zd

zd.report("data.csv", output="rep.html")
```

The report is a single self-contained HTML file: inline CSS, inline SVG sparklines, zero external network requests. Safe to email or host statically.

## What you have now

You have used every top-level Zedda function. From here:

- [Guides](#guides/profiling) — deeper walkthroughs of each function with sample output.
- [Python API](#api/overview) — every argument, return type, and exception.
- [CLI](#cli) — the same functions exposed as `zedda` subcommands.
- [Architecture](#architecture) — how the C++17 engine streams terabyte-scale files in 2 MB of memory.
