module.exports = localize;

// https://docs.maptiler.com/schema/planet/

function localize(lang) {
  if (!lang) {
    return;
  }
  return ['coalesce', ['get', `name:${lang}`], ['get', 'name:latin'], ['get', 'name_int'], ['get', 'name'], ''];
}
