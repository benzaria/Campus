import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: './', // Define the root for the frontend
    base: './',
    build: {
        outDir: './dist', // Output directory for the frontend build
        emptyOutDir: true,       // Clean the output directory before building
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'), // Entry point
            },
        }
    },
    resolve: {
        alias: {
            // Aliases for cleaner imports
            '@': resolve(__dirname, './'),
        },
    },
    server: {
        port: 3000, // Dev server port
        strictPort: true, // Fails if port is already in use
    },
});
