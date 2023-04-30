import './style.css';
import { Render } from './render.ts';
import { Panel } from './settings/panel.ts';
import settings from './settings/settings.json';
import { Generator } from './charLights/generator.ts';
import exampleVideo from './video_example.mp4';

// Initialize the render object and the panel
const generator = new Generator();
const render = new Render(
  exampleVideo,
  { width: window.innerWidth, height: window.innerHeight, fps: settings.fps },
  settings,
  generator.generate(),
);
const panel = new Panel(render);
panel.bindChange();

// Initialize the video input
const input = document.getElementById('video-input') as HTMLInputElement;
input?.addEventListener('change', () => {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];

  // Obtains the blob URL of the uploaded file
  render.src = URL.createObjectURL(file);
});

// Initialize the stop button
const btn = document.getElementById('stop-btn');
btn?.addEventListener('click', () => {
  render.stop();
});
