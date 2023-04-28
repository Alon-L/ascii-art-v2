// Represents a frame of the image.
export type Frame = {
    pixels: Uint8Array | Uint8ClampedArray;
    width: number;
    height: number;
};

// Interface for a WebGL program
export class Program<T extends string> {
    // String contents of the vertex and fragment shaders
    private readonly vs: string;
    private readonly fg: string;

    private readonly canvas: HTMLCanvasElement;

    // The WebGL context instance
    protected readonly gl: WebGL2RenderingContext;

    protected readonly program: WebGLProgram;

    protected readonly frame: Frame;

    // An object with all the uniform location objects of the program
    protected readonly uniforms: Record<T, WebGLUniformLocation>;

    private readonly posLoc: number;

    // The width and height of the resulting calculations' matrix.
    protected _dstWidth: number;
    protected _dstHeight: number;

    protected constructor(vs: string, fg: string, frame: Frame, dstWidth: number, dstHeight: number, uniformLocs: readonly T[]) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = dstWidth;
        this.canvas.height = dstHeight;

        const gl = this.canvas.getContext('webgl2');
        if (!gl) throw new Error('WebGL is not supported on this browser!');

        this.gl = gl;
        this.vs = vs;
        this.fg = fg;
        this._dstWidth = dstWidth;
        this._dstHeight = dstHeight;

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

        // Initialize the uniform locations object
        this.uniforms = uniformLocs.reduce((acc, loc) => {
            const uniform = this.gl.getUniformLocation(this.program, loc);
            if (!uniform) throw new Error(`Could not find uniform ${loc}!`);

            acc[loc] = uniform;
            return acc;
        }, {} as Record<T, WebGLUniformLocation>);

        // Create the position attribute
        this.createPositionAttr();
    }

    // Sets up the position attribute and draws the canvas
    protected draw(): void {
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
    protected createTexture(src: Uint8Array | Uint8ClampedArray, width: number, height: number, unit: number, texLoc: WebGLUniformLocation, texDimsLoc: WebGLUniformLocation, format: GLint): void {
        const tex = this.gl.createTexture();
        if (!tex) throw new Error('Could not create texture!');

        this.gl.activeTexture(this.gl.TEXTURE0 + unit); // Texture unit 0
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        // Create a texture from the frame pixel lights
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            format,
            width,
            height,
            0,
            format,
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

    public set dstWidth(value: number) {
        this.canvas.width = value;
        this._dstWidth = value;
    }

    public set dstHeight(value: number) {
        this.canvas.height = value;
        this._dstHeight = value;
    }

    // Adds a new uniform location to the uniform locations object
    protected addUniformLoc(loc: T): void {
        const location = this.gl.getUniformLocation(this.program, loc);
        if (!location) throw new Error('Uniform location not found!');

        this.uniforms[loc] = location;
    }

    // Returns the results of the program shader
    public get results(): Uint8Array {
        const results = new Uint8Array(this._dstWidth * this._dstHeight * 4);
        this.gl.readPixels(0, 0, this._dstWidth, this._dstHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, results);

        return results;
    }

    // Returns the R channels of the results
    public get reducedResults(): Uint8Array {
        const results = this.results;

        const reduced = new Uint8Array(this._dstWidth * this._dstHeight);
        // The results are stored in the alpha R channel of every pixel in the canvas
        for (let i = 0; i < this._dstWidth * this._dstHeight; ++i) {
            reduced[i] = results[i * 4];
        }

        return reduced;
    }
}
