import { Menu, Notification, Tray } from 'electron';
import { createWindow, __appProtocol } from '../electron/main.js'
import path from 'path';
import fs from 'fs';


/** @type {Path} */ const __dirname = import.meta.dirname;
/** @type {Tray} */ let tray;


function replacePlaceholders(template, scope) {
    return Object.keys(scope).reduce(
        (result, key) => result.replaceAll(`\${${key}}`, scope[key]),
        template
    );
}

// handle the custom protocol URL
export function handleProtocolUrl(url) {
    console.log(`Custom protocol triggered: ${url}`);
    const link = new URL(url);
    const action = link.searchParams.get('action');
    const _for = link.searchParams.get('for');
    //console.log(link.searchParams.get('for'));
    switch (_for) {
        case 'book':
            console.log(`User clicked ${_for}`);
            break;

        default:
            break;
    }
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
    return [_for, action]
}

// show custom xml notification
export function showNotification(_for, type) {
    //console.log(replacePlaceholders(JSON.parse(fs.readFileSync(`${__dirname}/toast.json`, 'utf-8')).AcceptDismiss.join('\n'), { __appProtocol, __dirname }))

    const toastXml = replacePlaceholders(JSON.parse(fs.readFileSync(`${__dirname}/toast.json`, 'utf-8'))['AcceptSnoozeDismiss'].join('\n'), { __appProtocol, __dirname, _for })

    const notification = new Notification({ toastXml });
    notification.show();
}

// set up the tray with full functionality
export function setupTray(data, force = false) {
    console.log('Setting up tray');
    const trayIconPath = path.join(__dirname, 'icon.png');
    force ? tray.destroy() : null;
    tray = new Tray(trayIconPath);
    const contextMenu = !data ? Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                if (!global.win) {
                    global.win = createWindow();
                } else {
                    global.win.show();
                }
            },
        },
        {
            label: 'Quit',
            click: () => {
                global.app.quit();
            },
        },
    ]) : Menu.buildFromTemplate(data);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('myApp');
}
