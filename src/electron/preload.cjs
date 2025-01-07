const { contextBridge, ipcRenderer, webFrame } = require('electron');
const path = require('path');

const api = {
    decode: async (data) => {
        console.log('in preload', data);
        return await ipcRenderer.invoke('decode-file', data);
    },

    encode: async (data) => {
        console.log('in preload', data);
        return await ipcRenderer.invoke('encode-file', data);
    },

    mail: (data) => ipcRenderer.send('mail', data),
    storage: (verb, data) => ipcRenderer.invoke('storage', verb, data),
    database: (verb, data) => ipcRenderer.invoke('database', verb, data),

    webFrame: {
        setZoomLevel: (level) => webFrame.setZoomLevel(level),
        getZoomLevel: () => webFrame.getZoomLevel(),
        setZoomFactor: (factor) => webFrame.setZoomFactor(factor),
        getZoomFactor: () => webFrame.getZoomFactor(),
    },
};

contextBridge.exposeInMainWorld('api', api);
contextBridge.exposeInMainWorld('const', {
    __dirname: path.join(__dirname, '../..'),
});
contextBridge.exposeInMainWorld('require', (module) => require(module));

/*
contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
*/
