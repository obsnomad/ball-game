import Ball from "./Ball.js";

class Panel {
  bounds;
  balls = [];

  constructor() {
    this.render();
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

      const old = { hor, ver };

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
        const overX = x - otherX;
        const overY = y - otherY;
        const angle = Math.abs(Math.atan(overY / overX));
        const realOverX = Math.abs(overX) - diameter * Math.cos(angle);
        const realOverY = Math.abs(overY) - diameter * Math.sin(angle);
        if (realOverX <= 0 && realOverY <= 0) {
          const deltaX = Math.sign(overX) * Math.abs(realOverX) * 0.05;
          const deltaY = Math.sign(overY) * Math.abs(realOverY) * 0.05;
          otherBall.velocity = [hor - deltaX, ver - deltaY];
          hor = otherVelocity[0] + deltaX;
          ver = otherVelocity[1] + deltaY;
        }
      });

      ball.velocity = [
        Math.sign(hor) * Math.abs(hor),
        Math.sign(ver) * Math.abs(ver),
      ];

      isMoving ||= ball.isMoving;

      balls.push(ball);
    }
    this.balls = balls;

    if (isMoving) {
      requestAnimationFrame(this.moveBalls.bind(this));
    }
  }

  moveBalls() {
    let changed = false;
    this.balls.forEach((ball) => {
      const [x, y] = ball.velocity;
      if (
        Math.abs(x) > Ball.velocityThreshold ||
        Math.abs(y) > Ball.velocityThreshold
      ) {
        ball.x += x;
        ball.y += y;
        ball.velocity = [x * Ball.frictionFactor, y * Ball.frictionFactor];
        changed = true;
      } else {
        ball.velocity = [0, 0];
      }
    });
    if (changed) {
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
    requestAnimationFrame(this.checkIntersections.bind(this));
  }
}

export default Panel;
