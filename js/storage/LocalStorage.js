import AbstractStorage from "./AbstractStorage.js";

class LocalStorage extends AbstractStorage {
  async setAuto(value) {
    localStorage.auto = Number(value);
  }

  async getAuto() {
    return Boolean(Number(localStorage.auto));
  }

  async set(data) {
    localStorage.balls = JSON.stringify(data);
  }

  async get() {
    return JSON.parse(localStorage.balls ?? null);
  }

  async clear() {
    delete localStorage.balls;
  }
}

export default LocalStorage;
