import $ from 'jquery';
import axios from 'axios';

let env;

/* Initialisation */

const init = async () => {
  env = await fs.read('env.json')
  console.log('env', env)
}

/* Constants */

export { env, constant };

const constant = {
  $root: $(document.documentElement),
  $DOM: $(document),
  __protocol: globalThis.location.protocol,
  __host: globalThis.location.host,
  __base: globalThis.location.origin,
  __dirname: globalThis.location.href,
  oldDate: new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 1,
  icons: {
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
}

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

export const oldDate = new Date().getTime() //- 1000 * 60 * 60 * 24 * 30 * 1

/* Classes */

export class path {
  /**
   * @param {...String} segments
   * @returns {String}
   */
  static join(...segments) {
    return segments.map(segment => segment.replace(/\/+$/, ''))
      .join('/')
      .replace(/\/{2,}/g, '/');
  }

  /**
   * @param {...String} segments
   * @returns {String}
   */
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

  /**
   * @param {String} path
   * @returns {String}
   */
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

  /** @type {IDBDatabase|null} */
  static db = null;

  /** @returns {Promise<void>} */
  static async init() {
    return new Promise(async (resolve, reject) => {
      const request = indexedDB.open(fs.dbName, 1);

      request.onupgradeneeded = (evt) => {
        const db = evt.target.result;
        if (!db.objectStoreNames.contains(fs.storeName)) {
          db.createObjectStore(fs.storeName, { keyPath: 'name' });
        }
      };

      request.onsuccess = (evt) => {
        fs.db = evt.target.result;
        resolve();
      };

      request.onerror = (evt) => {
        reject('Failed to initialize IndexedDB:', evt.target.error);
      };
    });
  }

  /**
   * @param {IDBTransactionMode} mode
   * @returns {Promise<IDBObjectStore>}
   */
  static async transaction(mode) {
    if (!fs.db) await fs.init();
    return fs.db.transaction(fs.storeName, mode).objectStore(fs.storeName);
  }

  /**
   * @param {String} path
   * @param {String} content
   * @param {number} date
   * @returns {Promise<String>}
   */
  static async write(path, content = '', date = new Date().getTime()) {
    return new Promise(async (resolve, reject) => {
      const store = await fs.transaction('readwrite');
      const request = store.put({ name: path, date, content });

      request.onsuccess = () => resolve(`Item '${path}' at '${date}' written successfully.`);
      request.onerror = (evt) => reject(`Failed to write item: ${evt.target.error}`);
    });
  }


  /**
   * @typedef {Object} fsRead
   * @property {Number} date
   * @property {String} content
   * 
   * @param {String} path
   * @param {Boolean} refresh
   * @param {Boolean} lookup
   * @returns {Promise<fsRead|String|null>}
   */
  static async read(path, refresh = false, lookup = false) {
    return new Promise(async (resolve, reject) => {
      const store = await fs.transaction('readonly');
      const request = store.get(path);

      request.onsuccess = async (evt) => {
        const item = evt.target.result;
        let content;
        if (!lookup) {
          if (item && !refresh) {
            ({ content } = item)
          } else {
            content = await fs.fetch(path)
          }
          fs.write(path, content)
          resolve(content);
        }
        resolve(item)
      };

      request.onerror = (evt) => reject(`Failed to read item: ${evt.target.error}`);
    });
  }

  /**
   * @param {String} url
   * @returns {Promise<String>}
   */
  static async fetch(url) {
    return new Promise(async (resolve, reject) => {
      const __source = url.startsWith('/') ? __base : __dirname;
      await axios.get(__source + url)
        .then(response => resolve(response.data))
        .catch(error => reject('Error fetching the file:', error));
    })
  }

  /**
   * @param {String} path
   * @returns {Promise<String>}
   */
  static async delete(path = '') {
    return new Promise(async (resolve, reject) => {
      if (!path) {
        indexedDB.deleteDatabase(fs.dbName);
        resolve(`'${fs.dbName}' deleted successfully.`)
      }
      const store = await fs.transaction('readwrite');
      const request = store.delete(path);

      request.onsuccess = () => resolve(`Item '${path}' deleted successfully.`);
      request.onerror = (evt) => reject(`Failed to delete item: ${evt.target.error}`);
    });
  }

  /**
   * @param {String} path
   * @returns {Promise<String[]>}
   */
  static async list(path = '') {
    return new Promise(async (resolve, reject) => {
      const store = await fs.transaction('readonly');
      const request = store.getAllKeys();

      request.onsuccess = (evt) => {
        const allKeys = evt.target.result;
        const items = allKeys.filter(key => key.startsWith(path));
        resolve(items);
      };

      request.onerror = (evt) => reject(`Failed to list items: ${evt.target.error}`);
    });
  }

  /**
   * @param {String} path 
   * @returns {Promise<Boolean|Date>}
   */
  static async exist(path) {
    return new Promise(async (resolve, reject) => {
      await fs.read(path, false, true)
        .then(({ date }) => resolve(date))
        .catch(error => reject(`Failed to check item existence: ${error}`))
    });
  }

  /**
   * @param {String} path
   * @param {Boolean} del
   * @return {Promise<String[]>} 
   */
  static async isOld(path = '', del = true) {
    const allKeys = await fs.list(path)
    const oldKeys = [];

    allKeys.forEach(async (key) => {
      const date = await fs.exist(key)
      if (date < oldDate) {
        del ? fs.delete(key) : oldKeys.push(key);
      }
    })

    return oldKeys;
  }
}


/* Initialisation */
init()