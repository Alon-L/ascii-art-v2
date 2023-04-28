import './style.css'
import { settings } from './settings/panel.ts';
import {CalcProgram} from "./gpgpu/calc/CalcProgram.ts";
import {Generate} from "./charLights/generate.ts";
import videoExample from './NSLComm.mp4';
import {MonochromeProgram} from "./gpgpu/monochrome/MonochromeProgram.ts";
import {Video} from "./video.ts";
import {Readable} from "stream";

const mono = new MonochromeProgram({
    pixels: new Uint8Array(),
    width: window.innerWidth,
    height: window.innerHeight,
});

const calc = new CalcProgram({
    pixels: new Uint8Array(),
    width: window.innerWidth,
    height: window.innerHeight,
});


const frames = new Readable({
    read(size: number) {}
});

new Video(videoExample, frames, {width: window.innerWidth, height: window.innerHeight, fps: 60});

frames.on('data', (pixels) => {
    mono.pixels = pixels;

    mono.draw();

    calc.lights = mono.reducedResults;

    calc.draw();

    const str = String.fromCharCode(...calc.reducedResults).replace(/(.{480})/g, '$1\n');

    (document.querySelector('#result')! as HTMLSpanElement).innerText = str;
});

/*
// TODO: Upload video
async function extractFramesFromVideo(fps = 30) {
    const video = document.createElement("video");

    let seekResolve: (val?: unknown) => void;
    video.addEventListener("seeked", async function () {
        if (seekResolve) seekResolve();
    });

    video.src = videoExample;

    document.querySelector('#app')!.appendChild(video);

    // workaround chromium metadata bug (https://stackoverflow.com/q/38062864/993683)
    while (
        (video.duration === Infinity || isNaN(video.duration)) &&
        video.readyState < 2
        ) {
        await new Promise((r) => setTimeout(r, 1000));
        video.currentTime = 10000000 * Math.random();
    }
    const duration = video.duration;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const [w, h] = [window.innerWidth, window.innerHeight];
    canvas.width = w;
    canvas.height = h;

    let interval = 1 / fps;
    let currentTime = 0;

    while (currentTime < duration) {
        video.currentTime = currentTime;
        await new Promise((r) => (seekResolve = r));

        ctx.drawImage(video, 0, 0, w, h);

        const pixels = ctx.getImageData(0, 0, w, h).data;

        mono.pixels = pixels;

        mono.draw();

        calc.lights = mono.reducedResults;

        calc.draw();

        const str = String.fromCharCode(...calc.reducedResults).replace(/(.{480})/g, '$1\n');

        (document.querySelector('#result')! as HTMLSpanElement).innerText = str;

        currentTime += interval;
    }
}

extractFramesFromVideo();*/

const lightMap = new Generate().generate();

//console.log(JSON.stringify(lightMap));

/*

const img = new Image();
img.src = triangle;

img.addEventListener('load', () => {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const monochrome: number[] = [];
    for (let i = 0; i < pixels.length / 4; ++i) {
        monochrome.push((pixels[i * 4] + pixels[i * 4 + 1] + pixels[i * 4 + 2]) / 3);
    }


    const calc = new CalcProgram({
        lights: new Uint8Array(),
        width: canvas.width,
        height: canvas.height,
        block: {
            width: 8,
            height: 16,
        }
    });

    console.time('Setup');

    calc.lights = new Uint8Array(monochrome);

    calc.draw();

    console.timeEnd('Setup');



    let str = String.fromCharCode(...calc.results).replace(/(.{240})/g, '$1\n');


    (document.querySelector('#result')! as HTMLSpanElement).innerText = str;

    console.log(calc.results);


    document.querySelector('#app')!.appendChild(canvas);

});



*/

