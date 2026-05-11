// Physics constants — grouped here so all tuning happens in one place.
// These are the values that define how the simulation "feels."
const GRAVITY      = 1200;  // acceleration downward in px/s² (high because pixels aren't meters — real 9.8 m/s² would be invisible)
const RESTITUTION  = 0.65;  // fraction of velocity kept after each bounce (1 = perfectly elastic, 0 = dead stop)
const FRICTION     = 0.985; // horizontal velocity is multiplied by this every frame — models air resistance (viscous drag)
const SETTLE_SPEED = 8;     // px/s — once total speed drops below this, the particle is marked for removal

export class Particle {
  constructor(x, y, vx, vy, radius, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;         // horizontal velocity in px/s
    this.vy = vy;         // vertical velocity in px/s (positive = downward, because canvas y-axis points down)
    this.radius = radius;
    this.color = color;
    this.settled = false;
  }

  update(dt, canvasWidth, canvasHeight) {
    // Step 1: gravity accelerates the particle downward every frame.
    // This is F = ma rearranged: a = F/m = g (mass cancels, so all particles fall at the same rate).
    // Multiplying by dt makes it frame-rate independent — the same real-world physics regardless of fps.
    this.vy += GRAVITY * dt;

    // Step 2: velocity moves the particle's position.
    // This order matters: we apply gravity to velocity FIRST, then use the updated velocity to move.
    // Doing it the other way introduces a one-frame lag (less accurate integration).
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Step 3: collision detection and response.
    // We clamp the position to the boundary first, then flip and reduce the velocity.
    // Without the clamp, a particle that tunneled slightly past a wall would bounce back and forth
    // inside the wall forever, since it keeps re-triggering the collision check.

    // Floor
    if (this.y + this.radius >= canvasHeight) {
      this.y = canvasHeight - this.radius; // push back to the surface
      this.vy = -this.vy * RESTITUTION;    // flip direction, lose energy
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

    // Step 4: friction decays horizontal velocity each frame.
    // Multiplying by a value just below 1 produces exponential decay — the slower the particle gets,
    // the slower the decay rate. This is viscous drag (like air resistance), not true kinetic friction.
    this.vx *= FRICTION;

    // Step 5: once total speed (magnitude of the velocity vector) is negligible, mark as settled.
    // Math.hypot(vx, vy) is √(vx² + vy²) — the same as speed in physics.
    if (Math.hypot(this.vx, this.vy) < SETTLE_SPEED) this.settled = true;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
