const test = require('node:test');
const assert = require('node:assert/strict');
const { MockAgent, setGlobalDispatcher } = require('undici');
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
