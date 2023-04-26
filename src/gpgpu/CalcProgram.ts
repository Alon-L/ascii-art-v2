import { Program } from './Program.ts';
import vs from './calc.vert';
import fg from './calc.frag';
import charLights from '../charLights/map.json';

// Represents a frame of the image.
export type Frame = {
  lights: Uint8Array; // A sequence of the light values of every pixel
  width: number;
  height: number;
  // TODO: Block size should be constant
  block: {
      width: number;
      height: number;
  }
};

export class CalcProgram extends Program {
    private readonly frame: Frame;

    private readonly posLoc: number;
    private readonly lightsTexLoc: WebGLUniformLocation;
    private readonly lightsDimsLoc: WebGLUniformLocation;
    private readonly charLightsLoc: WebGLUniformLocation;
    private readonly charLightsDimsLoc: WebGLUniformLocation;

    // The width and height of the resulting calculations' matrix.
    private readonly dstWidth: number;
    private readonly dstHeight: number;

    public constructor(frame: Frame) {
        const canvas = document.createElement('canvas');

        const gl = canvas.getContext('webgl');
        if (!gl) throw new Error('WebGL is not supported on this browser!');

        super(gl, vs, fg);

        this.frame = frame;

        // The matrix contains a single ascii value for every block.
        this.dstWidth = this.frame.width / this.frame.block.width;
        this.dstHeight = this.frame.height / this.frame.block.height;

        canvas.width = this.dstWidth;
        canvas.height = this.dstHeight;

        // Sets the locations of the attributes and uniforms
        this.posLoc = gl.getAttribLocation(this.program, 'position');
        this.lightsTexLoc = gl.getUniformLocation(this.program, 'lightsTex')!;
        this.lightsDimsLoc = gl.getUniformLocation(this.program, 'lightsDims')!;
        this.charLightsLoc = gl.getUniformLocation(this.program, 'charLights')!;
        this.charLightsDimsLoc = gl.getUniformLocation(this.program, 'charLightsDims')!;
    }

    // Sets-up all the attributes, uniforms and textures, and draws the canvas
    public draw(): void {
        this.createPositionAttr();
        this.createLightsTexture();
        this.createCharLightsTexture();
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.dstWidth * this.dstHeight);
    }

    // Creates the attribute for the vertices position, made from 2 triangles
    private createPositionAttr(): void {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        // Position vertices should be 2 triangles that fill the entire canvas
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            // First triangle, left half of the canvas
            -1, -1,
             1, -1,
            -1,  1,
            // Second triangle, right half of the canvas
            -1,  1,
             1, -1,
             1,  1,
        ]), this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(this.posLoc);
        this.gl.vertexAttribPointer(
            this.posLoc,
            2,
            this.gl.FLOAT,
            false,
            0,
            0,
        );
    }

    public set lights(lights: Uint8Array): void {
        this.frame.lights = lights;
        this.createCharLightsTexture();
    }

    private createCharLightsTexture(): void {
        const tex = this.gl.createTexture();
        if (!tex) throw new Error('Could not create texture!');

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        // Create a texture from the frame pixel lights

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.LUMINANCE,
            // TODO: Number of characters - 131, row = width * height + 1
            this.frame.block.width * this.frame.block.height + 1,
            114,
            0,
            this.gl.LUMINANCE,
            this.gl.UNSIGNED_BYTE,
            new Uint8Array(charLights),
        );

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        this.gl.uniform1i(this.charLightsLoc, 1); // The src texture is on texture unit 0
        // TODO: Number of characters - 131, row = width * height + 1
        this.gl.uniform2f(this.charLightsDimsLoc, this.frame.block.width * this.frame.block.height + 1, 114);
    }

    // Creates a texture from the light values of the pixels
    private createLightsTexture(): void {
        const tex = this.gl.createTexture();
        if (!tex) throw new Error('Could not create texture!');

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        // Create a texture from the frame pixel lights
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.LUMINANCE,
            this.frame.width,
            this.frame.height,
            0,
            this.gl.LUMINANCE,
            this.gl.UNSIGNED_BYTE,
            this.frame.lights,
        );

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        this.gl.useProgram(this.program);
        this.gl.uniform1i(this.lightsTexLoc, 0); // The src texture is on texture unit 0
        this.gl.uniform2f(this.lightsDimsLoc, this.frame.width, this.frame.height);
    }

    // Returns the ASCII values that should be placed in every block
    public get results(): number[] {
        const results = new Uint8Array(this.dstWidth * this.dstHeight * 4);
        this.gl.readPixels(0, 0, this.dstWidth, this.dstHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, results);

        const asciis = [];
        // The results are stored in the alpha R channel of every pixel in the canvas
        for (let i = 0; i < this.dstWidth * this.dstHeight; ++i) {
            asciis.push(results[i * 4]);
        }

        return asciis;
    }

}
