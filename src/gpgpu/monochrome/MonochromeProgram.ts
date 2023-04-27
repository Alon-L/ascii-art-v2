import {Frame, Program} from "../Program.ts";
import vs from "./mono.vert";
import fg from "./mono.frag";

export class MonochromeProgram extends Program {
    private readonly pixelsTexLoc: WebGLUniformLocation;
    private readonly pixelsDimsLoc: WebGLUniformLocation;

    constructor(frame: Frame) {
        super(vs, fg, frame, frame.width, frame.height);

        // Sets the locations of the uniforms
        this.pixelsTexLoc = this.gl.getUniformLocation(this.program, 'pixelsTex')!;
        this.pixelsDimsLoc = this.gl.getUniformLocation(this.program, 'pixelsDims')!;
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
        this.createTexture(this.frame.pixels, this.frame.width, this.frame.height, 0, this.pixelsTexLoc, this.pixelsDimsLoc, this.gl.RGBA);
    }
}
