# ArrowProfiler

```cpp
// include/zedda/arrow_profiler.hpp
namespace zedda {

// Arrow C Data Interface structs (extern "C")
struct ArrowSchema {
    const char* format;
    const char* name;
    const char* metadata;
    int64_t flags, n_children;
    ArrowSchema** children;
    ArrowSchema* dictionary;
    void (*release)(ArrowSchema*);
    void* private_data;
};

struct ArrowArray {
    int64_t length, null_count, offset, n_buffers, n_children;
    const void** buffers;
    ArrowArray** children;
    ArrowArray* dictionary;
    void (*release)(ArrowArray*);
    void* private_data;
};

class ArrowProfiler {
public:
    ArrowProfiler(const std::string& file_name, int64_t total_rows);
    ~ArrowProfiler() = default;

    void            consume_batch(uintptr_t schema_ptr, uintptr_t array_ptr);
    DatasetProfile  finalize();

private:
    static constexpr int64_t MAX_CORR_COLS = 1000;  // SEC-C01
};

} // namespace zedda
```

## Purpose

Profiles datasets delivered as Arrow batches via the [Arrow C Data Interface](https://arrow.apache.org/docs/format/CDataInterface.html). Used when the Python layer receives a Parquet, Arrow, or Feather file, or a pandas / polars DataFrame (which is converted to Arrow under the hood).

## Arrow C Data Interface

`ArrowSchema` and `ArrowArray` are the two C structs that compose the Arrow C Data Interface. They are imported into namespace `zedda` for convenience but are defined `extern "C"` to match the Arrow ABI exactly.

## Methods

### `ArrowProfiler(file_name, total_rows)`

Constructor. `file_name` is used only for the resulting [`DatasetProfile`](#cpp-api/profile-result) metadata — no file is opened. `total_rows` is the expected total row count (used for progress reporting).

### `consume_batch(schema_ptr, array_ptr)`

Consumes one Arrow batch. `schema_ptr` and `array_ptr` are uintptr_t values (raw pointers cast to integers) so they can cross the Python / C++ boundary without nanobind having to know about the Arrow structs.

Validates (SEC-C07):

- Both pointers must be non-null.
- `schema->release` and `array->release` must be non-null (i.e. the structs are still valid).
- The column count of `schema` and `array` must match.

Throws `std::runtime_error` on validation failure (rather than crashing with an OOB access).

### `finalize()`

Computes the final [`DatasetProfile`](#cpp-api/profile-result) from the accumulated batches. Applies the `MAX_CORR_COLS = 1000` cap (SEC-C01) — above 1,000 numeric columns, correlation is always skipped.

## Supported Arrow format strings

Read from `src/core/arrow_profiler.cpp`:

| Format | ColumnType |
|---|---|
| `c`, `C` (int8 / uint8)                                | `INTEGER`  |
| `s`, `S` (int16 / uint16)                            | `INTEGER`  |
| `i`, `I` (int32 / uint32)                            | `INTEGER`  |
| `l`, `L` (int64 / uint64)                            | `INTEGER`  |
| `e` (float16), `f` (float32), `g` (float64) | `FLOAT`     |
| `b` (bool)                                                       | `BOOLEAN` |
| `u`, `U`, `z`, `Z` (utf8 / binary variants)        | `STRING`   |
| Anything starting with `td`, `tt`, or `ts`       | `DATETIME` |
| Anything else                                                  | `UNKNOWN` (one-time stderr warning per format) |

## Python binding

`ArrowProfiler` is exposed to Python as `fasteda_core.ArrowProfiler`. The Python `scan()` function uses it for Parquet / Arrow / Feather input — `pyarrow` reads the file and exports each batch via the Arrow C Data Interface.

## See also

- [C++ API: ProfileResult](#cpp-api/profile-result) — the output type.
- [C++ API: ColumnAccumulator](#cpp-api/column-accumulator) — what `consume_batch` feeds.
- [Architecture](#architecture) — the Arrow data flow.
