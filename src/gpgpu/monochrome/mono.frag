precision highp float;

uniform sampler2D pixelsTex;
uniform vec2 pixelsDims;

#define R_CO 0.2126
#define G_CO 0.7152
#define B_CO 0.0722

void main() {
    // Calculates the grayscale value of the 3 channels
    vec2 RCoord = vec2((gl_FragCoord.x) * 4.0 + 0.0, (gl_FragCoord.y) + 0.0) / pixelsDims;
    vec2 GCoord = vec2((gl_FragCoord.x) * 4.0 + 1.0, (gl_FragCoord.y) + 1.0) / pixelsDims;
    vec2 BCoord = vec2((gl_FragCoord.x) * 4.0 + 2.0, (gl_FragCoord.y) + 2.0) / pixelsDims;

    float R = texture2D(pixelsTex, RCoord).x;
    float G = texture2D(pixelsTex, GCoord).x;
    float B = texture2D(pixelsTex, BCoord).x;

    float luminance = R * R_CO + G * G_CO + B * B_CO;

    //gl_FragColor = vec4(luminance, luminance, luminance, 1);

    //gl_FragColor = vec4(1);
    gl_FragColor = vec4(R, G, B, 1);
    //gl_FragColor = vec4(pixelsDims / 255.0 / 100.0, 0, 0);
}
