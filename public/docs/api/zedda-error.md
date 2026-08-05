# ZeddaError

```python
class zedda.ZeddaError(Exception)
```

Base exception class for all user-facing Zedda errors. Catch this for bad paths, unsupported extensions, missing dependencies, scan errors, and any other expected failure mode.

## When it is raised

`ZeddaError` is raised by every public function for:

| Function | Common `ZeddaError` causes |
|---|---|
| `scan()`, `profile()`     | Missing file, empty file, unsupported extension, missing `pyarrow`, path traversal, scan engine error |
| `compare()`                                | Same as above for either input |
| `ml_ready()`, `warnings()`     | Same as `scan()` |
| `fix()`, `clean()`                  | Same as `scan()`, plus audit-path traversal in `clean()` |
| `clean.undo()`                          | No backup file exists |
| `merge()`                                    | `paths` has fewer than 2 entries |
| `ask()`                                          | Path validation failure (bad extension, blocked OS root, null bytes) |
| `report()`                                 | Same as `scan()` |

## Catching it

```python
from zedda import ZeddaError
import zedda as zd

try:
    result = zd.scan("data.csv")
except ZeddaError as e:
    print(f"scan failed: {e}")
    # e.g. "scan failed: File not found: data.csv"
```

## Subclasses

`ZeddaError` does not currently define any subclasses. All user-facing errors are raised as plain `ZeddaError`. Catching `ZeddaError` is sufficient.

## Internal note

The `ZeddaError` class is defined in `zedda._resolve` and re-exported from `zedda._scan` and the top-level `zedda` package. Importing it from `zedda` is the supported path:

```python
from zedda import ZeddaError
```

## See also

- [Python API Overview](#api/overview) — every function that can raise `ZeddaError`.
- [Security](#contributing/security) — the full hardening surface.
