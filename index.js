console.log(new Date().toLocaleTimeString());
import { Keyboard } from "./input.js";

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

class Scene {
  objects = [];
  add = (o) => this.objects.push(o);
  render() {
    context.clearRect(this.xMin, this.yMin, this.width, this.height);
    for (const o of this.objects) o.render();
  }
}

const scene = new Scene();

const d = 1;
const viewport = { width: 1, height: 1 };

function initCanvas() {
  context.resetTransform();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.scale(1, -1);
  context.lineWidth = 3;
  if (scene) {
    scene.xMax = canvas.width / 2;
    scene.xMin = -scene.xMax;
    scene.yMax = canvas.height / 2;
    scene.yMin = -scene.yMax;
    scene.width = scene.xMax - scene.yMin;
    scene.height = scene.yMax - scene.yMin;
  }
}

initCanvas();

function testCanvas() {
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(300, 300);
  context.stroke();
}

testCanvas();
class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  getVp(offset, scale = 1) {
    const ox = this.x * scale + offset.x;
    const oy = this.y * scale + offset.y;
    const oz = this.z * scale + offset.z;

    let x = 0;
    let y = 0;
    if (oz > d) {
      x = (((ox * d) / oz) * canvas.height) / viewport.width;
      y = (((oy * d) / oz) * canvas.width) / viewport.height;
    }

    return { x, y };
  }
  getOp(offset, scale = 0.25) {
    const ox = this.x * scale + offset.x;
    const oy = this.y * scale + offset.y;

    const x = (ox * canvas.height) / viewport.width;
    const y = (oy * canvas.width) / viewport.height;

    return { x, y };
  }
  clone = () => new Point(this.x, this.y, this.z);
  add = (v) => new Point(this.x + v.x, this.y + v.y, this.z + v.z);
}

const p1 = new Point(1, 1, -1);
const p2 = new Point(1, -1, -1);
const p3 = new Point(-1, -1, -1);
const p4 = new Point(-1, 1, -1);
const p5 = new Point(1, 1, 1);
const p6 = new Point(1, -1, 1);
const p7 = new Point(-1, -1, 1);
const p8 = new Point(-1, 1, 1);

class Facet {
  constructor(p1, p2, p3, p4) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.p4 = p4;
    this.points = [this.p1, this.p2, this.p3, this.p4];

    this.t1 = p1.clone();
    this.t2 = p2.clone();
    this.t3 = p3.clone();
    this.t4 = p4.clone();
    this.transforms = [this.t1, this.t2, this.t3, this.t4];
    this.normal = {};

