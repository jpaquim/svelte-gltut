#version 300 es

precision highp float;

uniform vec4 baseColor;

out vec4 outputColor;

void main() {
  outputColor = baseColor;
}

