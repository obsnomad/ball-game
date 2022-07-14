class Buttons {
  autosaveTimer = null;
  panels = [];

  constructor(container, storage) {
    this.storage = storage;

    const root = document.createElement("div");
    root.className = "buttons";
    root.innerHTML = `
      <button type="button" id="new">New game</button>
      <button type="button" id="save">Save game</button>
      <label><input type="checkbox" id="autosave" />Autosave</label>
      <button type="button" id="clear">Clear storage</button>
    `;

    container.append(root);

    root.querySelector('#new').addEventListener('click', this.newGame.bind(this));
    root.querySelector('#save').addEventListener('click', this.saveGame.bind(this));
    root.querySelector('#clear').addEventListener('click', this.clearStorage.bind(this));

    const autosave = root.querySelector('#autosave');
    autosave.addEventListener('change', this.autoSave.bind(this));
    this.storage.getAuto().then((checked) => {
      autosave.checked = checked;
      this.autoSave(checked);
    });
  }

  attachPanels(...panels) {
    this.panels = panels;
  }

  newGame() {
    this.clearStorage();
    this.panels.forEach((panel) => panel.regenerateBalls());
  }

  saveGame() {
    this.storage.update();
  }

  autoSave(event) {
    let value = event;
    if (typeof value !== 'boolean') {
      value = event.target.checked;
      this.storage.setAuto(value);
    }
    if (value) {
      this.autosaveTimer = setInterval(() => this.storage.update(), 1000);
    } else if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }

  clearStorage() {
    this.storage.clear();
  }
}

export default Buttons;
