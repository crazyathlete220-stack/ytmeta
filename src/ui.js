'use strict';

const readline = require('readline');

/** Print a consistent command banner showing the active mode. */
function banner(title, execute) {
  const mode = execute ? 'EXECUTE (changes will be applied)' : 'DRY-RUN (no changes)';
  console.log('');
  console.log(`▌ ${title}`);
  console.log(`▌ mode: ${mode}`);
  console.log('');
}

/** Footer shown after a dry-run so the next step is obvious. */
function dryRunNotice() {
  console.log('');
  console.log('DRY-RUN complete. Nothing was changed.');
  console.log('Re-run with --execute to apply these changes.');
}

/** Ask a single question on stdin and resolve with the trimmed answer. */
function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** Load and validate a JSON array file used by batch commands. */
function loadJsonArray(fs, file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Data file not found: ${file}`);
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(data)) {
    throw new Error(`Expected a JSON array in ${file}.`);
  }
  return data;
}

/** Small delay to stay friendly with API quota between write calls. */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { banner, dryRunNotice, prompt, loadJsonArray, sleep };
