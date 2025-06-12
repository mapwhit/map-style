const { initCaching } = require('./caching');
const loader = require('./loader');
const loadGlyphs = require('./glyphs');
const { loadSprite, selectSprite } = require('./sprite');
const localize = require('./localize');
const sourceLoaders = require('./source');

module.exports = {
  mapStyle,
  reset
};

async function mapStyle(url, cacheStrategy, options = {}) {
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
  initSources(style, options);
  initLayers(style, options);
  return style;

  async function instantiateSources(style) {
    if (style.sources) {
      const indirectSources = Object.values(style.sources).filter(
        source => source.url && source.type !== 'image');
      const loadedSources = await Promise.allSettled(indirectSources.map(source => load({
        url: source.url,
        transform: { post: doNotCache }
      }, 'json')));
      indirectSources.forEach((source, index) => {
        delete source.url;
        const loadedSource = loadedSources[index];
        if (loadedSource.status === 'fulfilled') {
          delete loadedSource.value.type;
          Object.assign(source, loadedSource.value);
        }
      });
    }
    if (style.sprite) {
      style.sprite = selectSprite(style.sprite, style.metadata?.sprite);
    }

    return style;
  }
}

function reset(style, options = {}) {
  resetSources(style, options);
  resetLayers(style, options);
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
    metadata: Object.assign({}, metadata),
    sprite,
    glyphs
  };
  const cacheDefault = isCacheable(metadata?.caching);
  if (sources) {
    // filter only cacheable sources
    cached.sources = Object.entries(sources).reduce((result, [key, source]) => {
      const cacheable = source.metadata?.caching ? isCacheable(source.metadata?.caching) : cacheDefault;
      if (cacheable) {
        result[key] = Object.assign({}, source);
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

function initSources(style, options) {
  if (!style.sources) {
    return;
  }
  style.metadata = style.metadata ?? {};
  style.metadata.caching = initCaching(style.metadata.caching);
  Object.values(style.sources).forEach(source => {
    sourceLoaders[source.type]?.init(loader, source, style, options);
  });
}

function resetSources({ sources }, options = {}) {
  if (!sources) {
    return;
  }
  Object.values(sources).forEach(source => {
    sourceLoaders[source.type]?.reset(source, options);
  });
}

function initLayers(style, options) {
  if (!style.layers) {
    return;
  }
  const textField = localize(options.language);
  if (!textField) {
    return;
  }
  style.layers.forEach(layer => {
    if (layer.layout?.['text-field'] === '{name}') {
      layer.metadata = layer.metadata ?? {};
      layer.metadata['text-field'] = '{name}';
      layer.layout['text-field'] = textField;
    }
  });
}

function resetLayers({ layers }, options = {}) {
  if (!layers) {
    return;
  }
  const textField = localize(options.language) ?? '{name}';
  layers.forEach(layer => {
    if (layer.layout?.['text-field'] === '{name}' || layer.metadata?.['text-field'] === '{name}') {
      layer.metadata = layer.metadata ?? {};
      layer.metadata['text-field'] = '{name}';
      layer.layout['text-field'] = textField;
    }
  });
}
