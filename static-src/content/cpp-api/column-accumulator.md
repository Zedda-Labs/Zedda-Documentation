# ColumnAccumulator

```cpp
// include/zedda/column_accumulator.hpp
namespace zedda {

enum class ColumnType { UNKNOWN, INTEGER, FLOAT, STRING, BOOLEAN, DATETIME };

inline std::string column_type_str(ColumnType t);
// "int" / "float" / "str" / "bool" / "datetime" / "unknown"

struct ColumnAccumulator {
    std::string name;
    ColumnType  type = ColumnType::UNKNOWN;

    int64_t count      = 0;
    int64_t null_count = 0;
    int64_t zero_count = 0;

    // Welford running statistics
    double welford_mean = 0.0;
    double welford_M2   = 0.0;
    double val_min      = std::numeric_limits<double>::max();
    double val_max      = std::numeric_limits<double>::lowest();
    double M3           = 0.0;
    double M4           = 0.0;  // excess kurtosis accumulation

    // String-length stats
    int64_t min_str_len  = std::numeric_limits<int64_t>::max();
    int64_t max_str_len  = 0;
    double  mean_str_len = 0.0;

    // Finalized results (populated by finalize())
    double mean     = 0.0;
    double variance = 0.0;
    double stddev   = 0.0;
    double skewness = 0.0;
    double kurtosis = 0.0;  // excess (normal == 0)
    double null_pct = 0.0;

    void update(double value);
    void update_null();
    void update_string(const std::string&);
    void update_string_sv(std::string_view);
    void finalize();
    void merge(const ColumnAccumulator& o);

    int64_t non_null_count() const;
    double  range()          const;
    bool    all_null()       const;
};

} // namespace zedda
```

## Purpose

Online accumulator for per-column statistics. Uses Welford's algorithm (with the M3 / M4 extension from Pébay) for mean, variance, skewness, and kurtosis in a single pass. Constant memory regardless of column length.

## Methods

### `update(double value)`

Single Welford step. NaN and Inf values are routed to `update_null()` instead of being treated as numeric values.

### `update_null()`

Increments `count` and `null_count` without affecting numeric stats.

### `update_string(const std::string&)` / `update_string_sv(std::string_view)`

Records string-length statistics (`min_str_len`, `max_str_len`, `mean_str_len`). The `_sv` variant is zero-copy.

### `finalize()`

Computes `mean`, `variance`, `stddev`, `skewness`, `kurtosis`, `null_pct` from the running moments. Must be called **once** after all rows have been fed in.

### `merge(const ColumnAccumulator& o)`

Merges another accumulator into this one using the Chan / Pébay parallel Welford formula. This is what allows the multi-threaded `ProfileBuilder` to combine per-chunk accumulators into a single column profile.

Type promotion lattice (applied during merge): `UNKNOWN < BOOLEAN < STRING < DATETIME < INTEGER < FLOAT`. A column with one float in a million integers is a `FLOAT` column.

### `non_null_count()`, `range()`, `all_null()`

Convenience accessors. `range()` is `val_max - val_min`.

## Thread safety

`ColumnAccumulator` is **not** thread-safe. Each worker thread should have its own accumulator; merge them at the end with `merge()`.

## Example

```cpp
#include <zedda/column_accumulator.hpp>

zedda::ColumnAccumulator acc;
acc.name = "age";
acc.type = zedda::ColumnType::INTEGER;

for (double v : {2, 4, 4, 4, 5, 5, 7, 9}) {
    acc.update(v);
}
acc.finalize();

// mean ≈ 5.0, variance ≈ 4.57, stddev ≈ 2.14
```

## See also

- [C++ API: CorrelationEngine](#cpp-api/correlation-engine) — the same Welford approach for covariance.
- [C++ API: ProfileBuilder](#cpp-api/profile-builder) — orchestrates accumulators across threads.
- [Architecture](#architecture) — why Welford was chosen.
