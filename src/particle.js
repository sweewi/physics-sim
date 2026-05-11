const GRAVITY     = 1200;  // px/s²
const RESTITUTION = 0.65;  // energy kept per bounce (1 = perfect, 0 = dead stop)
const FRICTION    = 0.985; // vx multiplier per frame (viscous drag)
const SETTLE_SPEED = 8;    // px/s — below this, particle is removed

export class Particle {
  constructor(x, y, vx, vy, radius, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.settled = false;
  }

  update(dt, canvasWidth, canvasHeight) {
    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Floor
    if (this.y + this.radius >= canvasHeight) {
      this.y = canvasHeight - this.radius;
      this.vy = -this.vy * RESTITUTION;
    }
    // Left wall
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.vx = -this.vx * RESTITUTION;
    }
    // Right wall
    if (this.x + this.radius >= canvasWidth) {
      this.x = canvasWidth - this.radius;
      this.vx = -this.vx * RESTITUTION;
    }

    this.vx *= FRICTION;

    if (Math.hypot(this.vx, this.vy) < SETTLE_SPEED) this.settled = true;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
