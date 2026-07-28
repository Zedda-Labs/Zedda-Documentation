# Introduction

**Zedda** is a C++17-powered EDA and data cleaning engine for Python. It profiles, cleans, and validates datasets from a single Python call, streaming data in constant memory so the same API scales from a 900-row CSV to a terabyte-scale Parquet file.

The project lives at [github.com/Zedda-Labs/Zedda](https://github.com/Zedda-Labs/Zedda) and is published on [PyPI](https://pypi.org/project/zedda) under the MIT license. The current release is **0.4.8**.

## What Zedda does

Zedda gives you ten top-level functions, each focused on one job:

| Function | Job |
|---|---|
| `zd.profile()` | Scan and print a full EDA report in the terminal |
| `zd.scan()` | Silent scan — return a profile without printing |
| `zd.compare()` | Detect schema drift and distribution shift between two datasets |
| `zd.ml_ready()` | Score ML training readiness (0–100) |
| `zd.warnings()` | List every data quality issue, ranked by severity |
| `zd.collect_warnings()` | Same as `warnings()` but returns a structured list |
| `zd.fix()` | Generate copy-paste pandas fix code |
| `zd.clean()` | Auto-clean with backups, audit trail, and one-call undo |
| `zd.merge()` | Safely combine multiple files |
| `zd.ask()` | Plain-English dataset Q&A (offline patterns + optional LLM) |
| `zd.report()` | Export a self-contained offline HTML report |

Every function accepts a file path **or** a pandas / polars `DataFrame` directly — a file path is never required.

## Why Zedda exists

Pandas makes it easy to load data, but answering "is this dataset safe to train on?" still requires writing the same boilerplate every time: check nulls, infer types, look for outliers, flag high-cardinality strings, detect constant columns, compute correlations, spot schema drift against yesterday's snapshot. Zedda collapses that boilerplate into a single call.

The core engine is C++17 — not because Python is slow, but because profiling a 50 GB Parquet file should not require loading it into memory. Zedda streams files in fixed-size chunks, accumulates statistics with Welford's online algorithm, estimates cardinality with HyperLogLog, and uses AVX2 / AVX-512 SIMD to scan CSV fields when the CPU supports it.

## When to use Zedda

::::tip
**Zedda is a good fit when** you are starting work on a new dataset and want a fast, honest first look at its shape, types, nulls, outliers, and ML readiness — without writing 200 lines of pandas.
::::

Use Zedda for:

- **First contact with a dataset.** `zd.profile("data.csv")` prints a complete report in seconds.
- **CI/CD data validation.** `zd.scan()` and `zd.collect_warnings()` are silent and return structured data — perfect for failing a pipeline when quality drops.
- **Train / test drift detection.** `zd.compare("train.csv", "test.csv")` flags schema mismatches and distribution shift before they cost you a model.
- **ML readiness triage.** `zd.ml_ready()` scores the dataset 0–100 and emits a copy-paste fix block.
- **Safe auto-cleaning.** `zd.clean()` writes a backup, applies fixes, and writes a JSON audit trail — `zd.clean.undo()` restores the original.

## When Zedda is not the right tool

Zedda is a profiler and cleaner, not a dataframe runtime. It does not replace pandas or polars for transformation, joins, or group-by analytics. Use it upstream of your normal pipeline.

## Design principles

1. **Constant memory.** A 1 TB Parquet file uses the same ~2 MB of working memory as a 1 MB CSV. Zedda never loads the whole file.
2. **One Python call.** No configuration files, no setup. `zd.profile(path)` is enough.
3. **Honest output.** If Zedda skipped a step (e.g. correlation on >50 numeric columns), it tells you. Sampling triggers automatically above 1 GB and is reported in the output.
4. **No surprises.** Every mutation (`clean()`) is backed up and audited. Every fix block is copy-paste, not magic.

## Next steps

- [Installation](#installation) — get Zedda installed in under a minute.
- [Quick Start](#quickstart) — profile, scan, and clean your first dataset.
- [Architecture](#architecture) — how the C++17 streaming engine works under the hood.
