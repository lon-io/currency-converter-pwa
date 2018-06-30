import idb from 'idb';
import constants from '../config/constants';

const {
    name: dbName,
    stores,
    version,
} = constants.db;

// https://github.com/jakearchibald/idb
export default class IDBHelper {
    constructor() {
        this.dbPromise = this.openDB();
    }

    openDB() {
        return navigator.serviceWorker ? idb.open(dbName, version, (upgradeDB) => {
            Object.values(stores).forEach((storeKey) => {
                const store = upgradeDB.createObjectStore(storeKey);

                switch (storeKey) {
                    case stores.CONVERSION_FACTORS:
                        store.createIndex('by-created-date', 'timestamp');
                        break;
                    default:
                        break;
                }
            });

            return upgradeDB;
        }) : Promise.resolve(null);
    }

    get(key, storeKey = stores.GENERAL) {
        console.log('GET =>', storeKey);
        return this.dbPromise.then(db => {
            if (!db) return null;

            return db.transaction(storeKey)
                .objectStore(storeKey).get(key);
        });
    }

    set(key, val, storeKey = stores.GENERAL) {
        console.log('SET =>', storeKey);
        return this.dbPromise.then(db => {
            if (!db) return null;

            const tx = db.transaction(storeKey, 'readwrite');
            tx.objectStore(storeKey).put(val, key);
            return tx.complete;
        });
    };

    delete(key, storeKey = stores.GENERAL) {
        console.log('DEL =>', storeKey);
        return this.dbPromise.then(db => {
            if (!db) return null;

            const tx = db.transaction(storeKey, 'readwrite');
            tx.objectStore(storeKey).delete(key);
            return tx.complete;
        });
    };

    clear(storeKey = stores.GENERAL) {
        console.log('CLEAR =>', storeKey);
        return this.dbPromise.then(db => {
            if (!db) return null;

            const tx = db.transaction(storeKey, 'readwrite');
            tx.objectStore(storeKey).clear();
            return tx.complete;
        });
    };

    keys(storeKey = stores.GENERAL) {
        console.log('KEYS =>', storeKey);
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

    getStoreCursorByIndex(storeKey = stores.GENERAL, index, forward) {
        return this.dbPromise.then(db => {
            if (!db) return [];

            const tx = db.transaction(storeKey);
            const store = tx.objectStore(storeKey);

            // limit store to 30 items
            store.index(index).openCursor(null, forward ? 'next': 'prev').then(function deleteRest(cursor) {
                if (!cursor) return;
                cursor.delete();
                return cursor.continue().then(deleteRest);
            });
        });
    };
}
