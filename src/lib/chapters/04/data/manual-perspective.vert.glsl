#version 300 es

in vec4 position;
in vec4 color;

smooth out vec4 theColor;

uniform vec2 offset;
uniform float zNear;
uniform float zFar;
uniform float frustumScale;

void main() {
  vec4 cameraPos = position + vec4(offset.x, offset.y, 0, 0);
  vec4 clipPos;

  clipPos.xy = cameraPos.xy * frustumScale;

  clipPos.z = cameraPos.z * (zNear + zFar) / (zNear - zFar);
  clipPos.z += 2.0 * zNear * zFar / (zNear - zFar);

  clipPos.w = -cameraPos.z;

  gl_Position = clipPos;
  theColor = color;
}
