import Ball from "./Ball.js";
import { vectorAdd, vectorDot, vectorMultiply, vectorSubtract } from "./utils.js";

class Panel {
  bounds;
  balls = [];

  constructor(frictionFactor) {
    this.render();
    this.frictionFactor = frictionFactor;
    this.changed = false;
  }

  get width() {
    return this.bounds.width - Ball.diameter;
  }

  get height() {
    return this.bounds.height - Ball.diameter;
  }

  render() {
    this.htmlElement = document.createElement("div");
    this.htmlElement.className = "panel";
    this.htmlElement.parentObject = this;
  }

  appendTo(container) {
    this.unobserve();
    container.append(this.htmlElement);
    this.observe();
    this.resize();
    return this;
  }

  observe() {
    this.observer = new ResizeObserver(this.resize.bind(this));
    this.observer.observe(this.htmlElement);
    this.htmlElement.addEventListener("dragover", this.dragOver.bind(this));
    this.htmlElement.addEventListener("drop", this.drop.bind(this));
  }

  unobserve() {
    this.observer && this.observer.disconnect();
  }

  resize() {
    this.bounds = this.htmlElement.getBoundingClientRect();
    this.checkIntersections();
  }

  generateBalls(count) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      this.balls.push(new Ball(x, y, this).appendTo(this.htmlElement));
    }
    this.checkIntersections();
  }

  checkIntersections() {
    const { width, height } = this;
    const { diameter } = Ball;
    const balls = [];
    let isMoving = false;

    while (this.balls.length > 0) {
      const ball = this.balls.pop();

      let { x, y, velocity } = ball;
      let [hor, ver] = velocity;

      if (x <= 0 && hor <= 0) {
        hor = -Math.min(hor, x);
        x = 0;
      } else if (x >= width && hor >= 0) {
        hor = -Math.max(hor, x - width);
        x = width;
      }

      if (y <= 0 && ver <= 0) {
        ver = -Math.min(ver, y);
        y = 0;
      } else if (y >= height && ver >= 0) {
        ver = -Math.max(ver, y - height);
        y = height;
      }

      this.balls.forEach((otherBall) => {
        const { x: otherX, y: otherY, velocity: otherVelocity } = otherBall;
        const overX = otherX - x;
        const overY = otherY - y;
        const quadDistance = overX ** 2 + overY ** 2;
        if (quadDistance <= diameter ** 2) {
          const angle = Math.atan(overY / overX);
          const distance = diameter - Math.sqrt(quadDistance);
          const shift = [distance * Math.cos(angle) / 2, distance * Math.sin(angle) / 2];

          ball.x -= shift[0];
          ball.y -= shift[1];
          otherBall.x += shift[0];
          otherBall.y += shift[1];

          const normalizedShift = [shift[0] / distance, shift[1] / distance];
          const dot = vectorDot(vectorAdd([hor, ver], shift), normalizedShift);
          const otherDot = vectorDot(vectorSubtract(otherVelocity, shift), normalizedShift);
          const optimized = otherDot - dot;

          [hor, ver] = vectorAdd([hor, ver], vectorMultiply(normalizedShift, optimized));
          otherBall.velocity = vectorSubtract(otherVelocity, vectorMultiply(normalizedShift, optimized));
        }
      });

      ball.velocity = [hor, ver];

      isMoving ||= ball.isMoving;

      balls.push(ball);
    }
    this.balls = balls;

    if (isMoving) {
      requestAnimationFrame(this.moveBalls.bind(this));
    }
  }

  moveBalls() {
    this.changed = false;
    this.balls.forEach((ball) => {
      const [x, y] = ball.velocity;
      if (
        Math.abs(x) > Ball.velocityThreshold ||
        Math.abs(y) > Ball.velocityThreshold
      ) {
        ball.x += x;
        ball.y += y;
        ball.velocity = [x * this.frictionFactor, y * this.frictionFactor];
        this.changed = true;
      } else {
        ball.velocity = [0, 0];
      }
    });
    if (this.changed) {
      this.checkIntersections();
    }
  }

  dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  drop(event) {
    event.preventDefault();
    const { clientX: newX, clientY: newY, timeStamp: newTime } = event;

    const ballId = event.dataTransfer.getData("text/plain");
    const dropBall = document.getElementById(ballId).parentObject;
    const { x, y, time } = dropBall.dragData;
    const hor = ((newX - x) / (newTime - time)) * 5;
    const ver = ((newY - y) / (newTime - time)) * 5;

    const index = dropBall.panel.balls.findIndex((ball) => ball === dropBall);

    dropBall.panel.balls.splice(index, 1);
    dropBall.panel = this;
    this.balls.push(dropBall);
    dropBall.appendTo(this.htmlElement);

    dropBall.x = newX - this.bounds.left - Ball.radius;
    dropBall.y = newY - this.bounds.top - Ball.radius;
    dropBall.velocity = [
      Math.sign(hor) * Math.abs(hor),
      Math.sign(ver) * Math.abs(ver),
    ];
    if (!this.changed) {
      requestAnimationFrame(this.moveBalls.bind(this));
    }
  }
}

export default Panel;
