const loader = require('./loader');

module.exports = mapStyle;

function mapStyle(url, cacheStrategy) {
  const load = loader(cacheStrategy);
  return load({
    url,
    transform: {
      pre: instantiateSources,
      post: cacheableOnly
    }
  }, 'json');

  async function instantiateSources(style) {
    if (style.sources) {
      const indirectSources = Object.values(style.sources).filter(source => source.url);
      const loadedSources = await Promise.all(indirectSources.map(source => load({
        url: source.url,
        transform: { post: doNotCache }
      }, 'json')));
      indirectSources.forEach((source, index) => {
        delete source.url;
        const loadedSource = loadedSources[index];
        delete loadedSource.type;
        Object.assign(source, loadedSource);
      });
    }

    return style;
  }
}

function doNotCache() {
  return ;
}

function cacheableOnly(style) {
  const {
    version,
    name,
    metadata,
    sources,
    sprite,
    glyphs,
    layers
  } = style;
  const cached = {
    version,
    name,
    metadata,
    sprite,
    glyphs
  };
  const cacheDefault = isCacheable(metadata?.caching);
  if (sources) {
    // filter only cacheable sources
    cached.sources = Object.entries(sources).reduce((result, [key, source]) => {
      const cacheable = source.metadata?.caching ? isCacheable(source.metadata?.caching) : cacheDefault;
      if (cacheable) {
        result[key] = source;
      }
      return result;
    }, {});
  }

  if (layers) {
    // filter only cacheable layers
    cached.layers = layers.reduce((result, layer) => {
      const { source } = layer;
      if (!source || cached.sources[source]) {
        result.push(layer);
      }
      return result;
    }, []);
  }

  return cached;
}

function isCacheable(caching) {
  if (!caching) {
    return ;
  }
  const keys = Object.keys(caching);
  if (caching.default) {
    keys.push(caching.default);
  }
  return keys.some(key => key.startsWith('cache-'));
}
