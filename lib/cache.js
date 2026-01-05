import tileCache from 'tile-cache';

export function from(params, store = 'json') {
  return tileCache.get(store, getKey(params));
}

export function update(params, data, store = 'json') {
  return tileCache.put(store, getKey(params), data);
}

function getKey({ url, fontstack, range, x, y, z }) {
  if (fontstack) {
    return [fontstack, Number.parseInt(range, 10)];
  }
  if (x !== undefined) {
    return [x, y, z];
  }
  return url;
}
