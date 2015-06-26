# glo-demo-primitive

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

A tiny mesh visualizer. This module will evolve and change as the `glo` ecosystem matures.

## Usage

[![NPM](https://nodei.co/npm/glo-demo-primitive.png)](https://www.npmjs.com/package/glo-demo-primitive)

```js
var geom = require('primitive-sphere')()
var viewer = require('glo-demo-primitive')

viewer(geom, {
  texture: true,   // add a simple repeating pattern
  repeat: [ 8, 8 ] // UV repeats
}).start()
```

## License

MIT, see [LICENSE.md](http://github.com/glo-js/glo-demo-primitive/blob/master/LICENSE.md) for details.
