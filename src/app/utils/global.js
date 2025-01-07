import $ from 'jquery';
import axios from 'axios';

/* Const */

export const $root = $(document.documentElement)
export const $DOM = $(document)
export const __protocol = globalThis.location.protocol
export const __host = globalThis.location.host
export const __base = globalThis.location.origin
export const __dirname = globalThis.location.href
// export const __dirname = window.const ? window.const.__dirname : null
// export const require = window.requires

export const icons = {
  folder: 'folder',
  file: 'file',
  pdf: 'file-pdf',
  txt: 'file-text',
  word: 'file-word',
  excel: 'file-excel',
  image: 'file-image',
  video: 'file-video',
  audio: 'file-audio',
  powerpoint: 'file-powerpoint',
}

/* Function */

export class path {
  static join(...segments) {
    return segments.map(segment => segment.replace(/\/+$/, ''))
      .join('/')
      .replace(/\/{2,}/g, '/');
  }

  static resolve(...segments) {
    const stack = [];

    segments
      .join('/')
      .split('/')
      .forEach(segment => {
        if (segment === '..') {
          stack.pop();
        } else if (segment !== '.' && segment !== '') {
          stack.push(segment);
        }
      });

    return '/' + stack.join('/');
  }

  static normalize(path) {
    return path
      .replace(/\\/g, '/')
      .replace(/\/{2,}/g, '/')
      .replace(/\/+$/, '');
  }
}

export class fs {
  static dbName = 'database';
  static storeName = 'files';
  static db = null;

  static async init() {
    return new Promise(async (resolve, reject) => {
      const request = indexedDB.open(fs.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(fs.storeName)) {
          db.createObjectStore(fs.storeName, { keyPath: 'name' });
        }
      };

      request.onsuccess = (event) => {
        fs.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        reject('Failed to initialize IndexedDB:', event.target.error);
      };
    });
  }

  static async transaction(mode) {
    if (!fs.db) await fs.init();
    return fs.db.transaction(fs.storeName, mode).objectStore(fs.storeName);
  }

  static async write(path, content) {
    return new Promise(async (resolve, reject) => {
      const store = await fs.transaction('readwrite');
      const request = store.put({ name: path, content });

      request.onsuccess = () => resolve(`Item '${path}' written successfully.`);
      request.onerror = (event) => reject(`Failed to write item: ${event.target.error}`);
    });
  }

  static async read(path) {
    return new Promise(async (resolve, reject) => {
      const store = await fs.transaction('readonly');
      const request = store.get(path);

      request.onsuccess = async (event) => {
        const item = event.target.result;
        if (item) {
          resolve(item.content);
        } else {
          resolve(await fs.fetch(path));
        }
      };

      request.onerror = (event) => reject(`Failed to read item: ${event.target.error}`);
    });
  }

  static async fetch(url) {
    return new Promise(async (resolve, reject) => {
      await axios.get(__dirname + url)
        .then(response => {
          fs.write(url, response.data)
          resolve(response.data)
        })
        .catch(error => reject('Error fetching the file:', error));
    })
  }

  static async delete(path = '') {
    return new Promise(async (resolve, reject) => {
      if (!path) {
        indexedDB.deleteDatabase(fs.dbName);
        resolve(`'${fs.dbName}' deleted successfully.`)
      }
      const store = await fs.transaction('readwrite');
      const request = store.delete(path);

      request.onsuccess = () => resolve(`Item '${path}' deleted successfully.`);
      request.onerror = (event) => reject(`Failed to delete item: ${event.target.error}`);
    });
  }

  static async list(path = '') {
    return new Promise(async (resolve, reject) => {
      const store = await fs.transaction('readonly');
      const request = store.getAllKeys();

      request.onsuccess = (event) => {
        const allKeys = event.target.result;
        const itemsInDirectory = allKeys.filter(key => key.startsWith(path));
        resolve(itemsInDirectory);
      };

      request.onerror = (event) => reject(`Failed to list items: ${event.target.error}`);
    });
  }

  static async exist(path) {
    return new Promise(async (resolve, reject) => {
      const store = await fs.transaction('readonly');
      const request = store.getKey(path);

      request.onsuccess = (event) => resolve(!!event.target.result);
      request.onerror = (event) => reject(`Failed to check item existence: ${event.target.error}`);
    });
  }
}

