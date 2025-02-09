module.exports = loadGlyphs;

function loadGlyphs(load, glyphs) {
  return (fontstack, range) => {
    const begin = range * 256;
    const end = begin + 255;

    const url = glyphs
        .replace('{fontstack}', fontstack)
        .replace('{range}', `${begin}-${end}`);

    return load({ url, fontstack, range }, 'font');
  };
}
