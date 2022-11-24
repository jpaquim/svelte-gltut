#version 300 es

precision highp float;

const float PI = 3.1415926535897932384626433832795;

out vec4 outputColor;

uniform float fragLoopDuration;
uniform float time;

const vec4 firstColor = vec4(1, 1, 1, 1);
const vec4 secondColor = vec4(0, 1, 0, 1);

void main() {
  float currTime = mod(time, fragLoopDuration);
  float currLerp = currTime / fragLoopDuration;
  float loopLerp = sin(currLerp * PI);
  outputColor = mix(firstColor, secondColor, loopLerp);
}
