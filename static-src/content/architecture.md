# Architecture

Zedda is a C++17 engine with a thin Python binding layer. The design goal is **constant memory**: a 1 TB Parquet file uses the same ~2 MB of working memory as a 1 MB CSV.

## High-level data flow

```
Python API         (python/zedda/__init__.py)
    │
    ▼
nanobind binding   (src/bindings/bindings.cpp)
    │
    ▼
fasteda_core.profile(path, ...)  — releases the GIL
    │
    ├── CSV path ─────────────► CsvStreamReader  (src/core/stream_reader.cpp)
    │                                │
    │                                ▼
    │                            MmapFile         (src/core/mmap_reader.cpp)
    │                                │
    │                                ▼
    │                            SIMD scanner     (src/core/simd_scanner.cpp)
    │                                │
    │                                ▼
    │                            ColumnAccumulator (per chunk, per thread)
    │                                │
    │                                ▼
    │                            merge + finalize
    │
    └── Parquet / Arrow / DataFrame path
                                     │
                                     ▼
                                 pyarrow         (Python)
                                     │
                                     ▼
                                 Arrow C Data Interface
                                     │
                                     ▼
                                 ArrowProfiler    (src/core/arrow_profiler.cpp)
                                     │
                                     ▼
                                 ColumnAccumulator
                                     │
                                     ▼
                                 finalize()
    │
    ▼
DatasetProfile  (include/zedda/profile_result.hpp)
    │
    ▼
Python DatasetProfileWrapper  (python/zedda/__init__.py)
    │
    ▼
Rich terminal report  OR  HTML report  OR  structured warnings
```

## The five core techniques

### 1. Welford's online algorithm

