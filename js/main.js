import { BALL_DIAMETER, BALLS_AMOUNT, FRICTION_FACTOR_LEFT, FRICTION_FACTOR_RIGHT, STORAGE } from "./config.js";
import LocalStorage from "./storage/LocalStorage.js";
import IndexedStorage from "./storage/IndexedStorage.js";
import Buttons from "./gameObjects/Buttons.js";
import Panel from "./gameObjects/Panel.js";

const getStorage = async () => {
  switch (STORAGE) {
    case 'local':
      return new LocalStorage();
    case 'idb':
      return new IndexedStorage();
    default:
      throw new Error('Wrong storage type');
  }
};

const buildStructure = async (containerId) => {
  const container = document.querySelector(containerId);

  if (!container) {
    throw "Container not found";
  }

  document.documentElement.style.setProperty("--ball-diameter", BALL_DIAMETER + "px");

  const storage = await getStorage();

  const buttons = new Buttons(container, storage);

  const leftPanel = new Panel(container, storage, FRICTION_FACTOR_LEFT, BALLS_AMOUNT);
  const rightPanel = new Panel(container, storage, FRICTION_FACTOR_RIGHT);

  buttons.attachPanels(leftPanel, rightPanel);
};

buildStructure("#root");
