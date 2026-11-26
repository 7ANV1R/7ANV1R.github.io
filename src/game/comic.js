// Comic-book rendering for destroy mode: an original masked hero, guns,
// starbursts, sound-effect lettering, puffy clouds and halftone. Everything is
// drawn with flat colour, a cel shade and a black ink outline.

export const INK = '#111';
export const ORANGE = '#f36c38';
export const YELLOW = '#ffd23f';
export const RED = '#d7263d';
export const CYAN = '#5bd8ff';
export const FONT = "Bangers, Impact, 'Arial Black', sans-serif";
const SUIT = '#f36c38';
const SUIT_DARK = '#c24a1f';
const NAVY = '#243a73';
const NAVY_DARK = '#16264f';
const SKIN = '#f1c27d';
const SCARF = '#2fb4ff';

export const GUN_SCALE = 1.4;
export const HERO_SCALE = 1.3;

const rand = (a, b) => a + Math.random() * (b - a);

export function loadComicFont() {
  if (!document.querySelector('link[data-dm-font]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Bangers&display=swap';
    l.dataset.dmFont = '';
    document.head.append(l);
  }
  // resolves once the face is usable on canvas (or quietly falls back to Impact)
  return new Promise((r) => {
    const tryLoad = () => document.fonts.load(`40px Bangers`).then(r, r);
    setTimeout(tryLoad, 50);
  });
}

function box(g, x, y, w, h, fill, lw = 1.4) {
  g.fillStyle = fill;
  g.beginPath();
  g.rect(x, y, w, h);
  g.fill();
  g.lineWidth = lw;
  g.strokeStyle = INK;
  g.stroke();
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// ---------- shapes ----------
export const starShape = (spikes) =>
  Array.from({ length: spikes * 2 }, (_, i) => (i % 2 ? rand(0.42, 0.6) : rand(0.85, 1.15)));

export function starPath(g, x, y, r, shape, rot = 0) {
  g.beginPath();
  const n = shape.length;
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const rr = r * shape[i];
    i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  g.closePath();
}

// Halftone dots fading out from a centre: comic scorch / shading.
export function halftone(g, x, y, R, color, maxDot = 2.8, step = 6) {
  g.fillStyle = color;
  g.beginPath();
  for (let gy = -R; gy <= R; gy += step) {
    const off = (Math.round(gy / step) & 1) * (step / 2);
    for (let gx = -R + off; gx <= R; gx += step) {
      const d = Math.hypot(gx, gy);
      if (d >= R) continue;
      const rr = maxDot * (1 - d / R) ** 0.7;
      if (rr < 0.35) continue;
      g.moveTo(x + gx + rr, y + gy);
      g.arc(x + gx, y + gy, rr, 0, Math.PI * 2);
    }
  }
  g.fill();
}

export function halftonePattern(ctx, bg, dot, size = 8, r = 1.6) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, size, size);
  g.fillStyle = dot;
  g.beginPath();
  g.arc(size / 2, size / 2, r, 0, Math.PI * 2);
  g.fill();
  return ctx.createPattern(c, 'repeat');
}

// ---------- effects ----------
// Layered starburst that pops in and shrinks away. k: remaining life 1→0.
export function drawBurst(g, p, k) {
  const e = 1 - k;
  const s = e < 0.3 ? 0.5 + (e / 0.3) * 0.6 : 1.1 - (e - 0.3) * 0.5;
  p.layers.forEach((c, i) => {
    starPath(g, p.x, p.y, p.r * s * (1 - i * 0.22), p.shape, p.rot + i * 0.2);
    g.fillStyle = c;
    g.fill();
    if (i === 0) {
      g.lineWidth = 4;
      g.strokeStyle = INK;
      g.lineJoin = 'miter';
      g.stroke();
    }
  });
}

