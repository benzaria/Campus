import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow;

app.on('ready', () => {
    // Create the main window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the main HTML file
    mainWindow.loadFile('index.html');

    // Example: Show a badge after 2 seconds
    setTimeout(() => {
        showBadge();
    }, 2000);

    // Example: Clear the badge after 5 seconds
    //setTimeout(() => {
    //    clearBadge();
    //}, 5000);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Function to show a badge (red dot) on the app icon (Windows)
function showBadge() {
    if (process.platform === 'win32') {
        mainWindow.setOverlayIcon(
            path.join(import.meta.dirname, 'icon.png'), // Path to the red dot image
            'You have new notifications' // Accessible description for the badge
        );
        console.log('Badge displayed');
    }
}

// Function to clear the badge from the app icon (Windows)
function clearBadge() {
    if (process.platform === 'win32') {
        mainWindow.setOverlayIcon(null, ''); // Clear the overlay icon
        console.log('Badge cleared');
    }
}


export const echo = (...args) => console.log(...args);

/*
import fs from 'fs'
return
echo(JSON.parse(fs.readFileSync(new URL('toast.json', import.meta.url), 'utf-8')).YesNo)
const ar = ["a", "b", "c"]
echo(ar.join(''))

const obj = {
    "dd": [
        {
            "title": "ddd",
            "msg": "dd"
        },
        {
            "title": "ggg",
            "msg": "gg"
        }
    ],
    "00|08|03|12": [
        {
            "title": "fff",
            "msg": "ff"
        },
        {
            "title": "hhh",
            "msg": "hh"
        }
    ]
}

//for (const key in obj) {
//    const spl = key.split('|').filter(el => el);
//    console.log(key, spl);
//
//}
*/