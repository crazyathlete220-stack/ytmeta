# Contributing to ytmeta

Thanks for your interest in improving ytmeta! Contributions of all sizes are welcome.

## Getting started

```bash
git clone https://github.com/crazyathlete220-stack/ytmeta.git
cd ytmeta
npm install
npm test
```

Requires Node.js 18+.

## Development

- The CLI entry point is [`bin/ytmeta.js`](bin/ytmeta.js).
- Each subcommand lives in [`src/commands/`](src/commands/).
- Shared helpers are in [`src/`](src/): `config.js`, `youtube.js`, `ui.js`.

### Design principles

These keep ytmeta safe to run against a real channel — please preserve them:

1. **Dry-run by default.** Every write command must preview its changes and do
   nothing unless `--execute` is passed.
2. **No surprises.** Uploads default to `private`; destructive actions (like
   `delete`) require an explicit typed confirmation.
3. **Secrets stay local.** Never read, log, or commit credentials or tokens.

## Tests

Tests use Node's built-in test runner (no extra dependencies):

```bash
npm test
```

Please add tests for new pure logic (parsing, transforms, validation). Network
calls to the YouTube API are not unit-tested; keep that logic thin and push the
testable parts into small functions.

## Pull requests

1. Fork and create a branch from `main`.
2. Keep changes focused; one logical change per PR.
3. Make sure `npm test` passes.
4. Describe what changed and why.

## Reporting bugs / requesting features

Open an issue with steps to reproduce (for bugs) or the use case (for features).
Please do not include any real OAuth credentials or tokens in issues.
