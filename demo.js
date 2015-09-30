var mesh = require('torus-mesh')({
  majorRadius: 1,
  minorRadius: 0.25
})

require('./')(mesh, {
  distanceBounds: [ 1.5, 100 ],
  repeat: [ 8, 4 ]
}).start()