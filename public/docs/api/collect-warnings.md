# zedda.collect_warnings()

```python
zedda.collect_warnings(
    path,
    sample_size=None,
) -> list[dict]
```

Programmatic equivalent of [`warnings()`](#api/warnings). Returns a structured list of dicts instead of printing. This is the right function for CI/CD pipelines.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `path`              | `str` / `Path` / `DataFrame` | _(required)_ | Input dataset |
| `sample_size` | `int` or `None`                       | `None`               | Sample size in rows |

## Returns

`list[dict]`. Each dict has these keys:

| Key | Type | Description |
|---|---|---|
| `icon`                  | `str`  | Severity icon (emoji-style, used by the terminal renderer) |
| `column`              | `str`  | Column name (or dataset-level label) |
| `message`         | `str`  | Human-readable description |
| `category`        | `str`  | Issue category (e.g. `high_nulls`, `outliers`) |
| `severity`           | `str`  | `critical` / `warning` / `info` |
| `fix_code`          | `str`  | Inline pandas fix snippet (may be empty) |
| `fix_action`      | `str`  | Short description of the fix action (may be empty) |
| `auto_fixable` | `bool` | Whether [`clean()`](#api/clean) would fix this automatically |

## Example

```python
import zedda as zd

issues = zd.collect_warnings("data.csv")

# Fail CI on any critical issue
critical = [i for i in issues if i["severity"] == "critical"]
assert not critical, f"{len(critical)} critical issues: {[i['message'] for i in critical]}"

# Count auto-fixable
auto_fixable = [i for i in issues if i["auto_fixable"]]
print(f"{len(auto_fixable)} of {len(issues)} issues are auto-fixable")
```

## CI/CD pattern

```python
import sys
import zedda as zd

issues = zd.collect_warnings(sys.argv[1])
critical = [i for i in issues if i["severity"] == "critical"]

if critical:
    for i in critical:
        print(f"[CRITICAL] {i['column']}: {i['message']}")
    sys.exit(1)
```

## See also

- [`warnings()`](#api/warnings) — the print-first variant.
- [`clean()`](#api/clean) — apply every auto-fixable warning.
- [`fix()`](#api/fix) — generate pandas code for every warning.
