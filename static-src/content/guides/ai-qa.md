# AI Q&A

[`zd.ask(path, question)`](#api/ask) answers plain-English questions about a dataset. It tries four offline pattern matchers first; only if none match does it fall back to an optional LLM call.

## Offline patterns

`ask()` has four built-in matchers, run in order. If a matcher recognises the question, the LLM is never called.

| Pattern | Example question | What it returns |
|---|---|---|
| A — row count           | "how many rows?"                                   | Total row count |
| B — column count     | "how many columns?"                              | Total column count |
| C — null summary   | "any nulls here?"                                | Per-column null counts and percentages |
| D — single-column stat | "what's the average age?"                       | Mean / stddev / min / max / null count for the named column |

A fifth offline matcher covers correlation summary questions: "strongest correlation?", "which columns are correlated?".

## LLM fallback

If no offline pattern matches and `ZEDDA_AI_KEY` is set in the environment, `ask()` calls an OpenAI-compatible chat-completions endpoint. By default this is Groq's `llama-3.3-70b-versatile` model.

The system prompt instructs the model to format its answer with three labels — `Drop immediately:`, `Drop or transform:`, `Keep:` — stay under 400 words, and never mention Groq, LLaMA, or the API.

::::warning
**Known inconsistency (v0.4.8):** The `ZEDDA_AI_ENDPOINT` environment variable is read into the `AI_ENDPOINT` constant in `zedda._constants`, but the actual `_ask_zedda_ai()` call site hardcodes the Groq URL. Setting `ZEDDA_AI_ENDPOINT` to point at OpenAI will **not** redirect the call. This is tracked as an incomplete fix (M-24) and will be resolved in a future release.
::::

## Configuring AI access

```bash
export ZEDDA_AI_KEY="sk-..."
```

The key must match the pattern `sk-[A-Za-z0-9]{20,}`. Keys are redacted from error messages (`sk-***REDACTED***`) — see [Security](#contributing/security).

The default model is `llama-3.3-70b-versatile`. To use a different model:

```python
import zedda as zd

zd.ask("data.csv", "which columns should I drop?", model="openai/gpt-oss-120b")
```

The pricing table in `zedda._constants.AI_PRICING` tracks four models:

| Model identifier | Provider |
|---|---|
| `llama-3.3-70b-versatile`           | Groq (default) |
| `openai/gpt-oss-120b`                | OpenAI |
| `openai/gpt-oss-20b`                 | OpenAI |
| `moonshotai/kimi-k2-instruct-0905` | Moonshot |

Request parameters: `max_tokens=800`, `temperature=0.2`, `timeout=10s`.

## Path validation

`ask()` validates the input path before doing anything else:

- Extension must be `.csv`, `.parquet`, `.arrow`, or `.feather`.
- Path must not be inside `/etc`, `/proc`, `/sys`, `/root`, `C:/Windows`, or other blocked OS roots.
- Question is sanitised: control characters stripped, length capped at 500 characters.

This is part of Zedda's security hardening (SEC-Q01 through SEC-Q07).

## Print vs. return

`ask()` has a `print_output` flag:

```python
# Default — prints Rich-formatted output, returns None
zd.ask("data.csv", "any nulls?")

# Silent — returns the answer string
answer = zd.ask("data.csv", "any nulls?", print_output=False)
```

## Example session

```python
import zedda as zd

zd.ask("titanic.csv", "how many rows?")
# → "891 rows"

zd.ask("titanic.csv", "any nulls here?")
# → Per-column null table (offline pattern C)

zd.ask("titanic.csv", "what's the average fare?")
# → "mean=32.20, stddev=49.69, min=0.00, max=512.33, nulls=0" (offline pattern D)

zd.ask("titanic.csv", "which columns should I drop?")
# → LLM response with Drop immediately / Drop or transform / Keep labels
```

## The CLI variant

```bash
zedda ask data.csv "any nulls here?"
zedda run --ai data.csv     # adds LLM insights to the profile output
```

See [CLI Reference](#cli).

## Next steps

- [Python API: ask()](#api/ask) — full argument reference.
- [Configuration](#configuration) — every environment variable.
- [Security](#contributing/security) — the full hardening surface.
