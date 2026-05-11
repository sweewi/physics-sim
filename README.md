# Particle Physics Simulation

Project 3 of the learning path. A real-time physics sandbox built with vanilla JavaScript and the Canvas 2D API. Click anywhere to explode a burst of particles that fall, bounce, slow down, and eventually disappear.

---

## What We Built

A full-screen canvas where clicking spawns 10 colored circles. Each one has a position and a velocity. Every frame, gravity accelerates them downward, their velocity moves their position, and collision detection bounces them off the floor and walls with energy loss. Friction gradually decays horizontal speed until the particle settles and is removed from the simulation.

No libraries, no build tools — plain HTML, CSS, and JavaScript with ES modules.

---

## Concepts Learned

### Delta Time (`dt`)
Physics equations need to know how much real time passed between frames, or fast and slow machines produce different behavior. The `requestAnimationFrame` callback provides a timestamp in milliseconds. We subtract the previous timestamp and divide by 1000 to get `dt` in seconds. Every physics calculation is multiplied by `dt`, so a particle moving at 200 px/s travels the same real-world distance per second regardless of frame rate.

### Velocity and Gravity
Each particle stores two pairs of numbers: position (`x`, `y`) and velocity (`vx`, `vy`). Every frame, velocity moves the position, and gravity accelerates the velocity. Position accumulates velocity; velocity accumulates forces. This is Newton's second law (`F = ma`) discretized into time steps — a technique called Euler integration (named after the mathematician Leonhard Euler, pronounced "Oiler").

### Coefficient of Restitution (Bounce Energy Loss)
When a particle hits a wall or floor, we flip its velocity and multiply by a value between 0 and 1 (we used 0.65). This is a real physics concept — it's the ratio of speed after a bounce to speed before. A basketball on hardwood is roughly 0.6–0.7. Setting it to 1 gives infinite bouncing; setting it to 0 makes particles thud dead on impact.

### Friction as Viscous Drag
We multiply horizontal velocity by 0.985 every frame. This produces exponential decay — the velocity halves over a fixed number of frames regardless of its current value. This models air resistance (viscous drag), not true kinetic friction. Real kinetic friction is a constant force that stops abruptly; viscous drag tapers smoothly to zero. The viscous model is one multiplication per frame and looks better at this scale.

### Dynamic List Management (Spawn and Despawn)
Particles are stored in a plain array. Adding one is a `push()`. Removing one while the loop is still running requires care: if you splice forward while iterating, removing index 3 shifts index 4 down and the loop skips it. We iterate backwards — starting from the last index and working toward 0 — so any removal only affects positions we've already visited.

---

## Key Decisions and Tradeoffs

**Why GRAVITY = 1200 instead of 9.8?**
Canvas coordinates are pixels, not meters. At 9.8 px/s², particles would fall imperceptibly slowly. 1200 px/s² produces the visual feel of Earth gravity at screen scale. The physics equations are identical — only the unit system changes.

**Why is friction viscous drag and not real kinetic friction?**
Real kinetic friction (`F = μmg`) produces a constant deceleration that snaps to exactly zero. Implementing that cleanly without jitter requires extra logic. Viscous drag (`vx *= constant`) is one multiplication per frame, numerically stable, and produces a smooth taper that feels natural.

**Why are constants in `particle.js` and not `main.js`?**
Constants live where they're used. `GRAVITY`, `RESTITUTION`, `FRICTION`, and `SETTLE_SPEED` are only read inside `particle.js`, so they live there. `SPAWN_COUNT` and related values are only read inside `spawnBurst()` in `main.js`, so they live there. The principle is the same in both cases: don't make a reader jump between files to understand one thing.

**Why is `spawnBurst()` not its own file?**
A thing earns its own file when it has a distinct, reusable identity — like the `Particle` class, which gets instantiated many times. `spawnBurst()` is one function, called in one place, that's 8 lines long. Moving it to its own file would add overhead with no payoff.

**Known quirk: particles can die mid-air**
At the apex of a high bounce, vertical velocity (`vy`) is momentarily zero. If horizontal velocity (`vx`) has decayed enough from friction, total speed drops below the settle threshold and the particle disappears in mid-air. The fix is to only check the settle condition when the particle is near the floor. Left as a future improvement.

---

## What to Build Next

**Project 4 — Weather Dashboard**

Introduces the internet. You'll use `fetch` (a built-in browser function for making network requests) to talk to a real weather API, parse the JSON (a text format for sending structured data) it returns, and display it in the DOM (the browser's live representation of the HTML page). First time your code talks to the outside world.

New concepts: `fetch`, JSON, async/await with real network calls, loading and error states, CSS Grid for layout, and reading API documentation — a skill used in every project from here on.

---

## Future Ideas for This Simulation

- **Particle-particle collisions** — add momentum conservation between particles, using radius as a proxy for mass
- **Mass based on size** — currently radius is visual only; larger circles don't behave heavier
- **Moving boundary imparts velocity** — when the window is resized fast, particles near the wall should react to the moving surface
- **Fix mid-air death** — only run the settle check when a particle is near the floor, not at the apex of a bounce
