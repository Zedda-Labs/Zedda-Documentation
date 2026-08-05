# zedda.fix()

```python
zedda.fix(
    path,
    apply=False,
    sample_size=None,
    correlate=False,
) -> None | pandas.DataFrame
```

Generate copy-paste pandas fix code grouped by issue type, or apply the fixes in place and return the cleaned DataFrame.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `path`              | `str` / `Path` / `DataFrame` | _(required)_ | Input dataset |
| `apply`             | `bool`                                            | `False`              | If `True`, execute fixes on a DataFrame and return it. If `False`, print code only. |
| `sample_size` | `int` or `None`                       | `None`               | Sample size in rows |
| `correlate`      | `bool`                                            | `False`              | Force O(N²) correlation |

## Returns

- `apply=False` (default) → `None`. Prints the fix code to the terminal.
- `apply=True`             → `pandas.DataFrame`. The cleaned DataFrame (the original file on disk is **not** modified).

## Generated code structure

The fix code is grouped by issue type:

| Issue category | Generated code |
|---|---|
| Missing Values              | `df["col"].fillna(df["col"].median(), inplace=True)` for numeric, `fillna(df["col"].mode()[0])` for strings |
| Outliers                          | `df["col"] = df["col"].clip(upper=df["col"].quantile(0.99))` |
| ID Columns                       | `df.drop(columns=["col"], inplace=True)` |
| High-Cardinality Strings | `df["col"] = pd.factorize(df["col"])[0]` |
| Constant Columns        | `df.drop(columns=["col"], inplace=True)` |

## Example

```python
import zedda as zd

# Print fix code only
zd.fix("data.csv")

# Apply and get the cleaned DataFrame
cleaned = zd.fix("data.csv", apply=True)
print(cleaned.shape)
```

## Difference from `clean()`

| Aspect | `fix(apply=True)` | `clean()` |
|---|---|---|
| Writes a backup file                          | No                          | Yes (`{path}.zedda-backup`) |
| Writes a JSON audit trail                          | No                          | Yes |
| Returns a DataFrame                                  | Yes                          | Yes (if input is DataFrame or `output=None`) |
| Writes a cleaned file to disk                       | No                          | Yes |
| Has an `undo()` helper                            | No                          | Yes (`clean.undo()`) |

Use `fix()` when you want to review and edit the code. Use [`clean()`](#api/clean) when you want safe, audited auto-cleaning.

## See also

- [Cleaning & Fixing guide](#guides/cleaning) — practical walkthrough.
- [`clean()`](#api/clean) — auto-clean with backup and audit.
- [`warnings()`](#api/warnings) — every issue category.
