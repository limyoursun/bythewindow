import { Point } from "./point.js";

const FOLLOW_SPEED = 0.08;
const ROTATE_SPEED = 0.12;
const SPEED_REDUCE = 0.8;
const MAX_ANGLE = 30;
const FPS = 1000 / 60;
const WIDTH = 260;
const HEIGHT = 260;

export class Dialog {
  constructor() {
    this.pos = new Point();
    this.target = new Point();
    this.prevPos = new Point();
    this.downPos = new Point();
    this.speedPos = new Point();
    this.startPos = new Point();
    this.mousePos = new Point();
    this.centerPos = new Point();
    this.origin = new Point();
    this.rotation = 0;
    this.sideValue = 0;
    this.isDown = false;
  }

  resize(stageWidth, stageHeight) {
    this.pos.x = Math.random() * (stageWidth - WIDTH);
    this.pos.y = Math.random() * (stageHeight - HEIGHT);
    this.target = this.pos.clone(); // 장점 1. 현재 위치와 이전 위치를 따로 저장, 관리할 수 있다
    this.prevPos = this.pos.clone(); // 장점 2. 원본 객체를 유지할 수 있다
  }

  animate(ctx){
    const move = this.target.clone().subtract(this.pos).reduce(FOLLOW_SPEED);
    this.pos.add(move);

    this.centerPos = this.pos.clone().add(this.mousePos);

    ctx.beginPath(); // 새 도형을 그릴 수 있다!
    ctx.fillStyle = `#ff8`;
    ctx.fillRect(this.pos.x, this.pos.y, WIDTH, HEIGHT);
  }

  down(point){
    if(point.collide(this.pos, WIDTH, HEIGHT)) {
      this.isDown = true;
      this.startPos = this.pos.clone();
      this.downPos = point.clone();
      this.mousePos = point.clone().subtract(this.pos);

      return this;
    }else{
      return null;
    }
  }

  move(point) {
    if(this.isDown){ // point로 잡은 곳을 빼는 건가...
      this.target = this.startPos.clone().add(point).subtract(this.downPos);
    }
  }

  up() {
    this.isDown = false;
  }
}
