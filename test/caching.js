import assert from 'node:assert/strict';
import test from 'node:test';
import { getStrategy, initCaching } from '../lib/caching/index.js';

test('caching default', () => {
  const caching = initCaching('do-nothing');

  const strategy = getStrategy(caching, {});
  assert.equal(strategy, 'do-nothing');
});

test('caching single option', () => {
  const caching = initCaching(['case', ['to-boolean', ['global-state', 'field']], 'network-only', 'do-nothing']);

  let strategy = getStrategy(caching, {
    field: true
  });
  assert.equal(strategy, 'network-only');

  strategy = getStrategy(caching, {});
  assert.equal(strategy, 'do-nothing');
});

test('caching multiple options', () => {
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

test('caching multiple fields', () => {
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
