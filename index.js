var createMesh = require('glo-mesh')
var createCamera = require('perspective-camera')
var createApp = require('canvas-loop')
var createShader = require('glo-shader')
var createTexture = require('glo-texture/2d')
var createContext = require('get-canvas-context')
var identity = require('gl-mat4/identity')
var assign = require('object-assign')
var injectDefines = require('glsl-inject-defines')
var defined = require('defined')
var material = require('./shader')
var toWireframe = require('gl-wireframe')
var orbitControls = require('orbit-controls')

module.exports = function meshViewer (primitive, opt) {
  opt = opt || {}

  var distance = defined(opt.distance, 4)
  var color = defined(opt.color, [ 1, 1, 1, 1 ])
  
  var gl = opt.gl || createContext('webgl', { antialias: true })
  var canvas = gl.canvas
  document.body.appendChild(canvas)

  var wireframe = opt.wireframe
  var culling = opt.culling !== false
  var useTexture = primitive.uvs && opt.texture !== false
  var shaderDefines = {}
  if (opt.showNormals && primitive.normals) {
    shaderDefines.USE_NORMALS = true
  }
  if (useTexture) {
    shaderDefines.USE_TEXTURE = true
  }

  var shader = createShader(gl, assign(material, {
    vertex: material.vertex,
    fragment: injectDefines(material.fragment, shaderDefines),
    uniforms: [
      { type: 'vec2', name: 'repeat' },
      { type: 'sampler2D', name: 'iChannel0' }
    ]
  }))

  // defaults
  shader.bind()
  shader.uniforms.repeat(opt.repeat || [1, 1])
  shader.uniforms.iChannel0(0)
  
  var model = identity([])
  var camera = createCamera({
    near: opt.near,
    far: opt.far,
    position: [0, 0, 1]
  })
  var mesh = createMesh(gl)
    .attribute('position', primitive.positions)
    .elements(wireframe ? toWireframe(primitive.cells) : primitive.cells)

  var controls = orbitControls({
    element: canvas,
    distanceBounds: [2, 100],
    distance: 6,
    rotationSpeed: 1,
    pinchSpeed: 0.025
  })

  // optional attributes
  if (primitive.uvs) {
    mesh.attribute('uv', primitive.uvs)
  }
  if (primitive.normals) {
    mesh.attribute('normal', primitive.normals)
  }

  var time = 0
  var startAngle = opt.angle || 0
  var tex
  var app = createApp(canvas, { scale: window.devicePixelRatio })
    .on('tick', render)

  app.render = render
  app.gl = gl

  // create a default repeating texture
  if (useTexture) {
    if (opt.texture && typeof opt.texture.bind === 'function') {
      tex = opt.texture
    } else {
      tex = createCheckerTexture(gl)
    }
  }

  return app

  function render (dt) {
    dt = dt || 0
    time += dt / 1000

    var width = gl.drawingBufferWidth
    var height = gl.drawingBufferHeight
    gl.viewport(0, 0, width, height)
    gl.clearColor(0, 0, 0, 1)
    gl.clearDepth(1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    if (culling) {
      gl.cullFace(gl.BACK)
      gl.frontFace(gl.CCW)
      gl.enable(gl.CULL_FACE)
    } else {
      gl.disable(gl.CULL_FACE)
    }

    var angle = startAngle + time * 0.35
    camera.viewport = [0, 0, width, height]
    // camera.identity()
    // camera.translate([ Math.cos(angle) * distance, 0, Math.sin(angle) * distance ])
    // camera.lookAt([ 0, 0, 0 ])
    
    controls.update(camera.position, camera.direction, camera.up)
    camera.update()

    shader.bind()
    shader.uniforms.projection(camera.projection)
    shader.uniforms.view(camera.view)
    shader.uniforms.model(model)
    shader.uniforms.color(color)

    if (tex) {
      tex.bind()
    }
    mesh.bind(shader)
    mesh.draw(wireframe ? gl.LINES : gl.TRIANGLES)
    mesh.unbind(shader)
  }
}

function createCheckerTexture (gl) {
  var pixels = [
    [0xff, 0xff, 0xff, 0xff], [0xcc, 0xcc, 0xcc, 0xff],
    [0xcc, 0xcc, 0xcc, 0xff], [0xff, 0xff, 0xff, 0xff]
  ]
  return createTexture(gl, pixels, [ 2, 2 ], {
    wrap: gl.REPEAT,
    minFilter: gl.NEAREST,
    magFilter: gl.NEAREST
  })
}
