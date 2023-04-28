precision highp float;

uniform sampler2D pixelsTex;
uniform vec2 pixelsDims;

#define R_CO 0.2126
#define G_CO 0.7152
#define B_CO 0.0722

#define CONTRAST_CO 48.0

void main() {
    // Calculates the grayscale value of the 3 channels
    vec4 RGBA = texture2D(pixelsTex, gl_FragCoord.xy / pixelsDims);
    float luminance = RGBA.x * R_CO + RGBA.y * G_CO + RGBA.z * B_CO;

    // Add contrast to the image
    float contrastFactor = (259.0 * (CONTRAST_CO + 255.0)) / (255.0 * (259.0 - CONTRAST_CO));
    float contrasted = (contrastFactor * (luminance - 0.5) + 0.5);

    gl_FragColor = vec4(contrasted);
}
