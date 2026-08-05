# zedda.scan()

```python
zedda.scan(
    path,
    sample_size=None,
    allowed_dir=None,
    correlate=False,
) -> DatasetProfile
```

Scan a dataset silently. Returns a [`DatasetProfile`](#api/dataset-profile) without printing anything. The C++ engine releases the GIL for the duration of the scan.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `path`                  | `str` / `Path` / `pandas.DataFrame` / `polars.DataFrame` | _(required)_ | Input dataset |
| `sample_size`     | `int` or `None`                       | `None`               | Sample size in rows. `None` scans the whole file (auto-samples 2M rows if file > 1 GB). |
| `allowed_dir`     | `str` / `Path` or `None`         | `None`               | If set, the resolved input path must live inside this directory. Uses `Path.relative_to()` (not `str.startswith()`) — defeats path-traversal attacks. |
| `correlate`           | `bool`                                            | `False`              | Force O(N²) correlation even when numeric cols > 50. |

## Returns

A `DatasetProfile` — see [DatasetProfile](#api/dataset-profile) for the full attribute list. The returned object is wrapped in a `DatasetProfileWrapper` that adds `__repr__`, `to_dict()`, and `to_json()`.

## Raises

[`ZeddaError`](#api/zedda-error) for:

- Missing file
- Empty file (0 bytes)
- Unsupported extension (only `.csv`, `.parquet`, `.arrow`, `.feather` accepted)
- Missing `pyarrow` for Parquet / Arrow / Feather input
- Path traversal violation (when `allowed_dir` is set and the path escapes it)
- Null bytes in the path string
- Scan errors from the C++ engine

## Example

```python
import zedda as zd

result = zd.scan("data.csv")
print(result.num_rows, result.num_cols, result.overall_null_pct)

# Auto-sampled scan of a huge Parquet file
result = zd.scan("huge.parquet", sample_size=500_000)
print(result.is_sampled)  # True

# Lock scan to a directory
result = zd.scan("uploads/file.csv", allowed_dir="/var/app/uploads")
```

## Path safety

`scan()` enforces two path-safety rules (SEC-P02):

1. **Null-byte rejection.** If the path string contains a `\0`, `ZeddaError` is raised immediately.
2. **Symlink resolution.** Symlinks are resolved before the `allowed_dir` check. This prevents symlink-based escapes.

## Auto-sampling

If `sample_size` is set, Zedda samples that many rows. If `sample_size` is `None` (the default) **and** the file size exceeds 1 GB, Zedda auto-samples 2,000,000 rows and sets `result.is_sampled = True`. To force a full scan of a >1 GB file, pass `sample_size=None` explicitly — but be aware that this may take a long time.

## See also

- [`profile()`](#api/profile) — same engine, prints a full report.
- [`collect_warnings()`](#api/collect-warnings) — silent structured warnings.
- [DatasetProfile](#api/dataset-profile) — the return type.
