import settings from '../settings.json';

// Utility class to generate the mapping of the light levels for every character
export class Generate {
    // A string that contains all the available characters for usage
    private readonly chars: string;

    constructor() {
        this.chars = settings.chars
    }

    // Generates a map in the format of the 'charLights' float array, from all the available characters
    public generate(): number[] {
        let result: number[] = [];

        //for (const char of this.chars) {
        for (let i = 0; i < this.chars.length; ++i) {
            const char = this.chars[i];
            const lightMap = this.lightMap(char);

            console.log(char.charCodeAt(0));

            // First element should be the ASCII value of the character
            result.push(char.charCodeAt(0));
            // Concat the light map of the current character
            result = result.concat(lightMap);

            console.log(i, char);
        }

        return result;
    }

    // Returns the light map of a character.
    private lightMap(char: string): number[] {
        const ctx = this.createCanvas(char);
        const pixels = ctx.getImageData(0, 0, settings.block.width, settings.block.height).data;

        // Take only the R channel, since the text is monochrome.
        const lights = [];
        for (let i = 0; i < pixels.length / 4; ++i) {
            lights.push(pixels[i * 4]);
        }

        return lights;
    }

    // Creates a canvas element and writes the character into it.
    // The character is written in white, at a size that matches the constant block size.
    private createCanvas(char: string): CanvasRenderingContext2D {
        const canvas = document.createElement('canvas');
        canvas.width = settings.block.width;
        canvas.height = settings.block.height;

        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('Canvas is not supported on this browser!');

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `normal ${settings.block.height}px monospace`;
        ctx.fillStyle = 'white';

        // Center text horizontally and vertically
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        // Glow effect for the text
        ctx.shadowColor = 'white';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 3;

        ctx.fillText(char, canvas.width / 2, canvas.height / 2);

        document.querySelector('#app')!.appendChild(canvas);

        return ctx;
    }
}
