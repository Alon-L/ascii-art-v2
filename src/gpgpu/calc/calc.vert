#version 300 es

in vec4 position;

void main() {
    // Vertex shader should only assign the given position
    gl_Position = position;
}
