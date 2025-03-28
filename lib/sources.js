const { initCaching } = require('./caching');
const loader = require('./loader');
const sourceLoaders = require('./source');

module.exports = { init, reset };

function init(style, options = {}) {
  if (!style.sources) {
    return;
  }
  style.metadata = style.metadata ?? {};
  style.metadata.caching = initCaching(style.metadata.caching);
  Object.values(style.sources).forEach(source => {
    options.init?.source?.(style, source);
    sourceLoaders[source.type]?.init(loader, source, style, options);
  });
}

function reset(style, options = {}) {
  const { sources } = style;
  if (!sources) {
    return;
  }
  Object.values(sources).forEach(source => {
    options.reset?.source?.(style, source);
    sourceLoaders[source.type]?.reset(source, options);
  });
}
