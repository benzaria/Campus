import { app, BrowserWindow as Window, WebContentsView as View } from "electron";
import { showNotification, setupTray, handleProtocolUrl } from "../supervisor/supervisor.js"
import { config as denv } from "dotenv"; denv();
import path from "node:path";
import fs from "node:fs";


/** @type {Protocol} */ export const __appProtocol = 'myapp';
/** @type {Path} */ const __dirname = import.meta.dirname;
global.win = null;
global.app = app;

console.log(__dirname)

// Ensure only a single instance of the app is running
const gotLock = app.requestSingleInstanceLock();

!gotLock ? app.quit() : (() => {
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
        windowExist();
    });

    app.whenReady().then(() => {
        console.log('App is ready');

        // Check if the app was started with --supervisor
        const isSupervisor = process.argv.includes('--supervisor');
        if (!isSupervisor) {
            console.log('not supervised')
            windowExist();
        }
        setupTray();

        const url = process.argv.find(arg => arg.startsWith(`${__appProtocol}://`));
        url ? handleProtocolUrl(url) : null;

        // test
        //showNotification();
    });

    app.on('open-url', (evt, url) => {
        evt.preventDefault();
        handleProtocolUrl(url);
    });

    app.on('activate', () => {
        windowExist()
    });

    // Quit the app only when explicitly requested
    app.on('window-all-closed', (evt) => {
        evt.preventDefault(); // Prevent quitting when all windows are closed
    });
})();

export function createWindow() {
    global.win = new Window({
        width: 975,
        height: 660,
        title: 'Campus',
        icon: "./assets/icon.ico",
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            symbolColor: '#74b1be',
            // color: '#2f3241',
            color: '#ffff',
            height: 34,
            ////width: 120,
        },
        webPreferences: {
            //devTools: false,
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.cjs')
        }
    });

    global.win.webContents.setUserAgent(process.env.userAgent);

    // example
    // const hiddenContent = new View();
    // hiddenContent.webContents.setUserAgent(process.env.userAgent);
    // hiddenContent.setBounds({ x: 100, y: 0, width: 800, height: 600 });
    // hiddenContent.webContents.loadURL('C:\\Users\\benz\\Desktop\\Médecine_Calendrier des examens du 2ème partiel_1ère session  2023-2024.pdf');

    //win.setContentView()
    // global.win.loadFile('./app/index.html').catch(console.error);
    // global.win.loadURL('https://localhost:3000').catch(console.error);
    // global.win.contentView.addChildView(hiddenContent)

    global.win.loadURL('http://localhost:3000');
    //global.win.loadFile(path.join(__dirname, '../../dist/app/index.html'));

    global.win.on('close', () => {
        global.win = null;
    });

    return global.win;
}

function windowExist() {
    !global.win ? global.win = createWindow() : global.win.show();
}