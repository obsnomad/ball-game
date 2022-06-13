import Ball from "./Ball.js";

class Panel {
  bounds;
  balls = [];

  constructor() {
    this.render();
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

  get width() {
    return this.bounds.width - Ball.diameter;
  }

  get height() {
    return this.bounds.height - Ball.diameter;
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
        hor = -hor - Math.min(0, x);
        x = 0;
      } else if (x >= width && hor >= 0) {
        hor = -hor - Math.max(0, x - width);
        x = width;
      }

      if (y <= 0 && ver <= 0) {
        ver = -ver - Math.min(0, y);
        y = 0;
      } else if (y >= height && ver >= 0) {
        ver = -ver - Math.max(0, y - height);
        y = height;
      }

      this.balls.forEach((otherBall) => {
        const { x: otherX, y: otherY, velocity: otherVelocity } = otherBall;
        const overX = x - otherX;
        const overY = y - otherY;
        const distance = Math.sqrt(overX ** 2 + overY ** 2);
        if (distance <= diameter) {
          otherBall.velocity = [hor - overX * 0.05, ver - overY * 0.05];
          hor = otherVelocity[0] + overX * 0.05;
          ver = otherVelocity[1] + overY * 0.05;
        }
      });

      ball.velocity = [
        Math.sign(hor) * Math.min(Math.abs(hor), Ball.velocityMax),
        Math.sign(ver) * Math.min(Math.abs(ver), Ball.velocityMax),
      ];

      isMoving ||= ball.isMoving;

      balls.push(ball);
    }
    this.balls = balls;

    requestAnimationFrame(this.moveBalls.bind(this));

    if (isMoving) {
      requestAnimationFrame(this.checkIntersections.bind(this));
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
      Math.sign(hor) * Math.min(Math.abs(hor), Ball.velocityMax),
      Math.sign(ver) * Math.min(Math.abs(ver), Ball.velocityMax),
    ];
    requestAnimationFrame(this.checkIntersections.bind(this));
  }
}

export default Panel;
