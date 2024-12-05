import { app, BrowserWindow, Menu, Notification, Tray } from 'electron';
import path from 'path';
import fs from 'fs';
import { echo } from './test.js'

const __appProtocol = 'campus';
const __dirname = import.meta.dirname;
let win = null;
let tray;


function replacePlaceholders(template) {
    return template.replace(/\${(.*?)}/g, (_, key) => {
        try {
            return key.length <= 20 && key ? eval(`__${key}`) : '';
        } catch {
            return '';
        }
    });
}

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

        // Restore or recreate the window if needed
        if (!win) {
            win = createWindow();
        } else if (win.isMinimized()) {
            win.restore();
        }
        win.show();
    });

    app.on('ready', () => {
        console.log('App is ready');

        // Check if the app was started with --supervisor
        const isSupervisor = process.argv.includes('--supervisor');
        if (isSupervisor) {
            setupTrayOnly();
        } else {
            win = createWindow();
            setupTray();
        }

        const url = process.argv.find(arg => arg.startsWith(`${__appProtocol}://`));
        url ? handleProtocolUrl(url) : null;

        echo(replacePlaceholders(JSON.parse(fs.readFileSync(`${__dirname}/toast.json`, 'utf-8')).YesNo.join('\n')))

        const toastXml = replacePlaceholders(JSON.parse(
            fs.readFileSync(`${__dirname}/toast.json`, 'utf-8'
            ))['AcceptSnoozeDismiss'].join(''))

        const notification = new Notification({ toastXml });
        notification.show();
    });

    app.on('open-url', (evt, url) => {
        evt.preventDefault();
        handleProtocolUrl(url);
    });
}

// Function to handle the custom protocol URL
function handleProtocolUrl(url) {
    console.log(`Custom protocol triggered: ${url}`);
    const action = new URL(url).searchParams.get('action');
    switch (action) {
        case 'accept':
            console.log(`User clicked ${action}`);
            break;
        case 'snooze':
            console.log(`User clicked ${action}`);
            break;
        case 'dismiss':
            console.log(`User clicked ${action}`);
            break;
        case 'click':
            console.log('Notification itself was clicked');
            break;
        default:
            console.log('Unknown action');
            break;
    }
}

// Function to set up the tray for the "tray-only" mode
function setupTrayOnly() {
    console.log('Starting in tray-only mode...');
    const trayIconPath = path.join(import.meta.dirname, 'icon.png');
    tray = new Tray(trayIconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                if (!win) {
                    win = createWindow();
                } else {
                    win.show();
                }
            },
        },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            },
        },
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('myApp');
}

// Function to set up the tray with full functionality
function setupTray() {
    console.log('Setting up tray with full functionality...');
    const trayIconPath = path.join(import.meta.dirname, 'icon.png');
    tray = new Tray(trayIconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                if (!win) {
                    win = createWindow();
                } else {
                    win.show();
                }
            },
        },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            },
        },
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('myApp');
}

// Function to create the main application window
function createWindow() {
    const newWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    newWindow.loadFile('./index.html');

    // Handle the close event to destroy the window
    newWindow.on('close', (event) => {
        event.preventDefault();
        newWindow.destroy(); // Free up memory by destroying the window
        win = null; // Dereference the window object
    });

    return newWindow;
}
