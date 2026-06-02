#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const pkg = require('../package.json');

const login = require('../src/commands/login');
const upload = require('../src/commands/upload');
const titles = require('../src/commands/titles');
const descriptions = require('../src/commands/descriptions');
const comments = require('../src/commands/comments');
const watermark = require('../src/commands/watermark');
const del = require('../src/commands/delete');

program
  .name('ytmeta')
  .description(
    'Safe, dry-run-first CLI for bulk-managing YouTube video metadata.\n' +
      'Every write command previews changes by default and only applies them with --execute.'
  )
  .version(pkg.version);

program
  .command('login')
  .description('Authenticate with YouTube (OAuth loopback flow)')
  .action(login);

program
  .command('upload <videoFile>')
  .description('Upload a video (private by default)')
  .requiredOption('--title <title>', 'video title')
  .option('--description <text>', 'description text')
  .option('--description-file <path>', 'read description from a file')
  .option('--tags <list>', 'comma-separated tags')
  .option('--privacy <status>', 'private | unlisted | public', 'private')
  .option('--category <id>', 'YouTube category id', '22')
  .option('--lang <code>', 'default language, e.g. en, ja')
  .option('--execute', 'actually upload (otherwise dry-run)')
  .action(upload);

program
  .command('titles <file>')
  .description('Bulk-update titles from a JSON file [{id,title}]')
  .option('--execute', 'apply changes (otherwise dry-run)')
  .action(titles);

program
  .command('descriptions <file>')
  .description('Bulk-update descriptions from JSON [{id, description|prepend|append}]')
  .option('--execute', 'apply changes (otherwise dry-run)')
  .action(descriptions);

program
  .command('comments <file>')
  .description('Post comments from a JSON file [{videoId,text}]')
  .option('--execute', 'actually post (otherwise dry-run)')
  .action(comments);

program
  .command('watermark <image>')
  .description('Set the channel branding watermark')
  .requiredOption('--channel <id>', 'target channel id')
  .option('--corner <pos>', 'topLeft | topRight | bottomLeft | bottomRight', 'bottomRight')
  .option('--offset <ms>', 'ms after start to show', '5000')
  .option('--execute', 'apply (otherwise dry-run)')
  .action(watermark);

program
  .command('delete <ids...>')
  .description('Permanently delete videos by id (requires a confirmation phrase)')
  .option('--execute', 'enable deletion (otherwise dry-run)')
  .action(del);

program.parseAsync(process.argv).catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
