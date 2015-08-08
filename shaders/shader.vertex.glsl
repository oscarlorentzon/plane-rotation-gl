attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

varying vec4 v_color;

void main() {
    gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;

    v_color = a_color;
}