    this.visible = true;
  }
  update(rotate, position) {
    for (let i = 0; i < 4; ++i)
      this.rotate(this.transforms[i], this.points[i], rotate);

    // this.visible = this.calculateVisible(position);
  }
  calculateVisible(position) {
    // calculate normal vector of facet
    const p1 = this.t1;
    const p2 = this.t2;
    const p3 = this.t3;

    const w = {
      x: p2.x - p1.x,
      y: p2.y - p1.y,
      z: p2.z - p1.z,
    };

    const v = {
      x: p3.x - p1.x,
      y: p3.y - p1.y,
      z: p3.z - p1.z,
    };

    const r = {
      x: v.y * w.z - v.z * w.y,
      //y: v.x * w.z - v.z * w.x,
      y: v.z * w.x - v.x * w.z,
      z: v.x * w.y - v.y * w.x,
    };

    const length = Math.sqrt(r.x ** 2 + r.y ** 2 + r.z ** 2);

    const normal = { x: r.x / length, y: r.y / length, z: r.z / length };

    this.normal = normal;

    const normalVector = this.normal;
    const cameraVector = this.t1.add(position);
    return (
      normalVector.x * cameraVector.x +
        normalVector.y * cameraVector.y +
        normalVector.z * cameraVector.z <=
      0
    );
  }
  rotate(t, p, r) {
    const cosX = Math.cos(r.x);
    const sinX = Math.sin(r.x);
    const cosY = Math.cos(r.y);
    const sinY = Math.sin(r.y);
    const cosZ = Math.cos(r.z);
    const sinZ = Math.sin(r.z);

    // 1st rotation: about x-axis
    const x1 = p.x;
    const y1 = cosX * p.y - sinX * p.z;
    const z1 = sinX * p.y + cosX * p.z;

    // 2nd rotation: about y-axis
    const x2 = cosY * x1 - sinY * z1;
    const y2 = y1;
    const z2 = sinY * x1 + cosY * z1;

    // 3rd rotation: about z-axis
    const x3 = cosZ * x2 - sinZ * y2;
    const y3 = sinZ * x2 + cosZ * y2;
    const z3 = z2;

    t.x = x3;
    t.y = y3;
    t.z = z3;
  }
  render(position, index) {
    if (this.visible) {
      const vp1 = this.t1.getOp(position);
      const vp2 = this.t2.getOp(position);
      const vp3 = this.t3.getOp(position);
      const vp4 = this.t4.getOp(position);

      // calculate wireframe x,y coords
      //   const vp1 = this.t1.getVp(position);
      //   const vp2 = this.t2.getVp(position);
      //   const vp3 = this.t3.getVp(position);
      //   const vp4 = this.t4.getVp(position);

      // draw wireframe of facet
      context.beginPath();
      context.moveTo(vp1.x, vp1.y);
      context.lineTo(vp2.x, vp2.y);
      context.lineTo(vp3.x, vp3.y);
      context.lineTo(vp4.x, vp4.y);
      context.closePath();
      context.stroke();

      //if (index % 6 === 0) {
      // draw dot in centre of face (halfway between c1 and c3)
      /*
    const x2 = Math.abs(this.c1.x - this.c3.x) / 2;
    const y2 = Math.abs(this.c1.y - this.c3.y) / 2;
    const z2 = Math.abs(this.c1.z - this.c3.z) / 2;

    const x = Math.min(this.c1.x, this.c3.x) + x2;
    const y = Math.min(this.c1.y, this.c3.y) + y2;
    const z = Math.min(this.c1.z, this.c3.z) + z2;

    const p = new Point(x, y, z);
    const vp = p.getVp(position);

    const nx = x + this.normal.x;
    const ny = y + this.normal.y;
    const nz = z + this.normal.z;

    const n = new Point(nx * 2, ny * 2, nz * 2);
    const vn = n.getVp(position);
    */

      // calculate end of normal point from vertex
      const normalPoint = new Point(
        this.t1.x + this.normal.x,
        this.t1.y + this.normal.y,
        this.t1.z + this.normal.z
      );
      const vnp = normalPoint.getVp(position);
      const vc1 = this.t1.getVp(position);
      /*
      // draw normal to facet
      context.beginPath();
      context.moveTo(vc1.x, vc1.y);
      context.lineTo(vnp.x, vnp.y);
      context.stroke();

      // draw visible indicator at end of normal
      context.beginPath();
      context.arc(vnp.x, vnp.y, 3, 0, 2 * Math.PI);
      if (this.visible) context.fill();
      else context.stroke();
*/
      //}
    }
  }
}

class Cube {
  constructor() {
    this.position = { x: 0, y: 0, z: 6 };
    this.rotate = { x: 0, y: 0, z: 0 };

    this.facets = [];
    this.facets.push(new Facet(p2, p1, p4, p3)); // front
    this.facets.push(new Facet(p7, p8, p5, p6)); // back
    this.facets.push(new Facet(p6, p2, p3, p7)); // bottom
    this.facets.push(new Facet(p1, p5, p8, p4)); // top
    this.facets.push(new Facet(p3, p4, p8, p7)); // left
    this.facets.push(new Facet(p6, p5, p1, p2)); // right
  }
  update() {
    for (const f of this.facets) f.update(this.rotate, this.position);
  }
  render() {
    let i = 0;
    for (const f of this.facets) f.render(this.position, i++);
  }
}

const cube = new Cube();
scene.add(cube);

const dp = 0.01;
const dr = 0.01;
function animate() {
  requestAnimationFrame(animate);
  // if (Keyboard.isPressed("KeyC")) scene.render();

  if (Keyboard.isDown("ArrowLeft")) cube.position.x -= dp;
  if (Keyboard.isDown("ArrowRight")) cube.position.x += dp;
  if (Keyboard.isDown("ArrowDown")) cube.position.y -= dp;
  if (Keyboard.isDown("ArrowUp")) cube.position.y += dp;
  if (Keyboard.isDown("End")) cube.position.z -= dp;
  if (Keyboard.isDown("Home")) cube.position.z += dp;

  if (Keyboard.isDown("Numpad2")) cube.rotate.x -= dr;
  if (Keyboard.isDown("Numpad8")) cube.rotate.x += dr;
  if (Keyboard.isDown("Numpad4")) cube.rotate.y -= dr;
  if (Keyboard.isDown("Numpad6")) cube.rotate.y += dr;
  if (Keyboard.isDown("Numpad7")) cube.rotate.z -= dr;
  if (Keyboard.isDown("Numpad9")) cube.rotate.z += dr;

  if (Keyboard.isPressed("Numpad5")) {
    cube.rotate.x = 0;
    cube.rotate.y = 0;
    cube.rotate.z = 0;
    cube.position.x = 0;
    cube.position.y = 0;
  }

  cube.update();
  scene.render();
}

animate();
