import {Frame, Program} from '../Program.ts';
import vs from './calc.vert';
import fg from './calc.frag';
import charLights from '../../charLights/map.json';
import settings from '../../settings.json';

export class CalcProgram extends Program {
    private readonly lightsTexLoc: WebGLUniformLocation;
    private readonly lightsDimsLoc: WebGLUniformLocation;
    private readonly charLightsLoc: WebGLUniformLocation;
    private readonly charLightsDimsLoc: WebGLUniformLocation;

    public constructor(frame: Frame) {
        const dstWidth = frame.width / settings.block.width;
        const dstHeight = frame.height / settings.block.height;

        super(vs, fg, frame, dstWidth, dstHeight);

        // Sets the locations of the uniforms
        this.lightsTexLoc = this.gl.getUniformLocation(this.program, 'lightsTex')!;
        this.lightsDimsLoc = this.gl.getUniformLocation(this.program, 'lightsDims')!;
        this.charLightsLoc = this.gl.getUniformLocation(this.program, 'charLights')!;
        this.charLightsDimsLoc = this.gl.getUniformLocation(this.program, 'charLightsDims')!;
    }

    // Sets-up all the attributes, uniforms and textures, and draws the canvas
    public draw(): void {
        this.createLightsTexture();
        this.createCharLightsTexture();
        super.draw();
    }

    public set lights(lights: Uint8Array) {
        this.frame.pixels = lights;
        this.createCharLightsTexture();
    }

    private createCharLightsTexture(): void {
        const width = settings.block.width * settings.block.height + 1;
        const height = settings.chars.length;

        this.createTexture(new Uint8Array(charLights), width, height, 1, this.charLightsLoc, this.charLightsDimsLoc);
    }

    // Creates a texture from the light values of the pixels
    private createLightsTexture(): void {
        this.createTexture(this.frame.pixels, this.frame.width, this.frame.height, 0, this.lightsTexLoc, this.lightsDimsLoc);
    }

    // Returns the ASCII values that should be placed in every block
    public get asciis(): number[] {
        const results = super.results;

        const asciis = [];
        // The results are stored in the alpha R channel of every pixel in the canvas
        for (let i = 0; i < this.dstWidth * this.dstHeight; ++i) {
            asciis.push(results[i * 4]);
        }

        return asciis;
    }

}
