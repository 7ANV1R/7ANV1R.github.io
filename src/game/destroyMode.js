// Destroy mode. The whole page is snapshotted into a canvas and becomes the
// world: content (text, cards, images) is solid ground, the page background is
// air. A comic-book hero drops onto what's on screen and blasts the site apart;
// broken chunks fly off and settle as rubble. The camera follows the hero and
// the wheel looks around. The real DOM is never touched; exit just removes the
// overlay. All drawing style lives in ./comic.js.
import { domToCanvas } from 'modern-screenshot';
import {
  INK, ORANGE, YELLOW, RED, CYAN, GUN_SCALE, HERO_SCALE, loadComicFont, starShape, halftone, halftonePattern, drawBurst, drawSfx,
  drawCloud, cloudBlobs, drawFocusLines, drawFlame, drawSpeech, drawCrosshair, drawGun, drawHero, drawScarf,
} from './comic.js';

const WEAPONS = [
  { name: 'Pistol', rate: 240, speed: 2000, spread: 0.012, pellets: 1, crater: 22, chunks: 4, power: 300, recoil: 0, kick: 4, len: 20, casing: '#e0b04a',
    sfx: ['PEW!', 'BANG!', 'PAP!'], sfxSize: 24, colors: ['#bff6ff', CYAN, '#1b2f8f'], sfxEvery: 0 },
  { name: 'Minigun', rate: 60, speed: 2200, spread: 0.07, pellets: 1, crater: 14, chunks: 2, power: 260, recoil: 16, kick: 3, len: 34, casing: '#e0b04a',
    sfx: ['BRAKKA', 'RATATAT', 'BRRRT!'], sfxSize: 26, colors: ['#ffc2d6', '#ff3d7f', '#5a0a2a'], sfxEvery: 380 },
  { name: 'Shotgun', rate: 720, speed: 1800, spread: 0.15, pellets: 7, crater: 16, chunks: 2, power: 320, recoil: 260, kick: 10, len: 32, casing: RED,
    sfx: ['BLAM!', 'KA-BLAM!', 'BOOM!'], sfxSize: 34, colors: ['#fff27a', '#ff8c1a', RED], sfxEvery: 0 },
  { name: 'Rocket', rate: 850, speed: 820, spread: 0, pellets: 1, crater: 95, chunks: 16, power: 700, recoil: 300, kick: 22, len: 31, rocket: true,
    sfx: ['FWOOSH!', 'SHOOM!'], sfxSize: 22, colors: ['#ffffff', '#c9d6ff', '#24306b'], sfxEvery: 0 },
];
const BOOM_WORDS = ['KA-BOOM!', 'KRAKOOM!', 'BLAMMO!', 'KABLAM!', 'WHAM!', 'KRA-KOOM!'];
const HIT_WORDS = ['KRAK!', 'TOK!', 'SPANG!', 'THWAK!', 'CRUNCH!'];
const SPAWN_LINES = ['TIME TO REFACTOR!', 'SHIP IT... TO PIECES!', "LET'S BREAK PROD!", 'CODE REVIEW TIME!'];
const pick = (a) => a[(Math.random() * a.length) | 0];

const G = 1800; // debris
const G_PLAYER = 1050; // floaty, space-ish
const SPEED = 260;
const JUMP = 560;
const JETPACK = 2300;
const JETPACK_MAX = 380;
const MAX_FALL = 900;
const PH = 88; // hero height (drawn at HERO_SCALE)
const PW = 9; // hero half width
const MAX_CHUNKS = 220;
const MAX_PARTICLES = 1400;
const MAX_PIXELS = 16e6; // stay under Safari's canvas area limit

let game = null;
let pending = null; // capture in flight

export const isRunning = () => Boolean(game || pending);

export async function start({ onStop } = {}) {
  if (game || pending) return;
  const token = {};
  pending = token;
  try {
    const root = document.getElementById('root');
    const W = innerWidth, H = innerHeight;
    const Hw = Math.max(H, root.scrollHeight, document.documentElement.scrollHeight);
    const PS = Math.min(devicePixelRatio || 1, 2, Math.sqrt(MAX_PIXELS / (W * Hw)));
    const font = Promise.race([loadComicFont(), new Promise((r) => setTimeout(r, 3000))]);
    const [shot] = await Promise.all([
      Promise.race([
        captureFullPage(root, W, Hw, PS),
        new Promise((_, rej) => setTimeout(() => rej(new Error('page capture timed out')), 20000)),
      ]),
      font,
    ]);
    if (pending !== token) return; // cancelled while capturing
    game = createGame(shot, { W, H, Hw, PS }, onStop);
  } catch (err) {
    console.error('Destroy mode failed to start:', err);
    if (pending === token) onStop?.();
  } finally {
    if (pending === token) pending = null;
  }
}

export function stop() {
  pending = null;
  if (!game) return;
  const g = game;
  game = null;
  g.stop();
}

// Snapshot the whole page from the top, whatever the scroll position: the
// game always opens at the top of the site, so fixed and sticky elements (nav,
// profile card) sit where they naturally are. Exiting leaves the real page
// where it was.
function captureFullPage(root, W, Hw, PS) {
  return domToCanvas(root, {
    width: W,
    height: Hw,
    scale: PS,
    // Safari never fires loadeddata for preload="metadata" videos, and the
    // lib waits this long per pending media before drawing anyway.
    timeout: 1500,
    // Videos without a decoded frame render nothing anyway, and cloning them
    // crashes WebKit.
    filter: (n) => !(n instanceof Element) || !(n.tagName === 'VIDEO' && n.readyState < 2),
  });
}

