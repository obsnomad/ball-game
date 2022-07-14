import Ball from "./Ball.js";
import { vector } from "../utils.js";
import { BALL_DIAMETER, VELOCITY_THRESHOLD } from "../config.js";

class Panel {
  bounds = { width: 0, height: 0 };
  balls = [];
  changed = false;

  constructor(container, storage, frictionFactor, ballsAmount = 0) {
    this.htmlElement = document.createElement("div");
    this.htmlElement.className = "panel";
    this.htmlElement.parentObject = this;

    this.frictionFactor = frictionFactor;
    this.initialBallsAmount = ballsAmount;

    this.storage = storage;
    this.storage.attachPanel(this);

    this.unobserve();
    container.append(this.htmlElement);
    this.observe();
    this.resize();

    this.storage.getPanelData(this).then((balls) => {
      if (balls) {
        this.generateBallsFromStorage(balls);
      } else {
        this.generateBalls();
      }
    });
  }

  get width() {
    return this.bounds.width - BALL_DIAMETER;
  }

  get height() {
    return this.bounds.height - BALL_DIAMETER;
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
    const { width, height, left, top } = this.htmlElement.getBoundingClientRect();
    if (this.bounds.width !== width || this.bounds.height !== height) {
      this.bounds = { width, height, left, top };
      this.checkIntersections();
    }
  }

  generateBallsFromStorage(balls) {
    this.balls = balls.map(({ x, y, u, v, color }) => new Ball(this, x, y, [u, v], color));
    this.checkIntersections();
  }

  generateBalls() {
    if (!this.initialBallsAmount) {
      return;
    }
    for (let i = 0; i < this.initialBallsAmount; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      this.balls.push(new Ball(this, x, y));
    }
    this.checkIntersections();
  }

  regenerateBalls() {
    this.balls.forEach((ball) => ball.destroy());
    this.balls = [];
    this.generateBalls();
  }

  checkIntersections() {
    const { width, height } = this;
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
        if (quadDistance <= BALL_DIAMETER ** 2) {
          const angle = Math.atan(overY / overX);
          const distance = BALL_DIAMETER - Math.sqrt(quadDistance);
          const shift = [distance * Math.cos(angle) / 2, distance * Math.sin(angle) / 2];

          ball.x -= shift[0];
          ball.y -= shift[1];
          otherBall.x += shift[0];
          otherBall.y += shift[1];

          const normalizedShift = [shift[0] / distance, shift[1] / distance];
          const dot = vector.dot(vector.add([hor, ver], shift), normalizedShift);
          const otherDot = vector.dot(vector.subtract(otherVelocity, shift), normalizedShift);
          const optimized = otherDot - dot;

          [hor, ver] = vector.add([hor, ver], vector.multiply(normalizedShift, optimized));
          otherBall.velocity = vector.subtract(otherVelocity, vector.multiply(normalizedShift, optimized));
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
        Math.abs(x) > VELOCITY_THRESHOLD ||
        Math.abs(y) > VELOCITY_THRESHOLD
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

    const ball = document.getElementById(event.dataTransfer.getData("text/plain"));
    if (!ball) {
      return;
    }
    const dropBall = ball.parentObject;
    const { x, y, time } = dropBall.dragData;
    const hor = ((newX - x) / (newTime - time)) * 5;
    const ver = ((newY - y) / (newTime - time)) * 5;

    const index = dropBall.panel.balls.findIndex((ball) => ball === dropBall);

    dropBall.panel.balls.splice(index, 1);
    dropBall.panel = this;
    this.balls.push(dropBall);
    dropBall.moveTo(this.htmlElement);

    dropBall.x = newX - this.bounds.left - BALL_DIAMETER / 2;
    dropBall.y = newY - this.bounds.top - BALL_DIAMETER / 2;
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
