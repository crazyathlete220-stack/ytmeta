# ytmeta

[![npm version](https://img.shields.io/npm/v/ytmeta.svg)](https://www.npmjs.com/package/ytmeta)
[![node](https://img.shields.io/node/v/ytmeta.svg)](https://www.npmjs.com/package/ytmeta)
[![license](https://img.shields.io/npm/l/ytmeta.svg)](LICENSE)

A safe, **dry-run-first** command-line tool for bulk-managing YouTube video metadata —
titles, descriptions, comments, watermarks, and uploads.

Built for creators, channel managers, and agencies who maintain a lot of videos and are
tired of editing them one by one in the Studio UI.

## Why ytmeta

Bulk-editing a YouTube channel is risky: one wrong script and dozens of titles or
descriptions are overwritten with no undo. ytmeta is designed around that risk.

- **Dry-run by default.** Every write command previews exactly what it would change and
  changes *nothing* until you add `--execute`.
- **Uploads are private by default**, so nothing goes public by accident.
- **Deletes require a typed confirmation phrase**, even with `--execute`.
- **Your secrets stay local.** OAuth credentials and tokens are read from your working
  directory (or env vars) and are never bundled or committed.

## Install

```bash
npm install -g ytmeta
```

Then run `ytmeta --help` to confirm it's available. Requires Node.js 18+.

### From source

```bash
git clone https://github.com/crazyathlete220-stack/ytmeta.git
cd ytmeta
npm install
npm link        # optional: makes `ytmeta` available globally
```

## Setup (one time)

1. In the [Google Cloud Console](https://console.cloud.google.com/), create a project and
   enable the **YouTube Data API v3**.
2. Create an **OAuth client ID** of type **Desktop app** and download the JSON.
3. Save it as `client_secret.json` in the folder you run `ytmeta` from
   (or point `YTMETA_CREDENTIALS` at it).
4. Authenticate:

   ```bash
   ytmeta login
   ```

   Your browser opens, you approve access, and a `token.json` is saved locally.

> `client_secret.json` and `token.json` are already in `.gitignore`. Never commit them.

## Usage

Everything is a dry-run unless you pass `--execute`.

### Update titles in bulk

```bash
ytmeta titles examples/titles.json            # preview
ytmeta titles examples/titles.json --execute  # apply
```

`titles.json`:

```json
[
  { "id": "VIDEO_ID", "title": "New title" }
]
```

### Update descriptions in bulk

Replace a description outright, or add a shared header/footer to many videos at once:

```json
[
  { "id": "VIDEO_ID_1", "description": "Full replacement text" },
  { "id": "VIDEO_ID_2", "append": "\n—\nSubscribe: https://youtube.com/@you" },
  { "id": "VIDEO_ID_3", "prepend": "📣 New playlist: https://example.com\n" }
]
```

```bash
ytmeta descriptions examples/descriptions.json --execute
```

### Post comments

```bash
ytmeta comments examples/comments.json --execute
```

The API can't *pin* comments, so ytmeta posts them and prints the video URLs for you to
pin in Studio.

### Set a channel watermark

```bash
ytmeta watermark logo.png --channel UCxxxxxxxxxxxxxxxx --execute
```

### Upload a video

```bash
ytmeta upload ~/Movies/clip.mp4 --title "My video" --tags "a,b,c"            # dry-run
ytmeta upload ~/Movies/clip.mp4 --title "My video" --privacy unlisted --execute
```

### Delete videos (irreversible)

```bash
ytmeta delete VIDEO_ID_1 VIDEO_ID_2            # dry-run
ytmeta delete VIDEO_ID_1 VIDEO_ID_2 --execute  # prompts for a confirmation phrase
```

## Command reference

| Command | What it does | Write API |
|---------|--------------|-----------|
| `login` | OAuth authentication | — |
| `upload <file>` | Upload a video (private by default) | `videos.insert` |
| `titles <file>` | Bulk title update | `videos.update` |
| `descriptions <file>` | Bulk description update / append / prepend | `videos.update` |
| `comments <file>` | Post comments | `commentThreads.insert` |
| `watermark <image>` | Set channel watermark | `watermarks.set` |
| `delete <ids...>` | Delete videos | `videos.delete` |

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `YTMETA_CREDENTIALS` | `./client_secret.json` | OAuth client secret path |
| `YTMETA_TOKEN` | `./token.json` | saved token path |
| `YTMETA_PORT` | `4796` | local port for the login callback |

## Notes & limits

- Subject to the [YouTube Data API quota](https://developers.google.com/youtube/v3/getting-started#quota).
  Bulk writes cost quota per call; ytmeta adds small delays between calls.
- Comment pinning is not available via the API — pin manually in Studio.
- You can only modify videos on channels your authenticated account owns.

## License

MIT
