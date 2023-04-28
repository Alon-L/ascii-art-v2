import {Frame, Program} from '../Program.ts';
import vs from './calc.vert';
import fg from './calc.frag';
import charLights from '../../charLights/map.json';
import settings from '../../settings.json';

const calcProgramUniforms = ['lightsTex'
    , 'lightsDims'
    , 'charLightsTex'
    , 'charLightsDims'
    , 'blockWidth',
    'blockHeight'
    , 'charNum'] as const;

export class CalcProgram extends Program<typeof calcProgramUniforms[number]> {
    public constructor(frame: Frame) {
        const dstWidth = frame.width / settings.block.width;
        const dstHeight = frame.height / settings.block.height;

        super(vs, fg, frame, dstWidth, dstHeight, calcProgramUniforms);

        // Initialize the uniforms
        this.gl.uniform1i(this.uniforms.blockWidth, settings.block.width);
        this.gl.uniform1i(this.uniforms.blockHeight, settings.block.height);
        this.gl.uniform1i(this.uniforms.charNum, settings.chars.length);
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

        this.createTexture(new Uint8Array(charLights), width, height, 1, this.uniforms['charLightsTex'], this.uniforms['charLightsDims'], this.gl.LUMINANCE);
    }

    // Creates a texture from the light values of the pixels
    private createLightsTexture(): void {
        this.createTexture(this.frame.pixels, this.frame.width, this.frame.height, 0, this.uniforms['lightsTex'], this.uniforms['lightsDims'], this.gl.LUMINANCE);
    }
}
