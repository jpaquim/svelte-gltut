#version 300 es

precision highp float;

smooth in vec4 theColor;

out vec4 outputColor;

void main() { outputColor = theColor; }
