# Configuration

Zedda does **not** read any configuration files at runtime. All configuration is via environment variables. There is no `.zeddarc`, no `pyproject.toml` section, no `config.yaml`.

## Environment variables

| Variable | Default | Effect |
|---|---|---|
| `ZEDDA_AI_KEY`         | _(unset)_                                 | Required for online `ask()` fallback and `zedda run --ai`. If unset, AI features are silently skipped or return an "AI not configured" message. |
| `ZEDDA_AI_ENDPOINT` | `https://api.groq.com/openai/v1/chat/completions` | Read into `zedda._constants.AI_ENDPOINT` but **not actually used** by the call site (see warning below). |
| `ZEDDA_FORCE_SCALAR` | _(unset)_                                  | Set to `1` to force the scalar CSV scanner (disables AVX2 / AVX-512). Cached once via `std::call_once`. |

## ZEDDA_AI_KEY

Required for:

- [`zedda.ask()`](#api/ask) when the question does not match any offline pattern.
- `zedda run --ai` on the CLI.

Must match the pattern `sk-[A-Za-z0-9]{20,}`. Keys are redacted from error messages (`sk-***REDACTED***`) — see [Security](#contributing/security).

```bash
export ZEDDA_AI_KEY="sk-..."
```

The key is read from the environment only — never from a file, never from a CLI flag. This avoids leaking it into shell history or process listings.

## ZEDDA_AI_ENDPOINT

::::warning
**Known inconsistency (v0.4.8):** This variable is read into `AI_ENDPOINT` in `zedda._constants` (line 88), but the actual `_ask_zedda_ai()` call site in `zedda/__init__.py` (line 3849) hardcodes `https://api.groq.com/openai/v1/chat/completions`. Setting `ZEDDA_AI_ENDPOINT` to point at OpenAI or another OpenAI-compatible endpoint will **not** redirect the call. This is tracked as an incomplete fix (M-24) and will be resolved in a future release.
::::

The intended behaviour is for this variable to override the chat-completions endpoint. Once the M-24 fix is complete, you will be able to point Zedda at any OpenAI-compatible endpoint:

```bash
export ZEDDA_AI_ENDPOINT="https://api.openai.com/v1/chat/completions"
```

## ZEDDA_FORCE_SCALAR

Set to `1` to force the scalar CSV scanner:

```bash
ZEDDA_FORCE_SCALAR=1 python -c "import zedda as zd; zd.profile('data.csv')"
```

Useful for:

- Benchmarking (to compare SIMD vs scalar throughput)
- Debugging (to rule out SIMD-specific bugs)
- ARM / older CPUs where the SIMD path may not be optimal

The value is cached once via `std::call_once` — setting it after the first scan has no effect.

## Default AI model

The default model is `llama-3.3-70b-versatile` (Groq). Override per-call with the `model` argument to `ask()`:

```python
import zedda as zd

zd.ask("data.csv", "which columns should I drop?", model="openai/gpt-oss-120b")
```

The pricing table in `zedda._constants.AI_PRICING` tracks four models:

| Model | Provider |
|---|---|
| `llama-3.3-70b-versatile`            | Groq (default) |
| `openai/gpt-oss-120b`                 | OpenAI |
| `openai/gpt-oss-20b`                  | OpenAI |
| `moonshotai/kimi-k2-instruct-0905` | Moonshot |

## AI request parameters

When the LLM fallback fires, the request uses these parameters:

| Parameter | Value |
|---|---|
| `max_tokens` | 800 |
| `temperature` | 0.2 |
| `timeout`         | 10 seconds |

The system prompt instructs the model to act as "Zedda AI", format with `Drop immediately:` / `Drop or transform:` / `Keep:` labels, stay under 400 words, and never mention Groq, LLaMA, or the API names.

## Development configuration

These are not runtime configuration — they are developer tooling configs and are documented in [Contributing](#contributing/standards):

- `pyproject.toml [tool.ruff]` — lint + format config
- `pyproject.toml [tool.mypy]` — type-check config
- `pyproject.toml [tool.pytest.ini_options]` — pytest config
- `.coveragerc` — coverage config (source=`python/zedda`, `fail_under=55`)
- `.clang-format` — C++ formatting (Google-based, 4-space indent, 100-col)
- `.pre-commit-config.yaml` — pre-commit hooks (ruff, mypy, clang-format)

## See also

- [AI Q&A guide](#guides/ai-qa) — how `ask()` uses these variables.
- [Security](#contributing/security) — why keys are redacted.
- [C++ API: SimdScanner](#cpp-api/simd-scanner) — how `ZEDDA_FORCE_SCALAR` is read.
