const cache = require('./cache');

module.exports = selectStrategy;

const strategies = {
  'network-only': networkOnly,
  'network-first': networkFirst,
  'network-then-cache': networkThenCache,
  'network-first-then-cache': networkFirstThenCache,
  'cache-only': cacheOnly,
  'cache-first': cacheFirst,
  'cache-first-then-cache': cacheFirstThenCache,
  'do-nothing': doNothing
};

function selectStrategy(strategy = 'network-only') {
  return strategies[strategy] ?? networkOnly;
}

const fetchType = {
  json: fetchJSON,
  image: fetchData,
  font: fetchData,
  tile: fetchData
};

async function networkOnly(params, type = 'json') {
  const { url, transform, controller } = params;
  const signal = controller?.signal;
  const res = await fetch(url, { signal });
  const data = await fetchType[type](res);
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

async function doNothing() {}

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
      if (received.byteLength === 0) {
        // shouldn't get here because server should never send us empty tile
        // so it should never been put into cache
        // but just in case it does, we should ignore it
        continue;
      }
      return received;
    }
  }
  return tasks[0](params, type);
}

function fetchJSON(res) {
  return res.json();
}

function fetchData(res) {
  return res.arrayBuffer();
}
