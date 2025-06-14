/*global window */

module.exports = {
  selectSprite,
  loadSprite
};

function selectSprite(baseUrl, urls) {
  return urlsFromMetaData(urls) ?? urlsFromMetaData(baseUrl) ?? urlsFromBase(baseUrl);
}

async function loadSprite(load, sprite) {
  const [json, image] = await Promise.all([load({ url: sprite.json }, 'json'), load({ url: sprite.src }, 'image')]);
  return { json, image };
}

function urlsFromBase(baseUrl) {
  const format = window.devicePixelRatio > 1 ? '@2x' : '';
  return {
    json: `${baseUrl}${format}.json`,
    src: `${baseUrl}${format}.png`
  };
}

function urlsFromMetaData(urls) {
  if (!Array.isArray(urls)) {
    return;
  }
  let index = Math.round(window.devicePixelRatio || 1) - 1;
  if (index >= urls.length) {
    index = urls.length - 1;
  }
  return urls[index];
}
