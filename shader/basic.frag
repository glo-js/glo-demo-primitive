precision mediump float;
varying vec2 vUv;
varying vec3 vNormal;
uniform sampler2D iChannel0;
uniform vec2 repeat;
uniform vec4 color;

void main() {
  #ifdef USE_TEXTURE
    gl_FragColor = texture2D(iChannel0, vUv * repeat) * color;
  #else
    gl_FragColor = color;
  #endif
}