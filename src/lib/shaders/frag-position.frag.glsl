#version 300 es

precision highp float;

out vec4 outputColor;

void main() {
  float lerpValue = gl_FragCoord.y / 500.;

  outputColor = mix(vec4(1, 1, 1, 1), vec4(0.2, 0.2, 0.2, 1), lerpValue);
}
