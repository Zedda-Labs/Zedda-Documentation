# Correlation Engine

```cpp
// include/zedda/correlation_engine.hpp
namespace zedda {

struct ColumnPairAccumulator {
    int     col_i, col_j;
    int64_t n       = 0;
    double  mean_x  = 0.0, mean_y = 0.0;
    double  c_xx    = 0.0, c_yy   = 0.0, c_xy = 0.0;  // co-moments

    void    update(double x, double y);
    double  pearson_r() const;
};

struct CorrelationResult {
    std::string col_a, col_b;
    double      r = 0.0;
    std::string direction;  // "positive" / "negative"
    std::string strength;   // "weak" / "moderate" / "strong" / "very_strong"

    static std::string get_strength(double r);
};

inline size_t pair_idx(size_t i, size_t j, size_t n);
inline size_t pair_count(size_t n);  // n*(n-1)/2

} // namespace zedda
```

## Purpose

Online covariance accumulator. Uses the same Welford approach as [`ColumnAccumulator`](#cpp-api/column-accumulator), but for pairs of columns. Constant memory regardless of column length.

## ColumnPairAccumulator

### `update(double x, double y)`

Single Welford step for the pair (x, y). Both values must be non-null.

### `pearson_r() const`

Returns the Pearson correlation coefficient in \[−1, +1\]:

- `NaN` if `n < 2` (insufficient data)
- `0.0` if either column is constant (`c_xx` or `c_yy` is 0)

## CorrelationResult

The finalized, serialisable form of a correlation. `strength` is computed by `get_strength(r)`:

| |r| range | strength |
|---|---|
| ≥ 0.9          | `very_strong` |
| ≥ 0.7          | `strong`           |
| ≥ 0.5          | `moderate`    |
| < 0.5           | `weak`             |

The Python API only surfaces pairs with |r| ≥ 0.7.

## pair_idx / pair_count

`pair_idx(i, j, n)` returns the packed upper-triangle index for the pair (i, j) with `i < j`, used to store correlation accumulators in a flat array. `pair_count(n)` returns `n * (n - 1) / 2` — the total number of unique pairs.

## SEC-C01 cap

The Arrow profiler enforces `MAX_CORR_COLS = 1000` — above 1,000 numeric columns, correlation is always skipped to prevent OOM. The CSV profiler has a separate threshold: >50 numeric columns skips correlation unless `correlate=True` is passed.

## See also

- [C++ API: ColumnAccumulator](#cpp-api/column-accumulator) — single-column Welford.
- [C++ API: ProfileBuilder](#cpp-api/profile-builder) — orchestrates correlation across threads.
- [Architecture](#architecture) — why online covariance was chosen.
