const tileCache = require('tile-cache');

module.exports = { from, update };

const stores = {
  json: 'json'
};

function from(params, type) {
  return tileCache.get(getStore(type), getKey(params));
}

function update(params, data, type) {
  return tileCache.put(getStore(type), getKey(params), data);
}

function getStore(type) {
  return stores[type] ?? stores.json;
}

function getKey(params) {
  return params.url;
}
