import assert from 'node:assert/strict';
import test from 'node:test';
import loadGlyphs from '../lib/glyphs.js';

test('glyphs', async () => {
  loadGlyphs((params, type) => {
    assert.equal(type, 'font');
    const { url } = params;
    assert.equal(url, 'https://localhost/fonts/v1/Arial Unicode MS/0-255.pbf');
  }, 'https://localhost/fonts/v1/{fontstack}/{range}.pbf')('Arial Unicode MS', 0);
});
