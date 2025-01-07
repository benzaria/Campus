import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: './src/app',
    base: './',
    build: {
        outDir: '../../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/app/index.html'),
            },
            output: {
                entryFileNames: 'script.js',
                chunkFileNames: 'js/[name].js',
                assetFileNames: (assetInfo) => {
                    const extType = assetInfo.name.split('.').pop();
                    switch (extType) {
                        case 'css':
                            return 'style.css'
                        case 'json':
                            return '[name].json'
                        case 'woff2':
                            return 'assets/font/[name].[ext]'

                        default:
                            return 'assets/[name].[ext]';
                    }
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src/app'),
        },
    },
    server: {
        port: 3000,
        strictPort: true,
    },
});
