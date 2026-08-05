# SIMD Scanner

```cpp
// include/zedda/simd_scanner.hpp
namespace zedda {

bool   has_avx2()    noexcept;
bool   has_avx512f() noexcept;

size_t find_next_special_scalar (const char* data, size_t len, size_t pos, char delim, char quote) noexcept;
size_t find_next_special_avx2   (const char* data, size_t len, size_t pos, char delim, char quote) noexcept;
size_t find_next_special_avx512 (const char* data, size_t len, size_t pos, char delim, char quote) noexcept;

using ScanFn = size_t(*)(const char*, size_t, size_t, char, char) noexcept;

ScanFn select_best_scanner() noexcept;
ScanFn get_active_scanner() noexcept;

} // namespace zedda
```

## Purpose

Finds the next occurrence of the CSV delimiter or quote character in a buffer. Three implementations — scalar, AVX2, and AVX-512 — with runtime CPU feature detection.

## CPU feature detection

### `has_avx2()`

Returns `true` if the CPU supports AVX2. Safe to call on any CPU — uses `__builtin_cpu_supports("avx2")` on GCC/Clang and `IsProcessorFeaturePresent` on MSVC.

### `has_avx512f()`

Returns `true` if the CPU supports AVX-512F **and** AVX-512BW. Same detection strategy.

## Scanner functions

All three scan functions have the same signature:

```cpp
size_t find_next_special_X(const char* data, size_t len, size_t pos, char delim, char quote) noexcept;
```

Returns the index of the next delimiter or quote character at or after `pos`. Returns `len` if none found.

- `find_next_special_scalar` — byte-by-byte loop. Always available.
- `find_next_special_avx2` — processes 32 bytes per iteration. Requires AVX2.
- `find_next_special_avx512` — processes 64 bytes per iteration. Requires AVX-512F + AVX-512BW.

## Dispatcher

### `select_best_scanner()`

Returns the best available scanner function pointer, prioritising AVX-512 > AVX2 > scalar. Called once at startup.

### `get_active_scanner()`

Returns the cached scanner function. Honors `ZEDDA_FORCE_SCALAR=1` — when set, forces the scalar scanner regardless of CPU support. Cached via `std::call_once` so the env var is only read once.

## Forcing scalar mode

```bash
ZEDDA_FORCE_SCALAR=1 python -c "import zedda as zd; zd.profile('data.csv')"
```

Useful for benchmarking and for ARM / older CPUs where the SIMD path may not be optimal.

## Per-file compile flags

`simd_scanner.cpp` gets extra compile flags in `CMakeLists.txt`:

- GCC/Clang: `-mavx2 -mavx512f -mavx512bw -mpopcnt`
- MSVC: `/arch:AVX2`
- ARM64: empty (no SIMD flags)

This allows the same translation unit to contain all three implementations and select between them at runtime.

## See also

- [C++ API: CsvStreamReader](#cpp-api/stream-reader) — uses the active scanner.
- [Benchmarks](#benchmarks) — scalar vs AVX2 vs AVX-512 throughput.
- [Configuration](#configuration) — `ZEDDA_FORCE_SCALAR`.
