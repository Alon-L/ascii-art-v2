import './style.css'
import videoExample from './video_example.mp4';
import {Render} from "./render.ts";
import {Panel} from "./settings/panel.ts";
import settings from './settings/settings.json'

const render = new Render(videoExample, { width: window.innerWidth, height: window.innerHeight, fps: settings.fps });
new Panel(render);
