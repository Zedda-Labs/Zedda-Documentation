# MmapFile

```cpp
// include/zedda/mmap_reader.hpp
namespace zedda {

class MmapFile {
public:
    explicit MmapFile(const std::string& path);
    ~MmapFile();                                   // RAII unmap

    MmapFile(const MmapFile&)            = delete;
    MmapFile& operator=(const MmapFile&) = delete;
    MmapFile(MmapFile&&) noexcept;                 // movable

    bool        open();          // true on success, never throws
    void        close();         // idempotent
    const char* data()    const;
    size_t      size()    const;
    bool        is_open() const;
};

} // namespace zedda
```

## Purpose

Cross-platform RAII wrapper around memory-mapped files. Used by [`CsvStreamReader`](#cpp-api/stream-reader) to read CSVs without buffering them through userspace.

## Behaviour

- **Constructor** stores the path. Does not open the file.
- **`open()`** returns `true` on success, `false` on any error. Never throws — safe to call from noexcept contexts.
- **`close()`** is idempotent — calling it on an already-closed (or never-opened) instance is a no-op.
- **Destructor** calls `close()` if the file is still open.
- **Moveable** but not copyable. Moving from an instance leaves the source in a valid-but-empty state.

## Platform support

- **POSIX** (Linux, macOS): `mmap(2)` + `munmap(2)` + `madvise(MADV_SEQUENTIAL)`
- **Windows**: `CreateFileMapping` + `MapViewOfFile`

Empty files are handled correctly — `open()` succeeds and `size()` returns 0.

## Debug mode

Compile with `-DZEDDA_DEBUG` to enable debug `fprintf` to stderr in the mmap reader. This is a compile-time flag, not a runtime env var.

## See also

- [C++ API: CsvStreamReader](#cpp-api/stream-reader) — uses MmapFile.
- [C++ API: ProfileBuilder](#cpp-api/profile-builder) — orchestrates the stream reader.
- [Architecture](#architecture) — why mmap.
