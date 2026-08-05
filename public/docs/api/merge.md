# zedda.merge()

```python
zedda.merge(
    paths,
    output="combined.csv",
    sample_size=None,
) -> pandas.DataFrame
```

Combine multiple files. Validates schema consistency, detects duplicates across files, flags distribution shifts on common numeric columns, and writes the combined file with a new `zedda_source_file` column.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `paths`            | `list` / `tuple` of paths or DataFrames | _(required)_ | At least 2 entries required |
| `output`        | `str` / `Path`                                   | `"combined.csv"` | Where to write the merged file |
| `sample_size` | `int` or `None`                                       | `None`                       | Sample size in rows for the underlying scans |

## Returns

`pandas.DataFrame` — the merged data, with a `zedda_source_file` column added to identify the originating file.

## Raises

[`ZeddaError`](#api/zedda-error) if `paths` has fewer than 2 entries.

## What it does

1. **Validate input.** `paths` must be a list/tuple of ≥2 entries.
2. **Profile each file.** Each input is scanned; files that fail to scan are skipped with a warning (fix P-H6).
3. **Schema check.** Computes schema mismatches across files — extra/missing columns are reported but do not block the merge.
4. **Detect duplicates.** Uses `pd.concat` + `duplicated` — O(N) row-wise duplicate detection across files.
5. **Flag distribution shifts.** On common numeric columns, flags if the mean shifts between files. ID-like and binary-target columns are skipped.
6. **Write combined file.** Concatenates the DataFrames and writes to `output`. A `zedda_source_file` column records the originating file name for each row.

## Example

```python
import zedda as zd

# Merge CSVs
df = zd.merge(["jan.csv", "feb.csv", "mar.csv"], output="q1.csv")
print(df.shape)
print(df["zedda_source_file"].value_counts())

# Merge DataFrames
import pandas as pd
jan = pd.read_csv("jan.csv")
feb = pd.read_csv("feb.csv")
df = zd.merge([jan, feb], output="jan_feb.csv")
```

## See also

- [CLI: zedda merge](#cli) — the command-line equivalent.
- [`scan()`](#api/scan) — what runs under the hood on each file.
- [`compare()`](#api/compare) — pair-wise comparison without merging.