// Sound-effect lettering: pops in with overshoot, slanted, outlined, with an
// offset colour shadow and an optional spiky balloon behind it.
export function drawSfx(g, p) {
  const age = p.max - p.life, k = p.life / p.max;
  const s = age < 0.08 ? 0.3 + (age / 0.08) * 0.95 : age < 0.15 ? 1.25 - ((age - 0.08) / 0.07) * 0.25 : 1;
  g.save();
  g.translate(p.x, p.y);
  g.rotate(p.rot);
  g.scale(s, s);
  g.transform(1, 0, -0.18, 1, 0, 0);
  g.globalAlpha = Math.min(1, k * 4);
  g.font = `${p.size}px ${FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineJoin = 'round';
  if (p.bubble) {
    const m = g.measureText(p.text).width;
    g.save();
    g.scale(1, 0.62);
    starPath(g, 0, 0, m * 0.72 + p.size * 0.5, p.shape, 0);
    g.fillStyle = p.bubble;
    g.fill();
    g.lineWidth = 5;
    g.strokeStyle = INK;
    g.stroke();
    g.restore();
  }
  const lw = Math.max(4, p.size * 0.2);
  g.lineWidth = lw;
  g.strokeStyle = INK;
  const d = Math.max(3, p.size * 0.08);
  g.strokeText(p.text, d, d);
  g.fillStyle = p.shadow;
  g.fillText(p.text, d, d);
  g.strokeText(p.text, 0, 0);
  const grad = g.createLinearGradient(0, -p.size / 2, 0, p.size / 2);
  grad.addColorStop(0, p.c1);
  grad.addColorStop(1, p.c2);
  g.fillStyle = grad;
  g.fillText(p.text, 0, 0);
  g.restore();
}

// Puffy cartoon cloud: outlined circles with a cel shade.
export function drawCloud(g, p, k) {
  let s = 0.55 + (1 - k) * 0.9;
  if (k < 0.3) s *= k / 0.3;
  if (s <= 0.02) return;
  g.fillStyle = INK;
  g.beginPath();
  for (const [dx, dy, r] of p.blobs) {
    g.moveTo(p.x + dx * s + r * s + 2.5, p.y + dy * s);
    g.arc(p.x + dx * s, p.y + dy * s, r * s + 2.5, 0, Math.PI * 2);
  }
  g.fill();
  g.fillStyle = p.shade;
  g.beginPath();
  for (const [dx, dy, r] of p.blobs) {
    g.moveTo(p.x + dx * s + r * s, p.y + dy * s);
    g.arc(p.x + dx * s, p.y + dy * s, r * s, 0, Math.PI * 2);
  }
  g.fill();
  g.fillStyle = p.color;
  g.beginPath();
  for (const [dx, dy, r] of p.blobs) {
    const cx = p.x + dx * s - r * s * 0.18, cy = p.y + dy * s - r * s * 0.18;
    g.moveTo(cx + r * s * 0.78, cy);
    g.arc(cx, cy, r * s * 0.78, 0, Math.PI * 2);
  }
  g.fill();
}

export const cloudBlobs = (r) =>
  Array.from({ length: 4 + ((Math.random() * 3) | 0) }, () => [rand(-r, r), rand(-r * 0.6, r * 0.6), r * rand(0.45, 0.8)]);

// Radial "focus lines" around a big hit.
export function drawFocusLines(g, p, k) {
  g.globalAlpha = Math.min(1, k * 1.5) * 0.9;
  g.fillStyle = INK;
  g.beginPath();
  for (const [a, w, len] of p.lines) {
    const r0 = p.r, r1 = p.r + len;
    const c = Math.cos(a), s = Math.sin(a), nx = -s * w, ny = c * w;
    g.moveTo(p.x + c * r0 - nx, p.y + s * r0 - ny);
    g.lineTo(p.x + c * r0 + nx, p.y + s * r0 + ny);
    g.lineTo(p.x + c * r1, p.y + s * r1);
  }
  g.fill();
  g.globalAlpha = 1;
}

export function drawFlame(g, x, y, len, w = 4) {
  for (const [c, f] of [[ORANGE, 1], [YELLOW, 0.55]]) {
    g.beginPath();
    g.moveTo(x - w * f, y);
    g.quadraticCurveTo(x - w * 1.3 * f, y + len * 0.55 * f, x, y + len * f);
    g.quadraticCurveTo(x + w * 1.3 * f, y + len * 0.55 * f, x + w * f, y);
    g.closePath();
    g.fillStyle = c;
    g.fill();
    if (f === 1) {
      g.lineWidth = 2;
      g.strokeStyle = INK;
      g.stroke();
    }
  }
}

export function drawSpeech(g, x, y, text, k, minY = -Infinity) {
  g.save();
  g.globalAlpha = Math.min(1, k * 5);
  g.font = `17px ${FONT}`;
  const w = g.measureText(text).width + 20, h = 28;
  const bx = Math.round(x - w * 0.3), by = Math.round(Math.max(minY, y - h - 16));
  roundRect(g, bx, by, w, h, 12);
  g.fillStyle = '#fff';
  g.fill();
  g.lineWidth = 2.5;
  g.strokeStyle = INK;
  g.stroke();
  // short tail from the bubble edge toward the speaker (above or below)
  const below = y > by + h / 2;
  const ey = below ? by + h - 1 : by + 1;
  const tx = Math.max(bx + 12, Math.min(bx + w - 20, x)), ty = ey + (below ? 12 : -12);
  g.beginPath();
  g.moveTo(tx - 3, ey);
  g.lineTo(tx - 6, ty);
  g.lineTo(tx + 7, ey);
  g.fillStyle = '#fff';
  g.fill();
  g.stroke();
  g.fillRect(tx - 2, below ? ey - 3 : ey, 8, 3);
  g.fillStyle = INK;
  g.textBaseline = 'middle';
  g.fillText(text, bx + 10, by + h / 2 + 1);
  g.restore();
}

export function drawCrosshair(g, x, y) {
  x = Math.round(x);
  y = Math.round(y);
  g.lineCap = 'round';
  for (const [c, w] of [[INK, 6], ['#fff', 3]]) {
    g.strokeStyle = c;
    g.lineWidth = w;
    g.beginPath();
    g.arc(x, y, 10, 0, Math.PI * 2);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      g.moveTo(x + dx * 6, y + dy * 6);
      g.lineTo(x + dx * 16, y + dy * 16);
    }
    g.stroke();
  }
  g.fillStyle = RED;
  g.beginPath();
  g.arc(x, y, 2.5, 0, Math.PI * 2);
  g.fill();
}

// ---------- guns: drawn along +x from the grip at (0,0) ----------
export function drawGun(g, w, spin = 0) {
  g.lineJoin = 'round';
  if (w.name === 'Pistol') {
    box(g, -2, -5, 20, 7, '#e9ecf5');
    box(g, 0, -5, 15, 2, '#fff');
    box(g, 0, 1, 6, 8, ORANGE);
    box(g, 17, -4, 3, 5, YELLOW);
    box(g, 8, -2, 4, 2, CYAN, 1);
  } else if (w.name === 'Minigun') {
    box(g, -8, -8, 14, 15, ORANGE);
    box(g, 6, -6, 26, 11, '#cfd3dc');
    g.fillStyle = INK;
    for (let k = 0; k < 4; k++) g.fillRect(7 + ((k * 6 + spin) % 24), -6, 1.6, 11);
    box(g, 30, -7, 4, 13, '#4a4e69');
    box(g, -4, 7, 6, 6, '#333');
    box(g, -5, -5, 4, 4, CYAN, 1);
  } else if (w.name === 'Shotgun') {
    box(g, -15, -3, 13, 7, '#8a4b2a');
    box(g, -2, -5, 34, 4, '#cfd3dc');
    box(g, -2, -1, 34, 3, '#9aa0ad');
    box(g, 8, 2, 12, 4, '#5a3420');
    box(g, -3, 2, 5, 7, '#8a4b2a');
  } else {
    box(g, -16, -7, 42, 12, '#3d8b6d');
    box(g, -4, -7, 4, 12, YELLOW);
    box(g, 26, -8, 5, 14, RED);
    box(g, 2, -11, 6, 4, INK);
    box(g, -2, 5, 5, 8, '#333');
    g.strokeStyle = 'rgba(255,255,255,.55)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(-13, -4.5);
    g.lineTo(23, -4.5);
    g.stroke();
  }
}

// ---------- the hero ----------
// Original masked hero (brand orange + navy), facing +x with feet at (0,0).
// p: player state (walk phase, ground/thrust, recoil, squash); aim: world angle;
// flip: aiming left. Swap this function for a sprite sheet later.
export function drawHero(g, p, aim, flip, weapon, t, spin) {
  g.save();
  g.translate(Math.round(p.x), Math.round(p.y));
  g.scale(HERO_SCALE, HERO_SCALE);
  const sq = p.squash || 0;
  g.scale(1 + sq * 0.14, 1 - sq * 0.18);
  if (flip) g.scale(-1, 1);
  let a = flip ? Math.PI - aim : aim;
  a = Math.atan2(Math.sin(a), Math.cos(a));
  g.lineCap = 'round';
  g.lineJoin = 'round';

  const run = p.ground && Math.abs(p.vx) > 20;
  const hipY = -28 + (p.ground && !run ? Math.sin(t * 3) * 0.8 : 0);

  const limb = (pts, w, color) => {
    for (const [c, lw] of [[INK, w + 3.5], [color, w]]) {
      g.strokeStyle = c;
      g.lineWidth = lw;
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
    }
  };
  const knee = (hx, hy, fx, fy, L = 15) => {
    const dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy) || 1;
    const h = Math.sqrt(Math.max(0, L * L - (d / 2) ** 2));
    let nx = -dy / d, ny = dx / d;
    if (nx < 0) (nx = -nx), (ny = -ny); // knees bend forward
    return [hx + dx / 2 + nx * h, hy + dy / 2 + ny * h];
  };
  const leg = (back) => {
    const ph = p.walk + (back ? Math.PI : 0);
    let fx, fy;
    if (run) (fx = Math.sin(ph) * 11), (fy = -Math.max(0, -Math.cos(ph)) * 7);
    else if (p.ground) (fx = back ? -5 : 5), (fy = 0);
    else if (p.thrust) (fx = back ? -6 : 1), (fy = back ? -1 : -4);
    else (fx = back ? -6 : 9), (fy = back ? -6 : -12);
    const [kx, ky] = knee(0, hipY, fx, fy - 2);
    limb([[0, hipY], [kx, ky], [fx, fy - 2]], 5.5, back ? NAVY_DARK : NAVY);
    box(g, fx - 3, fy - 5, 10, 5, back ? '#a8a8b8' : '#e9ecf5', 2); // boot
  };

  // jetpack + flame (behind)
  if (p.thrust) drawFlame(g, -11, hipY + 2, 13 + Math.random() * 9, 4);
  box(g, -16, hipY - 20, 8, 20, '#8d99ae', 2);
  box(g, -15, hipY - 1, 6, 3, '#4a4e69', 1.5);

  leg(true);

  // torso with cel shade, emblem and belt
  g.beginPath();
  g.moveTo(-8, hipY - 21);
  g.lineTo(8, hipY - 21);
  g.lineTo(6, hipY);
  g.lineTo(-6, hipY);
  g.closePath();
  g.fillStyle = SUIT;
  g.fill();
  g.beginPath();
  g.moveTo(-8, hipY - 21);
  g.lineTo(-2, hipY - 21);
  g.lineTo(-1, hipY);
  g.lineTo(-6, hipY);
  g.closePath();
  g.fillStyle = SUIT_DARK;
  g.fill();
  g.beginPath();
  g.moveTo(-8, hipY - 21);
  g.lineTo(8, hipY - 21);
  g.lineTo(6, hipY);
  g.lineTo(-6, hipY);
  g.closePath();
  g.lineWidth = 2.5;
  g.strokeStyle = INK;
  g.stroke();
  g.beginPath(); // emblem disc + lightning bolt
  g.arc(1.5, hipY - 11.5, 5.5, 0, Math.PI * 2);
  g.fillStyle = NAVY;
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = INK;
  g.stroke();
  g.beginPath();
  [[1, -18], [5, -18], [2.5, -13], [5.5, -13], [-0.5, -5], [1.5, -10.5], [-1.5, -10.5]].forEach(([x, y], i) =>
    i ? g.lineTo(x, hipY + y) : g.moveTo(x, hipY + y),
  );
  g.closePath();
  g.fillStyle = YELLOW;
  g.fill();
  g.lineWidth = 1;
  g.stroke();
  box(g, -6.5, hipY - 4, 13, 4, YELLOW, 1.5);
  box(g, -1.5, hipY - 4, 3, 4, NAVY, 1);

  leg(false);

  // head: skin, spiky hair, domino mask with flapping tails, white comic eye
  const hy = hipY - 31;
  box(g, -2, hipY - 24, 5, 4, SKIN, 1.5); // neck
  g.beginPath();
  g.arc(2, hy, 8.5, 0, Math.PI * 2);
  g.fillStyle = SKIN;
  g.fill();
  g.lineWidth = 2.5;
  g.strokeStyle = INK;
  g.stroke();
  g.beginPath();
  [[-7, 1], [-10, -5], [-6, -5], [-8, -11], [-2, -8], [0, -14], [4, -9], [10, -11], [9, -5], [11, -3], [4, -4], [-3, -3]].forEach(([x, y], i) =>
    i ? g.lineTo(x, hy + y) : g.moveTo(x, hy + y),
  );
  g.closePath();
  g.fillStyle = '#1b1b2f';
  g.fill();
  g.lineWidth = 2;
  g.stroke();
  const flap = Math.sin(t * 14) * 2;
  g.strokeStyle = INK;
  g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(-5, hy - 1);
  g.lineTo(-13, hy + flap);
  g.moveTo(-5, hy);
  g.lineTo(-12, hy + 4 + flap);
  g.stroke();
  g.fillStyle = INK;
  g.beginPath();
  g.moveTo(-6, hy - 3);
  g.lineTo(11, hy - 4);
  g.lineTo(10.5, hy + 1.5);
  g.lineTo(-6, hy + 1.5);
  g.closePath();
  g.fill();
  g.fillStyle = '#fff';
  g.beginPath();
  g.moveTo(4.5, hy - 2);
  g.lineTo(9.5, hy - 2.5);
  g.lineTo(8.5, hy);
  g.closePath();
  g.fill();
  g.beginPath(); // gritted mouth
  g.moveTo(7, hy + 5);
  g.lineTo(10, hy + 4.5);
  g.lineWidth = 1.3;
  g.stroke();

  // arms + gun, rotated toward the crosshair
  g.save();
  g.translate(0, hipY - 18);
  g.rotate(a);
  const kick = -p.recoil * 5;
  limb([[0, 0], [8 + kick, 5], [15 + kick, 3]], 4, SUIT_DARK);
  g.save();
  g.translate(12 + kick, 0);
  g.scale(GUN_SCALE, GUN_SCALE);
  drawGun(g, weapon, spin);
  g.restore();
  limb([[0, 0], [9 + kick, 6], [13 + kick, 2]], 4.5, SUIT);
  for (const [gx, gy] of [[13 + kick, 2]]) {
    g.beginPath();
    g.arc(gx, gy, 3.2, 0, Math.PI * 2);
    g.fillStyle = NAVY;
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = INK;
    g.stroke();
  }
  g.restore();
  g.restore();
}

// Scarf: a verlet chain in world space, drawn behind the hero.
export function drawScarf(g, pts) {
  for (const [c, w] of [[INK, 8], [SCARF, 5]]) {
    g.strokeStyle = c;
    g.lineWidth = w;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
    g.stroke();
  }
}
