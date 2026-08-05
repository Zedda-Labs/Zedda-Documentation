# ProfileBuilder

```cpp
// include/zedda/profile_builder.hpp
namespace zedda {

class ProfileBuilder {
public:
    using ProgressCallback = std::function<void(int64_t rows_done)>;

    explicit ProfileBuilder(const std::string& path, StreamReaderConfig config = {});
    void set_progress(ProgressCallback cb);

    DatasetProfile build(bool is_sampled = false,
                         int64_t sample_size = 1000000,
                         bool    correlate   = false);
};

} // namespace zedda
```

## Purpose

Multi-threaded orchestrator. Builds a [`DatasetProfile`](#cpp-api/profile-result) from a CSV file by:

1. Constructing a [`CsvStreamReader`](#cpp-api/stream-reader) for the file.
2. Allocating per-column [`ColumnAccumulator`](#cpp-api/column-accumulator) instances.
3. Splitting the file into chunks and dispatching them to a thread pool (vendored `BS::thread_pool`).
4. Merging per-chunk accumulators into per-column accumulators via `ColumnAccumulator::merge()`.
5. Computing pairwise correlations on numeric columns (unless skipped).
6. Finalising each column's statistics via `ColumnAccumulator::finalize()`.
7. Returning the assembled `DatasetProfile`.

## Methods

### `set_progress(cb)`

Installs a progress callback invoked after each chunk with the number of rows processed so far. Called from worker threads — your callback must be thread-safe.

### `build(is_sampled, sample_size, correlate)`

Runs the full pipeline. Parameters:

| Parameter | Default | Meaning |
|---|---|---|
| `is_sampled`     | `false`       | If `true`, marks the resulting profile as sampled |
| `sample_size` | `1000000` | Maximum rows to read when `is_sampled` is true |
| `correlate`        | `false`        | If `true`, force O(N²) correlation even when numeric cols > 50 |

Returns a [`DatasetProfile`](#cpp-api/profile-result).

## Correlation skipping (PERF-1)

By default (`correlate=false`), the builder skips the O(N²) correlation matrix when the dataset has more than 50 numeric columns. The resulting `DatasetProfile` has `correlation_skipped = true` and an empty `correlations` vector.

Pass `correlate=true` to force correlation. The Arrow profiler has a separate hard cap at `MAX_CORR_COLS = 1000` (SEC-C01) — above 1,000 numeric columns, correlation is always skipped.

## Python entry point

The Python `scan()` / `profile()` entry point is `fasteda_core.profile(path, show_progress=True, is_sampled=False, sample_size=1000000, correlate=False)`, which constructs a `ProfileBuilder` and calls `build()`. The GIL is released for the duration of the scan.

## See also

- [C++ API: CsvStreamReader](#cpp-api/stream-reader) — what `ProfileBuilder` reads from.
- [C++ API: ColumnAccumulator](#cpp-api/column-accumulator) — what `ProfileBuilder` feeds.
- [C++ API: CorrelationEngine](#cpp-api/correlation-engine) — how correlation is computed.
- [Architecture](#architecture) — the threading model.
