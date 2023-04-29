import './style.css'
import videoExample from './video_example.mp4';
import {Render} from "./render.ts";
import {Panel} from "./settings/panel.ts";
import settings from './settings/settings.json'
import {Generator} from "./charLights/generator.ts";

const generator = new Generator();
const render = new Render(videoExample, { width: window.innerWidth, height: window.innerHeight, fps: settings.fps }, settings, generator.generate());
new Panel(render);

const btn = document.getElementById('stop-btn');
btn?.addEventListener('click', () => render.stop());
