import settings from '../settings/settings.json';

// Utility class to generate the mapping of the light levels for every character
export class Generator {
  // A string that contains all the available characters for usage
  public chars: string;

  public width: number;

  public height: number;

  constructor(chars = settings.chars, width = settings.block.width, height = settings.block.height) {
    this.chars = chars;

    this.width = width;
    this.height = height;
  }

  // Generates a map in the format of the 'charLights' float array, from all the available characters
  public generate(): number[] {
    let result: number[] = [];

    // for (const char of this.chars) {
    for (let i = 0; i < this.chars.length; ++i) {
      const char = this.chars[i];
      const lightMap = this.lightMap(char);

      // First element should be the ASCII value of the character
      result.push(char.charCodeAt(0));
      // Concat the light map of the current character
      result = result.concat(lightMap);
    }

    return result;
  }

  // Returns the light map of a character.
  private lightMap(char: string): number[] {
    const ctx = this.createCanvas(char);
    const pixels = ctx.getImageData(0, 0, this.width, this.height).data;

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
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas is not supported on this browser!');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // TODO: Make the font customizable
    ctx.font = `normal ${this.width}pt 'Source Code Pro', monospace`;
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

    canvas.remove();

    return ctx;
  }
}
