import { defineConfig } from 'vite';

export default defineConfig({
    root: './', // Specify the root directory for Vite
    base: './', // Ensure proper path resolution
    build: {
        outDir: '../../dist/app', // Renderer build output
        rollupOptions: {
            external: ['electron'], // Externalize Electron
        },
    },
});
