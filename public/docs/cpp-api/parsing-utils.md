# Parsing Utilities

```cpp
// include/zedda/parsing_utils.hpp
namespace zedda {

bool       fast_atod(const char* s, size_t len, double& out);
bool       fast_is_null(const char* s, size_t len);
ColumnType fast_detect_type(const char* s, size_t len);
double     fast_parse_bool(const char* s, size_t len);

} // namespace zedda
```

All functions are `static inline` and operate on raw `const char*` + length — no `std::string` allocation.

## fast_atod

```cpp
bool fast_atod(const char* s, size_t len, double& out);
```

Parses a double from `s[0..len)`. Uses the vendored [fast_float](https://github.com/fastfloat/fast_float) v8.0.0 library for the actual parsing. Returns `true` and sets `out` on success.

Rejects NaN and Inf — those values are treated as nulls rather than numbers. This matches the intent of `fast_is_null` and avoids polluting numeric statistics with sentinel values.

Parity with `fast_float::from_chars` is verified by `tests/cpp/test_fast_float_parity.cpp`.

## fast_is_null

```cpp
bool fast_is_null(const char* s, size_t len);
```

Returns `true` if `s[0..len)` is a recognised null sentinel. The match is **case-insensitive** and the recognised set is:

- Empty string
- `?`
- `NA`
- `NaN`
- `N/A`
- `null`
- `none`
- `#N/A`

## fast_detect_type

```cpp
ColumnType fast_detect_type(const char* s, size_t len);
```

Infers the most specific type for a single value. The lattice is:

`BOOLEAN → INTEGER → FLOAT → STRING`

A value that parses as a boolean literal is `BOOLEAN`. Otherwise, a value that parses as an integer is `INTEGER`. Otherwise, a value that parses as a float is `FLOAT`. Otherwise, the value is `STRING`.

Type promotion across rows (in [`ColumnAccumulator::merge`](#cpp-api/column-accumulator)) follows the same lattice: a column with one float in a million integers is a `FLOAT` column.

## fast_parse_bool

```cpp
double fast_parse_bool(const char* s, size_t len);
```

Returns:

- `1.0` if the value is a truthy boolean literal (`true`, `yes`, `1`, `y`, `t` — case-insensitive)
- `0.0` if the value is a falsy boolean literal (`false`, `no`, `0`, `n`, `f` — case-insensitive)
- `-1.0` if the value is not a recognised boolean literal

The `-1.0` sentinel is used by [`ColumnAccumulator`](#cpp-api/column-accumulator) to decide whether to treat the value as a non-boolean (and fall through to integer / float detection).

## Why raw pointers

`const char*` + `size_t len` is the cheapest possible string view — no allocation, no virtual dispatch. The CSV scanner already has the field boundaries; passing them directly avoids constructing a `std::string` for every cell, which would dominate parsing time.

## See also

- [C++ API: ColumnAccumulator](#cpp-api/column-accumulator) — consumes the parsed values.
- [C++ API: CsvStreamReader](#cpp-api/stream-reader) — calls these functions.
- [Third-Party Notices](#license) — fast_float attribution.
