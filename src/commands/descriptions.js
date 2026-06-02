'use strict';

const fs = require('fs');
const { getYouTubeClient } = require('../youtube');
const { banner, dryRunNotice, loadJsonArray, sleep } = require('../ui');

/**
 * Bulk-update video descriptions.
 *
 * Each data file entry is { "id": "<videoId>", ... } plus one of:
 *   "description": "<full text>"   replace the whole description
 *   "prepend": "<text>"            add text before the current description
 *   "append":  "<text>"            add text after the current description
 *
 * prepend/append are the common "add a shared footer/header to every video"
 * use case; they fetch the current description and modify it in place.
 */
function buildNewDescription(entry, current) {
  if (typeof entry.description === 'string') return entry.description;
  let text = current || '';
  if (entry.prepend) text = `${entry.prepend}\n${text}`;
  if (entry.append) text = `${text}\n${entry.append}`;
  return text;
}

async function descriptions(file, opts) {
  const execute = Boolean(opts.execute);
  banner('Bulk description update', execute);

  const updates = loadJsonArray(fs, file).filter(
    (u) => u.id && (u.description != null || u.prepend || u.append)
  );
  if (updates.length === 0) {
    console.log('No valid entries found (need id + description/prepend/append).');
    return;
  }

  const youtube = getYouTubeClient();
  const ids = updates.map((u) => u.id).join(',');
  const current = await youtube.videos.list({ part: 'snippet', id: ids });
  const snippetById = {};
  current.data.items.forEach((v) => {
    snippetById[v.id] = v.snippet;
  });

  let changed = 0;
  for (const u of updates) {
    const snippet = snippetById[u.id];
    if (!snippet) {
      console.log(`skip (not found / not owned): ${u.id}`);
      continue;
    }
    const next = buildNewDescription(u, snippet.description);
    console.log(`${u.id}  (${snippet.title})`);
    console.log(`  ${next.length} chars after update`);

    if (!execute) continue;

    await youtube.videos.update({
      part: 'snippet',
      requestBody: {
        id: u.id,
        snippet: {
          title: snippet.title,
          description: next,
          categoryId: snippet.categoryId,
          tags: snippet.tags || [],
          defaultLanguage: snippet.defaultLanguage,
        },
      },
    });
    console.log('  updated');
    changed++;
    await sleep(400);
  }

  if (!execute) return dryRunNotice();
  console.log(`\nDone: ${changed} description(s) updated.`);
}

module.exports = descriptions;
module.exports.buildNewDescription = buildNewDescription;
