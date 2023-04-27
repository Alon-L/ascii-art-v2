// Represents a frame of the image.
export type Frame = {
    pixels: Uint8Array;
    width: number;
    height: number;
};

// Interface for the WebGL program that calculates the matching character for every block in the frame.
export class Program {
    // String contents of the vertex and fragment shaders
    private readonly vs: string;
    private readonly fg: string;

    // The WebGL context instance
    protected gl: WebGLRenderingContext;

    protected program: WebGLProgram;

    protected readonly frame: Frame;

    private readonly posLoc: number;

    // The width and height of the resulting calculations' matrix.
    protected readonly dstWidth: number;
    protected readonly dstHeight: number;

    protected constructor(vs: string, fg: string, frame: Frame, dstWidth: number, dstHeight: number) {
        const canvas = document.createElement('canvas');

        const gl = canvas.getContext('webgl');
        if (!gl) throw new Error('WebGL is not supported on this browser!');

        canvas.width = dstWidth;
        canvas.height = dstHeight;

        this.gl = gl;
        this.vs = vs;
        this.fg = fg;
        this.dstWidth = dstWidth;
        this.dstHeight = dstHeight;

        this.frame = frame;

        // Loads the shaders
        const vsShader = this.loadShader(this.gl.VERTEX_SHADER, this.vs);
        const fgShader = this.loadShader(this.gl.FRAGMENT_SHADER, this.fg);

        const program = this.gl.createProgram();
        if (!program) throw new Error('Could not create webgl program!');

        // Adds the shaders to the program and links it
        this.gl.attachShader(program, vsShader);
        this.gl.attachShader(program, fgShader);
        this.gl.linkProgram(program);

        // Tell webgl how to convert from clip space to pixels
        this.gl.viewport(0, 0, dstWidth, dstHeight);

        this.program = program;

        this.gl.useProgram(this.program);

        // Sets the position attribute of the shader
        this.posLoc = this.gl.getAttribLocation(this.program, 'position');
    }

    // Sets up the position attribute and draws the canvas
    protected draw(): void {
        this.createPositionAttr();
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    // Creates a new shader and compiles it
    private loadShader(type: number, src: string): WebGLShader {
        const shader = this.gl.createShader(type);
        if (!shader) throw new Error(`Could not load shader of type ${type}!`);

        // Sends the source to the shader object
        this.gl.shaderSource(shader, src);
        // Compiles the shader program
        this.gl.compileShader(shader);

        // Check whether the shader compiled successfully
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            //this.gl.deleteShader(shader);
            throw new Error(`An error occurred compiling the shaders: ${this.gl.getShaderInfoLog(shader)}`);
        }

        return shader;
    }

    // Creates a new shader texture from the given source array
    protected createTexture(src: Uint8Array, width: number, height: number, unit: number, texLoc: WebGLUniformLocation, texDimsLoc: WebGLUniformLocation): void {
        const tex = this.gl.createTexture();
        if (!tex) throw new Error('Could not create texture!');

        this.gl.activeTexture(this.gl.TEXTURE0 + unit); // Texture unit 0
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        // Create a texture from the frame pixel lights
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.LUMINANCE,
            width,
            height,
            0,
            this.gl.LUMINANCE,
            this.gl.UNSIGNED_BYTE,
            src,
        );

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        // Clamp texture to the edges
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        // Sets the texture uniform and its dimensions uniform
        this.gl.uniform1i(texLoc, unit); // The src texture is on the given texture unit
        this.gl.uniform2f(texDimsLoc, width, height);
    }

    // Creates the attribute for the vertices position, made from 2 triangles
    protected createPositionAttr(): void {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        // Position vertices should be 2 triangles that fill the entire canvas
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            // First triangle, left half of the canvas
            -1, -1,
            1, -1,
            -1, 1,
            // Second triangle, right half of the canvas
            -1, 1,
            1, -1,
            1, 1,
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

    // Returns the results of the program shader
    public get results(): Uint8Array {
        const results = new Uint8Array(this.dstWidth * this.dstHeight * 4);
        this.gl.readPixels(0, 0, this.dstWidth, this.dstHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, results);

        console.log(results);

        return results;
    }
}
