'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadJsonArray } = require('../src/ui');

function tmpFile(contents) {
  const p = path.join(os.tmpdir(), `ytmeta-test-${Date.now()}-${Math.random()}.json`);
  fs.writeFileSync(p, contents);
  return p;
}

test('loadJsonArray: reads a valid JSON array', () => {
  const p = tmpFile('[{"id":"a"},{"id":"b"}]');
  const data = loadJsonArray(fs, p);
  assert.deepEqual(data, [{ id: 'a' }, { id: 'b' }]);
  fs.unlinkSync(p);
});

test('loadJsonArray: throws on a non-array JSON value', () => {
  const p = tmpFile('{"id":"a"}');
  assert.throws(() => loadJsonArray(fs, p), /Expected a JSON array/);
  fs.unlinkSync(p);
});

test('loadJsonArray: throws when the file is missing', () => {
  assert.throws(
    () => loadJsonArray(fs, '/no/such/file-xyz.json'),
    /Data file not found/
  );
});
