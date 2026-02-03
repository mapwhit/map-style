import expression from './expression.js';

export function initCaching(caching) {
  if (!caching) {
    return;
  }
  return expression(caching);
}

export function getStrategy(caching, object) {
  if (!caching) {
    return;
  }
  return caching.evaluate(object);
}

function getValues(caching, values = []) {
  if (typeof caching === 'string') {
    values.push(caching);
    return values;
  }
  if (Array.isArray(caching)) {
    caching.forEach(item => getValues(item, values));
  }
  return values;
}

export function isCacheable(caching) {
  if (!caching) {
    return;
  }
  return getValues(caching).some(key => key.startsWith('cache-'));
}
