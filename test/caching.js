const test = require('node:test');
const assert = require('node:assert/strict');
const { initCaching, getStrategy } = require('../lib/caching');

test('caching default', function () {
  const caching = initCaching({
    default: 'do-nothing'
  });

  const strategy = getStrategy(caching, {});
  assert.equal(strategy, 'do-nothing');
});

test('caching single option', function () {
  let caching = initCaching({
    default: 'do-nothing',
    'network-only': 'field'
  });

  let strategy = getStrategy(caching, {
    field: true
  });
  assert.equal(strategy, 'network-only');

  strategy = getStrategy(caching, {});
  assert.equal(strategy, 'do-nothing');
});

test('caching multiple options', function () {
  let caching = initCaching({
    default: 'do-nothing',
    'network-only': 'field1',
    'cache-only': 'field2'
  });

  let strategy = getStrategy(caching, {
    field1: true
  });
  assert.equal(strategy, 'network-only');

  strategy = getStrategy(caching, {
    field2: true
  });
  assert.equal(strategy, 'cache-only');

  strategy = getStrategy(caching, {});
  assert.equal(strategy, 'do-nothing');
});
