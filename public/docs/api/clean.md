# zedda.clean()

```python
zedda.clean(
    path,
    output=None,
    sample_size=None,
) -> pandas.DataFrame | None
```

Auto-clean a dataset with backup, audit trail, and one-call undo. This is the safe, autonomous variant of [`fix(apply=True)`](#api/fix).

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `path`              | `str` / `Path` / `DataFrame` | _(required)_ | Input dataset |
| `output`        | `str` / `Path` or `None`  | `None`                | Where to write the cleaned file. `None` = overwrite the input path (after backup). For DataFrame input with `output=None`, no file is written. |
| `sample_size` | `int` or `None`                       | `None`                | Sample size in rows for the underlying scan |

## Returns

- File input, `output` set     → `None` (file written to `output`)
- File input, `output=None` → `None` (input file overwritten after backup)
- DataFrame input, `output=None` → `pandas.DataFrame` (cleaned, no file written)
- DataFrame input, `output` set     → `pandas.DataFrame` (cleaned, file also written)

## Lifecycle

1. **Backup.** Writes `{path}.zedda-backup` next to the original. Idempotent — if a backup already exists, Zedda uses the existing one.
2. **Profile.** Runs a full scan to detect every auto-fixable warning.
3. **Apply fixes.** Same logic as `fix(apply=True)`, plus optional fuzzy typo clustering if `[clean]` extra is installed.
4. **Write cleaned file.** (Unless input was a DataFrame and `output=None`.)
5. **Write audit trail.** JSON file at `{output_dir}/{stem}_cleaning_audit.json`. Audit-path traversal is checked — the audit file must live in the same directory as the output.
6. **Return.** `None` or `DataFrame` per the rules above.

## zd.clean.undo()

```python
zedda.clean.undo(path)
```

Restores from the `.zedda-backup`. Raises [`ZeddaError`](#api/zedda-error) if no backup exists. Also importable as `zedda._clean_undo(path)`.

## Example

```python
import zedda as zd

# Clean a file in place (backup written automatically)
zd.clean("data.csv")
# data.csv is now cleaned; data.csv.zedda-backup holds the original

# Restore
zd.clean.undo("data.csv")

# Custom output path
zd.clean("data.csv", output="clean.csv")
# clean.csv is the cleaned version; clean_cleaning_audit.json records every fix

# Clean a DataFrame
import pandas as pd
df = pd.read_csv("data.csv")
cleaned = zd.clean(df)
print(cleaned.shape)
```

## The audit trail

`{stem}_cleaning_audit.json` records, for every fix applied:

- Column name
- Issue category (e.g. `missing_values`, `outliers`, `id_column`)
- Action taken (e.g. `fillna_median`, `clip_99th_percentile`, `drop`)
- Count of affected rows
- Timestamp

## What `clean()` does not do

- It does not deduplicate rows.
- It does not join columns from other datasets.
- It does not infer or fix datetime parsing errors.
- It does not run the `[ai]` LLM. Install `[clean]` for fuzzy typo clustering only.

## See also

- [Cleaning & Fixing guide](#guides/cleaning) — practical walkthrough.
- [`fix()`](#api/fix) — generate code only, no mutation.
- [`collect_warnings()`](#api/collect-warnings) — see what `clean()` will fix before running it.
