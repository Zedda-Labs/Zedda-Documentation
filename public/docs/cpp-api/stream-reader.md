# CsvStreamReader

```cpp
// include/zedda/stream_reader.hpp
namespace zedda {

struct ChunkResult {
    int64_t rows_processed = 0;
    int64_t total_rows     = 0;
    bool    done           = false;
};

struct StreamReaderConfig {
    int64_t     chunk_size  = 65536;   // rows per chunk
    char        delimiter   = ',';
    char        quote_char  = '"';
    bool        has_header  = true;
    std::string null_string = "";
};

class CsvStreamReader {
public:
    explicit CsvStreamReader(const std::string& path, StreamReaderConfig config = {});
    ~CsvStreamReader() noexcept;

    bool open();
    void close();

    std::vector<ColumnAccumulator> make_accumulators() const;
    ChunkResult read_chunk(std::vector<ColumnAccumulator>& accumulators);

    bool                            done()         const;
    int64_t                         rows_read()    const;
    const std::vector<std::string>& column_names() const;
    size_t                          num_columns()  const;
    const std::string&              path()         const;
};

} // namespace zedda
```

## Purpose

Constant-memory chunked CSV reader. Uses [`MmapFile`](#cpp-api/mmap-reader) for file access and the active [SIMD scanner](#cpp-api/simd-scanner) for field boundary detection. Feeds parsed values into per-column [`ColumnAccumulator`](#cpp-api/column-accumulator) instances.

## StreamReaderConfig

| Field | Default | Meaning |
|---|---|---|
| `chunk_size`  | `65536`     | Rows per chunk. Memory usage scales with this × number of columns. |
| `delimiter`   | `','`            | Field delimiter |
| `quote_char`  | `'"'`            | Quote character for escaped fields |
| `has_header`  | `true`         | Treat the first row as a header |
| `null_string` | `""`              | String to interpret as null (in addition to the built-in set) |

The built-in null detection (via [`fast_is_null`](#cpp-api/parsing-utils)) recognises: empty string, `?`, `NA`, `NaN`, `N/A`, `null`, `none`, `#N/A` (all case-insensitive).

## Methods

### `open()`

Opens the underlying [`MmapFile`](#cpp-api/mmap-reader). Returns `false` if the file cannot be opened (missing, permission denied, etc.). Never throws.

### `close()`

Idempotent. Closes the underlying mmap.

### `make_accumulators()`

Returns a vector of [`ColumnAccumulator`](#cpp-api/column-accumulator) — one per column — populated with the column names from the header (if `has_header` is true) or `col_0`, `col_1`, ... (if false).

### `read_chunk(accumulators)`

Reads up to `chunk_size` rows and feeds the values into `accumulators`. Returns a `ChunkResult` with the number of rows processed in this call and the total rows read so far. Sets `done = true` when the file is exhausted.

### `done()`, `rows_read()`, `column_names()`, `num_columns()`, `path()`

Accessors. `done()` is true after the final `read_chunk()` call.

## Header detection

If `has_header=true` (default), the first row is consumed as the header and used to name the accumulators. If `has_header=false`, columns are named `col_0`, `col_1`, ..., and the first row is treated as data.

## BOM and embedded newlines

The reader handles:

- **UTF-8 BOM** (`\xEF\xBB\xBF`) at the start of the file — stripped silently (fix C-H11).
- **Embedded newlines in quoted fields** — a newline inside a quoted field is treated as part of the field, not a row terminator (fix C-H10).
- **Escaped quotes** — `""` inside a quoted field is treated as a literal `"`.

## Destructor

Marked `noexcept` (fix C-L12). Safe to destroy during stack unwinding.

## See also

- [C++ API: ProfileBuilder](#cpp-api/profile-builder) — orchestrates `CsvStreamReader`.
- [C++ API: ColumnAccumulator](#cpp-api/column-accumulator) — what `read_chunk` feeds.
- [C++ API: MmapFile](#cpp-api/mmap-reader) — how the file is read.
- [C++ API: SimdScanner](#cpp-api/simd-scanner) — how field boundaries are found.