const HUD_CSS = `
.dm-hud{position:fixed;inset:0;z-index:2147483001;pointer-events:none;font-family:Bangers,Impact,'Arial Black',sans-serif;letter-spacing:.05em;color:#111;user-select:none;-webkit-user-select:none}
.dm-panel{background-color:#fff8e1;background-image:radial-gradient(rgba(0,0,0,.13) 1px,transparent 1.6px);background-size:6px 6px;border:3px solid #111;box-shadow:5px 5px 0 #111;border-radius:3px}
.dm-meter{position:absolute;left:16px;top:16px;padding:6px 12px 10px;min-width:170px;background-color:#ffd23f;transform:rotate(-2deg)}
.dm-meter small{display:block;font-size:15px}
.dm-meter b{display:block;font-size:34px;line-height:1;font-weight:400;color:#fff;-webkit-text-stroke:1.5px #111;text-shadow:3px 3px 0 #d7263d}
.dm-track{height:12px;border:2px solid #111;background:#fff;margin-top:6px;overflow:hidden}
.dm-fill{height:100%;width:0;background:repeating-linear-gradient(-45deg,#f36c38 0 6px,#d7263d 6px 12px);transition:width .25s}
.dm-pop{animation:dm-pop .25s}
@keyframes dm-pop{40%{transform:scale(1.15) rotate(-3deg)}}
.dm-exit{position:absolute;right:16px;top:16px;padding:8px 14px;font:inherit;font-size:20px;letter-spacing:.05em;color:#fff;background-color:#d7263d;cursor:pointer;pointer-events:auto;transform:rotate(2deg);transition:transform .12s}
.dm-exit:hover{transform:rotate(-1deg) scale(1.06)}
.dm-kbd{font-size:12px;padding:1px 6px;border:2px solid #111;background:#fff;color:#111;margin-left:8px;border-radius:3px}
.dm-bar{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);display:flex;gap:10px;padding:8px 10px}
.dm-slot{pointer-events:auto;position:relative;width:66px;height:48px;border:3px solid #111;background:#fff;box-shadow:3px 3px 0 #111;cursor:pointer;padding:0;border-radius:3px;transition:transform .12s}
.dm-slot.on{background:#ffd23f;transform:translateY(-5px) rotate(-3deg)}
.dm-slot span{position:absolute;left:4px;top:0;font-size:14px;color:#d7263d}
.dm-slot canvas{display:block;width:56px;height:38px;margin:3px auto 0}
.dm-hint{position:absolute;left:50%;bottom:92px;transform:translateX(-50%) rotate(-1deg);padding:6px 14px;font-size:16px;white-space:nowrap;background-color:#ffd23f;transition:opacity .8s;max-width:calc(100vw - 32px);overflow:hidden;text-overflow:ellipsis}
.dm-touch{display:none;position:absolute;left:16px;right:16px;bottom:92px;justify-content:space-between}
.dm-touch div{display:flex;gap:10px}
.dm-touch button{pointer-events:auto;width:54px;height:54px;font:inherit;font-size:22px;color:#111;touch-action:none}
.dm-hud.touch .dm-hint{bottom:158px}
html.dm-playing,html.dm-playing *{cursor:none!important}
html.dm-playing .dm-hud button{cursor:pointer!important}
`;

