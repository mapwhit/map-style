[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# @mapwhit/style-loader

Module to process and cache map style.

## Install

```sh
$ npm install --save @mapwhit/style-loader
```

## Usage

Load map style JSON and convert to an object that handles loading of all artifacts (sprites, sources, tiles, etc.) defined in the style.

```js
import { styleLoader } from '../lib/style-loader.js';

const style = await styleLoader('https://example.com/style.json', 'network-only');
```

## License

MIT © [Natalia Kowalczyk](https://melitele.me)

[npm-image]: https://img.shields.io/npm/v/@mapwhit/style-loader
[npm-url]: https://npmjs.org/package/@mapwhit/style-loader

[build-url]: https://github.com/mapwhit/style-loader/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/mapwhit/style-loader/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/@mapwhit/style-loader
[deps-url]: https://libraries.io/npm/@mapwhit%2Fstyle-loader
