import {MonochromeProgram} from "./MonochromeProgram.ts";
import triangle from '../../istockphoto-1248542684-612x612.jpg';
import {CalcProgram} from "../calc/CalcProgram.ts";
import '../../style.css'


const img = new Image();
img.src = triangle;

img.addEventListener('load', () => {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

    console.time('Start');

    const mono = new MonochromeProgram({
        pixels: new Uint8Array(data.data),
        width: canvas.width,
        height: canvas.height,
    });

    mono.draw();

    console.timeEnd('Start');

    const results = mono.results;

    ctx.putImageData(new ImageData(new Uint8ClampedArray(results), canvas.width, canvas.height), 0, 0);

    document.querySelector('#app')!.appendChild(canvas);

    /*console.log(new Uint8ClampedArray(results));

    const calc = new CalcProgram({
        pixels: new Uint8Array(mono.asciis),
        width: canvas.width,
        height: canvas.height,
    });

    calc.draw();

    let str = String.fromCharCode(...calc.asciis).replace(/(.{320})/g, '$1\n');


    (document.querySelector('#result')! as HTMLSpanElement).innerText = str;

    console.log(calc.asciis);*/
});
