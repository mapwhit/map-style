const tileCache = require('tile-cache');

module.exports = { from, update };

function from(params, store = 'json') {
  return tileCache.get(store, getKey(params));
}

function update(params, data, store = 'json') {
  return tileCache.put(store, getKey(params), data);
}

function getKey({ url, fontstack, range }) {
  if (fontstack) {
    return [ fontstack, parseInt(range, 10) ];
  }
  return url;
}
