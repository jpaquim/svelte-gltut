#version 300 es

in vec4 position;
uniform vec2 offset;

void main() {
  vec4 totalOffset = vec4(offset.x, offset.y, 0, 0);
  gl_Position = position + totalOffset;
}
