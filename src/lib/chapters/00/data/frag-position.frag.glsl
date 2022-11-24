#version 300 es

precision highp float;

out vec4 outputColor;

uniform int height;

void main() {
  float lerpValue = gl_FragCoord.y / float(height);

  outputColor = mix(vec4(1, 1, 1, 1), vec4(0.2, 0.2, 0.2, 1), lerpValue);
}
