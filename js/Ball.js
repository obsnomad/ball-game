import { convertColor, generateColorPart } from "./utils.js";

class Ball {
  static frictionFactor = 0.995;
  static velocityThreshold = 0.01;
  coords = [0, 0];
  velocity = [0, 0];
  dragData = { x: 0, y: 0, time: 0 };

  constructor(x = 0, y = 0, panel) {
    this.id = "ball" + Math.random().toString(16).slice(2);
    this.render();
    this.x = x;
    this.y = y;
    this.panel = panel;
  }

  static get radius() {
    return parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--radius")
    );
  }

  static get diameter() {
    return Ball.radius * 2;
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

  render() {
    this.htmlElement = document.createElement("div");
    this.htmlElement.className = "ball";
    this.htmlElement.id = this.id;
    const color = Array.from({ length: 3 }, generateColorPart);
    this.htmlElement.style.setProperty("--start-color", convertColor(color));
    this.htmlElement.style.setProperty(
      "--end-color",
      convertColor(color, -142)
    );
    this.htmlElement.draggable = true;
    this.htmlElement.parentObject = this;
  }

  appendTo(container) {
    container.append(this.htmlElement);
    this.observe();
    return this;
  }

  observe() {
    this.htmlElement.addEventListener("dragstart", this.dragStart.bind(this));
    this.htmlElement.addEventListener("dragend", this.dragEnd.bind(this));
  }

  dragStart(event) {
    const { clientX: x, clientY: y, timeStamp: time } = event;
    event.dataTransfer.setData("text/plain", this.id);
    event.dataTransfer.effectAllowed = "move";
    this.dragData = { x, y, time };
    if (!this.dragElement) {
      this.dragElement = this.htmlElement.cloneNode(true);
      this.dragElement.style.position = "absolute";
      this.dragElement.style.top = "-10%";
    }
    document.body.append(this.dragElement);
    event.dataTransfer.setDragImage(this.dragElement, Ball.diameter, Ball.diameter);
  }

  dragEnd(event) {
    event.dataTransfer.dropEffect = "move";
    this.dragElement.remove();
  }
}

export default Ball;
