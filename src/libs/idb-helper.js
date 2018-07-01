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
            // Create stores
            Object.values(stores).forEach((storeObj) => {
                const storeKey = storeObj.key;
                const store = upgradeDB.createObjectStore(storeKey);

                // Create indices
                Object.values(storeObj.indices).forEach((index) => {
                    if (index.name && index.field) {
                        store.createIndex(index.name, index.field);
                    }
                });
            });

            return upgradeDB;
        }) : Promise.resolve(null);
    }

    get(key, storeConfig = stores.GENERAL) {
        const storeKey = storeConfig.key;

        return this.dbPromise.then(db => {
            if (!db) return null;

            return db.transaction(storeKey)
                .objectStore(storeKey).get(key);
        });
    }

    set(key, val, storeConfig = stores.GENERAL) {
        const storeKey = storeConfig.key;

        return this.dbPromise.then(db => {
            if (!db) return null;

            const tx = db.transaction(storeKey, 'readwrite');
            tx.objectStore(storeKey).put(val, key);
            return tx.complete;
        });
    };

    delete(key, storeConfig = stores.GENERAL) {
        const storeKey = storeConfig.key;

        return this.dbPromise.then(db => {
            if (!db) return null;

            const tx = db.transaction(storeKey, 'readwrite');
            tx.objectStore(storeKey).delete(key);
            return tx.complete;
        });
    };

    clear(storeConfig = stores.GENERAL) {
        const storeKey = storeConfig.key;

        return this.dbPromise.then(db => {
            if (!db) return null;

            const tx = db.transaction(storeKey, 'readwrite');
            tx.objectStore(storeKey).clear();
            return tx.complete;
        });
    };

    keys(storeConfig = stores.GENERAL) {
        const storeKey = storeConfig.key;

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

    getStoreCursorByIndex(storeConfig = stores.GENERAL, index, forward) {
        const storeKey = storeConfig.key;

        return this.dbPromise.then(db => {
            if (!db) return null;

            const tx = db.transaction(storeKey, 'readwrite');
            const store = tx.objectStore(storeKey);

            // limit store to 30 items
            return store.index(index).openCursor(null, forward ? 'next': 'prev');
        });
    };
}
