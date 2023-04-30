import './style.css';
import { Render } from './render.ts';
import { Panel } from './settings/panel.ts';
import settings from './settings/settings.json';
import { Generator } from './charLights/generator.ts';

// Initialize the render object and the panel
let render: Render | undefined;
const panel = new Panel(render);
panel.bindChange();

// Initialize the video input
const input = document.getElementById('video-input') as HTMLInputElement;
input?.addEventListener('change', () => {
  const generator = new Generator();
  // Stops the previous render if exists
  if (render) render.stop();

  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  // Obtains the blob URL of the uploaded file
  const blobURL = URL.createObjectURL(file);

  // Creates a new render instance
  render = new Render(
    blobURL,
    { width: window.innerWidth, height: window.innerHeight, fps: settings.fps },
    settings,
    generator.generate(),
  );
  panel.render = render;
});

// Initialize the stop button
const btn = document.getElementById('stop-btn');
btn?.addEventListener('click', () => {
  render?.stop();
  render = undefined;
});
