#version 300 es

precision highp float;

smooth in vec4 theColor;

smooth in float z;

out vec4 outputColor;

uniform bool depthClampingActive;

void main() {
  outputColor = theColor;

  if (depthClampingActive) {
    gl_FragDepth = clamp(z, 0.0, 1.0);
  }
}
