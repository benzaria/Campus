import { app, BrowserWindow, ipcMain, Notification } from "electron";
import { decode, encode } from "./cryptor.js";
import { config as denv } from "dotenv";denv();
import { SEND } from "../APIs/mailer.js";
import strg from "../APIs/storage.js";
import db from "../APIs/database.js";
import path from "node:path";
import $ from "jquery";

export const __dirname = import.meta.dirname;

function preload() {
    ipcMain.handle('decode-file', async (evt, { key, iv, fileName, filePath }) => {
        console.log('in main', key, iv, fileName, filePath);
        return await decode(key, iv, fileName, filePath)
    });
    ipcMain.handle('encode-file', async (evt, { key, iv, fileName, filePath }) => {
        console.log('in main', key, iv, fileName, filePath);
        return await encode(key, iv, fileName, filePath)
    });
    ipcMain.on('send-email', (evt, { to, sub, html }) => SEND(to, sub, html));
    ipcMain.handle('database', (evt, verb, {  }) => {
        switch (verb) {
            case 'GET': db.GET(); break;
            case 'PUT': db.PUT(); break;
            case 'DEL': db.DEL(); break;
            default: console.error('Error: undefined database API verb', verb); break;
        }
    });
    ipcMain.handle('storage', (evt, verb, {  }) => {
        switch (verb) {
            case 'GET': strg.GET(); break;
            case 'PUT': strg.PUT(); break;
            case 'DEL': strg.DEL(); break;
            default: console.error('Error: undefined storage API verb', verb); break;
        }
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 975,
        height: 660,
        title: 'Fmp-Qcm',
        icon: "./assets/icon.ico",
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            symbolColor: '#74b1be',
            color: '#2f3241',
            height: 55,
            ////width: 120,
        },
        webPreferences: {
            //devTools: false,
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        }
    });
    
    try {
        win.loadFile('./app/index.html');
    } catch (error) {
        throw new Error(`${error}`);
    }
}

app.whenReady().then(() => {
    createWindow();
    preload();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});



/*
const crypto = require('crypto');
function encrypt(text, key, iv) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

const key = crypto.randomBytes(32); // 256-bit key
const iv = crypto.randomBytes(16); // Initialization vector

const encrypted = encrypt("Hello World", key, iv);
console.log("Encrypted:", encrypted, key, iv);
*/
/*
ipcMain.on("notify", (event, { title, body }) => {
  const notification = new Notification({ title, body });
  notification.show();
});
*/