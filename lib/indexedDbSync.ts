export interface OfflinePayload {
    id: string; // Unique ID for the offline action
    formId: string;
    payload: Record<string, unknown>;
    timestamp: number;
}

const DB_NAME = 'FormFlowOfflineDB';
const STORE_NAME = 'pendingSubmissions';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB extension error:", event);
            reject("Error opening DB");
        };

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const saveToQueue = async (formId: string, payload: Record<string, unknown>): Promise<void> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const data: OfflinePayload = {
            id: crypto.randomUUID(),
            formId,
            payload,
            timestamp: Date.now()
        };

        store.add(data);
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = (e) => reject(e);
        });
    } catch (error) {
        console.error("Failed to save to IndexedDB:", error);
    }
};

export const getQueue = async (): Promise<OfflinePayload[]> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e);
        });
    } catch (error) {
        console.error("Failed to get queue from IndexedDB:", error);
        return [];
    }
};

export const removeFromQueue = async (id: string): Promise<void> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.delete(id);

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = (e) => reject(e);
        });
    } catch (error) {
        console.error(`Failed to remove item ${id} from IndexedDB:`, error);
    }
};

export const clearQueue = async (): Promise<void> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.clear();

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = (e) => reject(e);
        });
    } catch (error) {
        console.error("Failed to clear queue from IndexedDB:", error);
    }
}
