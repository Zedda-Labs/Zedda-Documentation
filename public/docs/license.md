# License & Third-Party Notices

Zedda is licensed under the **MIT License**. Copyright (c) 2026 Zedda-Labs.

## MIT License

```
MIT License

Copyright (c) 2026 Zedda-Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

The full text is in [`LICENSE`](https://github.com/Zedda-Labs/Zedda/blob/main/LICENSE).

## Third-Party Notices

Zedda relies on the following open-source libraries. This list mirrors [`THIRD_PARTY_NOTICES.md`](https://github.com/Zedda-Labs/Zedda/blob/main/THIRD_PARTY_NOTICES.md).

### fast_float

- **Version:** v8.0.0
- **License:** Apache 2.0 / MIT
- **URL:** [github.com/fastfloat/fast_float](https://github.com/fastfloat/fast_float)
- **Modifications:** None. Included directly in `include/zedda/fast_float/`.

### nanobind

- **Version / Commit:** `2deac96697d1b304f3c973cef7de5f94cbad5a57`
- **License:** BSD-3-Clause
- **URL:** [github.com/wjakob/nanobind](https://github.com/wjakob/nanobind)

### BS::thread_pool

- **Version / Commit:** `bd4533f1f70c2b975cbd5769a60d8eaaea1d2233`
- **License:** MIT
- **URL:** [github.com/bshoshany/thread-pool](https://github.com/bshoshany/thread-pool)

### PyArrow

- **License:** Apache 2.0
- **URL:** [github.com/apache/arrow](https://github.com/apache/arrow)
- **Usage:** Optional runtime dependency for Parquet / Arrow file profiling.
- **Version range:** `>=14.0.1,<27`

### Rich

- **License:** MIT
- **URL:** [github.com/Textualize/rich](https://github.com/Textualize/rich)
- **Usage:** Runtime dependency for terminal UI rendering.
- **Version range:** `>=13.0,<20`

### Typer

- **License:** MIT
- **URL:** [github.com/fastapi/typer](https://github.com/fastapi/typer)
- **Usage:** Runtime dependency for the CLI (`zedda` command).
- **Version range:** `>=0.12,<2.0`

### requests

- **License:** Apache 2.0
- **URL:** [github.com/psf/requests](https://github.com/psf/requests)
- **Usage:** Optional runtime dependency for `zd.ask()` AI integration (`[ai]` extra).
- **Version range:** `>=2.31,<3.0`

## Citation

If you use Zedda in academic work, cite it using the metadata in [`CITATION.cff`](https://github.com/Zedda-Labs/Zedda/blob/main/CITATION.cff):

```bibtex
@software{zedda,
  title       = {Zedda: Zero Effort Data Analysis},
  version     = {0.4.8},
  year        = {2026},
  url         = {https://github.com/Zedda-Labs/Zedda}
}
```

(The full CITATION.cff includes authors and other metadata — see the source file for the canonical citation.)

## See also

- [Security](#contributing/security) — supported versions and reporting.
- [Contributing](#contributing/setup) — how to contribute back.
- [Releasing](#contributing/releasing) — the release process.
