const test = require('node:test');
const assert = require('node:assert/strict');
const localize = require('../lib/localize');

test('localize with language', () => {
  assert.ok(localize() === undefined);

  // takes language into account for name
  assert.deepEqual(
    ['coalesce', ['get', 'name:en'], ['get', 'name:latin'], ['get', 'name_int'], ['get', 'name'], ''],
    localize('en')
  );
});
