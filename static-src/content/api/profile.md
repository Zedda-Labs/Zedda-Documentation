# zedda.profile()

```python
zedda.profile(
    path,
    sample_size=None,
    correlate=False,
) -> DatasetProfile
```

Scan and print a full Rich terminal EDA report. Returns the same [`DatasetProfile`](#api/dataset-profile) as [`scan()`](#api/scan).

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `path`              | `str` / `Path` / `pandas.DataFrame` / `polars.DataFrame` | _(required)_ | Input dataset |
| `sample_size` | `int` or `None`                       | `None`               | Sample size in rows. `None` = scan whole file (auto-samples 2M rows if file > 1 GB). |
| `correlate`      | `bool`                                            | `False`              | Force O(N²) correlation even when numeric cols > 50. |

## Returns

A `DatasetProfile`. Identical to what `scan()` returns.

## Output

`profile()` prints (in order):

1. Dataset overview panel
2. Data quality score (0–100)
3. Per-column table
4. Smart warnings
5. Pearson correlation alerts (|r| ≥ 0.7)

If `correlation_skipped` is true on the result, a yellow warning is printed after the report.

## Example

```python
import zedda as zd

zd.profile("data.csv")

# Force correlation on a wide dataset
zd.profile("wide.csv", correlate=True)

# Sample a huge Parquet file
zd.profile("huge.parquet", sample_size=200_000)
```

## Difference from `scan()`

| Aspect | `scan()` | `profile()` |
|---|---|---|
| Returns `DatasetProfile`   | Yes | Yes |
| Prints terminal report               | No  | Yes |
| Accepts `allowed_dir`                  | Yes | No  |
| Accepts `sample_size` / `correlate` | Yes | Yes |

`profile()` is meant for interactive use. For CI/CD or notebooks, prefer `scan()` and read attributes off the returned object.

## See also

- [`scan()`](#api/scan) — silent variant.
- [Profiling guide](#guides/profiling) — practical walkthrough.
- [DatasetProfile](#api/dataset-profile) — the return type.
