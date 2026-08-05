# zedda.ml_ready()

```python
zedda.ml_ready(
    path,
    sample_size=None,
    correlate=False,
) -> None
```

Score ML training readiness (0–100) and emit a copy-paste fix block. Prints four sections. Returns `None`.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `path`              | `str` / `Path` / `DataFrame` | _(required)_ | Input dataset |
| `sample_size` | `int` or `None`                       | `None`               | Sample size in rows |
| `correlate`      | `bool`                                            | `False`              | Force O(N²) correlation |

## Returns

`None`. `ml_ready()` is print-first.

## Scoring

The score starts at 100 and is reduced for every issue:

| Issue | Penalty |
|---|---|
| High-null column (>50% nulls)              | −15 |
| Moderate-null column (>5% nulls)      | −10 |
| ID-like integer or string column        | −5  |
| High-cardinality string column        | −3  |
| Constant column                                    | −2  |
| Outlier column                                   | −2  |

The score is **not** clamped to a minimum.

## Output sections

1. **Score** with a visual bar.
2. **Issues Found** — every penalty, grouped by severity, with inline fix code.
3. **Looks Good** — columns that pass the heuristics: binary target, low-cardinality categorical, clean numeric.
4. **Copy-Paste Block** — a single pandas code block at the end.
5. **Recommended feature count** — "Recommended feature count: X of Y columns".

## "Looks Good" thresholds

Constants in `zedda._ml_ready`:

- `LOOKS_GOOD_MAX_UNIQUE_INT = 15`
- `LOOKS_GOOD_MAX_UNIQUE_STR = 20`
- `LOOKS_GOOD_MAX_NULL_PCT = 5.0`

## Example

```python
import zedda as zd

zd.ml_ready("titanic.csv")
```

## Programmatic access

`ml_ready()` returns `None`. The underlying function is `zedda._ml_readiness_score` which returns a dict with `score`, `issues`, `drop_cols`, and `recommended_feature_count`.

## See also

- [ML Readiness guide](#guides/ml-readiness) — practical walkthrough.
- [`warnings()`](#api/warnings) — every issue category.
- [`fix()`](#api/fix) — apply the recommended fixes.
