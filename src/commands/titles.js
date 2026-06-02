'use strict';

const fs = require('fs');
const { getYouTubeClient } = require('../youtube');
const { banner, dryRunNotice, loadJsonArray, sleep } = require('../ui');

/**
 * Bulk-update video titles.
 *
 * Data file: JSON array of { "id": "<videoId>", "title": "<new title>" }.
 * The current snippet is fetched first so we only change the title and
 * preserve description/tags/category.
 */
async function titles(file, opts) {
  const execute = Boolean(opts.execute);
  banner('Bulk title update', execute);

  const updates = loadJsonArray(fs, file).filter((u) => u.id && u.title);
  if (updates.length === 0) {
    console.log('No valid { id, title } entries found.');
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
    console.log(`${u.id}`);
    console.log(`  before: ${snippet.title}`);
    console.log(`  after : ${u.title}`);

    if (!execute) continue;

    await youtube.videos.update({
      part: 'snippet',
      requestBody: {
        id: u.id,
        snippet: {
          title: u.title,
          description: snippet.description,
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
  console.log(`\nDone: ${changed} title(s) updated.`);
}

module.exports = titles;
