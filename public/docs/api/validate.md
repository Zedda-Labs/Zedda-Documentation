# zedda.validate()

```python
zedda.validate(
    data,
    rules: dict[str, dict[str, Any]],
    profile=None,
    fail_on_error: bool = False,
) -> ValidationReport
```

Validate a dataset against a declarative data quality contract. Evaluates column existence, null thresholds, value ranges, allowed types, and cardinality constraints.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `data` | `str` / `Path` / `DataFrame` | _(required)_ | Input dataset path or in-memory DataFrame |
| `rules` | `dict[str, dict[str, Any]]` | _(required)_ | Declarative column validation rules dictionary |
| `profile` | `DatasetProfile` or `None` | `None` | Pre-computed profile. If `None`, `zd.scan(data)` is run automatically |
| `fail_on_error` | `bool` | `False` | If `True`, raises `ZeddaError` if any critical rule fails |

## Supported Rule Specifications

Rules are defined as a mapping from column name to constraint dictionary:

```python
rules = {
    "age": {
        "max_null_pct": 5.0,        # Maximum allowed null percentage
        "min_val": 0,                # Minimum allowed numeric value
        "max_val": 120,              # Maximum allowed numeric value
        "allowed_types": ["int", "float"], # Allowed data types
    },
    "email": {
        "max_null_pct": 0.0,
        "min_unique": 10,            # Minimum unique values
    },
}
```

| Rule | Type | Description |
|---|---|---|
| `max_null_pct` | `float` | Maximum null percentage allowed (0.0 to 100.0) |
| `min_val` | `float` / `int` | Lower bound for numeric columns |
| `max_val` | `float` / `int` | Upper bound for numeric columns |
| `allowed_types` | `list[str]` | Allowed type strings (e.g. `["int", "float", "str", "bool"]`) |
| `min_unique` | `int` | Minimum unique count (via HyperLogLog / exact count) |
| `max_unique` | `int` | Maximum unique count |

## Returns

A `ValidationReport` object containing:

- `is_valid` (`bool`): `True` if all rules passed with zero breaches.
- `passed_rules` (`int`): Count of rules satisfied.
- `failed_rules` (`int`): Count of rules breached.
- `columns` (`list`): Per-column breach breakdown.
- `summary()` (`str`): Multi-line formatted terminal summary.

## Raises

[`ZeddaError`](#api/zedda-error) if `fail_on_error=True` and one or more validation rules fail.

## Example

```python
import zedda as zd

contract = {
    "fare": {"min_val": 0.0, "max_null_pct": 1.0},
    "survived": {"allowed_types": ["int", "bool"]},
}

report = zd.validate("titanic.csv", rules=contract)

if not report.is_valid:
    print(f"Validation failed: {report.failed_rules} breaches detected")
    print(report.summary())
```

## CLI Equivalent

```bash
zedda validate data.csv --rules contract.json --fail
```
