#version 300 es

precision highp float;

smooth in vec4 interpColor;

out vec4 outputColor;

void main() {
  outputColor = interpColor;
}
