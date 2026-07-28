# zedda.report()

```python
zedda.report(
    data,
    output=None,
) -> str
```

Alias: `zedda.export`.

Generate a self-contained offline HTML EDA report. The report is a single `.html` file with inline CSS, inline SVG sparklines, and zero external network requests.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `data`     | `str` / `Path` / `DataFrame` | _(required)_ | Input dataset |
| `output` | `str` / `Path` or `None`  | `None`                | Where to write the HTML file. `None` = `{stem}_report.html` for file input, `dataframe_report.html` for DataFrame input. |

## Returns

`str` — the absolute path of the written file.

## Output

The HTML report includes:

- Header — project name, file name, generated-at timestamp
- Quality ring — circular SVG gauge showing the 0–100 quality score
- Dataset overview — row count, column count, null percentage, scan time
- Per-column cards — every column with type, nulls, unique, and (for numeric) min/max/mean/stddev + SVG sparkline
- Warnings list — every issue from [`collect_warnings()`](#api/collect-warnings)
- Correlation table — every pair with |r| ≥ 0.7

The visual design uses Zedda's brand palette: warm cream background (`#FCFBF8`), teal primary (`#1D9E75`), crimson accent (`#C8344D`).

## Security

Every dynamic value (column name, file name, etc.) is escaped via the internal `_esc()` function. The test suite includes a regression test where a column named `<script>alert(1)</script>` is verified to be rendered as escaped text, not executed.

The report makes **no outbound network requests** — verified by an integration test that mocks the network and asserts zero calls.

## Example

```python
import zedda as zd

# Default output: data_report.html
path = zd.report("data.csv")
print(path)

# Custom output
path = zd.report("data.csv", output="weekly_report.html")

# DataFrame input — default output: dataframe_report.html
import pandas as pd
df = pd.read_csv("data.csv")
path = zd.report(df)
```

## The `export` alias

`report()` is also exported as `zd.export` for users who prefer that name:

```python
zedda.export("data.csv", output="rep.html")
```

## See also

- [HTML Reports guide](#guides/reports) — practical walkthrough.
- [CLI: zedda report](#cli) — the command-line equivalent.
- [`profile()`](#api/profile) — the terminal equivalent.
