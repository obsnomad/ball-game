import Panel from "./Panel.js";
import { BALL_DIAMETER, BALLS_AMOUNT, FRICTION_FACTOR_LEFT, FRICTION_FACTOR_RIGHT } from "./config.js";

const buildStructure = (containerId) => {
  const container = document.querySelector(containerId);

  if (!container) {
    throw "Container not found";
  }

  document.documentElement.style.setProperty("--ball-diameter", BALL_DIAMETER + "px");

  new Panel(container, FRICTION_FACTOR_LEFT, BALLS_AMOUNT);
  new Panel(container, FRICTION_FACTOR_RIGHT);
};

buildStructure("#root");
