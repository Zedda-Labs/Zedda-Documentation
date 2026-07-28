# CLI Reference

Zedda ships a `zedda` command-line tool with 11 subcommands. It is built with [Typer](https://typer.tiangolo.com/) and installed automatically by `pip install zedda`.

The entry point is defined in `pyproject.toml` as `zedda = "zedda.cli:app"`. The Typer app has `add_completion=False` and `rich_markup_mode="rich"`.

## Synopsis

```bash
zedda [--help] [--version] <command> [args]
```

Running `zedda` with no subcommand prints an ASCII-art banner (in the brand orange `#E79C65`) and the installed version. `--help` prints the banner followed by Typer's standard help.

## Commands

| Command | Args | Summary |
|---|---|---|
| [`zedda run`](#zedda-run)         | `PATH [--ai] [--cols COLS] [--out HTML]` | Profile a file and print the EDA report |
| [`zedda profile`](#zedda-profile) | `PATH`                                    | Alias of `run` without options |
| [`zedda scan`](#zedda-scan)       | `PATH`                                    | Fast silent scan |
| [`zedda compare`](#zedda-compare) | `PATH_A PATH_B`                           | Compare two datasets |
| [`zedda fix`](#zedda-fix)         | `PATH`                                    | Generate fix suggestions |
| [`zedda ml-ready`](#zedda-ml-ready) | `PATH`                                  | Check ML readiness |
| [`zedda warnings`](#zedda-warnings) | `PATH`                                  | Show all data quality warnings |
| [`zedda clean`](#zedda-clean)     | `PATH [-o OUTPUT]`                        | Auto-clean with backup + audit |
| [`zedda merge`](#zedda-merge)     | `PATHS... [-o combined.csv]`              | Merge multiple files |
| [`zedda report`](#zedda-report)   | `PATH [-o report.html]`                   | Export HTML report |
| [`zedda ask`](#zedda-ask)         | `PATH QUESTION`                           | Plain-English Q&A |
| [`zedda info`](#zedda-info)       | `PATH`                                    | Instant file metadata (no full scan) |
| [`zedda version`](#zedda-version) | _(none)_                                   | Print installed version |

## zedda run

```bash
zedda run PATH [--ai] [--cols COLS] [--out HTML]
```

Profiles a file and prints the full EDA report. The most flexible command — supports AI insights, column selection, and HTML export.

| Flag | Type | Default | Description |
|---|---|---|---|
| `--ai`     | flag      | off       | Add LLM insights to the report. Requires `ZEDDA_AI_KEY` env var. |
| `--cols`   | string    | _(all)_   | Accepted but **not yet implemented**. Prints a yellow warning and profiles all columns. |
| `--out`    | path      | _(none)_  | Save an HTML report to this path in addition to printing the terminal report. |

Example:

```bash
zedda run data.csv --ai --out rep.html
```

## zedda profile

```bash
zedda profile PATH
```

Alias of `run` without options. Equivalent to `zedda run PATH`.

## zedda scan

```bash
zedda scan PATH
```

Fast, silent scan. Prints nothing on success; prints errors only on failure. Use this in shell scripts where you want the exit code, not the report.

## zedda compare

```bash
zedda compare PATH_A PATH_B
```

Compare two datasets side-by-side. See [Comparing Datasets](#guides/comparing) for the full output description.

## zedda fix

```bash
zedda fix PATH
```

Generate copy-paste pandas fix code, grouped by issue type. See [Cleaning & Fixing](#guides/cleaning).

## zedda ml-ready

```bash
zedda ml-ready PATH
```

::::note
The CLI command uses a hyphen (`ml-ready`), while the Python function uses an underscore (`ml_ready()`).
::::

Scores ML readiness (0–100) and emits a copy-paste fix block. See [ML Readiness](#guides/ml-readiness).

## zedda warnings

```bash
zedda warnings PATH
```

Show all data quality warnings ranked by severity. See [Python API: warnings()](#api/warnings).

## zedda clean

```bash
zedda clean PATH [-o OUTPUT]
```

| Flag | Type | Default | Description |
|---|---|---|---|
| `-o, --output` | path | _(input path)_ | Where to write the cleaned file. Default overwrites the input (after backup). |

Auto-clean with backup and audit trail. See [Cleaning & Fixing](#guides/cleaning).

## zedda merge

```bash
zedda merge PATHS... [-o combined.csv]
```

| Flag | Type | Default | Description |
|---|---|---|---|
| `-o, --output` | path | `combined.csv` | Where to write the merged file. |

Merge multiple files (≥2 required). Validates schema consistency, detects duplicates across files, flags distribution shifts on common numeric columns. See [Python API: merge()](#api/merge).

Example:

```bash
zedda merge jan.csv feb.csv mar.csv -o q1.csv
```

## zedda report

```bash
zedda report PATH [-o report.html]
```

| Flag | Type | Default | Description |
|---|---|---|---|
| `-o, --output` | path | `report.html` | Where to write the HTML report. |

Export a self-contained offline HTML report. See [HTML Reports](#guides/reports).

## zedda ask

```bash
zedda ask PATH QUESTION
```

Plain-English dataset Q&A. Tries offline patterns first; falls back to the LLM if `ZEDDA_AI_KEY` is set. See [AI Q&A](#guides/ai-qa).

Example:

```bash
zedda ask data.csv "any nulls here?"
zedda ask data.csv "which columns should I drop?"
```

## zedda info

```bash
zedda info PATH
```

Instant file metadata — name, size, path, and row count. **Does not run a full scan** — uses a fast line count. Useful for quick sanity checks on large files.

## zedda version

```bash
zedda version
```

Print the installed Zedda version. Reads from `zedda.__version__`.

## Exit codes

All commands return `0` on success and non-zero on error. Errors are raised as [`ZeddaError`](#api/zedda-error) and printed with a traceback unless suppressed.

## Next steps

- [Python API](#api/overview) — the same functionality as Python functions.
- [Guides](#guides/profiling) — deeper walkthroughs of each feature.
- [Configuration](#configuration) — environment variables.
