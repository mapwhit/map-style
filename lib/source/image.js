const { initCaching, getStrategy } = require('../caching');

module.exports = {
  init,
  reset
};

// once we have content of the image file, changing the cache strategy will have no effect

function init(loader, source, style, options) {
  if (!source.url) {
    return;
  }
  source.metadata = source.metadata ?? {};
  source.metadata.caching = initCaching(source.metadata.caching) ?? style.metadata.caching;
  source.url = initImage(loader, source);
  reset(source, options);
}

function reset(source, options) {
  source.url?.resetLoad?.(options);
}

function initImage(loader, source) {
  const { metadata: { caching }, url } = source;
  let load;

  async function loadImage() {
    const data = await load({ url }, 'image');
    if (!data) {
      return;
    }
    source.url = data;
  }

  function resetLoad(options) {
    load = loader(getStrategy(caching, options));
    loadImage();
  }

  loadImage.resetLoad = resetLoad;
  return loadImage;
}
