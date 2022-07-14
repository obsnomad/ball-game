import { BALL_DIAMETER, BALLS_AMOUNT, FRICTION_FACTOR_LEFT, FRICTION_FACTOR_RIGHT } from "./config.js";
import LocalStorage from "./storage/LocalStorage.js";
import Buttons from "./gameObjects/Buttons.js";
import Panel from "./gameObjects/Panel.js";

const buildStructure = (containerId) => {
  const container = document.querySelector(containerId);

  if (!container) {
    throw "Container not found";
  }

  document.documentElement.style.setProperty("--ball-diameter", BALL_DIAMETER + "px");

  const storage = new LocalStorage();

  const buttons = new Buttons(container, storage);

  const leftPanel = new Panel(container, storage, FRICTION_FACTOR_LEFT, BALLS_AMOUNT);
  const rightPanel = new Panel(container, storage, FRICTION_FACTOR_RIGHT);

  buttons.attachPanels(leftPanel, rightPanel);
};

buildStructure("#root");
