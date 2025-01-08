import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs'

const args = process.argv.slice(4)
console.log(args)

const option = { recursive: true, force: true }

// Directories and paths
const distDir = path.resolve(args ? args[0] : 'dist');
const srcDir = path.resolve('src', 'app')
const destDataDir = path.join(distDir, 'data');
const srcDataDir = path.resolve(srcDir, 'data');

if (fs.existsSync(distDir))
    fs.rmSync(distDir, option)

if (fs.existsSync(srcDataDir))
    fs.cpSync(srcDataDir, destDataDir, option)

export default defineConfig({
    root: srcDir,
    base: './',
    build: {
        outDir: distDir,
        emptyOutDir: false,
        rollupOptions: {
            input: {
                main: path.resolve(srcDir, 'index.html'),
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
            '@': srcDir
        },
    },
    server: {
        port: 3000,
        strictPort: true,
    },
});
