const test = require('node:test');
const assert = require('node:assert/strict');
const { init, reset } = require('../lib/layers');

test('{name}', () => {
  const nameLayer = {
    id: 'name',
    layout: {
      'text-field': '{name}'
    }
  };
  const style = {
    layers: [ nameLayer ]
  };
  init(style);
  assert.equal(nameLayer.layout['text-field'], '{name}');
  reset(style, { language: 'fr' });
  assert.ok(Array.isArray(nameLayer.layout['text-field']));
  assert.equal(nameLayer.metadata['text-field'], '"{name}"');
  reset(style, {});
  assert.equal(nameLayer.layout['text-field'], '{name}');
});

test('["get" "name"]', () => {
  const nameLayer = {
    id: 'name',
    layout: {
      'text-field': ['get', 'name']
    }
  };
  const style = {
    layers: [ nameLayer ]
  };
  init(style);
  assert.deepEqual(nameLayer.layout['text-field'], ['get', 'name']);
  reset(style, { language: 'fr' });
  assert.ok(Array.isArray(nameLayer.layout['text-field']));
  assert.notEqual(nameLayer.layout['text-field'][0], 'get');
  assert.equal(nameLayer.metadata['text-field'], '["get","name"]');
  reset(style, {});
  assert.deepEqual(nameLayer.layout['text-field'], ['get', 'name']);
});

test('["upcase", ["get" "name"]]', () => {
  const nameLayer = {
    id: 'name',
    layout: {
      'text-field': ['upcase', ['get', 'name']]
    }
  };
  const style = {
    layers: [ nameLayer ]
  };
  init(style);
  assert.deepEqual(nameLayer.layout['text-field'], ['upcase', ['get', 'name']]);
  reset(style, { language: 'fr' });
  assert.ok(Array.isArray(nameLayer.layout['text-field']));
  assert.equal(nameLayer.layout['text-field'][0], 'upcase');
  assert.notEqual(nameLayer.layout['text-field'][1][0], 'get');
  assert.equal(nameLayer.metadata['text-field'], '["upcase",["get","name"]]');
  reset(style, {});
  assert.deepEqual(nameLayer.layout['text-field'], ['upcase', ['get', 'name']]);
});

test('ABC', () => {
  const nameLayer = {
    id: 'name',
    layout: {
      'text-field': 'ABC'
    },
    metadata: {
      'text-field': '{name}'
    }
  };
  const style = {
    layers: [ nameLayer ]
  };
  init(style);
  assert.equal(nameLayer.layout['text-field'], 'ABC');
  assert.ok(!nameLayer.metadata['text-field']);
  reset(style, { language: 'fr' });
  assert.equal(nameLayer.layout['text-field'], 'ABC');
  assert.ok(!nameLayer.metadata['text-field']);
  reset(style, {});
  assert.equal(nameLayer.layout['text-field'], 'ABC');
  assert.ok(!nameLayer.metadata['text-field']);
});
