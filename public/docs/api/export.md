# zedda.export()

```python
zedda.export(
    data,
    output: str | None = None,
    title: str | None = None,
    dark_mode: bool = True,
    sample_size: int | None = None,
) -> str
```

Top-level alias of [`zedda.report()`](#api/report). Generates and saves a standalone, zero-network-request HTML EDA report for a dataset.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `data` | `str` / `Path` / `DataFrame` | _(required)_ | Input dataset path or in-memory DataFrame |
| `output` | `str` / `Path` or `None` | `None` | Output HTML path (defaults to `{stem}_report.html` in current directory) |
| `title` | `str` or `None` | `None` | Custom report title |
| `dark_mode` | `bool` | `True` | Render report in dark theme |
| `sample_size` | `int` or `None` | `None` | Max rows to sample |

## Returns

`str` — The absolute or relative path to the generated `.html` report.

## Example

```python
import zedda as zd

# Generate HTML report
report_path = zd.export("data.csv", output="eda_report.html", title="Q3 Customer Analysis")
print(f"Report saved to {report_path}")
```

## See Also

- [`zedda.report()`](#api/report) — Full details on HTML report sections, sparklines, and zero-request offline architecture.
- [HTML Reports Guide](#guides/reports) — In-depth guide with browser previews.
