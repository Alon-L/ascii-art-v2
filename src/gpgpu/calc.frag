precision highp float;

uniform sampler2D lightsTex;
uniform vec2 lightsDims;

#define BLOCK_WIDTH 8
#define BLOCK_HEIGHT 16
#define CHAR_NUM 114

// Acts as a 2D array: one row for every character
// The first int of every row is the ascii value of the character
// The other BLOCK_WIDTH * BLOCK_HEIGHT values are the light values of the chararcter
#define CHAR_LIGHT_ROW (BLOCK_WIDTH * BLOCK_HEIGHT + 1)
uniform sampler2D charLights;
uniform vec2 charLightsDims;

void main() {
    // Initial best character pick
    vec4 bestCharASCII = vec4(0);
    float bestCharDelta = 1000.0;

    for (int i = 0; i < CHAR_NUM; i++) {
        float delta = 0.0;

        // Iterate through the block and find the char with the matching light levels
        for (int x = 0; x < BLOCK_WIDTH; ++x) {
            for (int y = 0; y < BLOCK_HEIGHT; ++y) {
                // FragCoord begins from 0.5, so shift it to 0.0
                vec2 texcoord = vec2((gl_FragCoord.x - 0.5) * float(BLOCK_WIDTH) + float(x), (gl_FragCoord.y - 0.5) * float(BLOCK_HEIGHT) + float(y)) / lightsDims;
                vec4 light = texture2D(lightsTex, texcoord);

                // Vector
                vec4 charLight = texture2D(charLights, vec2(1 + y + x * BLOCK_WIDTH + 1, i + 1) / charLightsDims);

                // Calculate the difference between the corresponding pixel light to the character's light
                delta += light.x - charLight.x;
            }
        }

        // Compare with the previous checked letters
        if (abs(delta) < abs(bestCharDelta)) {
            bestCharDelta = delta;
            bestCharASCII = texture2D(charLights, vec2(0, i) / charLightsDims);
            //bestCharASCII = vec4(i - 1) / 255.0;
        }
    }

    gl_FragColor = bestCharASCII;
    //gl_FragColor = texture2D(lightsTex, vec2(0, 0) / lightsDims);
    //gl_FragColor = texture2D(charLights, vec2(1, 1) / charLightsDims);
}
