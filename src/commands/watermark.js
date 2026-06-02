'use strict';

const fs = require('fs');
const { Readable } = require('stream');
const { getYouTubeClient } = require('../youtube');
const { banner, dryRunNotice } = require('../ui');

/**
 * Set a channel branding watermark (the subscribe overlay shown on videos).
 *
 * Requires --channel <channelId> and an image file (PNG recommended,
 * 150x150px or larger). Applies to all videos on the channel.
 */
async function watermark(image, opts) {
  const execute = Boolean(opts.execute);
  banner('Channel watermark', execute);

  if (!opts.channel) {
    console.log('Missing --channel <channelId>.');
    return;
  }
  if (!fs.existsSync(image)) {
    console.log(`Image not found: ${image}`);
    return;
  }

  const offsetMs = Number(opts.offset) || 5000;
  const corner = opts.corner || 'bottomRight';
  const size = fs.statSync(image).size;

  console.log(`channel : ${opts.channel}`);
  console.log(`image   : ${image} (${size} bytes)`);
  console.log(`position: ${corner}`);
  console.log(`timing  : ${offsetMs}ms after start`);

  if (!execute) return dryRunNotice();

  const youtube = getYouTubeClient();
  await youtube.watermarks.set({
    channelId: opts.channel,
    part: 'targetChannelId',
    requestBody: {
      position: { type: 'corner', cornerPosition: corner },
      timing: { type: 'offsetFromStart', offsetMs },
      targetChannelId: opts.channel,
    },
    media: {
      mimeType: image.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
      body: Readable.from(fs.readFileSync(image)),
    },
  });

  console.log('\nWatermark set. It may take a few minutes to appear on all videos.');
}

module.exports = watermark;
