# ML Readiness

[`zd.ml_ready(path)`](#api/ml-ready) scores how ready a dataset is for ML training, from 0 to 100. It is the fastest way to answer "can I train a model on this?"

## The score

The score starts at 100 and is reduced for every issue found:

| Issue | Penalty |
|---|---|
| High-null column (>50% nulls)             | −15 per column |
| Moderate-null column (>5% nulls)          | −10 per column |
| ID-like integer or string column         | −5 per column |
| High-cardinality string column           | −3 per column |
| Constant column (zero variance)        | −2 per column |
| Outlier column                                    | −2 per column |

The score is **not** clamped to a minimum — a sufficiently broken dataset can go negative. The lower the score, the more manual cleanup you need before training.

## What the report shows

`ml_ready()` prints four sections:

1. **The score** with a visual bar.
2. **Issues Found** — every penalty, grouped by severity (critical / warning / info), each with inline fix code.
3. **Looks Good** — columns that pass the heuristics: binary target, low-cardinality categorical, clean numeric.
4. **Copy-Paste Block** — a single pandas code block at the end that you can paste into a notebook to fix every flagged issue.
5. **Recommended feature count** — "Recommended feature count: X of Y columns" — the number of columns you should keep as features after dropping IDs, constants, and high-null columns.

## What counts as a target column

A column is treated as a target if its name starts with `survived`, `target`, `label`, `y`, `class`, `outcome`, `is_`, or `has_`. Target columns get a positive "Looks Good" entry when they are binary.

## What counts as an ID column

An integer or string column is ID-like if its cardinality is very high relative to the row count (every value unique, or close to it). ID columns are dropped by the generated fix block.

## What "Looks Good" means

A column appears in "Looks Good" when it meets one of these heuristics:

- **Binary target** — name looks like a target, cardinality is exactly 2.
- **Low-cardinality categorical** — integer with ≤ 15 unique values and val_min ≥ 0, or string with ≤ 20 unique values.
- **Clean numeric** — null percentage < 5%, not flagged as an outlier column.

The thresholds (`LOOKS_GOOD_MAX_UNIQUE_INT = 15`, `LOOKS_GOOD_MAX_UNIQUE_STR = 20`, `LOOKS_GOOD_MAX_NULL_PCT = 5.0`) are constants in `zedda._ml_ready`.

## Example

```python
import zedda as zd

zd.ml_ready("titanic.csv")
```

Typical output:

- Score: 78/100
- Issues Found: `Age` high-null (−15), `Cabin` high-null (−15), `PassengerId` ID-like (−5), `Name` high-cardinality string (−3), `Ticket` high-cardinality string (−3)
- Looks Good: `Survived` (binary target), `Pclass` (low-cardinality int), `Sex` (low-cardinality string), `SibSp`, `Parch`, `Fare` (clean numeric)
- Copy-Paste Block: drops `PassengerId`, `Name`, `Ticket`, `Cabin`; fills `Age` with median
- Recommended feature count: 6 of 12 columns

## Forcing correlation

Like `profile()`, `ml_ready()` accepts `correlate=False` by default. Set `correlate=True` to force correlation analysis on wide datasets.

```python
zd.ml_ready("wide.csv", correlate=True)
```

## Programmatic use

`ml_ready()` returns `None` — it is print-first. For programmatic access, the underlying function is `zedda._ml_readiness_score` which returns a dict with `score`, `issues`, `drop_cols`, and `recommended_feature_count`.

## Next steps

- [Python API: ml_ready()](#api/ml-ready) — full argument reference.
- [Warnings](#api/warnings) — every issue category Zedda detects.
- [Cleaning & Fixing](#guides/cleaning) — apply the recommended fixes safely.
