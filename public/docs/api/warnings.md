# zedda.warnings()

```python
zedda.warnings(
    path,
    sample_size=None,
    correlate=False,
) -> None
```

Print every data quality warning ranked by severity, with inline fix code and a copy-paste block at the end. Returns `None`.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `path`              | `str` / `Path` / `DataFrame` | _(required)_ | Input dataset |
| `sample_size` | `int` or `None`                       | `None`               | Sample size in rows |
| `correlate`      | `bool`                                            | `False`              | Force O(N²) correlation |

## Returns

`None`. `warnings()` is print-first. For programmatic access, use [`collect_warnings()`](#api/collect-warnings).

## Warning categories

Zedda detects warnings in these categories:

| Category | Example |
|---|---|
| High nulls        | A column has > 50% nulls |
| Constant column   | A column has zero variance (every non-null value identical) |
| Outliers              | A numeric column passes the outlier heuristic (mean > 0, val_max > 10×mean, etc.) |
| ID column             | A column has very high cardinality relative to row count |
| High-cardinality string | A string column has very high cardinality (likely free-text) |
| Skewed                  | A numeric column has |skewness| > 3 |
| High kurtosis        | A numeric column has kurtosis > 7 (heavy-tailed) |
| Correlated              | A pair of numeric columns has |r| ≥ 0.7 |

The outlier heuristic in `zedda._warnings.is_outlier_column`:

- Numeric column
- mean > 0
- unique > 5
- val_max > 10
- val_max > 10 × mean
- column name does not contain "ratio" or "pct"
- mean ≥ 2.0
- not a small-int categorical (unique < 15 with val_min ≥ 0)
- not a 0..unique+5 bounded integer

## Severity levels

Each warning has a severity:

- `critical` — high-nulls, ID columns, missing-target
- `warning`  — outliers, high-cardinality strings, skewed, high kurtosis
- `info`       — correlated pairs, constant columns

## Example

```python
import zedda as zd

zd.warnings("data.csv")
```

## See also

- [`collect_warnings()`](#api/collect-warnings) — programmatic variant returning `list[dict]`.
- [`fix()`](#api/fix) — generate pandas code to address the warnings.
- [`ml_ready()`](#api/ml-ready) — score the dataset for ML training.
