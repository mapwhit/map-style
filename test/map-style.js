const test = require('node:test');
const assert = require('node:assert/strict');
const { MockAgent, setGlobalDispatcher } = require('undici');
const { initCacheStore } = require('../lib/loader');
const { mapStyle } = require('../lib/map-style');

test('map-style', async () => {
  const agent = new MockAgent();
  setGlobalDispatcher(agent);
  agent
    .get('https://example.com')
    .intercept({
      path: 'style.json',
      method: 'GET'
    })
    .reply(200, require('./fixtures/style.json'));

  const style = await mapStyle('https://example.com/style.json', 'network-only');
  assert.ok(style);
  assert.equal(Object.keys(style.sources).length, 3);
});

test('map-style with caching', (_, done) => {
  initCacheStore({
    update: (_, style, type) => {
      setTimeout(() => {
        if (type === 'json') {
          assert.doesNotThrow(() => structuredClone(style));
          done();
        }
      }, 0);
    }
  });
  const agent = new MockAgent();
  setGlobalDispatcher(agent);
  agent
    .get('https://example.com')
    .intercept({
      path: 'style.json',
      method: 'GET'
    })
    .reply(200, require('./fixtures/style.json'));

  mapStyle('https://example.com/style.json', 'network-first-then-cache').then(style => {
    assert.ok(style);
  });
});
