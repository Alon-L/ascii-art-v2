import GUI, { Controller } from 'lil-gui';
import settings from './settings.json';
import { Render } from '../render.ts';

export const enum GUIProperties {
  BLOCK_WIDTH = 'width',
  BLOCK_HEIGHT = 'height',
  CHARS = 'chars',
  CONTRAST_COEFFICIENT = 'contrastCoefficient',
  FPS = 'fps',
}

// The event type from the lil-gui library
type GUIEvent = {
  object: object;
  controller: Controller;
} & (
  | {
      property:
        | GUIProperties.BLOCK_WIDTH
        | GUIProperties.BLOCK_HEIGHT
        | GUIProperties.CONTRAST_COEFFICIENT
        | GUIProperties.FPS;
      value: number;
    }
  | {
      property: GUIProperties.CHARS;
      value: string;
    }
);

// The GUI panel for the website settings
// Applies the settings onto the shader uniforms, and regenerates the char maps if needed
export class Panel {
  private readonly render: Render;

  private readonly gui: GUI;

  private readonly blockFolder: GUI;

  constructor(render: Render) {
    this.render = render;
    this.gui = new GUI();

    this.blockFolder = this.gui.addFolder('Block');
    this.blockFolder.add(settings.block, 'width', 2, 100).name('Width');
    this.blockFolder.add(settings.block, 'height', 4, 100).name('Height');

    this.gui.add(settings, 'chars').name('Characters');
    this.gui.add(settings, 'contrastCoefficient', -1, 1).name('Contrast Coefficient');
    this.gui.add(settings, 'fps', 5, 100).name('FPS');
  }

  public bindChange(): void {
    // lil-gui typescript types do not support generic properties :(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.gui.onChange(this.onChange.bind(this));
  }

  private onChange(event: GUIEvent): void {
    const { property, value } = event;

    switch (property) {
      case GUIProperties.FPS:
        this.render.fps = value;
        break;
      case GUIProperties.CONTRAST_COEFFICIENT:
        this.render.contrastCoefficient = value;
        break;
      case GUIProperties.BLOCK_WIDTH:
        this.render.blockWidth = value;
        break;
      case GUIProperties.BLOCK_HEIGHT:
        this.render.blockHeight = value;
        break;
      case GUIProperties.CHARS:
        this.render.chars = value;
        break;
      default:
        break;
    }
  }
}
