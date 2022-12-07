#version 300 es

in vec4 position;

uniform mat4 cameraToClipMatrix;
uniform mat4 worldToCameraMatrix;
uniform mat4 modelToWorldMatrix;

void main() {
  vec4 temp = modelToWorldMatrix * position;
  temp = worldToCameraMatrix * temp;
  gl_Position = cameraToClipMatrix * temp;
}
