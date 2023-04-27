precision highp float;

uniform sampler2D pixelsTex;
uniform vec2 pixelsDims;

#define R_CO 0.2126
#define G_CO 0.7152
#define B_CO 0.0722

void main() {
    // Calculates the grayscale value of the 3 channels
    vec4 RGBA = texture2D(pixelsTex, gl_FragCoord.xy / pixelsDims);
    float luminance = RGBA.x * R_CO + RGBA.y * G_CO + RGBA.z * B_CO;


    gl_FragColor = vec4(luminance);
}
