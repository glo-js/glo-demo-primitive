var mesh = require('torus-mesh')({
  majorRadius: 1,
  minorRadius: 0.25
})

require('./')(mesh, {
  repeat: [ 8, 4 ]
}).start()