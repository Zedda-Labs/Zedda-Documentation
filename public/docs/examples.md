# Examples

The Zedda repository ships one example: a Jupyter notebook that walks through profiling, warning detection, and auto-cleaning on the Titanic dataset.

## Titanic Quickstart

**File:** [`examples/titanic_quickstart.ipynb`](https://github.com/Zedda-Labs/Zedda/blob/main/examples/titanic_quickstart.ipynb)

A 4-cell, 3-markdown-cell notebook. Loads the Titanic dataset from the public DataScienceDojo mirror, profiles it, lists warnings, and cleans it.

### Setup

```bash
pip install zedda[parquet]
jupyter lab examples/titanic_quickstart.ipynb
```

The `[parquet]` extra is required because the notebook passes a pandas DataFrame to Zedda, which writes a temporary Parquet file under the hood.

### Cell 1 — Load and profile

```python
import pandas as pd
import zedda as zd

url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
df = pd.read_csv(url)

zd.profile(df)
```

This prints the full Rich EDA report: dataset overview panel, quality score, per-column table (Survived, Pclass, Sex, Age, SibSp, Parch, Ticket, Fare, Cabin, Embarked), smart warnings (high nulls on Age and Cabin, ID-like PassengerId, high-cardinality Name and Ticket), and any correlation alerts above |r| ≥ 0.7.

### Cell 2 — List every warning

```python
zd.warnings(df)
```

Prints every issue ranked by severity (critical → warning → info), each with inline fix code, plus a copy-paste block at the end and the overall quality score.

### Cell 3 — Auto-clean

```python
zd.clean(df, output="titanic_clean.csv")
```

::::warning
**Notebook bug (v0.4.8):** The original notebook calls `zd.clean(df, apply=True)`, but `clean()` does **not** accept an `apply` argument — only `path`, `output`, and `sample_size`. That call would raise `TypeError: clean() got an unexpected keyword argument 'apply'`. The snippet above uses the correct signature.
::::

The corrected call:

1. Writes `titanic.csv.zedda-backup` (or for DataFrame input, simply returns the cleaned DataFrame).
2. Applies every auto-fixable warning (drop PassengerId, Name, Ticket, Cabin; fill Age with median; etc.).
3. Writes `titanic_clean.csv` with a new `zedda_source_file` column.
4. Writes `titanic_clean_cleaning_audit.json` recording every fix applied.
5. Returns the cleaned `pandas.DataFrame`.

To restore the original:

```python
zd.clean.undo("titanic.csv")
```

## More examples (in the docs)

The [Guides](#guides/profiling) section of this documentation has runnable snippets for every public function:

- [Profiling Datasets](#guides/profiling) — `zd.profile()` and `zd.scan()`
- [Comparing Datasets](#guides/comparing) — `zd.compare()`
- [Cleaning & Fixing](#guides/cleaning) — `zd.fix()` and `zd.clean()`
- [ML Readiness](#guides/ml-readiness) — `zd.ml_ready()`
- [AI Q&A](#guides/ai-qa) — `zd.ask()`
- [HTML Reports](#guides/reports) — `zd.report()`

## Contributing an example

If you have a notebook or script that demonstrates a Zedda use case, contributions are welcome. See [Contributing](#contributing/setup) for the development setup.

## See also

- [Quick Start](#quickstart) — every public function in 30 seconds.
- [Python API](#api/overview) — every argument and return type.
- [CLI](#cli) — the command-line equivalents.
