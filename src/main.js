import { Particle } from './particle.js';

const SPAWN_COUNT     = 10;
const SPAWN_SPEED_MIN = 80;
const SPAWN_SPEED_MAX = 320;
const RADIUS_MIN      = 4;
const RADIUS_MAX      = 14;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

let particles = [];

function spawnBurst(x, y) {
  for (let i = 0; i < SPAWN_COUNT; i++) {
    const angle  = Math.random() * Math.PI * 2;
    const speed  = SPAWN_SPEED_MIN + Math.random() * (SPAWN_SPEED_MAX - SPAWN_SPEED_MIN);
    const radius = RADIUS_MIN + Math.random() * (RADIUS_MAX - RADIUS_MIN);
    const color  = `hsl(${Math.random() * 360}, 75%, 60%)`;
    particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, radius, color));
  }
}

canvas.addEventListener('click', (e) => spawnBurst(e.clientX, e.clientY));

let lastTime = null;

function loop(timestamp) {
  if (lastTime === null) {
    lastTime = timestamp;
    requestAnimationFrame(loop);
    return;
  }

  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) p.update(dt, canvas.width, canvas.height);

  // Iterate backwards so splicing doesn't shift unvisited indices
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].settled) particles.splice(i, 1);
  }

  for (const p of particles) p.draw(ctx);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