function createGame(shot, { W, H, Hw, PS }, onStop) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const root = document.getElementById('root');

  // ---------- world: page texture + solidity mask (CSS px) ----------
  const page = document.createElement('canvas');
  page.width = Math.round(W * PS);
  page.height = Math.round(Hw * PS);
  const pg = page.getContext('2d');
  // Parts of the snapshot outside the app's own box are transparent; lay the
  // page background down first.
  pg.fillStyle = getComputedStyle(root.firstElementChild || document.body).backgroundColor;
  pg.fillRect(0, 0, page.width, page.height);
  pg.drawImage(shot, 0, 0, page.width, page.height);
  pg.setTransform(PS, 0, 0, PS, 0, 0);

  // Content is solid, the page background is air: the most common colour is
  // taken as the background, anything clearly different is ground.
  const small = document.createElement('canvas');
  small.width = W;
  small.height = Hw;
  const sg = small.getContext('2d', { willReadFrequently: true });
  sg.drawImage(page, 0, 0, W, Hw);
  const mask = new Uint8Array(W * Hw);
  let initialSolid = 0;
  {
    const px = sg.getImageData(0, 0, W, Hw).data;
    const counts = new Map();
    for (let i = 0; i < px.length; i += 4 * 11) {
      const key = ((px[i] >> 3) << 10) | ((px[i + 1] >> 3) << 5) | (px[i + 2] >> 3);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const bgKey = [...counts].sort((a, b) => b[1] - a[1])[0][0];
    const bg = [((bgKey >> 10) & 31) * 8 + 4, ((bgKey >> 5) & 31) * 8 + 4, (bgKey & 31) * 8 + 4];
    // The floating nav is UI, not ground: drawn and shootable but not solid.
    const nr = document.querySelector('nav')?.getBoundingClientRect();
    const nav = nr && { l: nr.left, r: nr.right, t: nr.top, b: nr.bottom }; // fixed: at the top of the page
    for (let y = 0, i = 0; y < Hw; y++) {
      const navRow = nav && y >= nav.t && y < nav.b;
      for (let x = 0; x < W; x++, i++) {
        if (navRow && x >= nav.l && x < nav.r) continue;
        const j = i * 4;
        // ponytail: fixed threshold; raise it if subtle card fills should be air
        const d = Math.max(Math.abs(px[j] - bg[0]), Math.abs(px[j + 1] - bg[1]), Math.abs(px[j + 2] - bg[2]));
        if (d > 14) {
          mask[i] = 1;
          initialSolid++;
        }
      }
    }
  }
  let removed = 0;

  const colorAt = (x, y) => {
    const d = sg.getImageData(Math.max(0, Math.min(W - 1, x | 0)), Math.max(0, Math.min(Hw - 1, y | 0)), 1, 1).data;
    return `rgb(${d[0]},${d[1]},${d[2]})`;
  };

  // Side walls and the bottom of the page are solid; the top is open air.
  const solid = (x, y) => {
    x |= 0;
    y |= 0;
    if (x < 0 || x >= W || y >= Hw) return true;
    return y >= 0 && mask[y * W + x] === 1;
  };

  function inPoly(px, py, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function fillMask(poly, v) {
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    const x0 = Math.max(0, Math.floor(Math.min(...xs))), x1 = Math.min(W - 1, Math.ceil(Math.max(...xs)));
    const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(Hw - 1, Math.ceil(Math.max(...ys)));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const i = y * W + x;
        if (mask[i] !== v && inPoly(x + 0.5, y + 0.5, poly)) {
          if (!v) removed++;
          mask[i] = v;
        }
      }
  }

  const tracePath = (g, poly, dx = 0, dy = 0) => {
    g.beginPath();
    poly.forEach(([x, y], i) => (i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy)));
    g.closePath();
  };

  // ---------- DOM: canvas + HUD ----------
  const canvas = document.createElement('canvas');
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: W + 'px', height: H + 'px',
    zIndex: '2147483000', cursor: 'none', touchAction: 'none',
  });
  const ctx = canvas.getContext('2d');
  const voidFill = halftonePattern(ctx, '#17112f', '#2c2360'); // revealed behind destroyed page

  const isTouch = matchMedia('(pointer: coarse)').matches;
  const hud = document.createElement('div');
  hud.className = 'dm-hud' + (isTouch ? ' touch' : '');
  hud.innerHTML = `<style>${HUD_CSS}</style>
    <div class="dm-panel dm-meter"><small>DESTRUCTION!</small><b data-pct>0.0%</b><div class="dm-track"><div class="dm-fill" data-fill></div></div></div>
    <button class="dm-panel dm-exit" data-exit>✕ Exit<span class="dm-kbd">Esc</span></button>
    <div class="dm-panel dm-hint" data-hint>${
      isTouch ? 'tap to shoot · ▲ fly · ▼ sink' : 'A/D move · hold W fly · hold S sink · click shoot · 1–4 guns · scroll to look around'
    }</div>
    <div class="dm-panel dm-bar" data-guns></div>
    <div class="dm-touch" style="${isTouch ? 'display:flex' : ''}">
      <div><button class="dm-panel" data-k="a">◀</button><button class="dm-panel" data-k="d">▶</button></div>
      <div><button class="dm-panel" data-k="s">▼</button><button class="dm-panel" data-k="w">▲</button></div>
    </div>`;
  const $ = (sel) => hud.querySelector(sel);
  const pctEl = $('[data-pct]'), fillEl = $('[data-fill]');
  const hintTimer = setTimeout(() => ($('[data-hint]').style.opacity = '0'), 7000);
  $('[data-exit]').onclick = () => stop();

  const slots = WEAPONS.map((w, i) => {
    const b = document.createElement('button');
    b.className = 'dm-slot';
    b.title = w.name;
    b.innerHTML = `<span>${i + 1}</span>`;
    const ic = document.createElement('canvas');
    ic.width = 56 * dpr;
    ic.height = 38 * dpr;
    const ig = ic.getContext('2d');
    ig.setTransform(dpr, 0, 0, dpr, 0, 0);
    ig.translate(28 - w.len / 2, 21);
    drawGun(ig, w);
    b.append(ic);
    b.onclick = () => setWeapon(i);
    $('[data-guns]').append(b);
    return b;
  });

  const keys = new Set();
  hud.querySelectorAll('[data-k]').forEach((b) => {
    b.onpointerdown = () => keys.add(b.dataset.k);
    b.onpointerup = b.onpointerleave = b.onpointercancel = () => keys.delete(b.dataset.k);
  });

  document.body.append(canvas, hud);
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.classList.add('dm-playing');

  // ---------- state ----------
  // Drop in just above the biggest heading in the first screen of the page
  // (page coordinates, since the game opens at the top).
  const heading = [...document.querySelectorAll('h1, h2, h3')]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { el, left: r.left, right: r.right, top: r.top + scrollY, w: r.width };
    })
    .filter((h) => h.w && h.left >= 0 && h.right <= W && h.top > 60 && h.top < H * 0.7)
    .sort((a, b) => parseFloat(getComputedStyle(b.el).fontSize) - parseFloat(getComputedStyle(a.el).fontSize))[0];
  const P = {
    x: heading ? heading.left + 30 : W / 2,
    y: heading ? Math.max(PH + 10, heading.top) : PH + 10,
    vx: 0, vy: 0, ground: false, walk: 0, recoil: 0, ghost: false, thrust: false,
  };
  let camY = 0, follow = true;
  const mouse = { x: P.x + 200, y: P.y + 120 }; // screen coords
  const aimW = () => ({ x: mouse.x, y: mouse.y + camY }); // world coords
  let weapon = 0, firing = false, lastShot = -1e9, shake = 0, raf = 0, last = performance.now();
  let chunks = [], bullets = [], particles = [];
  let t = 0, spin = 0, lastSfx = -1e9;
  const speech = { text: pick(SPAWN_LINES), life: 2.8 };
  // scarf: verlet chain anchored at the neck
  const scarf = Array.from({ length: 7 }, () => ({ x: P.x, y: P.y - 47, px: P.x, py: P.y - 47 }));

  function setWeapon(i) {
    weapon = i;
    slots.forEach((b, j) => b.classList.toggle('on', j === i));
  }
  setWeapon(0);

  // ---------- sound: synthesized noise bursts, no assets ----------
  const audio = window.AudioContext ? new AudioContext() : null;
  function boom(dur, freq, vol) {
    if (!audio) return;
    const len = (audio.sampleRate * dur) | 0;
    const buf = audio.createBuffer(1, len, audio.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    const src = audio.createBufferSource();
    const f = audio.createBiquadFilter();
    const g = audio.createGain();
    f.frequency.value = freq;
    g.gain.value = vol;
    src.buffer = buf;
    src.connect(f).connect(g).connect(audio.destination);
    src.start();
  }

  // ---------- input ----------
  const onKey = (e) => {
    const key = e.key.toLowerCase();
    const map = { arrowleft: 'a', arrowright: 'd', arrowup: 'w', ' ': 'w', arrowdown: 's' };
    const kk = map[key] || key;
    if (e.type === 'keydown') {
      if (key === 'escape') return stop();
      if (key >= '1' && key <= '4') setWeapon(+key - 1);
      if ('adws'.includes(kk)) follow = true;
      keys.add(kk);
    } else keys.delete(kk);
    if (key in map) e.preventDefault();
  };
  const clearKeys = () => keys.clear();
  const onWheel = (e) => {
    e.preventDefault();
    e.stopPropagation(); // keep Lenis (window listener) from scrolling underneath
    camY = Math.max(0, Math.min(Hw - H, camY + e.deltaY));
    follow = false;
  };
  const blockTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onMove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };
  const onDown = (e) => {
    onMove(e);
    audio?.resume();
    firing = true;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onUp = () => (firing = false);

  addEventListener('keydown', onKey);
  addEventListener('keyup', onKey);
  addEventListener('blur', clearKeys);
  addEventListener('wheel', onWheel, { passive: false, capture: true });
  addEventListener('touchmove', blockTouch, { passive: false, capture: true });
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  // ---------- effects ----------
  // One particle list; `t` picks behaviour and look.
  // bit: debris/dust square · spark: streak · fire: additive glow · smoke: soft
  // puff · ring: shockwave · flash: additive disc · text: comic pop · casing
  function fx(p) {
    p.max = p.life;
    particles.push(p);
    if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  function burst(x, y, n, t, power, extra = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = rand(0.25, 1) * power;
      fx({ t, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.3, life: rand(0.35, 0.9), size: rand(2, 4), ...extra });
    }
  }

  // ---------- destruction ----------
  function makeChunk(pts, cx0, cy0, power) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const minx = Math.floor(Math.min(...xs)), miny = Math.floor(Math.min(...ys));
    const w = Math.ceil(Math.max(...xs)) - minx + 2, h = Math.ceil(Math.max(...ys)) - miny + 2;
    if (w < 3 || h < 3) return;
    const cx = xs.reduce((a, b) => a + b) / xs.length, cy = ys.reduce((a, b) => a + b) / ys.length;
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * PS);
    c.height = Math.ceil(h * PS);
    const g = c.getContext('2d');
    g.scale(PS, PS);
    tracePath(g, pts, -minx, -miny);
    g.save();
    g.clip();
    g.drawImage(page, minx * PS, miny * PS, w * PS, h * PS, 0, 0, w, h);
    // a little shading so chunks read as solid rubble, not glass
    const sh = g.createLinearGradient(0, 0, w, h);
    sh.addColorStop(0, 'rgba(255,255,255,.12)');
    sh.addColorStop(1, 'rgba(0,0,0,.28)');
    g.fillStyle = sh;
    g.fillRect(0, 0, w, h);
    g.restore();
    g.strokeStyle = INK;
    g.lineWidth = 2.5;
    g.stroke();
    const d = Math.hypot(cx - cx0, cy - cy0) || 1;
    const v = power * rand(0.45, 1);
    chunks.push({
      c, w, h, ox: minx - cx, oy: miny - cy,
      verts: pts.map(([x, y]) => [x - cx, y - cy]),
      x: cx, y: cy, a: 0,
      vx: ((cx - cx0) / d) * v + rand(-60, 60),
      vy: ((cy - cy0) / d) * v - power * 0.5,
      va: rand(-9, 9), rest: 0, life: 0, free: false,
    });
    if (chunks.length > MAX_CHUNKS) bake(chunks.shift());
  }

  function crater(x, y, r, nChunks, power) {
    const n = 12 + ((r / 5) | 0);
    const poly = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.25;
      const rr = r * rand(0.6, 1.15);
      poly.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    // Chunks first (they copy the texture before it's cut): compact rocks
    // from real content inside the crater; empty background just turns to dust.
    for (let made = 0, tries = 0; made < nChunks && tries < nChunks * 3; tries++) {
      const a = rand(0, Math.PI * 2), d = Math.sqrt(Math.random()) * r * 0.75;
      const cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d;
      if (!solid(cx, cy)) continue;
      const cr = Math.max(4, r * rand(0.16, 0.3));
      const k = 5 + ((Math.random() * 3) | 0);
      const pts = [];
      for (let i = 0; i < k; i++) {
        const b = (i / k) * Math.PI * 2 + rand(-0.3, 0.3);
        pts.push([cx + Math.cos(b) * cr * rand(0.6, 1.1), cy + Math.sin(b) * cr * rand(0.6, 1.1)]);
      }
      makeChunk(pts, x, y, power);
      made++;
    }
    pg.save();
    pg.globalCompositeOperation = 'source-atop'; // comic halftone scorch, only on what's there
    halftone(pg, x, y, r * 1.9, 'rgba(17,12,20,.85)', Math.min(3.2, 1.6 + r / 40), r > 40 ? 6 : 4.5);
    pg.globalCompositeOperation = 'destination-out';
    tracePath(pg, poly);
    pg.fill();
    pg.globalCompositeOperation = 'source-atop'; // inked edge
    pg.strokeStyle = INK;
    pg.lineWidth = 4;
    pg.stroke();
    pg.restore();
    fillMask(poly, 0);
  }

  function chunkVerts(s) {
    const c = Math.cos(s.a), si = Math.sin(s.a);
    return s.verts.map(([x, y]) => [s.x + x * c - y * si, s.y + x * si + y * c]);
  }

  function bake(s) {
    pg.save();
    pg.translate(s.x, s.y);
    pg.rotate(s.a);
    pg.drawImage(s.c, s.ox, s.oy, s.w, s.h);
    pg.restore();
    fillMask(chunkVerts(s), 1);
  }

  const cloud = (x, y, r, life, color = '#fff', shade = '#c9c9d6', vx = 0, vy = -30) =>
    fx({ t: 'cloud', x, y, vx, vy, blobs: cloudBlobs(r), life, color, shade });
  const sfx = (x, y, text, size, [c1, c2, shadow], extra = {}) =>
    fx({ t: 'sfx', x, y, text, size, c1, c2, shadow, rot: rand(-0.22, 0.22), life: 0.75, ...extra });

  function hit(x, y, w) {
    const col = colorAt(x, y);
    crater(x, y, w.crater * rand(0.8, 1.2), w.chunks, w.power);
    fx({ t: 'burst', x, y, r: w.crater * 1.25, shape: starShape(9), rot: rand(0, 6), layers: [YELLOW, '#fffbe6'], life: 0.12 });
    burst(x, y, 5, 'spark', 560, { life: 0.22 });
    burst(x, y, 7, 'bit', 300, { color: col });
    burst(x, y, 3, 'ink', 260, { size: rand(2, 4) });
    if (Math.random() < 0.5) cloud(x, y, w.crater * 0.45, rand(0.5, 0.8), '#f4f1ea', '#bdb8c9');
    if (Math.random() < 0.22) sfx(x + rand(-20, 20), y - w.crater - 10, pick(HIT_WORDS), 22, ['#fff27a', '#ff8c1a', RED]);
  }

  function explode(x, y, w) {
    crater(x, y, w.crater, w.chunks, w.power);
    fx({ t: 'burst', x, y, r: w.crater * 1.7, shape: starShape(14), rot: rand(0, 6), layers: [RED, '#ff8c1a', YELLOW, '#fffbe6'], life: 0.38 });
    fx({ t: 'lines', x, y, r: w.crater * 1.5, lines: Array.from({ length: 34 }, () => [rand(0, Math.PI * 2), rand(1.5, 4), rand(80, 260)]), life: 0.2 });
    fx({ t: 'ring', x, y, r: w.crater * 2.6, life: 0.35 });
    fx({ t: 'screen', x, y, life: 0.09 });
    burst(x, y, 26, 'spark', 950, { life: 0.4 });
    burst(x, y, 26, 'bit', 620, { color: colorAt(x, y) });
    burst(x, y, 16, 'ink', 520, { size: rand(3, 7) });
    for (let i = 0; i < 9; i++) {
      const a = rand(0, Math.PI * 2), d = rand(10, w.crater * 0.9);
      const dark = i % 3 === 0;
      cloud(x + Math.cos(a) * d, y + Math.sin(a) * d, rand(16, 28), rand(0.9, 1.6), dark ? '#5b5470' : '#fbf7ee', dark ? '#3a3450' : '#c9c3d6', Math.cos(a) * 60, Math.sin(a) * 60 - 50);
    }
    sfx(x, y - w.crater * 0.4, pick(BOOM_WORDS), 58, ['#fff27a', '#ffb31a', RED], { bubble: '#fff', shape: starShape(13), life: 1 });
    boom(0.9, 450, 1);
    shake = Math.max(shake, w.kick);
    const R = w.crater * 2.4;
    for (const s of chunks) {
      const d = Math.hypot(s.x - x, s.y - y);
      if (d < R) {
        const f = (1 - d / R) * 700;
        s.vx += ((s.x - x) / (d || 1)) * f;
        s.vy += ((s.y - y) / (d || 1)) * f - 200;
        s.rest = 0;
      }
    }
    const d = Math.hypot(P.x - x, P.y - PH / 2 - y);
    if (d < R) {
      const f = (1 - d / R) * 900;
      P.vx += ((P.x - x) / (d || 1)) * f;
      P.vy -= f * 0.7;
      P.ground = false;
    }
  }

  // ---------- shooting ----------
  const shoulder = () => ({ x: P.x, y: P.y - 46 * HERO_SCALE });
  const aimAngle = () => {
    const s = shoulder(), a = aimW();
    return Math.atan2(a.y - s.y, a.x - s.x);
  };

  function shoot(now) {
    const w = WEAPONS[weapon];
    if (now - lastShot < w.rate) return;
    lastShot = now;
    const a0 = aimAngle(), s = shoulder(), target = aimW();
    const reach = (12 + w.len * GUN_SCALE) * HERO_SCALE;
    const mx = s.x + Math.cos(a0) * reach, my = s.y + Math.sin(a0) * reach;
    const dist = Math.hypot(target.x - mx, target.y - my);
    for (let i = 0; i < w.pellets; i++) {
      const a = a0 + (Math.random() - 0.5) * 2 * w.spread;
      bullets.push({ x: mx, y: my, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed, a, dist: dist * rand(0.97, 1.03), trav: 0, w });
    }
    P.vx -= Math.cos(a0) * w.recoil;
    P.vy -= Math.sin(a0) * w.recoil * 0.5;
    P.recoil = 1;
    fx({ t: 'burst', x: mx, y: my, r: w.rocket ? 22 : 10 + w.pellets * 1.5, shape: starShape(7), rot: a0, layers: [YELLOW, '#fffbe6'], life: 0.06 });
    if (w.rocket) cloud(mx - Math.cos(a0) * 50, my - Math.sin(a0) * 50, 14, 0.6, '#fbf7ee', '#c9c3d6', -Math.cos(a0) * 120, -Math.sin(a0) * 120);
    if (now - lastSfx > w.sfxEvery && (w.sfxEvery || Math.random() < 0.6)) {
      lastSfx = now;
      sfx(mx + Math.cos(a0) * 30, my + Math.sin(a0) * 30 - 18, pick(w.sfx), w.sfxSize, w.colors);
    }
    spin += 9;
    if (w.casing) {
      const back = Math.cos(a0) > 0 ? -1 : 1;
      fx({ t: 'casing', x: s.x + Math.cos(a0) * 18, y: s.y + Math.sin(a0) * 18, vx: back * rand(60, 160), vy: rand(-260, -160), rot: 0, va: rand(-20, 20), life: 2.5, color: w.casing });
    }
    shake = Math.max(shake, w.kick * 0.35);
    if (w.rocket) boom(0.35, 300, 0.5);
    else boom(w.pellets > 1 ? 0.3 : 0.07, w.pellets > 1 ? 1200 : 2600, 0.35);
  }

  // ---------- update ----------
  const groundAt = (x, y) => {
    for (let dx = -PW + 2; dx <= PW - 2; dx += 2) if (solid(x + dx, y)) return true;
    return false;
  };
  const bodyBlocked = (x, feetY) => {
    for (let h = 1; h <= PH; h += 3) if (solid(x - PW, feetY - h) || solid(x + PW, feetY - h)) return true;
    return false;
  };

  function updatePlayer(dt) {
    const dir = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0);
    P.vx += (dir * SPEED - P.vx) * Math.min(1, dt * (P.ground ? 14 : 5));
    P.thrust = keys.has('w') && !P.ground;
    if (keys.has('w') && P.ground) {
      P.vy = -JUMP;
      P.ground = false;
    } else if (P.thrust) {
      // jetpack: holding up keeps lifting
      P.vy = Math.max(-JETPACK_MAX, P.vy - JETPACK * dt);
      if (Math.random() < dt * 12) cloud(P.x - (aimW().x < P.x ? -15 : 15), P.y - 30, 5, 0.45, '#fbf7ee', '#c9c3d6', 0, 120);
    }

    // Holding down sinks through whatever is underfoot; after release it only
    // finishes passing through the thing its feet are in.
    const feetIn = () => solid(P.x, P.y - 1);
    P.ghost = keys.has('s') || (P.ghost && feetIn());
    if (P.ghost) {
      P.ground = false;
      P.vy = Math.min(MAX_FALL, Math.max(P.vy, 140) + G_PLAYER * dt);
      P.x = Math.max(PW, Math.min(W - PW, P.x + P.vx * dt));
      P.y = Math.min(Hw, P.y + P.vy * dt);
      if (P.y >= Hw) P.vy = 0;
      return;
    }

    let dx = P.vx * dt;
    const sx = Math.sign(dx);
    while (Math.abs(dx) > 0) {
      const step = Math.abs(dx) >= 1 ? sx : dx;
      dx -= step;
      const nx = P.x + step;
      // free to move, or already overlapping something (let it walk out)
      if (!bodyBlocked(nx, P.y) || bodyBlocked(P.x, P.y)) {
        P.x = Math.max(PW, Math.min(W - PW, nx));
        continue;
      }
      let up = 1; // climb small ledges and rubble
      while (up <= 10 && bodyBlocked(nx, P.y - up)) up++;
      if (up <= 10 && P.ground) {
        P.x = nx;
        P.y -= up;
      } else {
        P.vx = 0;
        break;
      }
    }

    const wasGround = P.ground, fallSpeed = P.vy;
    P.vy = Math.min(MAX_FALL, P.vy + G_PLAYER * dt);
    let dy = P.vy * dt;
    while (Math.abs(dy) > 0) {
      const step = Math.abs(dy) >= 1 ? Math.sign(dy) : dy;
      dy -= step;
      if (step > 0 && groundAt(P.x, P.y + step)) {
        P.vy = 0;
        break;
      }
      // Going up is soft too (one-way platforms): rise through content and
      // land on top of it. Only the top of the page stops the head.
      if (step < 0 && P.y - PH + step < 0) {
        P.vy = 0;
        break;
      }
      P.y += step;
    }
    P.ground = groundAt(P.x, P.y + 1) && P.vy >= 0;
    if (P.ground && !wasGround && fallSpeed > 250) {
      P.squash = Math.min(1, fallSpeed / 700);
      cloud(P.x - 10, P.y - 4, 6, 0.4, '#fbf7ee', '#c9c3d6', -70, -20);
      cloud(P.x + 10, P.y - 4, 6, 0.4, '#fbf7ee', '#c9c3d6', 70, -20);
    }
    // Feet inside something while not rising (rubble settled on them, or W
    // released mid-way through a card): step up onto it if it's a low top,
    // otherwise sink back out the bottom.
    if (P.vy >= 0 && !P.thrust) {
      for (let i = 0; i < 12 && feetIn(); i++) P.y -= 1;
      if (feetIn()) P.ghost = true;
    }
  }

  function updateCamera(dt) {
    if (!follow) return;
    // dead zone: only move when the figure nears the top/bottom of the screen
    const top = P.y - PH - camY, bottom = P.y - camY;
    let target = camY;
    if (top < H * 0.15) target = P.y - PH - H * 0.15;
    else if (bottom > H * 0.8) target = P.y - H * 0.8;
    target = Math.max(0, Math.min(Hw - H, target));
    camY += (target - camY) * Math.min(1, dt * 7);
  }

  function update(dt, now) {
    updatePlayer(dt);
    P.walk += Math.abs(P.vx) * dt * 0.06;
    P.recoil = Math.max(0, P.recoil - dt * 8);
    P.squash = Math.max(0, (P.squash || 0) - dt * 6);
    t += dt;
    speech.life -= dt;
    const face = aimW().x < P.x ? -1 : 1;
    scarf[0].x = P.x - face * 5;
    scarf[0].y = P.y - 47 * HERO_SCALE;
    for (let i = 1; i < scarf.length; i++) {
      const q = scarf[i];
      const vx = (q.x - q.px) * 0.9 - P.vx * 0.004 - face * 0.25, vy = (q.y - q.py) * 0.9 + 300 * dt * dt + Math.sin(t * 9 + i) * 0.15;
      q.px = q.x;
      q.py = q.y;
      q.x += vx;
      q.y += vy;
    }
    for (let it = 0; it < 3; it++)
      for (let i = 1; i < scarf.length; i++) {
        const a = scarf[i - 1], b = scarf[i];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = (d - 6) / d;
        b.x -= dx * f;
        b.y -= dy * f;
      }
    updateCamera(dt);
    if (firing) shoot(now);

    // bullets fly to the crosshair and destroy exactly there
    for (const b of bullets) {
      const step = b.w.speed * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.trav += step;
      if (b.trav >= b.dist) {
        b.done = true;
        const back = b.trav - b.dist; // land on the exact point
        const ix = b.x - Math.cos(b.a) * back, iy = b.y - Math.sin(b.a) * back;
        if (b.w.rocket) explode(ix, iy, b.w);
        else hit(ix, iy, b.w);
      } else if (b.w.rocket) {
        if (Math.random() < 0.45) cloud(b.x - Math.cos(b.a) * 16, b.y - Math.sin(b.a) * 16, rand(5, 8), 0.55, '#fbf7ee', '#c9c3d6', rand(-15, 15), rand(-25, 0));
      }
    }
    bullets = bullets.filter((b) => !b.done);

    // Chunks fly in front of the page. A falling chunk that enters solid from
    // free air lands (bounces, then settles into terrain); while it's in front
    // of a solid surface it just keeps falling past it.
    for (const s of chunks) {
      s.life += dt;
      s.vy += G * dt;
      s.vx *= 1 - 0.35 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.a += s.va * dt;
      const touching = chunkVerts(s).some(([x, y]) => solid(x, y));
      if (!touching) s.free = true;
      else if (s.free && s.vy > 0) {
        s.y -= s.vy * dt;
        s.x -= s.vx * dt;
        s.vy *= -rand(0.2, 0.35);
        s.vx *= 0.55;
        s.va = s.va * 0.5 + s.vx * 0.01;
        if (Math.abs(s.vy) < 70) s.rest += dt * 3;
        if (Math.abs(s.vy) > 160) cloud(s.x, s.y + 4, 4, 0.3, '#fbf7ee', '#c9c3d6', 0, -30);
      }
      if (s.rest > 0.25 || s.life > 7) {
        bake(s);
        s.done = true;
      }
    }
    chunks = chunks.filter((s) => !s.done);

    for (const p of particles) {
      p.life -= dt;
      if (p.t === 'sfx') {
        p.y -= 26 * dt;
        continue;
      }
      if (p.t === 'burst' || p.t === 'ring' || p.t === 'lines' || p.t === 'screen') continue;
      const g = p.t === 'cloud' ? -0.02 : p.t === 'spark' ? 0.45 : 1;
      p.vy += G * g * dt;
      const drag = p.t === 'cloud' ? 2.5 : 0.5;
      p.vx *= 1 - drag * dt;
      p.vy *= 1 - drag * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.t === 'casing') {
        p.rot += p.va * dt;
        if (solid(p.x, p.y) && p.vy > 0) {
          p.y -= p.vy * dt;
          p.vy *= -0.45;
          p.vx *= 0.6;
          p.va *= 0.6;
          if (Math.abs(p.vy) > 60) boom(0.02, 5000, 0.04);
        }
      }
    }
    particles = particles.filter((p) => p.life > 0);

    shake = Math.max(0, shake - dt * 45);

    const pct = ((removed / Math.max(1, initialSolid)) * 100).toFixed(1) + '%';
    if (pctEl.textContent !== pct) {
      pctEl.textContent = pct;
      fillEl.style.width = Math.min(100, parseFloat(pct)) + '%';
      pctEl.classList.remove('dm-pop');
      void pctEl.offsetWidth;
      pctEl.classList.add('dm-pop');
    }
  }

  // ---------- draw ----------

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.save();
    ctx.translate(shake ? rand(-0.5, 0.5) * shake : 0, -camY + (shake ? rand(-0.5, 0.5) * shake : 0));
    ctx.fillStyle = voidFill; // halftone void, scrolls with the page
    ctx.fillRect(-40, camY - 40, W + 80, H + 80);
    const sh = Math.min(H * PS, page.height - camY * PS);
    ctx.drawImage(page, 0, camY * PS, page.width, sh, 0, camY, W, sh / PS);

    const view = (p, pad = 200) => p.y > camY - pad && p.y < camY + H + pad;
    const k = (p) => Math.max(0, p.life / p.max);

    for (const p of particles) if (p.t === 'lines' && view(p, 400)) drawFocusLines(ctx, p, k(p));
    for (const p of particles) {
      if (p.t !== 'cloud' || !view(p)) continue;
      drawCloud(ctx, p, k(p));
    }
    for (const s of chunks) {
      if (!view(s, 80)) continue;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.a);
      ctx.drawImage(s.c, s.ox, s.oy, s.w, s.h);
      ctx.restore();
    }
    for (const p of particles) {
      if (!view(p)) continue;
      const kk = k(p);
      if (p.t === 'bit') {
        ctx.globalAlpha = Math.min(1, kk * 2);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = INK;
        ctx.strokeRect(p.x, p.y, p.size, p.size);
      } else if (p.t === 'ink') {
        ctx.globalAlpha = Math.min(1, kk * 2);
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.5 + kk * 0.5), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.t === 'casing') {
        ctx.globalAlpha = Math.min(1, kk * 3);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-3.5, -1.8, 7, 3.6);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = INK;
        ctx.strokeRect(-3.5, -1.8, 7, 3.6);
        ctx.restore();
      } else if (p.t === 'spark') {
        ctx.globalAlpha = Math.min(1, kk * 1.5);
        ctx.lineCap = 'round';
        for (const [c, w] of [[ORANGE, 4], ['#fff6c8', 1.6]]) {
          ctx.strokeStyle = c;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
          ctx.stroke();
        }
      } else if (p.t === 'ring') {
        const r = p.r * Math.sqrt(1 - kk);
        ctx.globalAlpha = Math.min(1, kk * 2);
        for (const [c, w] of [[INK, 4 + 8 * kk], ['#fff', 1 + 5 * kk]]) {
          ctx.strokeStyle = c;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (p.t === 'burst') {
        ctx.globalAlpha = 1;
        drawBurst(ctx, p, kk);
      }
    }
    ctx.globalAlpha = 1;

    for (const b of bullets) {
      if (b.w.rocket) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.a);
        ctx.rotate(-Math.PI / 2);
        drawFlame(ctx, 0, 10, 14 + Math.random() * 8, 4);
        ctx.rotate(Math.PI / 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = INK;
        ctx.fillStyle = '#e9ecf5';
        ctx.beginPath();
        ctx.rect(-12, -4.5, 18, 9);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = RED;
        ctx.beginPath();
        ctx.moveTo(6, -4.5);
        ctx.lineTo(14, 0);
        ctx.lineTo(6, 4.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.lineCap = 'round';
        for (const [c, w] of [[INK, 6], [ORANGE, 3.5], ['#fff6c8', 1.5]]) {
          ctx.strokeStyle = c;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(b.x - b.vx * 0.016, b.y - b.vy * 0.016);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    const flip = aimW().x < P.x;
    drawScarf(ctx, scarf);
    drawHero(ctx, P, aimAngle(), flip, WEAPONS[weapon], t, spin);
    if (speech.life > 0) drawSpeech(ctx, P.x + 18, P.y - PH * 1.1, speech.text, speech.life / 2.8, camY + 110);

    for (const p of particles) if (p.t === 'sfx' && view(p)) drawSfx(ctx, p);
    ctx.restore();

    for (const p of particles) {
      if (p.t !== 'screen') continue; // impact frame flash
      ctx.fillStyle = `rgba(255,250,230,${k(p) * 0.4})`;
      ctx.fillRect(0, 0, W, H);
    }
    drawCrosshair(ctx, mouse.x, mouse.y);
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    update(dt, now);
    draw();
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    stop() {
      cancelAnimationFrame(raf);
      clearTimeout(hintTimer);
      removeEventListener('keydown', onKey);
      removeEventListener('keyup', onKey);
      removeEventListener('blur', clearKeys);
      removeEventListener('wheel', onWheel, { capture: true });
      removeEventListener('touchmove', blockTouch, { capture: true });
      document.documentElement.style.overflow = prevOverflow;
      document.documentElement.classList.remove('dm-playing');
      canvas.remove();
      hud.remove();
      audio?.close();
      onStop?.();
    },
  };
}
