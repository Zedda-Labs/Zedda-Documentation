# Benchmarks

Zedda ships a single benchmark target: `fasteda_bench` (compile-defined `FASTEDA_STANDALONE`). It generates synthetic 31-column transaction-schema CSVs at 100K and 1M rows, then times [`CsvStreamReader`](#cpp-api/stream-reader) in scalar mode (`ZEDDA_FORCE_SCALAR=1`) vs auto mode (AVX2 / AVX-512 if available).

**File:** [`benchmarks/bench_main.cpp`](https://github.com/Zedda-Labs/Zedda/blob/main/benchmarks/bench_main.cpp) (303 lines)

## What it measures

For each row count (100K and 1M):

1. **Scalar scan time** — `ZEDDA_FORCE_SCALAR=1` is set, forcing the byte-by-byte scanner.
2. **Auto scan time** — the runtime dispatcher picks the best available scanner (AVX-512 > AVX2 > scalar).
3. **Speedup** — auto / scalar.

It also prints:

- AVX2 / AVX-512 CPU capability detection (via [`has_avx2()`](#cpp-api/simd-scanner) and [`has_avx512f()`](#cpp-api/simd-scanner))
- A pipeline breakdown — SIMD scan time (ns/byte) and `fast_float` parsing time (ns/field)
- A speedup table comparing scalar vs auto

## Targets

The benchmark has two throughput targets it aims to meet on a modern x86 CPU with AVX2:

| Rows | Target (AVX2) |
|---|---|
| 100,000  | < 15 ms  |
| 1,000,000 | < 120 ms |

## Building and running

The benchmark is built only when Zedda is configured without scikit-build (i.e. from a source checkout, not a wheel build):

```bash
git clone https://github.com/Zedda-Labs/Zedda.git --recursive
cd Zedda
pip install cmake ninja
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --target fasteda_bench
./build/fasteda_bench
```

## Sample output

On a 4-core x86_64 CPU with AVX2 but not AVX-512:

```
Zedda benchmark — synthetic transaction schema (31 columns)

CPU capabilities: AVX2=yes  AVX-512=no

=== 100K rows ===
scalar: 41.2 ms   (auto-dispatch picked: AVX2)
auto:    9.8 ms   speedup: 4.2x
  SIMD scan:   3.1 ns/byte
  fast_float: 1.4 ns/field

=== 1M rows ===
scalar: 412 ms
auto:   108 ms   speedup: 3.8x
  SIMD scan:   3.2 ns/byte
  fast_float: 1.4 ns/field
```

Actual numbers depend on CPU, RAM bandwidth, and storage speed. The key takeaway is that the SIMD scanner delivers a 3–5× speedup over the scalar path on AVX2 CPUs, and a further ~1.5× on AVX-512.

## What is not benchmarked

The benchmark measures CSV scan throughput only. It does **not** measure:

- Parquet / Arrow throughput (no `bench_parquet` target exists)
- Per-column statistics finalisation (negligible — Welford merge is O(N) in column count)
- HyperLogLog cardinality estimation (negligible — 16 KB per column regardless)
- Pearson correlation (skipped by default on >50 numeric columns)
- The Python layer overhead (Rich rendering, warnings detection, fix code generation)

## Memory usage

The benchmark prints peak RSS at the end. For a 1M-row CSV with 31 columns:

| Component | Memory |
|---|---|
| MmapFile (virtual only)         | ~150 MB virtual, ~0 KB resident |
| CsvStreamReader chunk        | ~64 KB                              |
| 31 × ColumnAccumulator         | ~6 KB                                |
| 31 × HyperLogLog                 | ~500 KB                            |
| Pearson covariance (465 pairs) | ~4 KB                        |
| **Total RSS**                                | **~2 MB**                      |

Compare to pandas: the same 1M-row, 31-column CSV in a `pd.DataFrame` uses ~250 MB. Zedda's RSS is ~125× smaller.

## Continuous fuzzing

A separate libFuzzer harness (`tests/fuzz/fuzz_csv_parser.cpp`, 24 lines) feeds arbitrary bytes through [`get_active_scanner()`](#cpp-api/simd-scanner). It runs nightly for 10 minutes in CI (`fuzz.yml`) with address sanitizer enabled. Built only when `-DZEDDA_BUILD_FUZZERS=ON` is passed to CMake.

## See also

- [C++ API: SimdScanner](#cpp-api/simd-scanner) — the SIMD implementations.
- [C++ API: CsvStreamReader](#cpp-api/stream-reader) — what is being benchmarked.
- [Architecture](#architecture) — why the engine is constant-memory.
- [Configuration](#configuration) — `ZEDDA_FORCE_SCALAR`.
