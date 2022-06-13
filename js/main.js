import Panel from "./Panel.js";

const buildStructure = (containerId) => {
  const container = document.querySelector(containerId);

  if (!container) {
    throw "Container not found";
  }

  const sourcePanel = new Panel().appendTo(container);
  const targetPanel = new Panel().appendTo(container);

  sourcePanel.generateBalls(20);
};

buildStructure("#root");
