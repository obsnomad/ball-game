import Panel from "./Panel.js";

const buildStructure = (containerId) => {
  const container = document.querySelector(containerId);

  if (!container) {
    throw "Container not found";
  }

  const sourcePanel = new Panel(0.95).appendTo(container);
  new Panel(0.999).appendTo(container);

  sourcePanel.generateBalls(20);
};

buildStructure("#root");
