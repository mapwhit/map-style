const expression = require('./expression');

module.exports = {
  initCaching,
  getStrategy
};

function initCaching(caching) {
  if (!caching) {
    return;
  }
  return expression(caching);
}

function getStrategy(caching, object) {
  if (!caching) {
    return;
  }
  return caching.evaluate(object);
}
