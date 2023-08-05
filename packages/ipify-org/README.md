# @dyndns/ipify

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]

This package consumes [ipify.org](https://ipify.org) APIs and retrieves the current machines public IP address (both v4 and v6). This can be used in both CLI and library (JS/Typescript in both NodeJS and browser) mode.

## Installation

There are three different methods to install and use this package.

```sh
# 1) no installation
# npx (or similar package runners)
npx @dyndns/ipify@latest

# 2) install globally (usable in other apps and CLI)
# npm (or similar package runners)
npm i -g @dyndns/ipify@latest

# 3) install as a dependency in your application
# npm (or similar package runners)
npm i @dyndns/ipify@latest
```

### Usage

#### Library (JS/TS)

If you've followed the library method in the first step, then the package is available as a dependency.

```js
// javascript (CJS)

const ipRetriever = require('@dyndns/ipify');

const retrieveIP = ipRetriever.create();

retrieveIP('v4') // or "v6"
  .then((ipAddress) => console.log(ipAddress))
  .catch(console.error);
```

```ts
// typescript/javascript (module)

import * as ipRetriever from '@dyndns/ipify';

const retrieveIP = ipRetriever.create();

retrieveIP('v4') // or "v6"
  .then((ipAddress) => console.log(ipAddress))
  .catch(console.error);
```

#### CLI

If you've followed the CLI installation method in the first step, then the package is available as a command in your OS.

```sh
# using npx
npx @dyndns/ipify@latest

# if installed globally
dd-ipify --help


ipify.org command-line interface (CLI)

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
  --ip       IP address version            [choices: "v4", "v6"] [default: "v4"]
```

## License

GPL-3.0

[npm-image]: https://img.shields.io/npm/v/@dyndns/ipify.svg?color=orange
[npm-url]: https://npmjs.org/package/@dyndns/ipify
[downloads-image]: https://img.shields.io/npm/dt/@dyndns/ipify.svg
[downloads-url]: https://npmjs.org/package/@dyndns/ipify
