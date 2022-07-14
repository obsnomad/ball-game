import AbstractStorage from "./AbstractStorage.js";

class IndexedStorage extends AbstractStorage {
  constructor() {
    super();

    return new Promise((resolve, reject) => {
      const request = indexedDB.open("game", 1);

      request.onerror = () => {
        reject(this);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("balls");
        db.createObjectStore("auto");
      };
    });
  }

  async setAuto(value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["auto"], "readwrite");
      transaction.onerror = reject;
      transaction.oncomplete = resolve;

      const store = transaction.objectStore("auto");
      store.put(value, 'value');
    });
  }

  async getAuto() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["auto"]);
      transaction.onerror = reject;

      const store = transaction.objectStore("auto");
      const request = store.get('value');

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }

  async set(data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["balls"], "readwrite");
      transaction.onerror = reject;
      transaction.oncomplete = resolve;

      const store = transaction.objectStore("balls");
      store.clear();
      data.forEach((item, index) => store.put(item, index));
    });
  }

  async get() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["balls"]);
      transaction.onerror = reject;
      
      const store = transaction.objectStore("balls");
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }

  async clear() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["balls"], "readwrite");
      transaction.onerror = reject;
      transaction.oncomplete = resolve;

      const store = transaction.objectStore("balls");
      store.clear();
    });
  }
}

export default IndexedStorage;
