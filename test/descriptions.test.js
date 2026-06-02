'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildNewDescription } = require('../src/commands/descriptions');

test('description: full replace ignores current text', () => {
  const out = buildNewDescription({ description: 'brand new' }, 'old text');
  assert.equal(out, 'brand new');
});

test('description: empty-string replace is honored', () => {
  const out = buildNewDescription({ description: '' }, 'old text');
  assert.equal(out, '');
});

test('description: append adds after current', () => {
  const out = buildNewDescription({ append: 'footer' }, 'body');
  assert.equal(out, 'body\nfooter');
});

test('description: prepend adds before current', () => {
  const out = buildNewDescription({ prepend: 'header' }, 'body');
  assert.equal(out, 'header\nbody');
});

test('description: prepend and append combine around current', () => {
  const out = buildNewDescription({ prepend: 'H', append: 'F' }, 'body');
  assert.equal(out, 'H\nbody\nF');
});

test('description: handles missing current description', () => {
  const out = buildNewDescription({ append: 'footer' }, undefined);
  assert.equal(out, '\nfooter');
});
