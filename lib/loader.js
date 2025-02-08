const cache = require('./cache');

module.exports = selectStrategy;

const strategies = {
  'network-only': networkOnly,
  'network-first': networkFirst,
  'network-then-cache': networkThenCache,
  'network-first-then-cache': networkFirstThenCache,
  'cache-only': cacheOnly,
  'cache-first': cacheFirst,
  'cache-first-then-cache': cacheFirstThenCache
};

function selectStrategy(strategy = 'network-only') {
  return strategies[strategy] ?? networkOnly;
}

async function networkOnly(params, type = 'json') {
  const { url, transform } = params;
  const res = await fetch(url);
  let data;
  if (type === 'json') {
    data = await res.json();
  }
  else if (type === 'image') {
    data = await res.arrayBuffer();
  }
  if (data) {
    if (!transform?.pre) {
      return data;
    }
    return transform.pre(data);
  }
  return res;
}

function cacheOnly(params, type = 'json') {
  return cache.from(params, type);
}

async function networkThenCache(params, type = 'json') {
  const received = await networkOnly(params, type);
  if (received) {
    let data = received;
    const { transform } = params;
    if (transform?.post) {
      data = await transform.post(data);
    }
    if (data) {
      cache.update(params, data, type);
    }
  }
  return received;
}

function networkFirst(params, type = 'json') {
  return untilSuccess([networkOnly, cacheOnly], params, type);
}

function cacheFirst(params, type = 'json') {
  return untilSuccess([cacheOnly, networkOnly], params, type);
}

async function networkFirstThenCache(params, type = 'json') {
  return untilSuccess([networkThenCache, cacheOnly], params, type);
}

async function cacheFirstThenCache(params, type = 'json') {
  return untilSuccess([cacheOnly, networkThenCache], params, type);
}

async function untilSuccess(tasks, params, type) {
  while (tasks.length > 1) {
    const task = tasks.shift();
    const received = await task(params, type);
    if (received) {
      return received;
    }
  }
  return tasks[0](params, type);
}
