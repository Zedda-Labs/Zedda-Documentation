# zedda.ask()

```python
zedda.ask(
    path,
    question,
    llm="zedda",
    model=None,
    print_output=True,
) -> str | None
```

Plain-English question answering. Tries four offline pattern matchers first; only if none match does it fall back to an LLM call.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `path`                 | `str` / `Path` / `DataFrame` | _(required)_ | Input dataset |
| `question`        | `str`                                            | _(required)_ | Plain-English question. Sanitised: control chars stripped, length capped at 500 chars. |
| `llm`                    | `str`                                            | `"zedda"`             | LLM backend identifier. Only `"zedda"` is currently meaningful. |
| `model`               | `str` or `None`                       | `None`                | Override the default model (`llama-3.3-70b-versatile`). See [Configuration](#configuration). |
| `print_output` | `bool`                                          | `True`                | If `True`, print Rich-formatted output and return `None`. If `False`, return the answer string. |

## Returns

- `print_output=True` (default) → `None`. Prints Rich-formatted output.
- `print_output=False`             → `str`. The answer (or error string on failure).

## Offline patterns

`ask()` has four built-in matchers, run in order. If a matcher recognises the question, the LLM is never called:

| Pattern | Example | Returns |
|---|---|---|
| A — row count                       | "how many rows?"                    | Total row count |
| B — column count                  | "how many columns?"              | Total column count |
| C — null summary                | "any nulls here?"                  | Per-column null counts and percentages |
| D — single-column stat | "what's the average age?" | Mean / stddev / min / max / null count for the named column |

A fifth offline matcher covers correlation summary questions.

## LLM fallback

If no offline pattern matches and `ZEDDA_AI_KEY` is set in the environment, `ask()` calls an OpenAI-compatible chat-completions endpoint at Groq's `llama-3.3-70b-versatile` model by default.

Request parameters: `max_tokens=800`, `temperature=0.2`, `timeout=10s`.

::::warning
**Known inconsistency (v0.4.8):** The `ZEDDA_AI_ENDPOINT` environment variable is read into the `AI_ENDPOINT` constant in `zedda._constants`, but the actual `_ask_zedda_ai()` call site hardcodes the Groq URL. Setting `ZEDDA_AI_ENDPOINT` to point at OpenAI will **not** redirect the call. This is tracked as an incomplete fix (M-24).
::::

## Path validation

`ask()` validates the input path before doing anything else (SEC-Q01–Q07):

- Extension must be `.csv`, `.parquet`, `.arrow`, or `.feather`.
- Path must not be inside `/etc`, `/proc`, `/sys`, `/root`, `C:/Windows`, or other blocked OS roots.
- Question is sanitised: control characters stripped, length capped at 500 characters.

## Example

```python
import zedda as zd

# Default — prints, returns None
zd.ask("data.csv", "any nulls here?")

# Silent — returns the answer string
answer = zd.ask("data.csv", "which columns should I drop?", print_output=False)
print(answer)

# Override the model
zd.ask("data.csv", "which columns should I drop?", model="openai/gpt-oss-120b")
```

## See also

- [AI Q&A guide](#guides/ai-qa) — practical walkthrough.
- [Configuration](#configuration) — every environment variable.
- [CLI: zedda ask](#cli) — the command-line equivalent.
