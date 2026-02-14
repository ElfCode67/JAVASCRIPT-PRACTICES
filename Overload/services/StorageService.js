// services/StorageService.js
export class StorageService {
    #storage;
    #prefix;

    constructor(prefix = 'overload_') {
        this.#storage = localStorage;
        this.#prefix = prefix;
    }

    // Generic get with nullish coalescing
    get(key, defaultValue = null) {
        try {
            const item = this.#storage.getItem(this.#prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    }

    // Set with error handling
    set(key, value) {
        try {
            this.#storage.setItem(this.#prefix + key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }

    // Remove item
    remove(key) {
        this.#storage.removeItem(this.#prefix + key);
    }

    // Clear all app data
    clear() {
        Object.keys(this.#storage)
            .filter(key => key.startsWith(this.#prefix))
            .forEach(key => this.#storage.removeItem(key));
    }

    // Get all keys
    keys() {
        return Object.keys(this.#storage)
            .filter(key => key.startsWith(this.#prefix))
            .map(key => key.slice(this.#prefix.length));
    }
}