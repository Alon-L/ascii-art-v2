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

    public draw(): void {
        this.createPixelsTexture();
        super.draw();
    }

    // Creates a texture from the light values of the pixels
    private createPixelsTexture(): void {

        console.log(this.frame.pixels);

        this.createTexture(this.frame.pixels, this.frame.width * 4, this.frame.height, 0, this.pixelsTexLoc, this.pixelsDimsLoc);
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
