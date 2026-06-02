'use strict';

const fs = require('fs');
const { getYouTubeClient } = require('../youtube');
const { banner, dryRunNotice, prompt } = require('../ui');

/**
 * Upload a video file with metadata.
 *
 * Defaults to privacyStatus "private" so an upload is never public by
 * accident — change it explicitly with --privacy. Even with --execute,
 * the user confirms interactively before the upload starts.
 */
async function upload(videoFile, opts) {
  const execute = Boolean(opts.execute);
  banner('Upload video', execute);

  const file = videoFile.replace(/^~/, process.env.HOME || '~');
  const privacy = opts.privacy || 'private';
  const tags = opts.tags ? opts.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const description = opts.descriptionFile
    ? fs.readFileSync(opts.descriptionFile, 'utf8')
    : opts.description || '';

  const exists = fs.existsSync(file);
  console.log(`file    : ${file} ${exists ? '(found)' : '(NOT FOUND)'}`);
  console.log(`title   : ${opts.title || '(none)'}`);
  console.log(`privacy : ${privacy}`);
  console.log(`tags    : ${tags.join(', ') || '(none)'}`);
  console.log(`category: ${opts.category || '22'}`);
  console.log(`desc    : ${description.length} chars`);

  if (!exists) {
    console.log('\nAborted: video file not found.');
    return;
  }
  if (!opts.title) {
    console.log('\nAborted: --title is required.');
    return;
  }

  if (!execute) return dryRunNotice();

  const answer = await prompt(`\nUpload as "${privacy}"? (y/n) `);
  if (answer.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    return;
  }

  const youtube = getYouTubeClient();
  console.log('\nUploading...');
  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: opts.title,
        description,
        tags,
        categoryId: opts.category || '22',
        defaultLanguage: opts.lang,
      },
      status: { privacyStatus: privacy },
    },
    media: { body: fs.createReadStream(file) },
  });

  console.log(`\nUploaded (${privacy}).`);
  console.log(`https://www.youtube.com/watch?v=${res.data.id}`);
}

module.exports = upload;
