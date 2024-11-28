import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/electron/main.js',
            formats: ['es', "cjs"], // Electron uses CommonJS
        },
        outDir: 'dist/electron', // Output for main process
        rollupOptions: {
            external: ['electron'], // Externalize Electron
        },
    },
});
