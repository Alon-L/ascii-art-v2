#version 300 es

precision highp float;

uniform sampler2D pixelsTex;
uniform vec2 pixelsDims;

uniform float contrastCoefficient;

#define R_CO 0.2126
#define G_CO 0.7152
#define B_CO 0.0722

out vec4 outPixel;

void main() {
    // Calculates the grayscale value of the 3 channels
    vec4 RGBA = texture(pixelsTex, gl_FragCoord.xy / pixelsDims);
    float luminance = RGBA.x * R_CO + RGBA.y * G_CO + RGBA.z * B_CO;

    // Add contrast to the image
    float contrastFactor = (259.0 * (contrastCoefficient + 255.0)) / (255.0 * (259.0 - contrastCoefficient));
    float contrasted = (contrastFactor * (luminance - 0.5) + 0.5);

    outPixel = vec4(contrasted);
}
