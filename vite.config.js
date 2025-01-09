import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs'

const args = process.argv.slice(2)
console.log(args)

const option = { recursive: true, force: true }

// Directories and paths
const outDir = path.resolve(args[2] ?? 'dist');
const srcDir = path.resolve('src');
const appDir = path.resolve(srcDir, 'app');
const envFile = path.resolve(appDir, 'env.json');
const outDataDir = path.join(outDir, 'data');
const appDataDir = path.resolve(appDir, 'data');

if (fs.existsSync(outDir))
    fs.rmSync(outDir, option)

if (fs.existsSync(appDataDir))
    fs.cpSync(appDataDir, outDataDir, option)

if (fs.existsSync(envFile))
    fs.cpSync(envFile, outDir + '/env.json', option)

export default defineConfig({
    root: appDir,
    base: './',
    build: {
        outDir: outDir,
        emptyOutDir: false,
        rollupOptions: {
            input: {
                main: path.resolve(appDir, 'index.html'),
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
            '@': appDir
        },
    },
    server: {
        port: 3000,
        strictPort: true,
    },
});
