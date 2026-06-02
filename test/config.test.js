'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { resolvePaths, SCOPES } = require('../src/config');

test('resolvePaths: defaults to files in the current directory', () => {
  const saved = { c: process.env.YTMETA_CREDENTIALS, t: process.env.YTMETA_TOKEN };
  delete process.env.YTMETA_CREDENTIALS;
  delete process.env.YTMETA_TOKEN;

  const { credentialsPath, tokenPath } = resolvePaths();
  assert.equal(credentialsPath, path.join(process.cwd(), 'client_secret.json'));
  assert.equal(tokenPath, path.join(process.cwd(), 'token.json'));

  if (saved.c) process.env.YTMETA_CREDENTIALS = saved.c;
  if (saved.t) process.env.YTMETA_TOKEN = saved.t;
});

test('resolvePaths: honors environment overrides', () => {
  const saved = { c: process.env.YTMETA_CREDENTIALS, t: process.env.YTMETA_TOKEN };
  process.env.YTMETA_CREDENTIALS = '/custom/creds.json';
  process.env.YTMETA_TOKEN = '/custom/token.json';

  const { credentialsPath, tokenPath } = resolvePaths();
  assert.equal(credentialsPath, '/custom/creds.json');
  assert.equal(tokenPath, '/custom/token.json');

  if (saved.c) process.env.YTMETA_CREDENTIALS = saved.c;
  else delete process.env.YTMETA_CREDENTIALS;
  if (saved.t) process.env.YTMETA_TOKEN = saved.t;
  else delete process.env.YTMETA_TOKEN;
});

test('SCOPES: includes the force-ssl scope needed for comments', () => {
  assert.ok(SCOPES.includes('https://www.googleapis.com/auth/youtube.force-ssl'));
});
