import {Frame, Program} from "../Program.ts";
import vs from "./mono.vert";
import fg from "./mono.frag";

export class MonochromeProgram extends Program<'pixelsTex' | 'pixelsDims'> {
    constructor(frame: Frame) {
        super(vs, fg, frame, frame.width, frame.height);

        // Sets the locations of the uniforms
        this.addUniformLoc('pixelsTex');
        this.addUniformLoc('pixelsDims');
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
        this.createTexture(this.frame.pixels, this.frame.width, this.frame.height, 0, this.uniformLocations['pixelsTex'], this.uniformLocations['pixelsDims'], this.gl.RGBA);
    }
}
