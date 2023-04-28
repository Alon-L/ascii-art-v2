import {Readable} from 'stream';
import settings from './settings/settings.json';

export type VideoSettings = {
    width: number;
    height: number;
    fps?: number;
}

// Reads the frames of the video and pipes it into a readable stream
export class Video {
    private readonly video: HTMLVideoElement;
    private readonly ctx: CanvasRenderingContext2D;

    private readonly framesStream: Readable;
    public readonly settings: VideoSettings;

    constructor(src: string, framesStream: Readable, settings: VideoSettings) {
        this.video = document.createElement('video');
        this.video.addEventListener('play', this.onFrame.bind(this));

        this.video.src = src;
        this.video.muted = true;
        this.video.play();

        this.framesStream = framesStream;
        this.settings = settings;

        // Creates the canvas for drawing each frame to obtain its pixels
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Canvas is not supported on this browser!');

        canvas.width = settings.width;
        canvas.height = settings.height;

        this.ctx = ctx;
    }

    // Draws the current frame onto a canvas and reads the pixels into the readable stream
    private onFrame(): void {
        const {width, height} = this.settings;

        // Draw the image
        this.ctx.drawImage(this.video, 0, 0, width, height);
        const frame = this.ctx.getImageData(0, 0, width, height);

        // Push into the readable stream
        this.framesStream.push(new Uint8Array(frame.data));

        setTimeout(() => {
            this.onFrame();
        }, 1 / (this.settings.fps || settings.fps));
    }

    // Sets the fps value
    public set fps(value: number) {
        if (value > 0) {
            this.settings.fps = value;
        }
    }
}
