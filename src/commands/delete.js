'use strict';

const { getYouTubeClient } = require('../youtube');
const { banner, prompt } = require('../ui');

const CONFIRM_PHRASE = 'DELETE VIDEOS';

/**
 * Permanently delete videos by ID. This is irreversible, so even with
 * --execute the user must type an exact confirmation phrase.
 */
async function del(ids, opts) {
  const execute = Boolean(opts.execute);
  banner('Delete videos', execute);

  if (!ids || ids.length === 0) {
    console.log('No video IDs given.');
    return;
  }

  console.log('This permanently deletes the following videos:');
  ids.forEach((id) => console.log(`  - https://www.youtube.com/watch?v=${id}`));
  console.log('\nAPI operation: youtube.videos.delete');

  if (!execute) {
    console.log('\nDRY-RUN complete. Nothing was deleted.');
    console.log(`Re-run with --execute and confirm "${CONFIRM_PHRASE}" to delete.`);
    return;
  }

  console.log('\nThis cannot be undone.');
  const answer = await prompt(`Type exactly to confirm — ${CONFIRM_PHRASE}\n> `);
  if (answer !== CONFIRM_PHRASE) {
    console.log('Confirmation did not match. Aborted.');
    return;
  }

  const youtube = getYouTubeClient();
  for (const id of ids) {
    try {
      await youtube.videos.delete({ id });
      console.log(`deleted: ${id}`);
    } catch (err) {
      if (err.code === 404) console.log(`not found (already deleted?): ${id}`);
      else if (err.code === 403) console.log(`forbidden (not your video?): ${id}`);
      else console.log(`error: ${id} — ${err.message}`);
    }
  }
  console.log('\nDone.');
}

module.exports = del;
