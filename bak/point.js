export class Point {
  constructor(x, y) {
    this.x = x || 0; // 변수에 기본 값을 설정하는 용도. 변수 x가 undefined, null, 빈 문자열(''), false, 혹은 0일 경우에 대비하여 this.x 값을 설정함!
    this.y = y || 0;
  }

  add(point) {
    this.x += point.x; // point 값 추가해서 재할당
    this.y += point.y;
    return this;
  }

  subtract(point) {
    this.x -= point.x;
    this.y -= point.y;
    return this;
  }

  reduce(value) {
    this.x *= value;
    this.y *= value;
    return this;
  }

  collide(point, width, height) { // 충돌?
    if (
      this.x >= point.x &&
      this.x <= point.x + width &&
      this.y >= point.y &&
      this.y <= point.y + height
    ) {
      return true;
    } else {
      return false; // 명시적으로 존재
    }
  }

  clone() {
    return new Point(this.x, this.y);
  }
}
