import { Frame, Program } from '../Program.ts';
import vs from './calc.vert';
import fg from './calc.frag';
import { RenderSettings } from '../../render.ts';

const calcProgramUniforms = [
  'lightsTex',
  'lightsDims',
  'charLightsTex',
  'charLightsDims',
  'blockWidth',
  'blockHeight',
  'charNum',
] as const;

export class CalcProgram extends Program<(typeof calcProgramUniforms)[number]> {
  // Settings are linked to the lil gui. Changes dynamically
  private renderSettings: RenderSettings;

  private lightMap: number[];

  public constructor(frame: Frame, renderSettings: RenderSettings, lightMap: number[]) {
    const {
      block: { width: blockWidth, height: blockHeight },
    } = renderSettings;

    const dstWidth = frame.width / blockWidth;
    const dstHeight = frame.height / blockHeight;

    super(vs, fg, frame, dstWidth, dstHeight, calcProgramUniforms);

    this.renderSettings = renderSettings;
    this.lightMap = lightMap;

    // Initialize the uniforms
    this.gl.uniform1i(this.uniforms.blockWidth, this.renderSettings.block.width);
    this.gl.uniform1i(this.uniforms.blockHeight, this.renderSettings.block.height);
    this.gl.uniform1i(this.uniforms.charNum, this.renderSettings.chars.length);

    // Creates the texture from the characters light map
    this.createCharLightsTexture();
  }

  public set blockWidth(value: number) {
    this.dstWidth = this.frame.width / value;

    this.gl.uniform1i(this.uniforms.blockWidth, value);
  }

  public set blockHeight(value: number) {
    this.dstHeight = this.frame.height / value;

    this.gl.uniform1i(this.uniforms.blockHeight, value);
  }

  public set chars(value: string) {
    this.gl.uniform1i(this.uniforms.charNum, value.length);
  }

  public set charLights(lightMap: number[]) {
    this.lightMap = lightMap;
    this.createCharLightsTexture();
  }

  // Sets-up all the attributes, uniforms and textures, and draws the canvas
  public draw(): void {
    this.createLightsTexture();
    super.draw();
  }

  public set lights(lights: Uint8Array) {
    this.frame.pixels = lights;
    this.createCharLightsTexture();
  }

  private createCharLightsTexture(): void {
    const {
      chars,
      block: { width: blockWidth, height: blockHeight },
    } = this.renderSettings;

    const width = blockWidth * blockHeight + 1;
    const height = chars.length;

    this.createTexture(
      new Uint8Array(this.lightMap),
      width,
      height,
      1,
      this.uniforms.charLightsTex,
      this.uniforms.charLightsDims,
      this.gl.LUMINANCE,
    );
  }

  // Creates a texture from the light values of the pixels
  private createLightsTexture(): void {
    this.createTexture(
      this.frame.pixels,
      this.frame.width,
      this.frame.height,
      0,
      this.uniforms.lightsTex,
      this.uniforms.lightsDims,
      this.gl.LUMINANCE,
    );
  }
}
