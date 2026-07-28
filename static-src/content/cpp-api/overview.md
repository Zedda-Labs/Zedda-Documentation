# C++ API Overview

The Zedda core engine is C++17. All public C++ symbols live in **namespace `zedda`**, and headers are under [`include/zedda/`](https://github.com/Zedda-Labs/Zedda/tree/main/include/zedda).

The C++ API is **not** part of the public Python surface — it is the engine that powers the Python bindings via [nanobind](https://github.com/wjakob/nanobind). You would only use these headers directly if you were embedding Zedda into another C++ project.

## Header map

| Header | Key types |
|---|---|
| [`column_accumulator.hpp`](#cpp-api/column-accumulator)         | `ColumnType`, `ColumnAccumulator` (Welford) |
| [`correlation_engine.hpp`](#cpp-api/correlation-engine)        | `ColumnPairAccumulator`, `CorrelationResult`, `pair_idx`, `pair_count` |
| [`profile_result.hpp`](#cpp-api/profile-result)                  | `ColumnProfile`, `DatasetProfile` |
| [`hyperloglog.hpp`](#cpp-api/hyperloglog)                               | `HyperLogLog` (14-bit, 16 KB) |
| [`mmap_reader.hpp`](#cpp-api/mmap-reader)                              | `MmapFile` (RAII mmap) |
| [`simd_scanner.hpp`](#cpp-api/simd-scanner)                          | `has_avx2()`, `has_avx512f()`, `select_best_scanner()` |
| [`stream_reader.hpp`](#cpp-api/stream-reader)                        | `CsvStreamReader`, `StreamReaderConfig`, `ChunkResult` |
| [`profile_builder.hpp`](#cpp-api/profile-builder)                 | `ProfileBuilder` (orchestrator) |
| [`arrow_profiler.hpp`](#cpp-api/arrow-profiler)                     | `ArrowProfiler`, `ArrowSchema`, `ArrowArray` |
| [`parsing_utils.hpp`](#cpp-api/parsing-utils)                         | `fast_atod`, `fast_is_null`, `fast_detect_type`, `fast_parse_bool` |

## Vendored third-party (not part of the public API)

These live under `include/zedda/` but are third-party libraries, not Zedda code:

| Library | License | Path |
|---|---|---|
| `fast_float` v8.0.0      | Apache 2.0 / MIT | `include/zedda/fast_float/` |
| `BS::thread_pool`            | MIT                       | `include/zedda/BS_thread_pool.hpp` |

See [License & Third-Party Notices](#license) for full attribution.

## C++ standard and compiler requirements

- C++17 (required, no extensions)
- CMake ≥ 3.21
- GCC, Clang, or MSVC with C++17 support
- POSIX threads (Linux / macOS) or Win32 threads (Windows)

Compiler flags applied by `CMakeLists.txt`:

- GCC/Clang: `-O3 -Wall -Wextra -D_FORTIFY_SOURCE=2 -fstack-protector-strong -fPIC`
- MSVC: `/O2 /W3 /wd4996 /wd4834 /D_CRT_SECURE_NO_WARNINGS`
- LTO enabled in Release builds via `check_ipo_supported()` (15–25% expected speedup, PERF-2)
- `simd_scanner.cpp` gets extra flags: GCC/Clang `-mavx2 -mavx512f -mavx512bw -mpopcnt`, MSVC `/arch:AVX2`

## The Python binding

The C++ extension is loaded as `fasteda_core` (legacy name retained for backwards compatibility; will be renamed `zedda_core` in v0.6.0 per audit finding P-M26).

The binding (`src/bindings/bindings.cpp`) exposes:

- `ColumnProfile`, `CorrelationResult`, `DatasetProfile` — read-only / read-write attribute access
- `ArrowProfiler(file_name, total_rows)` — `consume_batch(schema_ptr, array_ptr)` + `finalize()`
- `profile(path, show_progress=True, is_sampled=False, sample_size=1000000, correlate=False)` — the GIL-releasing entry point used by the Python `scan()` / `profile()`

You normally never need to import `fasteda_core` directly — use the Python API.

## Next steps

- [Architecture](#architecture) — how the engine fits together.
- [Build System](#contributing/setup) — how to compile Zedda from source.
- [Python API](#api/overview) — the public surface most users want.
