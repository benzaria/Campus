import { app, Notification } from 'electron';
import fs from 'fs';
import path from 'path';

const appProtocol = 'myapp';

// Ensure only a single instance of the app is running
const gotLock = app.requestSingleInstanceLock();
//app.setAppUserModelId('com.benzaria.campus');

if (!gotLock) {
    app.quit();
} else {
    // Register custom protocol
    if (app.isPackaged) {
        app.setAsDefaultProtocolClient(appProtocol);
    } else {
        app.setAsDefaultProtocolClient(appProtocol, process.execPath, [
            path.resolve(process.argv[1]),
        ]);
    }

    // Event when a second instance is attempted
    app.on('second-instance', (evt, argv) => {
        // Parse the custom protocol URL from the arguments
        const url = argv.find(arg => arg.startsWith(`${appProtocol}://`));
        url ? handleProtocolUrl(url) : null;
    });

    app.on('ready', () => {
        console.log('App is ready');

        // Handle the protocol URL if app is opened with it
        const url = process.argv.find(arg => arg.startsWith(`${appProtocol}://`));
        url ? handleProtocolUrl(url) : null;

        // Show the notification
        const toastXml = fs.readFileSync(new URL('toast.xml', import.meta.url), 'utf-8')
            .replaceAll('${appProtocol}', appProtocol);

        const notification = new Notification({
            toastXml,
        });

        notification.show();
    });

    // Prevent the app from quitting when using the protocol
    app.on('open-url', (evt, url) => {
        evt.preventDefault();
        handleProtocolUrl(url);
    });
}

// Function to handle the custom protocol URL
function handleProtocolUrl(url) {
    console.log(`Custom protocol triggered: ${url}`);

    // Extract the action from the URL
    const action = new URL(url).searchParams.get('action');
    switch (action) {
        case 'yes':
            console.log('User clicked Yes');
            break;
        case 'no':
            console.log('User clicked No');
            break;
        case 'click':
            console.log('Notification itself was clicked');
            break;
        default:
            console.log('Unknown action');
            break;
    }
}
