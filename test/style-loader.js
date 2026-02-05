import assert from 'node:assert/strict';
import test from 'node:test';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { initCacheStore } from '../lib/loader.js';
import { styleLoader } from '../lib/style-loader.js';
import styleJson from './fixtures/style.json' with { type: 'json' };

test('style-loader', async () => {
  const agent = new MockAgent();
  setGlobalDispatcher(agent);
  agent
    .get('https://example.com')
    .intercept({
      path: 'style.json',
      method: 'GET'
    })
    .reply(200, styleJson);

  const style = await styleLoader('https://example.com/style.json', 'network-only');
  assert.ok(style);
  assert.equal(Object.keys(style.sources).length, 3);
});

test('style-loader with caching', (_, done) => {
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
    .reply(200, styleJson);

  styleLoader('https://example.com/style.json', 'network-first-then-cache').then(style => {
    assert.ok(style);
  });
});
