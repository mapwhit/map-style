import assert from 'node:assert/strict';
import test from 'node:test';
import { geojson, image, raster, 'raster-dem' as rasterDem, vector } from '../lib/source/index.js';

test('source', () => {
  assert.equal(vector, raster);
  assert.equal(vector, rasterDem);
});

test('geojson', () => {
  let loaded;
  const URL = 'https://example.com/geojson.json';
  const loader =
    () =>
    ({ url }) => {
      assert.equal(url, URL);
      loaded = true;
    };
  geojson.init(loader, { data: URL }, { metadata: {} });
  assert.equal(loaded, true);
});

test('image', () => {
  let loaded;
  const URL = 'https://example.com/image.png';
  const loader =
    () =>
    ({ url }) => {
      assert.equal(url, URL);
      loaded = true;
    };
  image.init(loader, { url: URL }, { metadata: {} });
  assert.equal(loaded, true);
});

test('vector', () => {
  let loaded;
  const URL = 'https://example.com/tiles/{z}/{x}/{y}.pbf';
  const loader =
    () =>
    ({ url }) => {
      assert.equal(url, URL.replace('{x}', '5').replace('{y}', '5').replace('{z}', '10'));
      loaded = true;
    };
  const source = { tiles: [URL], scheme: 'xyz' };
  vector.init(loader, source, { metadata: {} });
  source.tiles({ x: 5, y: 5, z: 10 });
  assert.equal(loaded, true);
});

test('vector tms', () => {
  let loaded;
  const URL = 'https://example.com/tiles/{z}/{x}/{y}.pbf';
  const loader =
    () =>
    ({ url }) => {
      assert.equal(url, URL.replace('{x}', '5').replace('{y}', '1018').replace('{z}', '10'));
      loaded = true;
    };
  const source = { tiles: [URL], scheme: 'tms' };
  vector.init(loader, source, { metadata: {} });
  source.tiles({ x: 5, y: 5, z: 10 });
  assert.equal(loaded, true);
});
