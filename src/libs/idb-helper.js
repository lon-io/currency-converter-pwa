import idb from 'idb';
import constants from '../config/constants';

const {
    name: dbName,
    storeKey,
} = constants.db;

// https://github.com/jakearchibald/idb
export default class IDBHelper {
    constructor() {
        this.store = null;
        this.dbPromise = this.openDB();
    }

    openDB() {
        return navigator.serviceWorker ? idb.open(dbName, 1, (upgradeDB) => {
            this.store = upgradeDB.createObjectStore(storeKey);
        }) : Promise.resolve(null);
    }

    get(key) {
        return this.dbPromise.then(db => {
            if (!db) return null;

            return db.transaction(storeKey)
                .objectStore(storeKey).get(key);
        });
    }

    set(key, val) {
        return this.dbPromise.then(db => {
            if (!db) return null;

            const tx = db.transaction(storeKey, 'readwrite');
            tx.objectStore(storeKey).put(val, key);
            return tx.complete;
        });
    };

    delete(key) {
        return this.dbPromise.then(db => {
            if (!db) return null;

            const tx = db.transaction(storeKey, 'readwrite');
            tx.objectStore(storeKey).delete(key);
            return tx.complete;
        });
    };

    clear() {
        return this.dbPromise.then(db => {
            if (!db) return null;

            const tx = db.transaction(storeKey, 'readwrite');
            tx.objectStore(storeKey).clear();
            return tx.complete;
        });
    };

    keys() {
        return this.dbPromise.then(db => {
            if (!db) return [];

            const tx = db.transaction(storeKey);
            const keys = [];
            const store = tx.objectStore(storeKey);

            // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
            // openKeyCursor isn't supported by Safari, so we fall back
            (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
                if (!cursor) return;
                keys.push(cursor.key);
                cursor.continue();
            });

            return tx.complete.then(() => keys);
        });
    }
}
