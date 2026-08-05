# Comparing Datasets

[`zd.compare(path_a, path_b)`](#api/compare) detects drift between two snapshots of a dataset. It is the right tool for train/test validation, recurring pipeline checks, and detecting silent schema changes.

## What it checks

A comparison runs five checks in order and prints a Rich comparison table:

1. **Schema diff** — columns present in A but missing in B, and vice versa. Also flags type mismatches on columns present in both.
2. **Null-rate changes** — for each shared column, the delta in null percentage from A to B.
3. **Distribution shift** — for each shared numeric column, the relative shift in mean from A to B. Stable if |shift| < 5%, shift if |shift| ≥ 10%. ID-like and binary-target columns are skipped.
4. **New categories** — for each shared string column, categories present in B but not in A.
5. **Verdict** — `PASS`, `REVIEW`, or `FAIL`.

## The verdict logic

The verdict is the bottom-line signal you can assert on in CI:

| Verdict | Triggered when |
|---|---|
| `FAIL`   | Any column missing in B that is not target-like, or any type mismatch |
| `REVIEW` | Any distribution shift on a shared numeric column, or any new category in a string column |
| `PASS`   | None of the above |

### Target-like columns

If a column name starts with `survived`, `target`, `label`, `y`, `class`, `outcome`, `is_`, or `has_`, it is treated as target-like. A target-like column missing in B is downgraded from a `FAIL` trigger to a `REVIEW` trigger — the assumption is that you are comparing train (with target) to test (without target).

## Example: train vs. test

```python
import zedda as zd

zd.compare("train.csv", "test.csv")
```

Typical output for a healthy train/test split:

- Schema: `PASS` (same columns)
- Null-rate delta: small (< 1%) on every shared column
- Distribution shift: stable on every shared numeric column
- New categories: none in categorical columns
- Verdict: `PASS`

Typical output for a problematic split:

- Schema: `FAIL` — column `age` is missing in test.csv
- Distribution shift: shift on `fare` (mean went from 32 to 58)
- New categories: `cabin` has 47 new categories in test
- Verdict: `FAIL`

## Comparing DataFrames

`compare()` accepts DataFrames too:

```python
import pandas as pd
import zedda as zd

train = pd.read_csv("train.csv")
test  = pd.read_csv("test.csv")
zd.compare(train, test)
```

## Forcing correlation

Like `profile()`, `compare()` accepts a `correlate=False` default that skips O(N²) correlation on wide datasets. Set `correlate=True` to force it.

```python
zd.compare("train.csv", "test.csv", correlate=True)
```

## Programmatic use

`compare()` returns `None` — it is a print-first function. For CI, wrap it in a script that captures the printed output, or use [`scan()`](#api/scan) on both files and compute your own diff using the [`_compare` module's helpers](#api/overview) (`compute_schema_diff`, `compute_distribution_shift`, `compute_verdict`).

## Next steps

- [Python API: compare()](#api/compare) — full argument reference.
- [ML Readiness](#guides/ml-readiness) — score whether a dataset is ready to train on.
- [Architecture](#architecture) — the engine internals.
