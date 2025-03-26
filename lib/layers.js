const localize = require('./localize');

module.exports = { init, reset };

function localizedName(language) {
  const name = localize(language);
  if (!name) {
    return;
  }
  return JSON.stringify(name);
}

function includesName(str) {
  return str.includes('"{name}"') || str.includes('["get","name"]');
}

function substituteName(str, textField) {
  if (!textField) {
    return JSON.parse(str);
  }
  return JSON.parse(str
    .replace('["get","name"]', '"{name}"')
    .replace('"{name}"', textField));
}

function initTextField(layer, textField) {
  let { layout, metadata } = layer;
  if (!layout?.['text-field']) {
    return;
  }
  layer.metadata = metadata ??= {};
  const str = JSON.stringify(layout['text-field']);
  if (includesName(str)) {
    metadata['text-field'] = str;
  }
  else {
    delete metadata['text-field'];
  }
  updateTextField(layer, textField);
}

function updateTextField(layer, textField) {
  let { layout, metadata } = layer;
  if (!metadata?.['text-field']) {
    return;
  }
  layout['text-field'] = substituteName(metadata['text-field'], textField);
}

function init({ layers }, options = {}) {
  if (!layers) {
    return;
  }
  const { language } = options;
  const textField = localizedName(language);
  layers.forEach(layer => {
    initTextField(layer, textField);
  });
}

function reset({ layers }, options = {}) {
  if (!layers) {
    return;
  }
  const { language } = options;
  const textField = localizedName(language);
  layers.forEach(layer => {
    updateTextField(layer, textField);
  });
}
