# HyperLogLog

```cpp
// include/zedda/hyperloglog.hpp
namespace zedda {

class HyperLogLog {
public:
    static constexpr int    BITS     = 14;
    static constexpr int    NUM_REGS = 1 << 14;       // 16384
    static constexpr double ALPHA    = 0.7213 / (1.0 + 1.079 / NUM_REGS);

    HyperLogLog();                                 // zero-init registers
    void add(double value);
    void add(std::string_view value);
    void add(const std::string& value);
    void add(int64_t value);
    double estimate() const;
    int64_t count() const;
    void   reset();
    void   merge(const HyperLogLog& other);
};

} // namespace zedda
```

## Purpose

Probabilistic cardinality estimator. Uses 14 bits → 16,384 registers → **16 KB of memory per column**, regardless of how many distinct values the column contains. Estimates unique counts with ~0.8% relative error.

## Constants

| Constant | Value | Meaning |
|---|---|---|
| `BITS`         | 14                          | Number of bits used as the register index |
| `NUM_REGS` | 16,384                  | Number of registers (2^14) |
| `ALPHA`         | 0.7213 / (1 + 1.079 / NUM_REGS) | Bias-correction constant for 14-bit HLL |

## Methods

### `add(value)`

Adds a value to the estimator. Overloads for `double`, `std::string_view`, `std::string`, and `int64_t` hash the value and update the relevant register.

### `estimate() const`

Returns the bias-corrected cardinality estimate as a `double`. Applies:

- **Small-range correction** — when the estimate is small, uses linear counting instead.
- **Large-range correction** — when the estimate is close to 2^64, adjusts for register saturation.

### `count() const`

Returns `int64_t(estimate() + 0.5)` — the rounded integer count.

### `reset()`

Zeroes all registers.

### `merge(const HyperLogLog& other)`

Element-wise max of registers. Used by [`ProfileBuilder`](#cpp-api/profile-builder) to combine per-chunk HLLs into a single per-column HLL.

## Why HLL

A `DISTINCT` count on a column with 1 billion unique values would require ~32 GB of memory in a hash set. HLL uses 16 KB per column regardless — a 2,000,000× reduction. The ~0.8% error is well below the noise floor of most EDA use cases (where you typically care about "10 unique values vs 10 million unique values", not "9,992,341 vs 10,007,219").

## See also

- [C++ API: ColumnAccumulator](#cpp-api/column-accumulator) — the accumulator that owns a per-column HLL.
- [Architecture](#architecture) — why HLL was chosen.
