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

export function drawSpeech(g, x, y, text, k, minY = -Infinity, maxX = Infinity) {
  g.save();
  g.globalAlpha = Math.min(1, k * 5);
  g.font = `17px ${FONT}`;
  const w = g.measureText(text).width + 20, h = 28;
  const bx = Math.round(Math.max(8, Math.min(maxX - w - 8, x - w * 0.3))), by = Math.round(Math.max(minY, y - h - 16));
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
// s: live gun state — spin (minigun barrels), heat 0..1, charge 0..1,
// loaded (rocket in the tube), t (clock, for blinking lights).
export function drawGun(g, w, s = {}) {
  g.lineJoin = 'round';
  const t = s.t || 0;
  if (w.id === 'blaster') {
    // retro ray pistol: finned body, ringed barrel, glowing energy cell
    g.beginPath();
    g.moveTo(-1, 0);
    g.lineTo(5, 0);
    g.lineTo(3, 10);
    g.lineTo(-4, 9);
    g.closePath();
    g.fillStyle = ORANGE;
    g.fill();
    g.lineWidth = 1.4;
    g.strokeStyle = INK;
    g.stroke();
    g.beginPath(); // fin
    g.moveTo(-3, -6);
    g.lineTo(2, -11);
    g.lineTo(9, -6);
    g.closePath();
    g.fillStyle = RED;
    g.fill();
    g.stroke();
    roundRect(g, -5, -7, 19, 8, 3.5);
    g.fillStyle = '#e9ecf5';
    g.fill();
    g.stroke();
    box(g, 13, -5.5, 9, 5, '#cfd3dc');
    box(g, 15, -6.8, 2, 7.6, YELLOW, 1);
    box(g, 19, -6.8, 2, 7.6, YELLOW, 1);
    box(g, 22, -4.5, 2.5, 3, RED, 1);
    const c = s.charge || 0;
    box(g, 1, -5, 9, 3.6, c ? `rgb(${91 + 164 * c},${216 + 39 * c},255)` : CYAN, 1);
    g.strokeStyle = INK; // trigger
    g.lineWidth = 1.3;
    g.beginPath();
    g.arc(6, 2.5, 2.6, 0, Math.PI);
    g.stroke();
  } else if (w.id === 'minigun') {
    // ammo belt sagging under the gun
    g.save();
    for (let i = 0; i < 7; i++) {
      const bx = -6 + i * 3.2, by = 8 + Math.sin(i / 2.2) * 6 + Math.sin(t * 25 + i) * (s.spinUp || 0) * 0.8;
      box(g, bx, by, 2.6, 5, '#e0b04a', 1);
    }
    g.restore();
    box(g, -11, -9, 15, 17, ORANGE); // motor housing
    g.strokeStyle = INK;
    g.lineWidth = 1.2;
    g.beginPath();
    for (let i = 0; i < 3; i++) g.moveTo(-8 + i * 3.5, -5), g.lineTo(-8 + i * 3.5, 4);
    g.stroke();
    g.beginPath(); // carry handle
    g.moveTo(-6, -9);
    g.quadraticCurveTo(2, -18, 10, -7);
    g.lineWidth = 4;
    g.stroke();
    g.strokeStyle = '#4a4e69';
    g.lineWidth = 2;
    g.stroke();
    box(g, 4, -7, 31, 13, '#cfd3dc'); // barrel cluster
    g.fillStyle = INK;
    for (let k = 0; k < 6; k++) g.fillRect(5 + ((k * 5 + (s.spin || 0)) % 29), -7, 1.4, 13);
    const heat = s.heat || 0;
    if (heat > 0.05) {
      const hg = g.createLinearGradient(14, 0, 35, 0);
      hg.addColorStop(0, 'rgba(255,90,30,0)');
      hg.addColorStop(1, `rgba(255,${120 - 80 * heat},30,${0.85 * heat})`);
      g.fillStyle = hg;
      g.fillRect(14, -7, 21, 13);
    }
    box(g, 4, -8.5, 3, 16, '#4a4e69');
    box(g, 19, -8.5, 2.5, 16, '#4a4e69');
    box(g, 34, -8, 5, 15, '#4a4e69');
    box(g, -4, 7, 6, 7, '#333');
  } else if (w.id === 'rocket') {
    box(g, -20, -8, 5, 15, '#2a5e49'); // flared back
    box(g, -16, -7, 44, 13, '#3d8b6d'); // tube
    box(g, -6, -7, 4, 13, YELLOW);
    box(g, 18, -7, 3, 13, YELLOW, 1);
    box(g, 27, -8.5, 5, 16, '#2a5e49'); // front rim
    if (s.loaded !== false) {
      g.beginPath(); // warhead peeking out
      g.moveTo(32, -5.5);
      g.lineTo(40, 0);
      g.lineTo(32, 5.5);
      g.closePath();
      g.fillStyle = RED;
      g.fill();
      g.lineWidth = 1.4;
      g.strokeStyle = INK;
      g.stroke();
    }
    box(g, 2, -14, 11, 6, INK); // scope
    box(g, 12, -13.5, 2.5, 5, CYAN, 1);
    box(g, -2, 6, 5, 8, '#333'); // grips
    box(g, 11, 6, 4, 6, '#333');
    g.strokeStyle = 'rgba(255,255,255,.55)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(-13, -4);
    g.lineTo(25, -4);
    g.stroke();
  } else {
    // drone remote seen side-on, as held: body in the hands, phone clamped on
    // top and tilted back toward the pilot's face, antenna pointing forward.
    // Origin: bottom-centre of the body, +x forward.
    g.lineCap = 'round';
    for (const [c, w] of [[INK, 3], ['#9aa0ad', 1.3]]) {
      g.strokeStyle = c; // antenna
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(6, -3);
      g.lineTo(12, -12);
      g.stroke();
    }
    g.strokeStyle = INK; // phone clamp arm
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(0, -6);
    g.lineTo(0, -9);
    g.stroke();
    g.save(); // phone: dark slab, screen facing the pilot
    g.translate(0, -11.5);
    g.rotate(-2.35);
    roundRect(g, -6.5, -2.2, 13, 4.4, 1);
    g.fillStyle = '#2b2d42';
    g.fill();
    g.lineWidth = 1.4;
    g.strokeStyle = INK;
    g.stroke();
    g.fillStyle = Math.sin(t * 6) > -0.6 ? '#7fd6ff' : '#bfeaff';
    g.fillRect(-5.5, 0.4, 11, 1.6);
    g.restore();
    g.beginPath(); // grip under the hands
    g.ellipse(-2, 0.5, 4, 2.6, 0, 0, Math.PI * 2);
    g.fillStyle = '#7d828e';
    g.fill();
    g.lineWidth = 1.4;
    g.strokeStyle = INK;
    g.stroke();
    roundRect(g, -7, -6, 15, 6, 2.5); // body
    g.fillStyle = '#d9dce3';
    g.fill();
    g.stroke();
    g.fillStyle = '#7cff6b';
    g.fillRect(-2, -2, 1.2, 1.2);
    g.fillRect(0, -2, 1.2, 1.2);
    const wig = Math.sin(t * 7) * 1; // thumb stick
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(2, -6);
    g.lineTo(2.5 + wig, -9);
    g.stroke();
    g.beginPath();
    g.arc(2.5 + wig, -9.5, 1.5, 0, Math.PI * 2);
    g.fillStyle = INK;
    g.fill();
  }
}

// ---------- drone strike ----------
// Camera quadcopter (white shell, red arm stripes, landing skids, gimbal
// camera underneath), seen from the front. dir: +1 flying right / -1 left.
export function drawDrone(g, d, t) {
  g.save();
  g.translate(d.x, d.y + Math.sin(t * 2.6 + (d.phase || 0)) * 1.5); // gentle hover bob
  g.rotate(d.dir * (d.tilt || 0)); // nose down when moving fast, level when hovering
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const prop = (x, y, rx) => {
    g.beginPath();
    g.ellipse(x, y, rx, rx * 0.18, 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(235,240,250,.55)';
    g.fill();
    g.lineWidth = 1.2;
    g.strokeStyle = 'rgba(17,17,17,.6)';
    g.stroke();
    const b = Math.sin(t * 70 + x) * rx;
    g.beginPath();
    g.moveTo(x - b, y);
    g.lineTo(x + b, y);
    g.lineWidth = 1.8;
    g.strokeStyle = INK;
    g.stroke();
  };
  const motor = (x, y, s) => {
    box(g, x - 2.5 * s, y - 4 * s, 5 * s, 5 * s, '#e9ecf5', 1.4);
    box(g, x - 1, y - 6 * s, 2, 2 * s, '#9aa0ad', 1);
  };
  // back pair: higher and smaller (depth)
  for (const sx of [-1, 1]) {
    g.lineWidth = 5;
    g.strokeStyle = INK;
    g.beginPath();
    g.moveTo(sx * 6, -6);
    g.lineTo(sx * 18, -10);
    g.stroke();
    g.lineWidth = 3;
    g.strokeStyle = '#e9ecf5';
    g.stroke();
    motor(sx * 18, -10, 0.8);
    prop(sx * 18, -15.5, 12);
  }
  // skids
  for (const sx of [-1, 1]) {
    for (const [c, w] of [[INK, 4.5], ['#fff', 2.2]]) {
      g.strokeStyle = c;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(sx * 6, 2);
      g.lineTo(sx * 9, 8);
      g.lineTo(sx * 10, 18);
      g.stroke();
    }
    box(g, sx * 10 - 2, 17.5, 4, 2, INK, 1);
  }
  // front arms with red stripes, LEDs under the motors
  for (const sx of [-1, 1]) {
    g.lineWidth = 7;
    g.strokeStyle = INK;
    g.beginPath();
    g.moveTo(sx * 8, -2);
    g.lineTo(sx * 26, -1);
    g.stroke();
    g.lineWidth = 4.5;
    g.strokeStyle = '#fff';
    g.stroke();
    g.fillStyle = RED;
    g.fillRect(sx > 0 ? 17 : -21, -3.2, 1.8, 4.4);
    g.fillRect(sx > 0 ? 20 : -18, -3.2, 1.8, 4.4);
    g.beginPath();
    g.arc(sx * 26, 3, 1.6, 0, Math.PI * 2);
    g.fillStyle = Math.sin(t * 12 + sx) > 0 ? (sx * d.dir > 0 ? '#ff4d5e' : '#59ff7a') : 'rgba(255,255,255,.4)';
    g.fill();
    motor(sx * 26, -1, 1);
    prop(sx * 26, -8, 16);
  }
  // shell
  g.beginPath();
  g.moveTo(-10, 2);
  g.quadraticCurveTo(-12, -9, 0, -10);
  g.quadraticCurveTo(12, -9, 10, 2);
  g.quadraticCurveTo(0, 5, -10, 2);
  g.closePath();
  g.fillStyle = '#fff';
  g.fill();
  g.lineWidth = 2.2;
  g.strokeStyle = INK;
  g.stroke();
  g.fillStyle = '#c9cdd6'; // cel shade
  g.beginPath();
  g.moveTo(-10, 2);
  g.quadraticCurveTo(0, 5, 10, 2);
  g.quadraticCurveTo(0, 0, -10, 2);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,.9)';
  g.fillRect(-5, -7, 6, 1.6);
  // gimbal camera
  box(g, -1.5, 3, 3, 3, '#9aa0ad', 1);
  roundRect(g, -4.5, 5.5, 9, 6.5, 1.5);
  g.fillStyle = '#cfd3dc';
  g.fill();
  g.lineWidth = 1.4;
  g.stroke();
  g.beginPath();
  g.arc(0, 8.8, 2.3, 0, Math.PI * 2);
  g.fillStyle = INK;
  g.fill();
  g.fillStyle = CYAN;
  g.fillRect(-0.8, 7.6, 1.2, 1.2);
  if (!d.dropped) drawBomb(g, 0, 21, 0.62);
  g.restore();
}

// Classic finned bomb, nose pointing down, centred at (x, y).
export function drawBomb(g, x, y, s = 1) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  g.lineJoin = 'round';
  g.beginPath(); // fins
  g.moveTo(-6, -12);
  g.lineTo(6, -12);
  g.lineTo(3, -5);
  g.lineTo(-3, -5);
  g.closePath();
  g.fillStyle = '#4a4e69';
  g.fill();
  g.lineWidth = 2;
  g.strokeStyle = INK;
  g.stroke();
  g.beginPath();
  g.ellipse(0, 3, 6, 10, 0, 0, Math.PI * 2);
  g.fillStyle = '#2b2d42';
  g.fill();
  g.stroke();
  box(g, -6, -2, 12, 3, YELLOW, 1.4);
  g.fillStyle = 'rgba(255,255,255,.5)';
  g.fillRect(-3.5, 2, 1.6, 6);
  g.restore();
}

