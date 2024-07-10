import { Point } from "./point.js";
import { Dialog } from "./dialog.js";

class App {
  constructor() { // 다른 모든 메서드 호출보다 앞선 시점인, 인스턴스 객체를 초기화할 때 수행할 초기화 코드를 정의할 수 있음
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d"); // 캔버스의 컨텍스트를 정의, 여기에서는 2d!!

    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1; // 현재 디스플레이 장치에 대한 '물리적 픽셀' 해상도와 'CSS 픽셀' 해상도의 비율을 반환

    this.mousePos = new Point();
    this.curItem = null;

    this.items = [];
    this.total = 1;
    for(let i = 0; i < this.total; i++){
      this.items[i] = new Dialog();
    }

    window.addEventListener("resize", this.resize.bind(this), false); // .bind(this)는 resize 메서드가 항상 현재 객체를 참조하도록 하는 것!

    window.requestAnimationFrame(this.animate.bind(this)); // 브라우저에게 수행하기를 원하는 애니메이션을 알리고 다음 리페인트 바로 전에 브라우저가 애니메이션을 업데이트할 지정된 함수를 호출하도록 요청한다고 함
    
    // 메서드의 this 컨텍스트를 명시적으로 설정하므로, 이벤트 핸들러 내부에서 this는 항상 원하는 객체를 참조하게 된다.
    document.addEventListener('pointerdown', this.onDown.bind(this), false);
    document.addEventListener('pointermove', this.onMove.bind(this), false);
    document.addEventListener('pointerup', this.onUp.bind(this), false);
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 3;
    this.ctx.shadowBlur = 6;
    this.ctx.shadowColor = `rgba(0, 0, 0, 0.1)`;

    this.ctx.lineWidth = 2;

    for(let i = 0; i < this.items.length; i++){
      this.items[i].resize(this.stageWidth, this.stageHeight);
    }
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight); // 투명하게! (x좌표, y좌표, 너비, 높이)

    for(let i = 0; i < this.items.length; i++){
      this.items[i].animate(this.ctx);
    }

    if(this.curItem){
      this.ctx.fillStyle = `#f00`;
      this.ctx.strokeStyle = `#f00`;

      this.ctx.beginPath();
      this.ctx.arc(this.mousePos.x, this.mousePos.y, 8, 0, Math.PI * 2)
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(this.curItem.centerPos.x, this.curItem.centerPos.y, 8, 0, Math.PI * 2)
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.moveTo(this.mousePos.x, this.mousePos.y);
      this.ctx.lineTo(this.curItem.centerPos.x, this.curItem.centerPos.y);
      this.ctx.stroke();
    }
  }

  onDown(e) {
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;

    // 마우스 위치를 기준으로 배열의 요소들을 검사하고,
    // 조건을 만족하는 첫 번째 객체를 찾아서 curItem으로 설정하고,
    // 배열에서 제거하고 다시 추가하는 작업을 수행
    for(let i = this.items.length -1; i >= 0; i--){
      const item = this.items[i].down(this.mousePos.clone());
      if(item){
        this.curItem = item;
        const index = this.items.indexOf(item);
        this.items.push(this.item.splice(index, 1)[0])
        break;
      }
    }
  }

  onMove(e) {
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;

    for(let i = 0; i < this.items.length; i++){
      this.items[i].move(this.mousePos.clone());
    }
  }

  onUp(e) {
    this.curItem = null;

    for(let i = 0; i < this.items.length; i++){
      this.items[i].up();
    }
  }
}

window.onload = () => {
  new App();
};
