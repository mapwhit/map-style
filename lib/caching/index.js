const expression = require('./expression');

module.exports = {
  initCaching,
  getStrategy
};

function initCaching(caching) {
  if (!caching) {
    return;
  }
  const result = Object.keys(caching).reduce(transformCaching, {
    caching,
    checks: []
  });
  return result.checks;
}

function checkStrategy(check) {
  this.strategy = check(this.object);
  return this.strategy;
}

function getStrategy(checks, object) {
  if (!checks) {
    return;
  }
  const result = {
    object
  };
  checks.some(checkStrategy, result);
  return result.strategy;
}

function checkDefault(strategy) {
  return strategy;
}

function checkProperty(strategy, check, object) {
  if (check(object)) {
    return strategy;
  }
}

function transformCaching(result, key) {
  const { caching, checks } = result;
  if (key === 'default') {
    checks.push(checkDefault.bind(undefined, caching[key]));
  } else {
    checks.unshift(checkProperty.bind(undefined, key, expression(caching[key])));
  }
  return result;
}
