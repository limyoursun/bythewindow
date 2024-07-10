class Mouse {
  constructor(canvas) {
    const test = document.querySelector("#test");
    this.pos = new Vector(-1000, -1000);
    this.radius = 90; // 마우스의 범위를 설정
    
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const offsetX = (e.clientX - rect.left) * scaleX;
      const offsetY = (e.clientY - rect.top) * scaleY;

      this.pos.setXY(offsetX, offsetY);
    });

    canvas.addEventListener("mouseleave", () => {
      this.pos.setXY(-1000, -1000);
    });

    canvas.ontouchmove = (e) => this.pos.setXY(e.touches[0].clientX, e.touches[0].clientY);
    canvas.ontouchcancel = () => this.pos.setXY(-1000, -1000);
    canvas.ontouchend = () => this.pos.setXY(-1000, -1000);
  }
}

class Dot {
  constructor(x, y, radius = 20) {
    this.pos = new Vector(x, y);
    this.oldPos = new Vector(x, y);

    this.friction = 0.95;
    this.gravity = new Vector(0, 0.6);
    this.mass = 50;
    this.radius = radius;

    this.pinned = false;
    this.color = "#888";
    this.borderColor = "rgba(0,0,0,0.3)";
    this.borderWidth = 1;
  }

  update(mouse) {
    if (this.pinned) return;

    let vel = Vector.sub(this.pos, this.oldPos);

    this.oldPos.setXY(this.pos.x, this.pos.y);

    vel.mult(this.friction);
    vel.add(this.gravity);

    let { x: dx, y: dy } = Vector.sub(mouse.pos, this.pos);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const direction = new Vector(dx / dist, dy / dist);
    const force = Math.max((mouse.radius - dist) / mouse.radius, 0);

    if (force > 0.6) this.pos.setXY(mouse.pos.x, mouse.pos.y);
    else {
      this.pos.add(vel);
      this.pos.add(direction.mult(force));
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.borderWidth;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

class Stick {
  constructor(p1, p2) {
    this.startPoint = p1;
    this.endPoint = p2;

    this.length = this.startPoint.pos.dist(this.endPoint.pos);
    this.tension = 0.8;
  }

  update() {
    const dx = this.endPoint.pos.x - this.startPoint.pos.x;
    const dy = this.endPoint.pos.y - this.startPoint.pos.y;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const diff = (dist - this.length) / dist;

    const offsetX = diff * dx * this.tension;
    const offsetY = diff * dy * this.tension;

    const m = this.startPoint.mass + this.endPoint.mass;
    const m1 = this.endPoint.mass / m;
    const m2 = this.startPoint.mass / m;

    if (!this.startPoint.pinned) {
      this.startPoint.pos.x += offsetX * m1;
      this.startPoint.pos.y += offsetY * m1;
    }
    if (!this.endPoint.pinned) {
      this.endPoint.pos.x -= offsetX * m2;
      this.endPoint.pos.y -= offsetY * m2;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "#888";
    ctx.moveTo(this.startPoint.pos.x, this.startPoint.pos.y);
    ctx.lineTo(this.endPoint.pos.x, this.endPoint.pos.y);
    ctx.stroke();
    ctx.closePath();
  }
}

class Rope {
  constructor(config, colorSet) {
    this.x = config.x;
    this.y = config.y;
    this.segments = config.segments;
    this.gap = config.gap;
    this.colorSet = colorSet;

    this.dots = [];
    this.sticks = [];
    this.iterations = 10;

    this.create();
  }

  pin(index) {
    this.dots[index].pinned = true;
  }

  create() {
    for (let i = 0; i < this.segments; i++) {
      const colorIndex = i % this.colorSet.length;
      const dotColor = this.colorSet[colorIndex];

      const dot = new Dot(this.x, this.y + i * this.gap);
      dot.color = dotColor;
      this.dots.push(dot);
    }
    for (let i = 0; i < this.segments - 1; i++) {
      this.sticks.push(new Stick(this.dots[i], this.dots[i + 1]));
    }
  }

  update(mouse) {
    this.dots.forEach((dot) => {
      dot.update(mouse);
    });
    for (let i = 0; i < this.iterations; i++) {
      this.sticks.forEach((stick) => {
        stick.update();
      });
    }
  }

  draw(ctx) {
    this.sticks.forEach((stick) => {
      stick.draw(ctx);
    });
    this.dots.forEach((dot) => {
      dot.draw(ctx);
    });
  }
}

class App {
  static width = innerWidth;
  static height = innerHeight;
  // static dpr = devicePixelRatio > 1 ? 2 : 1;
  static interval = 1000 / 60;
  constructor() {
    this.canvas = document.querySelector("canvas");
    // this.canvas = document.createElement("canvas")
    // document.body.appendChild(this.canvas)
    this.ctx = this.canvas.getContext("2d");
    this.mouse = new Mouse(this.canvas);
    this.resize();
    window.addEventListener("resize", this.resize.bind(this));

    this.createRopes();
  }

  createRopes() {
    this.ropes = [];

    const TOTAL = 20;
    const gap = 37;

    const colorSets = [
      [
        "#ff8349",
        "#ff8349",
        "#ff8349",
        "#ff9969",
        "#ff9969",
        "#ff9969",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#ff8349",
        "#ff8349",
        "#ff8349",
        "#ff9969",
        "#ff9969",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#d8f0ff",
        "#d8f0ff",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#ff8349",
        "#ff8349",
        "#ff8349",
        "#ff9969",
        "#d8f0ff",
        "#ff9969",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#ff8349",
        "#ff8349",
        "#ff9969",
        "#ff9969",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#ff9969",
        "#ff9969",
        "#ff9969",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#ff9969",
        "#ff9969",
        "#d8f0ff",
        "#ff9969",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#ff9969",
        "#d8f0ff",
        "#ff9969",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#ff9969",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#e2e0d4",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#e2e0d4",
        "#1f2122",
        "#1f2122",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#86b4e1",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#86b4e1",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#e2e0d4",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#86b4e1",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#e2e0d4",
        "#e2e0d4",
        "#1f2122",
        "#1f2122",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#86b4e1",
        "#86b4e1",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#e2e0d4",
        "#1f2122",
        "#1f2122",
        "#e2e0d4",
        "#e2e0d4",
        "#e2e0d4",
        "#1f2122",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#86b4e1",
        "#86b4e1",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#e2e0d4",
        "#e2e0d4",
        "#e2e0d4",
        "#e2e0d4",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#86b4e1",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#e2e0d4",
        "#e2e0d4",
        "#e2e0d4",
        "#e2e0d4",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#86b4e1",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#1f2122",
        "#e2e0d4",
        "#e2e0d4",
        "#e2e0d4",
        "#e2e0d4",
        "#e2e0d4",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#86b4e1",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#1f2122",
        "#e2e0d4",
        "#e2e0d4",
        "#e2e0d4",
        "#e2e0d4",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#86b4e1",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#1f2122",
        "#e2e0d4",
        "#e2e0d4",
        "#e2e0d4",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
      [
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#d8f0ff",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
        "#4579ac",
      ],
    ];
    for (let i = 0; i < TOTAL; i++) {
      const x = gap * (i + 0.7);
      const y = 20;
      const segments = 20;

      // 각 수직선에 다른 색상 세트를 전달
      const rope = new Rope(
        { x, y, gap, segments },
        colorSets[i % colorSets.length]
      );
      rope.pin(0);

      this.ropes.push(rope);
    }
  }

  resize() {
    App.width = innerWidth;
    App.height = innerHeight;

    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    // this.canvas.width = App.width * App.dpr;
    // this.canvas.height = App.height * App.dpr;
    // this.ctx.scale(App.dpr, App.dpr);

    this.createRopes();
  }

  render() {
    let now, delta;
    let then = Date.now();

    const frame = () => {
      requestAnimationFrame(frame);
      now = Date.now();
      delta = now - then;
      if (delta < App.interval) return;
      then = now - (delta % App.interval);
      this.ctx.clearRect(0, 0, App.width, App.height);

      // draw here
      this.ropes.forEach((rope) => {
        rope.update(this.mouse);
        rope.draw(this.ctx);
      });
    };
    requestAnimationFrame(frame);
  }
}

window.addEventListener("load", () => {
  const app = new App();
  app.render();
});

export default class Vector {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
  static add(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  }
  static sub(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }
  add(x, y) {
    if (arguments.length === 1) {
      this.x += x.x;
      this.y += x.y;
    } else if (arguments.length === 2) {
      this.x += x;
      this.y += y;
    }
    return this;
  }
  sub(x, y) {
    if (arguments.length === 1) {
      this.x -= x.x;
      this.y -= x.y;
    } else if (arguments.length === 2) {
      this.x -= x;
      this.y -= y;
    }
    return this;
  }
  mult(v) {
    if (typeof v === "number") {
      this.x *= v;
      this.y *= v;
    } else {
      this.x *= v.x;
      this.y *= v.y;
    }
    return this;
  }
  setXY(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  dist(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
