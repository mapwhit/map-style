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
    .replace('"{name}"', textField)
    .replace('["get","name"]', textField));
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

function doNothing() {}

function initVisibility(sources, layer, doUpdateVisibility) {
  if (!layer.metadata?.visibility) {
    const srcVis = sources?.[layer.source]?.metadata?.visibility;
    if (!srcVis) {
      return;
    }
    layer.metadata = layer.metadata ??= {};
    layer.metadata.visibility = srcVis;
  }
  doUpdateVisibility(layer);
}

function updateVisibility(visibility, layer) {
  const { metadata, layout } = layer;
  if (!metadata?.visibility) {
    return;
  }
  const vis = visibility(metadata.visibility, layout?.visibility);
  if (!vis) {
    // do nothing
    return;
  }
  if (vis === 'visible') {
    if (layout) {
      // defaults to 'visible'
      delete layout.visibility;
      if (Object.keys(layout).length === 0) {
        delete layer.layout;
      }
    }
  }
  else {
    layer.layout = layout ?? {};
    layer.layout.visibility = vis;
  }
}

function init({ layers, sources }, options = {}) {
  if (!layers) {
    return;
  }

  const { language, visibility } = options;
  const textField = localizedName(language);
  const doUpdateVisibility = visibility ? updateVisibility.bind(undefined, visibility) : doNothing;
  layers.forEach(layer => {
    initTextField(layer, textField);
    initVisibility(sources, layer, doUpdateVisibility);
  });
}

function reset({ layers }, options = {}) {
  if (!layers) {
    return;
  }
  const { language, visibility } = options;
  const textField = localizedName(language);
  const doUpdateVisibility = visibility ? updateVisibility.bind(undefined, visibility) : doNothing;
  layers.forEach(layer => {
    updateTextField(layer, textField);
    doUpdateVisibility(layer);
  });
}
