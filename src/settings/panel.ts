import settings from './settings.json';

import GUI from 'lil-gui';

const gui = new GUI();

const blockFolder = gui.addFolder('Block');
blockFolder.add(settings.block, 'width', 2, 100).name('Width');
blockFolder.add(settings.block, 'height', 4, 100).name('Height');

gui.add(settings, 'chars').name('Characters');
gui.add(settings, 'contrastCoefficient', -1, 1).name('Contrast Coefficient');
gui.add(settings, 'fps', 15, 75).name('FPS');

export { settings, gui, blockFolder };