// Pulsing "target marked" reticle on the ground.
export function drawTarget(g, x, y, t) {
  const r = 24 + Math.sin(t * 9) * 3;
  g.save();
  g.translate(x, y);
  g.lineCap = 'round';
  for (const [c, w] of [[INK, 6], [RED, 3]]) {
    g.strokeStyle = c;
    g.lineWidth = w;
    g.setLineDash([9, 7]);
    g.lineDashOffset = -t * 40;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
    g.beginPath();
    g.moveTo(-9, -9);
    g.lineTo(9, 9);
    g.moveTo(9, -9);
    g.lineTo(-9, 9);
    g.stroke();
  }
  g.restore();
}

// ---------- the hero ----------
// Original masked hero (brand orange + navy), facing +x with feet at (0,0).
// p: player state (walk phase, ground/thrust, recoil, squash); aim: world angle;
// flip: aiming left; gun: live gun state for drawGun. Swap this function for a sprite sheet later.
// dark: lighter pants so they read on a dark page
export function drawHero(g, p, aim, flip, weapon, t, gun, dark = false) {
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
    limb([[0, hipY], [kx, ky], [fx, fy - 2]], 5.5, back ? (dark ? '#2b4a9e' : NAVY_DARK) : dark ? '#3d64c9' : NAVY);
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
  g.fillStyle = '#f2d42c'; // spiky golden hair
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

  if (weapon.id === 'drones') {
    // pilot pose: elbows tucked at the sides, forearms out front at belly
    // height, remote in both hands with the phone tilted up to the face
    const sy = hipY - 18, hy2 = hipY - 5 + Math.sin(t * 2.2) * 0.4;
    const back = [11, hy2 + 0.5], front = [19, hy2 + 1.5]; // near hand grips from underneath
    const glove = ([x, y]) => {
      g.beginPath();
      g.arc(x, y, 2.7, 0, Math.PI * 2);
      g.fillStyle = NAVY;
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = INK;
      g.stroke();
    };
    limb([[-1, sy], [-1, sy + 11], back], 4, SUIT_DARK);
    glove(back);
    g.save();
    g.translate(16, hy2 + 1.5);
    g.scale(1.15, 1.15);
    drawGun(g, weapon, gun);
    g.restore();
    limb([[1, sy], [3, sy + 12], front], 4.5, SUIT);
    glove(front);
    g.restore();
    return;
  }

  // arms + gun, rotated toward the crosshair
  g.save();
  g.translate(0, hipY - 18);
  g.rotate(a);
  const kick = -p.recoil * 5;
  limb([[0, 0], [8 + kick, 5], [15 + kick, 3]], 4, SUIT_DARK);
  g.save();
  g.translate(12 + kick, 0);
  g.scale(GUN_SCALE, GUN_SCALE);
  drawGun(g, weapon, gun);
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

// ---------- rank badge ----------
// Winged hexagon emblem: yellow wings, red hex, a star in the middle.
// Centre (x, y) is the hex centre, r its radius; it spans ±1.95r across and
// -1r..1.32r down. t (seconds) drives the star pulse, shine and sparkle.
export function drawBadge(g, x, y, r, t = 0) {
  g.save();
  g.translate(x, y);
  g.lineJoin = 'round';
  const path = (pts) => {
    g.beginPath();
    pts.forEach(([px, py], i) => (i ? g.lineTo(px * r, py * r) : g.moveTo(px * r, py * r)));
    g.closePath();
  };
  const poly = (pts, fill, lw = 3) => {
    path(pts);
    g.fillStyle = fill;
    g.fill();
    if (lw) {
      g.lineWidth = lw;
      g.strokeStyle = INK;
      g.stroke();
    }
  };
  const star = (k, rot) => Array.from({ length: 10 }, (_, i) => {
    const a = rot - Math.PI / 2 + (i * Math.PI) / 5, kk = i % 2 ? k * 0.45 : k;
    return [Math.cos(a) * kk, Math.sin(a) * kk];
  });
  // wings: three feathers a side, drawn bottom-up so the top one overlaps
  for (const sx of [-1, 1])
    for (let i = 2; i >= 0; i--) {
      const f = [[0.6, -0.45 + i * 0.32], [1.95 - i * 0.28, -1 + i * 0.42], [1.8 - i * 0.28, -0.72 + i * 0.42], [0.6, -0.18 + i * 0.32]];
      poly(f.map(([a, b]) => [a * sx, b]), ['#fff0a0', YELLOW, '#e09a00'][i]);
    }
  poly([[-0.55, 0.62], [0, 1], [0.55, 0.62], [0.55, 0.9], [0, 1.32], [-0.55, 0.9]], '#e09a00'); // tail chevron
  const hex = (k) => Array.from({ length: 6 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    return [Math.cos(a) * k, Math.sin(a) * k];
  });
  const O = hex(1), I = hex(0.72);
  poly(O, RED, 0);
  // bevel faces lit from the top-left
  for (let i = 0; i < 6; i++) {
    const lit = Math.cos(-Math.PI / 2 + ((i + 0.5) * Math.PI) / 3 + Math.PI * 0.75);
    poly([O[i], O[(i + 1) % 6], I[(i + 1) % 6], I[i]], lit > 0 ? `rgba(255,255,255,${lit * 0.45})` : `rgba(0,0,0,${-lit * 0.35})`, 0);
  }
  // rivets on the rim
  hex(0.86).forEach(([px, py]) => {
    g.beginPath();
    g.arc(px * r, py * r, r * 0.055, 0, Math.PI * 2);
    g.fillStyle = YELLOW;
    g.fill();
    g.lineWidth = 1.5;
    g.strokeStyle = INK;
    g.stroke();
  });
  const face = g.createLinearGradient(0, -0.72 * r, 0, 0.72 * r);
  face.addColorStop(0, '#7d1020');
  face.addColorStop(1, RED);
  poly(I, face, 2.5);
  g.save();
  path(I);
  g.clip();
  halftone(g, 0, 0, r * 0.72, 'rgba(0,0,0,.25)', r * 0.05, r * 0.13);
  path(hex(0.58));
  g.lineWidth = 1.5;
  g.strokeStyle = 'rgba(255,210,63,.45)';
  g.stroke();
  // star: pulses gently
  const sp = 1 + Math.sin(t * 4) * 0.06;
  poly(star(0.44 * sp, 0).map(([a, b]) => [a + 0.04, b + 0.05]), INK, 0);
  poly(star(0.44 * sp, 0), YELLOW, r * 0.05);
  poly(star(0.2 * sp, 0), '#fff0a0', 0);
  // shine sweeping across the face every ~3s
  const sx = (((t * 0.9) % 2.6) - 1.3) * r;
  const sh = g.createLinearGradient(sx - r * 0.3, 0, sx + r * 0.3, 0);
  sh.addColorStop(0, 'rgba(255,255,255,0)');
  sh.addColorStop(0.5, 'rgba(255,255,255,.45)');
  sh.addColorStop(1, 'rgba(255,255,255,0)');
  g.setTransform(g.getTransform().multiply(new DOMMatrix([1, 0, -0.4, 1, 0, 0])));
  g.fillStyle = sh;
  g.fillRect(sx - r * 0.3, -r, r * 0.6, r * 2);
  g.restore();
  path(O);
  g.lineWidth = 4;
  g.strokeStyle = INK;
  g.stroke();
  // sparkle: twinkles
  const tw = 0.55 + 0.45 * Math.abs(Math.sin(t * 2.2));
  g.fillStyle = '#fff';
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + t * 0.6, k = (i % 2 ? 0.06 : 0.26) * tw;
    g.lineTo(0.84 * r + Math.cos(a) * k * r, -0.88 * r + Math.sin(a) * k * r);
  }
  g.fill();
  g.restore();
}
