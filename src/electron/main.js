import { app, BrowserWindow } from "electron/main";
import { config as denv } from "dotenv";denv();
import path from "node:path";
import $ from "jquery";

const __dirname = import.meta.dirname;

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
        throw new Error(error);
    }
}

app.whenReady().then(() => {
    createWindow();
    ipcHandler();
    
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