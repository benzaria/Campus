import { app, BrowserWindow as Window, WebContentsView as View } from "electron/main";
import { showNotification, setupTray, handleProtocolUrl } from "../supervisor/supervisor.js"
import { config as denv } from "dotenv"; denv();
import path from "node:path";
import fs from "node:fs";
import $ from "jquery";


/** @type {Protocol} */ export const __appProtocol = 'myapp';
/** @type {Path} */ const __dirname = import.meta.dirname;
global.win = null;
global.app = app;


// Ensure only a single instance of the app is running
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
    app.quit();
} else {
    if (app.isPackaged) {
        app.setAsDefaultProtocolClient(__appProtocol);
    } else {
        app.setAsDefaultProtocolClient(__appProtocol, process.execPath, [
            path.resolve(process.argv[1]),
        ]);
    }

    app.on('second-instance', (evt, argv) => {
        const url = argv.find(arg => arg.startsWith(`${__appProtocol}://`));
        url ? handleProtocolUrl(url) : null;

        //* Restore or recreate the window
        if (!global.win) {
            global.win = createWindow();
        } else if (global.win.isMinimized()) {
            global.win.restore();
        }
        global.win.show(); //*/
    });

    app.on('ready', () => {
        console.log('App is ready');

        // Check if the app was started with --supervisor
        const isSupervisor = process.argv.includes('--supervisor');
        if (!isSupervisor) {
            console.log('not supervised')
            global.win = createWindow();
        }
        setupTray();

        const url = process.argv.find(arg => arg.startsWith(`${__appProtocol}://`));
        url ? handleProtocolUrl(url) : null;

        // test
        showNotification();
    });

    app.on('open-url', (evt, url) => {
        evt.preventDefault();
        handleProtocolUrl(url);
    });

    app.on('activate', () => {
        if (!global.win) {
            global.win = createWindow();
        }
        global.win.show();
    });

    // Quit the app only when explicitly requested
    app.on('window-all-closed', (evt) => {
        evt.preventDefault(); // Prevent quitting when all windows are closed
    });
}

export function createWindow() {
    global.win = new Window({
        width: 975,
        height: 660,
        title: 'Campus',
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
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            sandbox: true,
            preload: path.join(__dirname, 'preload.cjs')
        }
    });

    global.win.webContents.setUserAgent(process.env.userAgent);

    const hiddenContent = new View();
    hiddenContent.webContents.setUserAgent(process.env.userAgent);
    hiddenContent.setBounds({ x: 0, y: 0, width: 400, height: 600 });
    hiddenContent.webContents.loadURL('https://google.com/');

    //win.setContentView()
    global.win.loadURL('https://google.com/').catch(console.error);
    global.win.contentView.addChildView(hiddenContent)

    global.win.on('close', () => {
        global.win = null;
    });

    return global.win;
}
