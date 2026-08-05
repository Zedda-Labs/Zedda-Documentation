# Profiling Datasets

Profiling is Zedda's headline feature. One call produces a complete EDA report — types, nulls, cardinality, statistics, correlations, warnings — without loading the dataset into memory.

## Two functions, one engine

[`zd.profile()`](#api/profile) and [`zd.scan()`](#api/scan) run the same C++17 streaming engine. The only difference is the output:

| Function | Prints to terminal | Returns a profile |
|---|---|---|
| `zd.scan()`     | No (silent)               | Yes |
| `zd.profile()` | Yes — full Rich report | Yes |

Use `scan()` in CI/CD pipelines and notebooks where you want the data, not the printout. Use `profile()` in an interactive terminal when you want a first look.

## What the report contains

When you call `zd.profile(path)`, Zedda prints (in order):

1. **Dataset overview panel** — file name, row count, column count, overall null percentage, scan time, sampled-scan badge if applicable.
2. **Data quality score** — 0–100, computed from null rates, constant columns, outlier columns, and dropped-column information loss. Clamped to `[0, 100]`.
3. **Per-column table** — for each column: name, inferred type, null count + percentage, approximate unique count, and numeric stats where applicable (mean, stddev, variance, min, max, range, skewness, kurtosis). String columns show min / max / mean length.
4. **Smart warnings** — every issue detected by [`collect_warnings()`](#api/collect-warnings), sorted by severity.
5. **Pearson correlation alerts** — pairs of numeric columns with |r| ≥ 0.7, labelled `weak` / `moderate` / `strong` / `very_strong`.

If correlation was skipped (more than 50 numeric columns and `correlate=False`), Zedda prints a yellow notice and sets `result.correlation_skipped = True`.

## Inferred column types

Zedda infers a single type per column from the file contents. The possible values are:

| `type_str` | Meaning |
|---|---|
| `int`      | All non-null values parse as integers |
| `float`    | All non-null values parse as numbers (mix of int and float allowed) |
| `str`      | String column — contains values that are not parseable as numbers or booleans |
| `bool`     | Values are recognised boolean literals (`true`/`false`/`yes`/`no`/`1`/`0` etc., case-insensitive) |
| `datetime` | Arrow-inferred datetime (Parquet / Arrow input only — CSV columns are not datetime-detected) |
| `unknown`  | Arrow column with a format string Zedda does not recognise (one-time stderr warning per format) |

Type promotion is monotonic: `UNKNOWN < BOOLEAN < STRING < DATETIME < INTEGER < FLOAT`. A column with one float in a million integers is a `float` column.

## Auto-sampling on large files

If a file is larger than 1 GB and `sample_size` is not set, Zedda automatically samples 2,000,000 rows. The dataset overview panel prints a yellow `SAMPLED` badge in that case, and `result.is_sampled` is `True`.

You can force a smaller sample explicitly:

```python
import zedda as zd

result = zd.scan("huge.parquet", sample_size=500_000)
```

Set `sample_size=None` (the default) to scan the entire file regardless of size.

## Forcing correlation on wide datasets

By default, Zedda skips the O(N²) correlation matrix when a dataset has more than 50 numeric columns. To force it:

```python
import zedda as zd

result = zd.scan("wide.csv", correlate=True)
```

::::warning
Forcing `correlate=True` on a dataset with thousands of numeric columns will be slow and memory-intensive. There is also a hard cap of 1,000 numeric columns in the Arrow profiler (`MAX_CORR_COLS = 1000`) — above that, correlation is always skipped to prevent OOM.
::::

## Reading the result programmatically

Both `scan()` and `profile()` return a `DatasetProfile` object. Common attributes:

```python
import zedda as zd

result = zd.scan("data.csv")

# Dataset-level
result.num_rows              # int
result.num_cols              # int
result.overall_null_pct      # float, 0.0 - 100.0
result.scan_time_ms          # float
result.is_sampled            # bool
result.correlation_skipped   # bool

# Per-column
for col in result.columns:
    print(col.name, col.type_str, col.null_pct, col.unique_approx)
    if col.type_str in ("int", "float"):
        print("  mean=", col.mean, "stddev=", col.stddev,
              "skew=", col.skewness, "kurt=", col.kurtosis)

# Correlations (only pairs with |r| >= 0.7)
for c in result.correlations:
    print(f"{c.col_a} <-> {c.col_b}: r={c.r:.3f} ({c.strength})")
```

For the full attribute list, see [DatasetProfile](#api/dataset-profile).

## Serialising the result

```python
import json
import zedda as zd

result = zd.scan("data.csv")
json.dumps(result.to_dict(), indent=2)  # full structured dump
result.to_json()                         # JSON string
```

## Performance notes

- The CSV scanner uses AVX2 / AVX-512 when the CPU supports it; scalar fallback otherwise. Set `ZEDDA_FORCE_SCALAR=1` to force the scalar path (useful for benchmarking).
- The engine releases the Python GIL during the scan, so multi-threaded Python code keeps running.
- Memory usage is bounded by the chunk size (default 65,536 rows per chunk) plus the HyperLogLog registers (16 KB per column).
- See [Benchmarks](#benchmarks) for measured throughput on a synthetic 31-column transaction schema.

## Next steps

- [Python API: profile()](#api/profile) — every argument and return value.
- [Python API: scan()](#api/scan) — silent variant.
- [Warnings](#api/warnings) — the warning categories Zedda detects.
- [Architecture](#architecture) — Welford, HyperLogLog, and the SIMD scanner.
