import {Frame, Program} from '../Program.ts';
import vs from './calc.vert';
import fg from './calc.frag';
import charLights from '../../charLights/map.json';
import settings from '../../settings.json';

export class CalcProgram extends Program<'lightsTex' | 'lightsDims' | 'charLightsTex' | 'charLightsDims'> {
    public constructor(frame: Frame) {
        const dstWidth = frame.width / settings.block.width;
        const dstHeight = frame.height / settings.block.height;

        super(vs, fg, frame, dstWidth, dstHeight);

        // Sets the locations of the uniforms
        this.addUniformLoc('lightsTex');
        this.addUniformLoc('lightsDims');
        this.addUniformLoc('charLightsTex');
        this.addUniformLoc('charLightsDims');
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

        this.createTexture(new Uint8Array(charLights), width, height, 1, this.uniformLocations['charLightsTex'], this.uniformLocations['charLightsDims'], this.gl.LUMINANCE);
    }

    // Creates a texture from the light values of the pixels
    private createLightsTexture(): void {
        this.createTexture(this.frame.pixels, this.frame.width, this.frame.height, 0, this.uniformLocations['lightsTex'], this.uniformLocations['lightsDims'], this.gl.LUMINANCE);
    }
}
