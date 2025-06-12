const { initCaching, getStrategy } = require('../caching');

module.exports = {
  init,
  reset
};

// once we have content of the GeoJSON file, changing the cache strategy will have no effect

function init(loader, source, style, options) {
  if (!source.data || typeof source.data !== 'string') {
    return;
  }
  source.metadata = source.metadata ?? {};
  source.metadata.caching = initCaching(source.metadata.caching) ?? style.metadata.caching;
  source.data = initJSON(loader, source);
  reset(source, options);
}

function reset(source, options) {
  source.data?.resetLoad?.(options);
}

function initJSON(loader, source) {
  const {
    metadata: { caching },
    data
  } = source;
  let load;

  async function loadJSON() {
    const json = await load({ url: data }, 'json');
    if (!json) {
      return;
    }
    source.data = json;
    return json;
  }

  function resetLoad(options) {
    load = loader(getStrategy(caching, options));
    loadJSON();
  }

  loadJSON.resetLoad = resetLoad;
  return loadJSON;
}
