#version 300 es

precision highp float;

uniform sampler2D lightsTex;
uniform vec2 lightsDims;

uniform int blockWidth;
uniform int blockHeight;
uniform int charNum;

// Char light acts as a 2D array: one row for every character
// The first int of every row is the ascii value of the character
// The other blockWidth * blockHeight values are the light values of the chararcter
uniform sampler2D charLightsTex;
uniform vec2 charLightsDims;

out vec4 outPixel;

void main() {
    // Initial best character pick
    vec4 bestCharASCII = vec4(0);
    float bestCharDelta = 1000.0;

    for (int i = 0; i < charNum; i++) {
        float delta = 0.0;

        // Iterate through the block and find the char with the matching light levels
        for (int x = 0; x < blockWidth; ++x) {
            for (int y = 0; y < blockHeight; ++y) {
                // FragCoord begins from 0.5, so shift it to 0.0
                vec2 lightCoord = vec2((gl_FragCoord.x - 0.5) * float(blockWidth) + float(x), (gl_FragCoord.y - 0.5) * float(blockHeight) + float(y)) / lightsDims;
                vec4 light = texture(lightsTex, lightCoord);

                // Finds the char light value for this specific pixel
                // (should always add 1 to the luminance texture)
                vec2 charLightCoord = vec2(1 + y + x * blockWidth + 1, i + 1) / charLightsDims;
                vec4 charLight = texture(charLightsTex, charLightCoord);

                // Calculate the difference between the corresponding pixel light to the character's light
                delta += light.x - charLight.x;
            }
        }

        // Compare with the previous checked letters
        if (abs(delta) < abs(bestCharDelta)) {
            bestCharDelta = delta;
            bestCharASCII = texture(charLightsTex, vec2(0, i) / charLightsDims);
        }
    }

    outPixel = bestCharASCII;
}
