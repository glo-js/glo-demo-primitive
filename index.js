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

module.exports = function meshViewer (primitive, opt) {
  opt = opt || {}

  var distance = defined(opt.distance, 4)
  var color = defined(opt.color, [ 1, 1, 1, 1 ])
  var attribs = { antialias: true }
  var gl = createContext('webgl', attribs)
  var canvas = document.body.appendChild(gl.canvas)
    
  var wireframe = opt.wireframe

  var useTexture = opt.texture !== false
  var shaderDefines = {}
  if (useTexture) {
    shaderDefines.USE_TEXTURE = true
  }

  var shader = createShader(gl, assign(material, {
    vertex: material.vertex,
    fragment: injectDefines(material.fragment, shaderDefines),
    uniforms: [
      { type: 'vec2', name: 'repeat', value: opt.repeat || [ 8, 8 ] },
      { type: 'sampler2D', name: 'iChannel0', value: 0 }
    ]
  }))

  var model = identity([])
  var camera = createCamera()
  var mesh = createMesh(gl)
    .attribute('position', primitive.positions)
    .attribute('uv', primitive.uvs)
    .attribute('normal', primitive.normals)
    .elements(wireframe ? toWireframe(primitive.cells) : primitive.cells)

  var time = 0
  var tex
  var app = createApp(canvas, { scale: window.devicePixelRatio })
    .on('tick', render)

  // create a default repeating texture
  if (useTexture) {
    var img = [
      [0xff, 0xff, 0xff, 0xff], [0xcc, 0xcc, 0xcc, 0xff],
      [0xcc, 0xcc, 0xcc, 0xff], [0xff, 0xff, 0xff, 0xff]
    ]
    tex = createTexture(gl, img, [ 2, 2 ], {
      wrap: gl.REPEAT,
      minFilter: gl.NEAREST,
      magFilter: gl.NEAREST
    })
  }

  return app

  function render (dt) {
    time += dt / 1000

    var width = gl.drawingBufferWidth
    var height = gl.drawingBufferHeight
    gl.viewport(0, 0, width, height)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)

    var angle = time * 0.5
    camera.viewport = [0, 0, width, height]
    camera.identity()
    camera.translate([ Math.cos(angle) * distance, 0, Math.sin(angle) * distance ])
    camera.lookAt([ 0, 0, 0 ])
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
