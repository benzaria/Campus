import { ipcMain, Notification } from "electron/main";
import authorize from "../APIs/auth/authApi.js";
import mail from "../APIs/calls/mailer/mailer.js";
import strg from "../APIs/calls/storage/storage.js";
import db from "../APIs/calls/database/database.js";

export default async function ipcHandler() {
    const [ auth_strg, auth_db, auth_mail ] = await authorize();

    ipcMain.handle('decode-file', async (evt, { key, iv, fileName, filePath }) => {
        console.log('in main', key, iv, fileName, filePath);
        return await decode(key, iv, fileName, filePath)
    });

    ipcMain.handle('encode-file', async (evt, { key, iv, fileName, filePath }) => {
        console.log('in main', key, iv, fileName, filePath);
        return await encode(key, iv, fileName, filePath)
    });

    ipcMain.on('mail', (evt, { to, sub, html }) => mail(auth_mail, to, sub, html));

    ipcMain.handle('storage', async (evt, verb, { drv, mod, sbmod, _path }) => {
        return await strg[verb](auth_strg, drv, mod, sbmod, _path);
    });

    ipcMain.handle('database', async (evt, verb, { id, user, name, pass, stat, role }) => {
        return await db[verb](auth_db, id, user, name, pass, stat, role);
    });

    ipcMain.on('notif', (evt, {title, msg}) => notif(title, msg))
}

function notif(title, msg) {
  const notification = new Notification({ title, msg });
  notification.show();
}