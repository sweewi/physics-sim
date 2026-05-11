import { Particle } from './particle.js';

// Spawn configuration — how bursts are created on click.
// These live here because spawnBurst() lives here; the Particle class doesn't care how it was born.
const SPAWN_COUNT     = 10;
const SPAWN_SPEED_MIN = 80;   // px/s — slowest a newly spawned particle can move
const SPAWN_SPEED_MAX = 320;  // px/s — fastest
const RADIUS_MIN      = 4;    // px
const RADIUS_MAX      = 14;   // px

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Setting canvas.width/height (not style.width/height) resets the drawing surface to the correct pixel dimensions.
// Setting only the style would stretch a smaller surface, causing blurry or mis-scaled rendering.
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

let particles = [];

function spawnBurst(x, y) {
  for (let i = 0; i < SPAWN_COUNT; i++) {
    // Random angle over the full circle so particles explode in all directions.
    // Gravity immediately takes over, so upward-moving ones arc and fall — producing the fountain effect.
    const angle  = Math.random() * Math.PI * 2;
    const speed  = SPAWN_SPEED_MIN + Math.random() * (SPAWN_SPEED_MAX - SPAWN_SPEED_MIN);
    const radius = RADIUS_MIN + Math.random() * (RADIUS_MAX - RADIUS_MIN);
    // HSL color: randomise hue (0-360°), fix saturation and lightness so all colors stay vivid and readable.
    const color  = `hsl(${Math.random() * 360}, 75%, 60%)`;
    particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, radius, color));
  }
}

canvas.addEventListener('click', (e) => spawnBurst(e.clientX, e.clientY));

let lastTime = null;

function loop(timestamp) {
  // First frame: there's no previous timestamp to subtract from, so dt would be enormous.
  // Skipping physics on frame one prevents a spike that launches particles across the canvas.
  if (lastTime === null) {
    lastTime = timestamp;
    requestAnimationFrame(loop);
    return;
  }

  // dt = seconds elapsed since the last frame.
  // Capped at 50ms so that returning from a background tab (which can produce dt of several seconds)
  // doesn't cause particles to tunnel through walls in one giant physics step.
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) p.update(dt, canvas.width, canvas.height);

  // Remove settled particles by iterating backwards.
  // If you splice while iterating forwards, removing index 3 shifts index 4 down to 3 —
  // the loop then increments to 4 and skips what used to be index 4. Backwards avoids this.
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].settled) particles.splice(i, 1);
  }

  for (const p of particles) p.draw(ctx);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
