class AbstractStorage {
  panels = [];

  attachPanel(panel) {
    this.panels.push(panel);
  }

  async getPanelData(panel) {
    const panelIndex = this.panels.indexOf(panel);

    if (panelIndex < 0) {
      throw new ReferenceError("Panel is not attached");
    }

    const balls = await this.get();

    if (!balls || balls.length === 0) {
      return null;
    }

    return balls.filter(({ panel }) => panel === panelIndex);
  }

  async update() {
    let data = [];

    this.panels.forEach((panel, index) => {
      data = [...data, ...panel.balls?.map(({ x, y, velocity: [u, v], color }) => ({
        panel: index,
        x,
        y,
        u,
        v,
        color,
      }))];
    });

    await this.set(data);
  }

  async set(data) {
    throw new ReferenceError("Concrete set method is undefined");
  }

  async get() {
    throw new ReferenceError("Concrete get method is undefined");
  }

  async setAuto(value) {
    throw new ReferenceError("Concrete setAuto method is undefined");
  }

  async getAuto() {
    throw new ReferenceError("Concrete getAuto method is undefined");
  }

  async clear() {
    throw new ReferenceError("Concrete clear method is undefined");
  }
}

export default AbstractStorage;
