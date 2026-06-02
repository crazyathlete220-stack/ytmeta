# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Test suite using Node's built-in test runner.
- GitHub Actions CI running tests on Node 18, 20, and 22.
- `CONTRIBUTING.md`, issue templates, and a pull request template.

## [0.1.0] - 2026-06-02

### Added
- Initial public release.
- `login` — OAuth authentication via a localhost loopback flow.
- `upload` — upload a video (private by default).
- `titles` — bulk-update titles from a JSON file.
- `descriptions` — bulk-update descriptions with replace / prepend / append.
- `comments` — post comments from a JSON file.
- `watermark` — set the channel branding watermark.
- `delete` — delete videos, guarded by a typed confirmation phrase.
- Dry-run-first design across all write commands.

[Unreleased]: https://github.com/crazyathlete220-stack/ytmeta/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/crazyathlete220-stack/ytmeta/releases/tag/v0.1.0
