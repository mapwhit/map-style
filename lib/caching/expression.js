import { createExpression } from '@mapwhit/style-expressions';

const cachingSpec = {
  type: 'enum',
  values: [
    'network-only',
    'network-first',
    'network-then-cache',
    'network-first-then-cache',
    'cache-only',
    'cache-first',
    'cache-first-then-cache',
    'do-nothing'
  ],
  default: 'network-only',
  expression: {
    parameters: ['global-state']
  }
};

export default function createCaching(caching) {
  const state = {};
  const expression = {
    setValue
  };
  setValue(caching);
  return expression;

  function setValue(caching) {
    if (caching === null || caching === undefined) {
      caching = cachingSpec.default;
    }
    if (cachingSpec.values.includes(caching)) {
      expression.evaluate = () => caching;
      return;
    }

    const compiled = createExpression(caching, cachingSpec, state);
    if (compiled.result === 'error') {
      throw new Error(compiled.value.map(err => `${err.key}: ${err.message}`).join(', '));
    }
    expression.evaluate = obj => {
      const properties = new Set(Object.keys(state));
      for (const prop in obj) {
        properties.add(prop);
      }
      properties.forEach(prop => {
        state[prop] = obj[prop];
      });
      return compiled.value.evaluate({});
    };
  }
}
