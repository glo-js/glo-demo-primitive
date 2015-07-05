#version 100
precision mediump float;
varying vec2 vUv;
varying vec3 vNormal;

uniform sampler2D iChannel0;
uniform vec2 repeat;
uniform vec4 color;

void main() {
  vec4 base;
  #if defined(USE_NORMALS)
    gl_FragColor = vec4(vNormal, 1.0) * color;
  #elif defined(USE_TEXTURE)
    gl_FragColor = texture2D(iChannel0, vUv * repeat) * color;
  #else
    gl_FragColor = color;
  #endif
}