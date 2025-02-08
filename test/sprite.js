const test = require('node:test');
const assert = require('node:assert/strict');
const { MockAgent, setGlobalDispatcher } = require('undici');
const loader = require('../lib/loader');
const { loadSprite, selectSprite } = require('../lib/sprite');

test('sprite', async () => {
  const agent = new MockAgent();
  setGlobalDispatcher(agent);
  const mockPool = agent.get('https://example.com');
  mockPool
    .intercept({
      path: '2-sprite@2x.json',
      method: 'GET'
    })
    .reply(200, {});
  mockPool
    .intercept({
      path: 'B-sprite@2x.webp',
      method: 'GET'
    })
    .reply(200, {});

  global.window = global.window ?? {};
  global.window.devicePixelRatio = 2;

  const sprite = await loadSprite(loader('network-only'), selectSprite('https://example.com/sprite', [{
    json: 'https://example.com/1-sprite.json',
    src: 'https://example.com/A-sprite.webp'
  }, {
    json: 'https://example.com/2-sprite@2x.json',
    src: 'https://example.com/B-sprite@2x.webp'
  }, {
    json: 'https://example.com/2-sprite@3x.json',
    src: 'https://example.com/C-sprite@3x.webp'
  }]));
  assert.ok(sprite);
  assert.ok(sprite.json);
  assert.ok(sprite.image);
});

test('sprite base url', async () => {
  const agent = new MockAgent();
  setGlobalDispatcher(agent);
  const mockPool = agent.get('https://example.com');
  mockPool
    .intercept({
      path: 'sprite@2x.json',
      method: 'GET'
    })
    .reply(200, {});
  mockPool
    .intercept({
      path: 'sprite@2x.png',
      method: 'GET'
    })
    .reply(200, {});

  global.window = global.window ?? {};
  global.window.devicePixelRatio = 2;

  const sprite = await loadSprite(loader('network-only'), selectSprite('https://example.com/sprite'));
  assert.ok(sprite);
  assert.ok(sprite.json);
  assert.ok(sprite.image);
});
