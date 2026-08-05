# Cleaning & Fixing

Zedda has two complementary cleaning functions:

- [`zd.fix()`](#api/fix) — generate **copy-paste pandas code** for you to review and run yourself.
- [`zd.clean()`](#api/clean) — **apply fixes automatically** with a backup, an audit trail, and a one-call undo.

Use `fix()` when you want to understand and edit the fix logic. Use `clean()` when you trust the defaults and want a safe, reversible auto-clean.

## zd.fix() — code generation

`fix()` scans the dataset, detects issues, and prints pandas code grouped by issue type:

| Issue category | What the generated code does |
|---|---|
| Missing Values     | `fillna(median)` for numeric, `fillna(mode()[0])` for strings |
| Outliers               | Clip at the 99th percentile |
| ID Columns              | Drop the column (information-free for ML) |
| High-Cardinality Strings | Label-encode (`pd.factorize`) |
| Constant Columns   | Drop the column (zero variance) |

### Generate only

```python
import zedda as zd

zd.fix("data.csv")
```

Zedda prints the code to the terminal. You copy it into your notebook, edit as needed, and run it.

### Apply directly

```python
import zedda as zd

cleaned_df = zd.fix("data.csv", apply=True)
```

With `apply=True`, Zedda executes the fixes on a pandas DataFrame in memory and returns the cleaned DataFrame. The original file on disk is **not** modified.

::::warning
The `fix()` outlier rule is intentionally aggressive: a numeric column is flagged as having outliers if its mean > 0, unique > 5, val_max > 10, val_max > 10×mean, the name does not contain "ratio" or "pct", mean ≥ 2.0, it is not a small-int categorical (unique < 15 with val_min ≥ 0), and it is not a bounded integer. Always review the generated code before running it on production data.
::::

## zd.clean() — auto-clean with backup

`clean()` is the safe, autonomous variant. The full lifecycle:

1. **Backup.** Writes `{path}.zedda-backup` next to the original. The backup is idempotent — if a backup already exists, Zedda uses the existing one rather than overwriting it.
2. **Profile.** Runs a full scan to detect every auto-fixable warning.
3. **Apply fixes.** Applies the same logic as `fix(apply=True)` plus optional fuzzy typo clustering if the `[clean]` extra is installed.
4. **Write cleaned file.** Default output is the input path (overwrites the original — the backup is your safety net). Pass `output=` to write elsewhere.
5. **Write audit trail.** A JSON file at `{output_dir}/{stem}_cleaning_audit.json` records every fix applied, with timestamps. Audit-path traversal is checked — the audit file must live in the same directory as the output.
6. **Return.** Returns a `pandas.DataFrame` of the cleaned data (or `None` if the input was a file and `output` was a path).

### Basic usage

```python
import zedda as zd

zd.clean("data.csv")
# data.csv is now cleaned; data.csv.zedda-backup holds the original
```

### Custom output path

```python
zd.clean("data.csv", output="clean.csv")
# clean.csv is the cleaned version; data.csv.zedda-backup holds the original
# clean_cleaning_audit.json records every fix applied
```

### Undo

```python
zd.clean.undo("data.csv")
```

Restores from the `.zedda-backup`. Raises [`ZeddaError`](#api/zedda-error) if no backup exists.

::::tip
`zd.clean.undo` is a function attribute attached to `clean`. The same function is also importable as `zedda._clean_undo` for environments where attribute access is awkward.
::::

### Cleaning a DataFrame

```python
import pandas as pd
import zedda as zd

df = pd.read_csv("data.csv")
cleaned_df = zd.clean(df)  # returns a DataFrame; no file written
```

When the input is a DataFrame and `output` is `None`, no file is written — `clean()` returns the cleaned DataFrame directly. Pass `output=` to also write a file.

## The audit trail

The audit JSON records, for every fix applied:

- Column name
- Issue category (e.g. `missing_values`, `outliers`, `id_column`)
- Action taken (e.g. `fillna_median`, `clip_99th_percentile`, `drop`)
- Count of affected rows
- Timestamp

This is what makes `clean()` safe to use in recurring pipelines — every mutation is auditable.

## What `clean()` does not do

- It does not deduplicate rows. Use [`merge()`](#api/merge) for cross-file deduplication.
- It does not join columns from other datasets.
- It does not infer or fix datetime parsing errors (CSV datetime inference is not supported).
- It does not run the `[ai]` LLM. Install `[clean]` for fuzzy typo clustering only.

## Next steps

- [Python API: fix()](#api/fix) — full argument reference.
- [Python API: clean()](#api/clean) — full argument reference.
- [Warnings](#api/warnings) — the issue categories Zedda detects.
- [ML Readiness](#guides/ml-readiness) — score the cleaned dataset for ML training.
