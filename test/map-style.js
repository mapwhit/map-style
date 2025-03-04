const test = require('node:test');
const assert = require('node:assert/strict');
const { MockAgent, setGlobalDispatcher } = require('undici');
const { mapStyle, reset } = require('../lib/map-style');

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

test('localize', async () => {
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
  const nameLayer = style.layers.find(layer => layer.id === 'name');
  assert.ok(nameLayer);
  assert.equal(nameLayer.layout['text-field'], '{name}');
  reset(style, { language: 'fr' });
  assert.ok(Array.isArray(nameLayer.layout['text-field']));
  reset(style, {});
  assert.equal(nameLayer.layout['text-field'], '{name}');
});
