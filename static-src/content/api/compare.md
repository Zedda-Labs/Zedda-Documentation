# zedda.compare()

```python
zedda.compare(
    path_a,
    path_b,
    sample_size=None,
    correlate=False,
) -> None
```

Compare two datasets for schema drift, distribution shift, and target-column health. Prints a Rich comparison table. Returns `None`.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `path_a`           | `str` / `Path` / `DataFrame` | _(required)_ | First dataset (typically train) |
| `path_b`           | `str` / `Path` / `DataFrame` | _(required)_ | Second dataset (typically test) |
| `sample_size` | `int` or `None`                       | `None`               | Sample size in rows applied to both datasets |
| `correlate`      | `bool`                                            | `False`              | Force O(N²) correlation on each dataset |

## Returns

`None`. `compare()` is print-first.

## Output

The comparison table has five sections:

1. **Schema diff** — columns in A but missing in B (and vice versa), and type mismatches on shared columns.
2. **Null-rate changes** — for each shared column, the delta in null percentage from A to B.
3. **Distribution shift** — for each shared numeric column, the relative shift in mean from A to B. ID-like and binary-target columns are skipped. Stable if |shift| < 5%, shift if |shift| ≥ 10%.
4. **New categories** — for each shared string column, categories present in B but not in A.
5. **Verdict** — `PASS`, `REVIEW`, or `FAIL`.

## Verdict logic

| Verdict | Triggered when |
|---|---|
| `FAIL`   | Any non-target-like column missing in B, or any type mismatch on a shared column |
| `REVIEW` | Any distribution shift on a shared numeric column, or any new category in a string column |
| `PASS`   | None of the above |

A column is treated as **target-like** if its name starts with `survived`, `target`, `label`, `y`, `class`, `outcome`, `is_`, or `has_`. Target-like columns missing in B are downgraded from a `FAIL` trigger to a `REVIEW` trigger.

## Example

```python
import zedda as zd

zd.compare("train.csv", "test.csv")

# Compare two DataFrames
import pandas as pd
train = pd.read_csv("train.csv")
test = pd.read_csv("test.csv")
zd.compare(train, test)
```

## Programmatic access

`compare()` returns `None`. For CI, the underlying helpers are exposed in `zedda._compare`:

- `compute_schema_diff(profile_a, profile_b)` — returns the diff structure
- `compute_distribution_shift(profile_a, profile_b)` — returns per-column shift data
- `compute_verdict(schema_diff, distribution_shift, ...)` — returns the verdict string

## See also

- [Comparing Datasets guide](#guides/comparing) — practical walkthrough.
- [`scan()`](#api/scan) — silent profile for either side.
- [DatasetProfile](#api/dataset-profile) — the comparison works on two profiles.
