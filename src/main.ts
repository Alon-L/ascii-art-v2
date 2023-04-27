import './style.css'
import {CalcProgram} from "./gpgpu/calc/CalcProgram.ts";
import videoExample from './boashon.mp4';
import {Generate} from "./charLights/generate.ts";

const calc = new CalcProgram({
    pixels: new Uint8Array(),
    width: window.innerWidth,
    height: window.innerHeight,
});

// TODO: Upload video
async function extractFramesFromVideo(fps = 25): Promise<number[][]> {
    return new Promise(async (resolve) => {
        let video = document.createElement("video");

        let seekResolve;
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
        let duration = video.duration;

        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d")!;
        let [w, h] = [window.innerWidth, window.innerHeight];
        canvas.width = w;
        canvas.height = h;

        let frames: number[][] = [];
        let interval = 1 / fps;
        let currentTime = 0;

        while (currentTime < duration) {
            video.currentTime = currentTime;
            await new Promise((r) => (seekResolve = r));

            context.drawImage(video, 0, 0, w, h);

            const frame: number[] = [];
            const pixels = context.getImageData(0, 0, w, h).data;
            for (let i = 0; i < pixels.length / 4; ++i) {
                frame.push((pixels[i * 4] + pixels[i * 4 + 1] + pixels[i * 4 + 2]) / 3);
            }

            calc.lights = new Uint8Array(frame);

            calc.draw();


            let str = String.fromCharCode(...calc.asciis).replace(/(.{320})/g, '$1\n');


            (document.querySelector('#result')! as HTMLSpanElement).innerText = str;

            currentTime += interval;
        }
        resolve(frames);
    });
}

const lightMap = new Generate().generate();

console.log(JSON.stringify(lightMap));



const frames = await extractFramesFromVideo();
console.log(frames);
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

