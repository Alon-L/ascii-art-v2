import glsl from 'vite-plugin-glsl';
import {defineConfig} from 'vite';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

export default defineConfig({
    plugins: [
        glsl(),
        nodePolyfills({
            include: [
                'stream',
            ],
            protocolImports: true,
        }),
    ]
});
