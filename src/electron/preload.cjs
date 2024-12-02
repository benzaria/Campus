const { contextBridge, ipcRenderer } = require('electron');

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
};

contextBridge.exposeInMainWorld('api', api);

/*
contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
*/
