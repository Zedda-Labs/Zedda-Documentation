# ProfileResult

```cpp
// include/zedda/profile_result.hpp
namespace zedda {

struct ColumnProfile {
    std::string name, type_str;
    int64_t total_count=0, null_count=0, non_null_count=0, unique_approx=0;
    double  null_pct=0.0, unique_pct=0.0;

    // numeric (int/float only)
    double mean=0, stddev=0, variance=0, skewness=0, kurtosis=0;
    double val_min=0, val_max=0, range=0;

    // string only
    int64_t min_str_len=0, max_str_len=0;
    double  mean_str_len=0.0;

    // flags
    bool has_high_nulls=false, is_constant=false, is_high_cardinality=false;
};

struct DatasetProfile {
    std::string file_path, file_name;
    int64_t num_rows=0, num_cols=0, num_numeric=0, num_string=0;
    double  overall_null_pct=0.0;
    int64_t total_null_cells=0, total_cells=0;
    double  scan_time_ms=0.0;
    bool    is_sampled=false;

    std::vector<ColumnProfile>      columns;
    std::vector<CorrelationResult>  correlations;
    bool    correlation_skipped=false;
};

} // namespace zedda
```

## Purpose

The finalized, serialisable output of a scan. Populated by [`ProfileBuilder`](#cpp-api/profile-builder) (CSV) or [`ArrowProfiler`](#cpp-api/arrow-profiler) (Parquet / Arrow). Wrapped by the Python binding and exposed as [`DatasetProfile`](#api/dataset-profile) on the Python side.

## ColumnProfile

The fields mirror what is documented in the Python [DatasetProfile](#api/dataset-profile) reference. The Python binding exposes most fields as read-only via nanobind's `def_ro`, with a few (`name`, `null_count`, `non_null_count`, `null_pct`, `val_min`, `val_max`, `range`, `has_high_nulls`) as read-write via `def_rw` — the asymmetry exists because the Python warnings layer mutates those fields in place.

## DatasetProfile

Holds the dataset-level overview plus vectors of [`ColumnProfile`](#cpp-api/profile-result) and [`CorrelationResult`](#cpp-api/correlation-engine). The `correlation_skipped` flag is set to `true` when:

- CSV input has >50 numeric columns and `correlate=false` (the default), OR
- Arrow input has >1000 numeric columns (`MAX_CORR_COLS` hard cap, SEC-C01)

## Python binding

`DatasetProfile` is bound to Python via `nb::class_<>` with `__repr__`. The Python layer wraps it in `DatasetProfileWrapper` which adds `__str__`, `to_dict()`, `to_json()`, and transparent attribute proxying via `__getattr__` / `__setattr__`.

## See also

- [Python API: DatasetProfile](#api/dataset-profile) — the Python wrapper.
- [C++ API: ColumnAccumulator](#cpp-api/column-accumulator) — what produces a `ColumnProfile`.
- [C++ API: ProfileBuilder](#cpp-api/profile-builder) — what produces a `DatasetProfile`.
