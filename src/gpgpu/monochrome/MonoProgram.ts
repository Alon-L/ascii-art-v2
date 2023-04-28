import {Frame, Program} from "../Program.ts";
import vs from "./mono.vert";
import fg from "./mono.frag";
import settings from '../../settings/settings.json';

const monoProgramUniforms = ['pixelsTex', 'pixelsDims', 'contrastCoefficient'];

export class MonoProgram extends Program<typeof monoProgramUniforms[number]> {
    constructor(frame: Frame) {
        super(vs, fg, frame, frame.width, frame.height, monoProgramUniforms);

        this.contrastCoefficient = settings.contrastCoefficient;
    }

    public set contrastCoefficient(value: number) {
        this.gl.uniform1f(this.uniforms['contrastCoefficient'], value * 255);
    }

    public set pixels(pixels: Uint8Array | Uint8ClampedArray) {
        this.frame.pixels = pixels;
        this.createPixelsTexture();
    }

    public draw(): void {
        this.createPixelsTexture();
        super.draw();
    }

    // Creates a texture from the light values of the pixels
    private createPixelsTexture(): void {
        this.createTexture(this.frame.pixels, this.frame.width, this.frame.height, 0, this.uniforms['pixelsTex'], this.uniforms['pixelsDims'], this.gl.RGBA);
    }
}
