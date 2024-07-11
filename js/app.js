import { selectedColor, colorArray } from './color.js';
import Vector from './vector.js';

class Mouse {
  constructor(canvas) {
      const test = document.querySelector("#test");
      this.pos = new Vector(-1000, -1000);
      this.radius = 41;
      
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
  constructor(x, y, radius = 10) {
    this.pos = new Vector(x, y);
    this.oldPos = new Vector(x, y);
    this.friction = 0.95;
    this.gravity = new Vector(0, 0.6);
    this.mass = 10;
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
    ctx.fillStyle = this.color || selectedColor; // this.color가 있으면 그것을 사용하고, 없으면 selectedColor를 사용합니다.
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
      this.iterations = 70;
      this.create();
  }

  pin(index) {
      this.dots[index].pinned = true;
  }

  create() {
      for (let i = 0; i < this.segments; i++) {
          const colorIndex = i % this.colorSet.length;
          const dotColor = this.colorSet[colorIndex] || '#888';
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
  static dpr = devicePixelRatio > 1 ? 1 : 1;
  static interval = 1000 / 60;
  constructor() {
      this.canvas = document.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.mouse = new Mouse(this.canvas);
      this.resize();
      window.addEventListener("resize", this.resize.bind(this));
      this.createRopes();
  }

  createRopes() {
      this.ropes = [];
      const TOTAL = 20;
      const gap = 18;
      for (let i = 0; i < TOTAL; i++) {
          const x = gap * (i + 1);
          const y = 10;
          const segments = 20;
          const rope = new Rope(
              { x, y, gap, segments },
              colorArray.flat().filter(color => color !== null)
          );
          rope.pin(0);
          this.ropes.push(rope);
      }
  }

  resize() {
      App.width = outerWidth;
      App.height = outerHeight;
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.height = 550;
      this.canvas.width = this.canvas.height * 2;
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