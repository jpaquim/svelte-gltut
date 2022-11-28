#version 300 es

in vec4 position;
in vec4 color;

smooth out vec4 theColor;

smooth out float z;

uniform vec3 offset;
uniform mat4 perspectiveMatrix;

uniform bool depthClampingActive;

void main() {
  vec4 cameraPos = position + vec4(offset.x, offset.y, offset.z, 0);

  gl_Position = perspectiveMatrix * cameraPos;
  theColor = color;

  if (depthClampingActive) {

    // transform z to window coordinates
    z = gl_Position.z / gl_Position.w;
    z = 0.5 * (gl_DepthRange.diff * z + gl_DepthRange.near + gl_DepthRange.far);

    // prevent z-clipping
    gl_Position.z = 0.0;
  }
}
