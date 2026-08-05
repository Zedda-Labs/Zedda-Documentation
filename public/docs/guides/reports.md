# HTML Reports

[`zd.report(data, output=None)`](#api/report) generates a self-contained offline HTML EDA report. The report is a single `.html` file with inline CSS, inline SVG sparklines, and zero external network requests.

## Why an HTML report

The terminal report from `profile()` is great for interactive use, but you cannot email it, host it, or attach it to a CI failure. The HTML report solves all three:

- **Email-friendly.** One file, no attachments, no external resources.
- **Hostable.** Drop it on S3, GitHub Pages, or any static host.
- **Auditable.** Every dynamic value is XSS-escaped via `_esc()`. The test suite includes a regression test where a malicious `<script>alert(1)</script>` column name is verified to be escaped.

## Basic usage

```python
import zedda as zd

zd.report("data.csv")
# writes data_report.html and returns the absolute path
```

`report()` returns the absolute path of the written file.

## Custom output path

```python
path = zd.report("data.csv", output="weekly_report.html")
print(path)  # /abs/path/to/weekly_report.html
```

## DataFrame input

```python
import pandas as pd
import zedda as zd

df = pd.read_csv("data.csv")
zd.report(df)  # writes dataframe_report.html
```

## What the report contains

The HTML report includes:

- **Header** — project name, file name, generated-at timestamp.
- **Quality ring** — a circular SVG gauge showing the 0–100 quality score.
- **Dataset overview** — row count, column count, null percentage, scan time.
- **Per-column cards** — every column with its type, null count, unique count, and (for numeric) min/max/mean/stddev plus an SVG sparkline of the value distribution.
- **Warnings list** — every issue from [`collect_warnings()`](#api/collect-warnings).
- **Correlation table** — every pair with |r| ≥ 0.7.

The visual design uses Zedda's brand palette: warm cream background (`#FCFBF8`), teal primary (`#1D9E75`), crimson accent (`#C8344D`).

## The `export` alias

`report()` is also exported as `zd.export` for users who prefer that name:

```python
zedda.export("data.csv", output="rep.html")
```

## CLI variant

```bash
zedda report data.csv -o rep.html
zedda run data.csv --out rep.html    # run also accepts --out
```

See [CLI Reference](#cli).

## Security

Every dynamic value (column name, file name, etc.) is escaped via the internal `_esc()` function. The test suite (`tests/python/test_report.py`) includes a regression test where a column named `<script>alert(1)</script>` is verified to be rendered as escaped text, not executed.

The report makes **no outbound network requests** — verified by an integration test that mocks the network and asserts zero calls.

## Next steps

- [Python API: report()](#api/report) — full argument reference.
- [Profiling](#guides/profiling) — the terminal equivalent.
- [CLI](#cli) — `zedda report` and `zedda run --out`.
