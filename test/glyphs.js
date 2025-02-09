const test = require('node:test');
const assert = require('node:assert/strict');
const loadGlyphs = require('../lib/glyphs');

test('glyphs', async () => {
  loadGlyphs((params, type) => {
    assert.equal(type, 'font');
    const { url } = params;
    assert.equal(url, 'https://localhost/fonts/v1/Arial Unicode MS/0-255.pbf');
  }, 'https://localhost/fonts/v1/{fontstack}/{range}.pbf')('Arial Unicode MS', 0);
});
