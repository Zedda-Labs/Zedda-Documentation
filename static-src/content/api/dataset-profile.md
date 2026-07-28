# DatasetProfile

```python
class zedda.DatasetProfile  # exposed via DatasetProfileWrapper
```

The profile object returned by [`scan()`](#api/scan) and [`profile()`](#api/profile). Wraps the C++ `zedda::DatasetProfile` struct with `__repr__`, `to_dict()`, and `to_json()`.

## Dataset-level attributes

| Attribute | Type | Description |
|---|---|---|
| `file_path`                       | `str`     | Absolute path of the scanned file |
| `file_name`                     | `str`     | Base name of the scanned file |
| `num_rows`                       | `int`     | Total row count |
| `num_cols`                       | `int`     | Total column count |
| `num_numeric`                  | `int`     | Number of int/float columns |
| `num_string`                    | `int`     | Number of string/bool/datetime/unknown columns |
| `overall_null_pct`      | `float` | Overall null percentage (0.0–100.0) |
| `total_null_cells`         | `int`     | Total null cells across the dataset |
| `total_cells`                       | `int`     | Total cells (`num_rows * num_cols`) |
| `scan_time_ms`                | `float` | Scan duration in milliseconds |
| `is_sampled`                       | `bool`   | `True` if the scan was sampled |
| `columns`                              | `list[ColumnProfile]` | Per-column profiles |
| `correlations`                  | `list[CorrelationResult]` | Pairs with \|r\| ≥ 0.7 (empty if skipped) |
| `correlation_skipped`  | `bool`   | `True` if correlation was skipped (>50 numeric cols and `correlate=False`) |

## ColumnProfile attributes

Each entry in `columns` is a `ColumnProfile` with:

| Attribute | Type | Applies to | Description |
|---|---|---|---|
| `name`                              | `str`     | All              | Column name |
| `type_str`                       | `str`     | All              | `int` / `float` / `str` / `bool` / `datetime` / `unknown` |
| `total_count`                 | `int`     | All              | Total rows |
| `null_count`                  | `int`     | All              | Null cells |
| `non_null_count`      | `int`     | All              | Non-null cells |
| `unique_approx`           | `int`     | All              | HyperLogLog cardinality estimate |
| `null_pct`                          | `float` | All              | Null percentage (0.0–100.0) |
| `unique_pct`                       | `float` | All              | Unique percentage of non-null |
| `mean`                              | `float` | int/float    | Arithmetic mean |
| `stddev`                           | `float` | int/float    | Sample standard deviation |
| `variance`                       | `float` | int/float    | Sample variance |
| `skewness`                      | `float` | int/float    | Skewness (Welford M3) |
| `kurtosis`                       | `float` | int/float    | Excess kurtosis (normal == 0) |
| `val_min`                         | `float` | int/float    | Minimum value |
| `val_max`                        | `float` | int/float    | Maximum value |
| `range`                            | `float` | int/float    | `val_max - val_min` |
| `min_str_len`                | `int`     | str             | Minimum string length |
| `max_str_len`               | `int`     | str             | Maximum string length |
| `mean_str_len`            | `float` | str             | Mean string length |
| `has_high_nulls`        | `bool`   | All              | `True` if `null_pct` exceeds the high-null threshold |
| `is_constant`                | `bool`   | All              | `True` if all non-null values are identical |
| `is_high_cardinality` | `bool`   | All              | `True` if cardinality is very high relative to row count |

## CorrelationResult attributes

Each entry in `correlations` is a `CorrelationResult` with:

| Attribute | Type | Description |
|---|---|---|
| `col_a`        | `str`     | First column name |
| `col_b`        | `str`     | Second column name |
| `r`                | `float` | Pearson correlation coefficient (−1 to +1) |
| `direction`  | `str`     | `positive` or `negative` |
| `strength`   | `str`     | `weak` / `moderate` / `strong` / `very_strong` |

Correlation strength buckets:

- |r| ≥ 0.9 → `very_strong`
- |r| ≥ 0.7 → `strong`
- |r| ≥ 0.5 → `moderate`
- else      → `weak`

Only pairs with |r| ≥ 0.7 are surfaced in `correlations`.

## Methods

```python
profile.to_dict() -> dict    # full structured dump
profile.to_json()  -> str     # JSON string
str(profile)                   # __repr__ — short summary
```

## Example

```python
import zedda as zd
import json

result = zd.scan("data.csv")

# Dataset-level
print(result.num_rows, result.num_cols, result.overall_null_pct)
print(f"scanned in {result.scan_time_ms:.1f} ms")

# Per-column
for col in result.columns:
    print(f"{col.name:30s} {col.type_str:8s} nulls={col.null_pct:5.1f}%  unique={col.unique_approx}")
    if col.type_str in ("int", "float"):
        print(f"  mean={col.mean:.2f}  stddev={col.stddev:.2f}  "
              f"min={col.val_min:.2f}  max={col.val_max:.2f}  "
              f"skew={col.skewness:.2f}  kurt={col.kurtosis:.2f}")

# Correlations
for c in result.correlations:
    print(f"{c.col_a} <-> {c.col_b}: r={c.r:.3f} ({c.strength} {c.direction})")

# Serialise
print(json.dumps(result.to_dict(), indent=2))
```

## See also

- [`scan()`](#api/scan) — how to get a `DatasetProfile`.
- [C++ API: ProfileResult](#cpp-api/profile-result) — the underlying struct.
- [Architecture](#architecture) — how the profile is built.
