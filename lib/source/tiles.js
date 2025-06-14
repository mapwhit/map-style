const { initCaching, getStrategy } = require('../caching');

module.exports = {
  init,
  reset
};

function init(loader, source, style, options) {
  if (!source.tiles) {
    return;
  }
  source.metadata = source.metadata ?? {};
  source.metadata.caching = initCaching(source.metadata.caching) ?? style.metadata.caching;
  source.tiles = initTiles(loader, source);
  reset(source, options);
}

function reset(source, options) {
  source.tiles?.resetLoad(options);
}

function initTiles(loader, source) {
  const {
    metadata: { caching },
    scheme,
    tiles
  } = source;
  let load;

  function loadTile({ x, y, z }, controller) {
    const url = tiles[(x + y) % tiles.length]
      .replace('{prefix}', (x % 16).toString(16) + (y % 16).toString(16))
      .replace('{z}', String(z))
      .replace('{x}', String(x))
      .replace('{y}', String(scheme === 'tms' ? 2 ** z - y - 1 : y));

    return load({ url, x, y, z, controller }, 'tile');
  }

  function resetLoad(options) {
    load = loader(getStrategy(caching, options));
  }

  loadTile.resetLoad = resetLoad;
  return loadTile;
}
