// Interface for the WebGL program that calculates the matching character for every block in the frame.
export class Program {
    // String contents of the vertex and fragment shaders
    private readonly vs: string;
    private readonly fg: string;

    // The WebGL context instance
    protected gl: WebGLRenderingContext;

    protected program: WebGLProgram;

    public constructor(gl: WebGLRenderingContext, vs: string, fg: string) {
        this.gl = gl;
        this.vs = vs;
        this.fg = fg;

        // Loads the shaders
        const vsShader = this.loadShader(this.gl.VERTEX_SHADER, this.vs);
        const fgShader = this.loadShader(this.gl.FRAGMENT_SHADER, this.fg);

        const program = this.gl.createProgram();
        if (!program) throw new Error('Could not create webgl program!');

        // Adds the shaders to the program and links it
        this.gl.attachShader(program, vsShader);
        this.gl.attachShader(program, fgShader);
        this.gl.linkProgram(program);

        this.program = program;

        this.gl.useProgram(this.program);
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
}
