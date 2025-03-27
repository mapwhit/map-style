module.exports = {
   initCaching,
   getStrategy
};

function doNothing() {}

function initCaching(caching, parseExpression = doNothing) {
  if (!caching) {
    return;
  }
  return parseExpression(caching);
}

function getStrategy(evaluate, object) {
  if (!evaluate) {
    return;
  }
  return evaluate(object);
}
