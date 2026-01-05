import loadGlyphs from './glyphs.js';
import { init as initLayers, reset as resetLayers } from './layers.js';
import loader from './loader.js';
import { init as initSources, reset as resetSources } from './sources.js';
import { loadSprite, selectSprite } from './sprite.js';

export async function mapStyle(url, cacheStrategy, options = {}) {
  const load = loader(cacheStrategy, options.cacheStore);
  const style = await load(
    {
      url,
      transform: {
        pre: instantiateSources,
        post: cacheableOnly
      }
    },
    'json'
  );
  if (style.sprite) {
    style.sprite = loadSprite(load, style.sprite);
  }
  if (style.glyphs) {
    style.glyphs = loadGlyphs(load, style.glyphs);
  }
  initSources(style, options);
  initLayers(style, options);
  return style;

  async function instantiateSources(style) {
    if (style.sources) {
      const indirectSources = Object.entries(style.sources).filter(
        ([, source]) => source.url && source.type !== 'image'
      );
      const controller = new AbortController();
      const abortTimeout = setTimeout(() => {
        controller.abort();
      }, 3000);
      const loadedSources = await Promise.allSettled(
        indirectSources.map(([, source]) =>
          load(
            {
              url: source.url,
              transform: { post: doNotCache },
              controller
            },
            'json'
          )
        )
      );
      clearTimeout(abortTimeout);
      indirectSources.forEach(([sourceId, source], index) => {
        delete source.url;
        const loadedSource = loadedSources[index];
        if (loadedSource.status === 'fulfilled') {
          delete loadedSource.value.type;
          Object.assign(source, loadedSource.value);
        } else {
          // remove source if it failed to load
          delete style.sources[sourceId];
        }
      });
    }
    if (style.sprite) {
      style.sprite = selectSprite(style.sprite, style.metadata?.sprite);
    }

    return style;
  }
}

export function reset(style, options = {}) {
  resetSources(style, options);
  resetLayers(style, options);
}

function doNotCache() {
  return;
}

function cacheableOnly(style) {
  const { version, name, metadata, sources, sprite, glyphs, layers } = style;
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
        if (source.metadata) {
          result[key].metadata = Object.assign({}, source.metadata);
        }
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
    return;
  }
  const keys = Object.keys(caching);
  if (caching.default) {
    keys.push(caching.default);
  }
  return keys.some(key => key.startsWith('cache-'));
}
