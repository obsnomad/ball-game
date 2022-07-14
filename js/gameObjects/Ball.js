import { convertColor, generateColorPart, randomId } from "../utils.js";
import { BALL_DIAMETER } from "../config.js";

class Ball {
  coords = [0, 0];
  dragData = { x: 0, y: 0, time: 0 };

  constructor(panel, x = 0, y = 0, velocity = [0, 0], color = null) {
    this.id = randomId("ball");

    this.htmlElement = document.createElement("div");
    this.htmlElement.className = "ball";
    this.htmlElement.id = this.id;
    this.color = color ?? Array.from({ length: 3 }, generateColorPart);
    this.htmlElement.style.setProperty("--start-color", convertColor(this.color));
    this.htmlElement.style.setProperty(
      "--end-color",
      convertColor(this.color, -142)
    );

    this.moveTo(panel.htmlElement);
    this.setDraggable();

    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.panel = panel;
  }

  get x() {
    return this.coords[0];
  }

  set x(value) {
    this.coords[0] = value;
    this.htmlElement.style.setProperty("--x", `${value}px`);
  }

  get y() {
    return this.coords[1];
  }

  set y(value) {
    this.coords[1] = value;
    this.htmlElement.style.setProperty("--y", `${value}px`);
  }

  get isMoving() {
    return Math.abs(this.velocity[0]) > 0 || Math.abs(this.velocity[1]) > 0;
  }

  moveTo(container) {
    container.append(this.htmlElement);
    this.setDraggable();
  }

  setDraggable() {
    this.htmlElement.draggable = true;
    this.htmlElement.parentObject = this;
    this.htmlElement.addEventListener("dragstart", this.dragStart.bind(this));
    this.htmlElement.addEventListener("dragend", this.dragEnd.bind(this));
  }

  dragStart(event) {
    const { clientX: x, clientY: y, timeStamp: time } = event;
    event.dataTransfer.setData("text/plain", this.id);
    event.dataTransfer.effectAllowed = "move";
    this.dragData = { x, y, time };
    this.velocity = [0, 0];
    this.coords = [];
    if (!this.dragElement) {
      this.dragElement = this.htmlElement.cloneNode(true);
      this.dragElement.style.position = "absolute";
      this.dragElement.style.top = "-10%";
    }
    this.htmlElement.style.setProperty("opacity", "0");
    document.body.append(this.dragElement);
    event.dataTransfer.setDragImage(this.dragElement, BALL_DIAMETER, BALL_DIAMETER);
  }

  dragEnd(event) {
    this.htmlElement.style.removeProperty("opacity");
    this.dragElement.remove();
    if (event.dataTransfer.dropEffect === "none") {
      this.coords = [
        parseFloat(this.htmlElement.style.getPropertyValue("--x")),
        parseFloat(this.htmlElement.style.getPropertyValue("--y")),
      ];
    }
  }

  destroy() {
    this.coords = [];
    this.htmlElement.remove();
    this.dragElement?.remove();
  }
}

export default Ball;
