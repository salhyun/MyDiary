class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(v) {
    return new Vector2(this.x+v.x, this.y+v.y);
  }
  subtract(v) {
    return new Vector2(this.x-v.x, this.y-v.y);
  }
  multiply(scale) {
    return new Vector2(this.x*scale, this.y*scale);
  }
  magnitude() {
    return Math.sqrt(this.x*this.x+this.y*this.y);
  }
  dot(v) {
    return (this.x*v.x+this.y*v.y);
  }
  normalize() {
    let magnitude = this.magnitude();
    if(magnitude > 0) {
      return new Vector2(this.x/magnitude, this.y/magnitude);
    } else {
      return new Vector2(0, 0);
    }
  }
}
export default Vector2;