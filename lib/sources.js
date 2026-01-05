import { initCaching } from './caching/index.js';
import loader from './loader.js';
import * as sourceLoaders from './source/index.js';

export function init(style, options = {}) {
  if (!style.sources) {
    return;
  }
  style.metadata = style.metadata ?? {};
  style.metadata.caching = initCaching(style.metadata.caching);
  Object.values(style.sources).forEach(source => {
    sourceLoaders[source.type]?.init(loader, source, style, options);
  });
}

export function reset({ sources }, options = {}) {
  if (!sources) {
    return;
  }
  Object.values(sources).forEach(source => {
    sourceLoaders[source.type]?.reset(source, options);
  });
}
