import {Readable} from "stream";
import {CalcProgram} from "./gpgpu/calc/CalcProgram.ts";
import {MonoProgram} from "./gpgpu/monochrome/MonoProgram.ts";
import {Video, VideoSettings} from "./video.ts";
import {Generator} from "./charLights/generator.ts";
import settings from './settings/settings.json';

// Renders the ascii video.
// Uses the Video class to render the original video, and pipes its frames into the readable stream.
// Uses the mono and calc programs to turn the frame into ascii, and renders the characters onto the span
export class Render {
    private readonly video: Video;
    private readonly frames: Readable;
    private readonly monoProgram: MonoProgram;
    private readonly calcProgram: CalcProgram;
    private readonly generator: Generator;
    private readonly resultSpan: HTMLSpanElement;
    private rowRegexp: RegExp;

    public constructor(src: string, videoSettings: VideoSettings) {
        const {width, height} = videoSettings;

        this.frames = new Readable({ read(_size: number) {} });

        this.monoProgram = new MonoProgram({
            pixels: new Uint8Array(),
            width,
            height,
        });

        this.calcProgram = new CalcProgram({
            pixels: new Uint8Array(),
            width,
            height,
        });

        this.generator = new Generator();

        this.frames.on('data', this.onData.bind(this));

        this.video = new Video(src, this.frames, videoSettings);

        this.resultSpan = document.querySelector('#result')!;
        this.setFontSize(settings.block.height);

        this.rowRegexp = this.createRowRegexp(settings.block.width);
    }

    // Called with every frame of the video
    private onData(pixels: Uint8Array) {
        // Pipes the pixels through the mono program
        this.monoProgram.pixels = pixels;
        this.monoProgram.draw();

        // Pipes the pixels through the calc program
        this.calcProgram.lights = this.monoProgram.reducedResults;
        this.calcProgram.draw();

        // Turns the resulting ascii codes into a string
        this.resultSpan.innerText = String.fromCharCode(...this.calcProgram.reducedResults)
            .replace(this.rowRegexp, '$1\n');
    }

    // Stops the video, destroys the stream and clears the span
    public stop(): void {
        this.video.stop();
        this.frames.destroy();
        this.resultSpan.innerText = '';
    }

    public set fps(value: number) {
        this.video.fps = value;
    }

    public set contrastCoefficient(value: number) {
        this.monoProgram.contrastCoefficient = value;
    }

    public set blockWidth(value: number) {
        this.rowRegexp = this.createRowRegexp(value);
        this.generateLightMap();
        this.generator.width = value;
        this.calcProgram.blockWidth = value;
    }

    public set blockHeight(value: number) {
        this.generator.height = value;
        this.generateLightMap();
        this.calcProgram.blockHeight = value;
        this.setFontSize(value);
    }

    public set chars(value: string) {
        this.calcProgram.charNum = value.length;
        this.generateLightMap(value);
    }

    // Generates a new light map and applies it to the programs
    private generateLightMap(chars?: string) {
        if (chars) {
            this.generator.chars = chars;
        }

        this.calcProgram.charLights = this.generator.generate();
    }

    private setFontSize(blockHeight: number): void {
        this.resultSpan.style.fontSize = `${Math.min(blockHeight - 2, 6)}px`;
    }

    private createRowRegexp(blockWidth: number): RegExp {
        return new RegExp(`(.{${this.video.settings.width / blockWidth}})`, 'g');
    }
}
