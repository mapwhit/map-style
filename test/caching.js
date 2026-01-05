const test = require('node:test');
const assert = require('node:assert/strict');
const { initCaching, getStrategy } = require('../lib/caching');

test('caching default', function () {
  const caching = initCaching('do-nothing');

  const strategy = getStrategy(caching, {});
  assert.equal(strategy, 'do-nothing');
});

test('caching single option', function () {
  const caching = initCaching(['case', ['to-boolean', ['global-state', 'field']], 'network-only', 'do-nothing']);

  let strategy = getStrategy(caching, {
    field: true
  });
  assert.equal(strategy, 'network-only');

  strategy = getStrategy(caching, {});
  assert.equal(strategy, 'do-nothing');
});

test('caching multiple options', function () {
  const caching = initCaching([
    'case',
    ['to-boolean', ['global-state', 'field1']],
    'network-only',
    ['to-boolean', ['global-state', 'field2']],
    'cache-only',
    'do-nothing'
  ]);

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

test('caching multiple fields', function () {
  const caching = initCaching([
    'case',
    ['all', ['to-boolean', ['global-state', 'field1']], ['to-boolean', ['global-state', 'field2']]],
    'network-only',
    'do-nothing'
  ]);

  let strategy = getStrategy(caching, {
    field1: true,
    field2: true
  });
  assert.equal(strategy, 'network-only');

  strategy = getStrategy(caching, {
    field1: true
  });
  assert.equal(strategy, 'do-nothing');

  strategy = getStrategy(caching, {
    field2: true
  });
  assert.equal(strategy, 'do-nothing');

  strategy = getStrategy(caching, {});
  assert.equal(strategy, 'do-nothing');
});
