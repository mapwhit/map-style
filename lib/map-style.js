const loader = require('./loader');
const loadGlyphs = require('./glyphs');
const { loadSprite, selectSprite } = require('./sprite');

module.exports = mapStyle;

async function mapStyle(url, cacheStrategy) {
  const load = loader(cacheStrategy);
  const style = await load({
    url,
    transform: {
      pre: instantiateSources,
      post: cacheableOnly
    }
  }, 'json');
  if (style.sprite) {
    style.sprite = await loadSprite(load, style.sprite);
  }
  if (style.glyphs) {
    style.glyphs = loadGlyphs(load, style.glyphs);
  }
  return style;

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
    if (style.sprite) {
      style.sprite = selectSprite(style.sprite, style.metadata?.sprite);
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
