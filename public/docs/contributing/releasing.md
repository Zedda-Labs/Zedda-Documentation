# Releasing

The release process is documented in [`RELEASING.md`](https://github.com/Zedda-Labs/Zedda/blob/main/RELEASING.md). This page summarises the 6-step release flow and the hotfix flow.

## Version policy

Zedda follows [Semantic Versioning](https://semver.org/):

| Bump | When |
|---|---|
| Major (0.x → 1.0)    | Breaking API changes |
| Minor (0.4.x → 0.5.0) | New features, backwards-compatible |
| Patch (0.4.7 → 0.4.8) | Bug fixes only |

The current version is **0.4.8**.

Version is single-sourced from `python/zedda/__init__.py:93` (`__version__ = "0.4.8"`) and consumed via `scikit_build_core.metadata.regex` provider in `pyproject.toml` (SEC-PKG01). It is mirrored in:

- `CMakeLists.txt:11` — `project(zedda VERSION 0.4.8 ...)`
- `CITATION.cff:7` — `version: 0.4.8`
- `python/zedda/cli.py:34` — CLI fallback string
- `python/zedda/report.py:714` — HTML report footer

::::warning
`conda-recipe/meta.yaml` is at version `0.4.5` — out of sync. The recipe's SHA256 is also a placeholder. This needs to be bumped manually before the next conda release.
::::

## The 6-step release process

### 1. Bump the version

Use the `bump.py` helper:

```bash
python bump.py 0.4.8 0.4.9
```

This sed-replaces the version string in 5 files:

- `python/zedda/__init__.py`
- `python/zedda/cli.py`
- `CMakeLists.txt`
- `tests/python/test_fasteda.py`
- `tests/python/test_extracted_modules.py`

::::note
`bump.py` does **not** bump `CITATION.cff`, `conda-recipe/meta.yaml`, or `python/zedda/report.py` — those have their own version strings and must be bumped manually.
::::

### 2. Update the CHANGELOG

Add a new section at the top of `CHANGELOG.md` in [Keep-a-Changelog](https://keepachangelog.com/en/1.1.0/) 1.1.0 format:

```markdown
## [0.4.9] - YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...
```

### 3. Commit and tag

```bash
git add -A
git commit -m "Release v0.4.9"
git tag v0.4.9
git push origin main --tags
```

### 4. CI builds the wheels

The `release.yml` workflow triggers on the tag push and:

- Builds wheels on `ubuntu-latest`, `windows-latest`, `macos-14` × `cp39, cp310, cp311, cp312, cp313, cp314`
- Linux archs: `x86_64 aarch64` (manylinux_2_28 + musllinux_1_2)
- macOS archs: `arm64` (on macos-14) / `x86_64`
- Windows: `AMD64` only
- Skips `*-win32` and `*-manylinux_i686`
- Build deps pinned: `cmake==3.30.5 ninja==1.11.1.1 scikit-build-core==0.10.7 nanobind==2.4.0`
- Uses ccache for faster rebuilds
- Generates an SBOM (SPDX-JSON) via `anchore/sbom-action@v0.18.0`

### 5. PyPI publishing via OIDC trusted publishing

Wheels are published to PyPI via [OIDC trusted publishing](https://docs.pypi.org/trusted-publishers/) — no API tokens. The publishing action is SHA-pinned: `pypa/gh-action-pypi-publish@v1.12.4` (CI-H1).

### 6. Post-publish verification

The release workflow installs from PyPI on Linux / Windows / macOS × Python 3.13, runs `zedda --help`, and opens a GitHub issue on failure.

## Docker release

The `docker.yml` workflow triggers on the same tag and:

- Builds multi-arch images (`linux/amd64`, `linux/arm64`)
- Publishes to both GHCR (`ghcr.io/zedda-labs/zedda`) and Docker Hub
- Runs Trivy and blocks HIGH/CRITICAL CVEs

## Hotfix flow

For an urgent fix on the current release:

1. Branch from the release tag: `git checkout -b hotfix/0.4.9.1 v0.4.9`
2. Apply the fix
3. Bump the patch version (e.g. `0.4.9` → `0.4.9.1`)
4. Add a hotfix section to the CHANGELOG
5. Commit, tag, push — same as the normal release flow
6. Merge the hotfix branch back to `main`

## See also

- [CHANGELOG.md](https://github.com/Zedda-Labs/Zedda/blob/main/CHANGELOG.md) — every release.
- [RELEASING.md](https://github.com/Zedda-Labs/Zedda/blob/main/RELEASING.md) — the source-of-truth process.
- [Development Setup](#contributing/setup) — how to build locally.