Per [`ColumnAccumulator`](#cpp-api/column-accumulator). Mean, variance, skewness, and kurtosis are computed in a single pass with constant memory. The M3 / M4 extensions (from Pébay 2008) give skewness and excess kurtosis without storing the data.

Parallel merge uses the Chan / Pébay parallel Welford formula — each worker thread processes a chunk independently, and the per-chunk accumulators are merged at the end. This is what lets Zedda scale linearly across CPU cores.

### 2. HyperLogLog

Per [`HyperLogLog`](#cpp-api/hyperloglog). 14-bit HLL → 16,384 registers → 16 KB per column, regardless of cardinality. Estimates unique counts with ~0.8% relative error — well below the noise floor of EDA use cases.

A `DISTINCT` count on a column with 1 billion unique values would require ~32 GB in a hash set. HLL uses 16 KB — a 2,000,000× reduction.

### 3. Pearson correlation

Per [Correlation Engine](#cpp-api/correlation-engine). Same Welford approach as single-column stats, but for covariance. Constant memory regardless of column length.

Two safety caps:

- **CSV path:** correlation is skipped when numeric cols > 50 and `correlate=False` (default). Override with `correlate=True`.
- **Arrow path:** correlation is always skipped above `MAX_CORR_COLS = 1000` numeric columns (SEC-C01).

### 4. SIMD CSV scanner

Per [SIMD Scanner](#cpp-api/simd-scanner). Three implementations — scalar, AVX2 (32 bytes/iter), AVX-512 (64 bytes/iter) — selected at runtime via CPU feature detection.

The scanner finds the next delimiter or quote character in the buffer. With AVX-512, Zedda processes a 1M-row CSV in ~120ms on a modern x86 CPU — see [Benchmarks](#benchmarks).

### 5. Memory-mapped file I/O

Per [`MmapFile`](#cpp-api/mmap-reader). The CSV reader uses `mmap(2)` (POSIX) or `CreateFileMapping` (Win32) to map the file into the process address space. The kernel handles paging; userspace never copies the bytes.

Combined with the constant-memory accumulators, this means Zedda's RSS stays at ~2 MB regardless of file size.

## Memory model

| Component | Memory | Scales with |
|---|---|---|
| MmapFile                      | Virtual only (kernel-managed) | File size |
| CsvStreamReader           | ~64 KB (one chunk)              | Chunk size |
| ColumnAccumulator     | ~200 bytes per column          | Column count |
| HyperLogLog                 | 16 KB per column                  | Column count |
| Pearson covariances | 8 bytes per pair                   | Numeric column count² |
| ArrowProfiler batch  | One batch at a time           | Arrow batch size |

For a typical 1M-row, 50-column CSV, total working memory is ~2 MB. The pandas equivalent would be ~800 MB.

## Sampling strategy

If a file is larger than 1 GB and `sample_size` is not set, Zedda auto-samples 2,000,000 rows. The resulting [`DatasetProfile`](#api/dataset-profile) has `is_sampled = True`, and the terminal report prints a yellow `SAMPLED` badge.

You can force a smaller or larger sample:

```python
import zedda as zd

result = zd.scan("huge.parquet", sample_size=500_000)
```

Set `sample_size=None` to scan the entire file regardless of size.

## Threading model

The vendored [BS::thread_pool](https://github.com/bshoshany/thread-pool) dispatches chunks to a fixed-size pool of worker threads. Each worker gets:

- Its own vector of `ColumnAccumulator` for the chunk
- Its own `HyperLogLog` per column
- Its own `ColumnPairAccumulator` per pair (if correlation is enabled)

After all chunks are processed, the per-worker accumulators are merged into a single per-column accumulator via `ColumnAccumulator::merge()` (Chan / Pébay parallel Welford) and `HyperLogLog::merge()` (element-wise max of registers).

The Python GIL is released for the duration of `fasteda_core.profile()`, so multi-threaded Python code keeps running during a scan.

## The Python layer

The Python layer in `python/zedda/__init__.py` is ~4,300 lines and handles:

- Input resolution (path / DataFrame → file via [`_resolve`](#api/overview))
- Calling `fasteda_core.profile()`
- Rich terminal rendering (quality bar, per-column table, warnings, correlations)
- HTML report generation ([`report.py`](#api/report))
- Offline AI pattern matching ([`_ask`](#api/overview))
- Warnings detection and ranking ([`_warnings`](#api/overview))
- Fix code generation ([`_fix`](#api/overview))
- Auto-clean with backup and audit ([`_clean`](#api/overview))
- Merge with schema check and duplicate detection ([`_merge`](#api/overview))
- ML readiness scoring ([`_ml_ready`](#api/overview))
- Distribution shift detection ([`_compare`](#api/overview))

The layer is thin — the heavy lifting (scanning, statistics, correlation, cardinality) is in C++.

## Security hardening

Zedda has systematic security hardening, tracked under the `SEC-*` audit IDs:

| ID | Hardening |
|---|---|
| SEC-P01 | `safe_col_name()` uses `repr()` to prevent code injection via CSV column names in generated pandas code |
| SEC-P02 | `scan(allowed_dir=...)` uses `Path.relative_to()` for path-traversal protection; null-byte path rejection |
| SEC-P03 / SEC-P04 | API keys redacted from error messages (`sk-[A-Za-z0-9]{20,}` → `sk-***REDACTED***`) |
| SEC-P05 | HTML report uses `_esc()` on every dynamic value; XSS regression test in `test_report.py` |
| SEC-Q01–Q07 | `ask()` path validation, blocked OS roots, extension allowlist, question sanitisation (500-char limit), API key from env only, 10s timeout |
| SEC-C01 | `MAX_CORR_COLS = 1000` prevents OOM on correlation matrix |
| SEC-C03 | Defensive `n < 1` guard in Welford update |
| SEC-C07 | Arrow pointer validation (`release != nullptr`, schema/array column-count match) |
| SEC-08  | `_FORTIFY_SOURCE=2`, `-fstack-protector-strong`, `-fPIC` on all GCC/Clang builds |

See [Security](#contributing/security) for the full policy.

## Build system

The C++ extension is built by CMake ≥ 3.21 with C++17, scikit-build-core, and nanobind. LTO is enabled in Release builds via `check_ipo_supported()` (15–25% expected speedup, PERF-2).

See [Development Setup](#contributing/setup) for the full build instructions and [Project Structure](#contributing/structure) for the directory layout.

## See also

- [C++ API](#cpp-api/overview) — every header.
- [Benchmarks](#benchmarks) — measured throughput.
- [Contributing](#contributing/setup) — how to build and modify the engine.
