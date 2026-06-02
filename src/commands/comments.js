'use strict';

const fs = require('fs');
const { getYouTubeClient } = require('../youtube');
const { banner, dryRunNotice, loadJsonArray, sleep } = require('../ui');

/**
 * Post a top-level comment on each listed video.
 *
 * Data file: JSON array of { "videoId": "<id>", "text": "<comment>" }.
 *
 * Note: the YouTube Data API cannot pin a comment. After posting, pin it
 * manually in YouTube Studio. Posted video URLs are printed to make that easy.
 */
async function comments(file, opts) {
  const execute = Boolean(opts.execute);
  banner('Bulk comment posting', execute);

  const items = loadJsonArray(fs, file).filter((c) => c.videoId && c.text);
  if (items.length === 0) {
    console.log('No valid { videoId, text } entries found.');
    return;
  }

  const youtube = execute ? getYouTubeClient() : null;
  const posted = [];

  for (const item of items) {
    console.log(`${item.videoId}`);
    console.log('  ----------------------------------------');
    console.log(
      '  ' + item.text.split('\n').join('\n  ')
    );
    console.log('  ----------------------------------------');

    if (!execute) continue;

    try {
      const res = await youtube.commentThreads.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            videoId: item.videoId,
            topLevelComment: { snippet: { textOriginal: item.text } },
          },
        },
      });
      console.log(`  posted (comment ${res.data.id})`);
      posted.push(item.videoId);
    } catch (err) {
      console.log(`  error: ${err.message}`);
    }
    await sleep(1200);
  }

  if (!execute) return dryRunNotice();

  console.log(`\nDone: ${posted.length}/${items.length} comment(s) posted.`);
  if (posted.length) {
    console.log('\nPin them manually in YouTube Studio (API cannot pin):');
    posted.forEach((id) => console.log(`  https://www.youtube.com/watch?v=${id}`));
  }
}

module.exports = comments;
