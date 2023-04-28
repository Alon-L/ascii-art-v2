import {Frame, Program} from '../Program.ts';
import vs from './calc.vert';
import fg from './calc.frag';
import charLights from '../../charLights/map.json';
import settings from '../../settings/settings.json';

const calcProgramUniforms = ['lightsTex'
    , 'lightsDims'
    , 'charLightsTex'
    , 'charLightsDims'
    , 'blockWidth',
    'blockHeight'
    , 'charNum'] as const;

export class CalcProgram extends Program<typeof calcProgramUniforms[number]> {
    private _blockWidth: number;
    private _blockHeight: number;
    private _charNum: number;
    private _lightMap: number[];

    public constructor(frame: Frame, blockWidth = settings.block.width, blockHeight = settings.block.height, charNum = settings.chars.length, lightMap = charLights) {
        const dstWidth = frame.width / blockWidth;
        const dstHeight = frame.height / blockHeight;

        super(vs, fg, frame, dstWidth, dstHeight, calcProgramUniforms);

        this._blockWidth = blockWidth;
        this._blockHeight = blockHeight;
        this._charNum = charNum;
        this._lightMap = lightMap;

        // Initialize the uniforms
        this.blockWidth = settings.block.width;
        this.blockHeight = settings.block.height;
        this.charNum = settings.chars.length;
    }

    public set blockWidth(value: number) {
        this.dstWidth = this.frame.width / value;
        this._blockWidth = value;

        this.gl.uniform1i(this.uniforms.blockWidth, value);
    }

    public set blockHeight(value: number) {
        this.dstHeight = this.frame.height / value;
        this._blockHeight = value;

        this.gl.uniform1i(this.uniforms.blockHeight, value);
    }

    public set charNum(value: number) {
        this._charNum = value;

        this.gl.uniform1i(this.uniforms.charNum, value);
    }

    public set charLights(lightMap: number[]) {
        this._lightMap = lightMap;
        this.createCharLightsTexture();
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
        const width = this._blockWidth * this._blockHeight + 1;
        const height = this._charNum;

        this.createTexture(new Uint8Array(this._lightMap), width, height, 1, this.uniforms.charLightsTex, this.uniforms.charLightsDims, this.gl.LUMINANCE);
    }

    // Creates a texture from the light values of the pixels
    private createLightsTexture(): void {
        this.createTexture(this.frame.pixels, this.frame.width, this.frame.height, 0, this.uniforms.lightsTex, this.uniforms.lightsDims, this.gl.LUMINANCE);
    }
}
