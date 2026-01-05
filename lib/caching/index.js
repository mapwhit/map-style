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
