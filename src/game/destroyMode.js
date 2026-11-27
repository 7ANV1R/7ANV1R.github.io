// Destroy mode. The whole page is snapshotted into a canvas and becomes the
// world: content (text, cards, images) is solid ground, the page background is
// air. A comic-book hero drops onto what's on screen and blasts the site apart;
// broken chunks fly off and settle as rubble. The camera follows the hero and
// the wheel looks around. The real DOM is never touched; exit just removes the
// overlay. All drawing style lives in ./comic.js.
import { domToCanvas } from 'modern-screenshot';
import {
  INK, ORANGE, YELLOW, RED, CYAN, FONT, GUN_SCALE, HERO_SCALE, loadComicFont, starShape, halftone, halftonePattern, drawBurst,
  drawSfx, drawCloud, cloudBlobs, drawFocusLines, drawFlame, drawSpeech, drawCrosshair, drawGun, drawHero, drawScarf,
  drawDrone, drawBomb, drawTarget,
} from './comic.js';

// Each gun plays differently:
// Blaster: tap for quick shots, hold to charge a plasma ball (bigger = bigger blast).
// Minigun: barrels spin up first, then fire faster and wilder as they heat up.
// Rocket: slow, one huge explosion.
// Drone strike: marks the crosshair; drones fly in and carpet-bomb a line
//   with the first bomb exactly on the mark.
const WEAPONS = [
  { id: 'blaster', name: 'Blaster', rate: 170, speed: 2100, len: 24, bore: -3, art: [-5, -11, 25, 10], recoil: 40, kick: 4,
    sfx: ['PEW!', 'ZAP!', 'PAP!'], bigSfx: ['KA-CHOOM!', 'VWOOOM!', 'ZZZAKK!'], colors: ['#bff6ff', CYAN, '#1b2f8f'] },
  { id: 'minigun', name: 'Minigun', rate: 110, minRate: 38, speed: 2300, spread: 0.03, maxSpread: 0.13, crater: 13, chunks: 2,
    power: 260, recoil: 16, kick: 3, len: 39, bore: -0.5, art: [-11, -18, 39, 19], casing: '#e0b04a', sfx: ['BRAKKA', 'RATATAT', 'BRRRT!'], sfxEvery: 380,
    colors: ['#ffc2d6', '#ff3d7f', '#5a0a2a'] },
  { id: 'rocket', name: 'Rocket', rate: 850, speed: 820, crater: 95, chunks: 16, power: 700, recoil: 300, kick: 22, len: 40, bore: -0.5, art: [-20, -14, 40, 14],
    sfx: ['FWOOSH!', 'SHOOM!'], colors: ['#ffffff', '#c9d6ff', '#24306b'] },
  { id: 'drones', name: 'Drone Strike', rate: 1800, crater: 72, chunks: 10, power: 620, kick: 14, len: 26, art: [-43, -18, 43, 21] },
];
const BOOM_WORDS = ['KA-BOOM!', 'KRAKOOM!', 'BLAMMO!', 'KABLAM!', 'WHAM!', 'KRA-KOOM!'];
const HIT_WORDS = ['KRAK!', 'TOK!', 'SPANG!', 'THWAK!', 'CRUNCH!'];
const SPAWN_LINES = ['TIME TO REFACTOR!', 'SHIP IT... TO PIECES!', "LET'S BREAK PROD!", 'CODE REVIEW TIME!'];
const STRIKE_LINES = ['DRONES, SIC EM!', 'AIR SUPPORT INBOUND!', 'TARGET MARKED!', 'DEPLOYING THE SWARM!'];
const WIN_LETTERS = 'SITE DESTROYED!';
// fastest first: [seconds, title]
const RANKS = [[180, 'ONE-HERO APOCALYPSE'], [420, 'DEMOLITION EXPERT'], [900, 'WRECKING CREW'], [Infinity, 'PERSISTENT MENACE']];
const pick = (a) => a[(Math.random() * a.length) | 0];
const rand = (a, b) => a + Math.random() * (b - a);

const G = 1800; // debris
const G_PLAYER = 1050; // floaty, space-ish
const SPEED = 260;
const SPRINT = 1.75; // Shift / joystick pushed to the rim
const JUMP = 560;
const JETPACK = 2300;
const JETPACK_MAX = 380;
const MAX_FALL = 900;
const PH = 88; // hero height (drawn at HERO_SCALE)
const PW = 9; // hero half width
const DRONE_SPEED = 720;
const MAX_CHUNKS = 220;
const MAX_PIXELS = 16e6; // stay under Safari's canvas area limit
// ponytail: the last few % are anti-aliased specks nobody can find, so the
// meter reads 100% once this share of the original content is gone.
const WIN_AT = 0.95;

let game = null;
let pending = null; // capture in flight

export const isRunning = () => Boolean(game || pending);

export async function start({ onStop, input } = {}) {
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
    game = createGame(shot, { W, H, Hw, PS, input }, onStop);
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
  // Lets page effects (the nav button's loading glitch) hold still for the picture.
  document.documentElement.setAttribute('data-dm-capture', '');
  return domToCanvas(root, {
    width: W,
    height: Hw,
    scale: PS,
    // Safari never fires loadeddata for preload="metadata" videos, and the
    // lib waits this long per pending media before drawing anyway.
    timeout: 1500,
    // Videos without a decoded frame render nothing anyway, and cloning them
    // crashes WebKit.
    filter: (n) => !(n instanceof Element) || !(n.hasAttribute('data-dm-fx') || (n.tagName === 'VIDEO' && n.readyState < 2)),
  }).finally(() => document.documentElement.removeAttribute('data-dm-capture'));
}

const HUD_CSS = `
.dm-hud{position:fixed;inset:0;z-index:2147483001;pointer-events:none;font-family:Bangers,Impact,'Arial Black',sans-serif;letter-spacing:.05em;color:#111;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.dm-panel{background-color:#fff8e1;background-image:radial-gradient(rgba(0,0,0,.13) 1px,transparent 1.6px);background-size:6px 6px;border:3px solid #111;box-shadow:5px 5px 0 #111;border-radius:3px}
.dm-meter{position:absolute;left:16px;top:16px;padding:6px 12px 10px;min-width:170px;background-color:#ffd23f;transform:rotate(-2deg)}
.dm-meter small{display:block;font-size:15px}
.dm-meter b{display:block;font-size:34px;line-height:1;font-weight:400;color:#fff;-webkit-text-stroke:1.5px #111;text-shadow:3px 3px 0 #d7263d}
.dm-track{height:12px;border:2px solid #111;background:#fff;margin-top:6px;overflow:hidden}
.dm-fill{height:100%;width:0;background:repeating-linear-gradient(-45deg,#f36c38 0 6px,#d7263d 6px 12px);transition:width .25s}
.dm-pop{animation:dm-pop .25s}
@keyframes dm-pop{40%{transform:scale(1.15) rotate(-3deg)}}
.dm-exit{position:absolute;right:16px;top:16px;padding:8px 14px;font:inherit;font-size:20px;letter-spacing:.05em;color:#fff;background-color:#d7263d;pointer-events:auto;transform:rotate(2deg);transition:transform .12s;touch-action:manipulation}
.dm-exit:hover{transform:rotate(-1deg) scale(1.06)}
.dm-kbd{font-size:12px;padding:1px 6px;border:2px solid #111;background:#fff;color:#111;margin-left:8px;border-radius:3px}
.dm-bar{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);display:flex;gap:10px;padding:8px 10px}
.dm-slot{pointer-events:auto;position:relative;width:78px;height:62px;border:3px solid #111;background:#fff;box-shadow:3px 3px 0 #111;padding:0;border-radius:3px;transition:transform .12s;overflow:hidden;touch-action:manipulation;font:inherit;color:#111}
.dm-slot.on{background:#ffd23f;transform:translateY(-5px) rotate(-3deg)}
.dm-slot span{position:absolute;left:0;top:0;z-index:2;min-width:19px;height:19px;line-height:17px;text-align:center;font-size:14px;color:#fff;background:#d7263d;border:solid #111;border-width:0 2px 2px 0;border-radius:0 0 6px 0}
.dm-slot em{position:absolute;left:0;right:0;bottom:0;z-index:2;height:15px;line-height:16px;font-size:11px;white-space:nowrap;font-style:normal;letter-spacing:.06em;text-align:center;color:#fff;background:#111}
.dm-slot.on em{background:#d7263d}
.dm-slot canvas{position:absolute;left:15px;top:2px;width:56px;height:38px}
.dm-slot i{position:absolute;inset:0;z-index:1;background:rgba(17,17,17,.35);transform-origin:bottom;transform:scaleY(0);pointer-events:none}
.dm-hint{position:absolute;left:50%;bottom:112px;transform:translateX(-50%) rotate(-1deg);padding:6px 14px;font-size:16px;white-space:nowrap;text-align:center;background-color:#ffd23f;transition:opacity .8s;max-width:calc(100vw - 32px);overflow:hidden;text-overflow:ellipsis}
.dm-stick{display:none;position:absolute;left:30px;bottom:34px;width:96px;height:96px;border-radius:50%;pointer-events:auto;touch-action:none;background:rgba(17,17,17,.28);border:2px solid rgba(255,255,255,.3)}
.dm-stick b{position:absolute;left:0;right:0;text-align:center;font-weight:400;font-size:10px;color:rgba(255,255,255,.55)}
.dm-knob{position:absolute;left:50%;top:50%;width:50px;height:50px;margin:-25px;border-radius:50%;background:rgba(255,210,63,.85);border:3px solid rgba(17,17,17,.85);box-shadow:0 3px 8px rgba(0,0,0,.35);transition:background .15s}
.dm-knob.fast{background:rgba(243,108,56,.9)}
.dm-hud.touch .dm-stick{display:block}
.dm-hud.touch .dm-kbd{display:none}
.dm-hud.touch .dm-meter{min-width:0;width:92px;padding:3px 7px 6px;left:10px;top:10px;border-width:2px;box-shadow:3px 3px 0 #111}
.dm-hud.touch .dm-meter small{font-size:9px}
.dm-hud.touch .dm-meter b{font-size:18px;-webkit-text-stroke:1px #111;text-shadow:2px 2px 0 #d7263d}
.dm-hud.touch .dm-track{height:7px;margin-top:3px;border-width:1.5px}
.dm-hud.touch .dm-exit{right:12px;top:12px;font-size:17px;padding:6px 12px}
.dm-hud.touch .dm-bar{left:auto;right:12px;bottom:18px;transform:none;display:grid;grid-template-columns:repeat(2,auto);gap:8px;padding:6px}
.dm-hud.touch .dm-slot{width:64px;height:54px}
.dm-hud.touch .dm-slot span{display:none}
.dm-hud.touch .dm-slot canvas{left:4px;top:1px;width:50px;height:34px}
.dm-hud.touch .dm-hint{bottom:auto;top:84px;font-size:14px;white-space:normal;text-align:center;width:max-content}
html.dm-playing,html.dm-playing *{cursor:none!important}
html.dm-playing .dm-hud button,html.dm-playing .dm-hud .dm-dev{cursor:pointer!important}
.dm-win{position:absolute;inset:0;display:grid;place-items:center;padding:16px;pointer-events:auto;overflow:hidden;background:rgba(23,17,47,.5);animation:dm-fade .4s both}
.dm-rays{position:absolute;left:50%;top:50%;width:250vmax;height:250vmax;margin:-125vmax;background:repeating-conic-gradient(rgba(255,210,63,.32) 0 7deg,transparent 7deg 18deg);animation:dm-spin 40s linear infinite;pointer-events:none}
.dm-card{position:relative;width:min(560px,100%);padding:30px 20px 20px;text-align:center;animation:dm-card .7s cubic-bezier(.2,1.5,.4,1) .1s both}
.dm-issue{position:absolute;left:-8px;top:-16px;padding:3px 10px;background:#d7263d;color:#fff;border:3px solid #111;transform:rotate(-4deg);font-size:14px}
.dm-burst{position:absolute;left:50%;top:76px;width:min(460px,96%);height:150px;transform:translate(-50%,-50%);animation:dm-throb 1.1s ease-in-out infinite alternate}
.dm-burst div{position:absolute;inset:0}
.dm-title{position:relative;margin:4px 0 0;font-weight:400;font-size:clamp(40px,11vw,74px);line-height:.95;color:#ffd23f;-webkit-text-stroke:2px #111;text-shadow:4px 4px 0 #d7263d,7px 7px 0 #111}
.dm-title span{display:inline-block;white-space:pre;animation:dm-drop .5s cubic-bezier(.3,1.8,.5,1) both;animation-delay:calc(.35s + var(--i) * .05s)}
.dm-stamp{display:inline-block;margin:16px 0 14px;padding:4px 14px;border:4px solid #d7263d;color:#d7263d;background:rgba(255,255,255,.7);font-size:clamp(18px,5vw,26px);transform:rotate(-6deg);animation:dm-stamp .35s cubic-bezier(.5,0,.6,1.4) 1.25s both}
.dm-stats{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-bottom:18px}
.dm-stats div{min-width:84px;padding:4px 12px;border:3px solid #111;background:#fff;box-shadow:3px 3px 0 #111;animation:dm-up .4s both;animation-delay:calc(1.5s + var(--i) * .12s)}
.dm-stats b{display:block;font-size:28px;font-weight:400;line-height:1.1}
.dm-stats small{font-size:12px;color:#d7263d}
.dm-actions{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;animation:dm-up .4s 2s both;pointer-events:none}
.dm-actions button{font:inherit;font-size:18px;letter-spacing:.05em;padding:8px 14px;border:3px solid #111;box-shadow:4px 4px 0 #111;background:#ffd23f;color:#111;cursor:pointer;touch-action:manipulation;transition:transform .12s}
.dm-actions button:hover{transform:translateY(-2px) rotate(-1deg)}
.dm-actions [data-keep]{background:#fff}
.dm-actions [data-leave]{background:#d7263d;color:#fff}
@keyframes dm-fade{from{opacity:0}}
@keyframes dm-spin{to{transform:rotate(360deg)}}
@keyframes dm-card{from{transform:scale(.2) rotate(-14deg);opacity:0}}
@keyframes dm-throb{to{transform:translate(-50%,-50%) scale(1.06) rotate(2deg)}}
@keyframes dm-drop{from{transform:translateY(-90px) rotate(-25deg) scale(1.6);opacity:0}}
@keyframes dm-stamp{from{transform:rotate(-6deg) scale(3);opacity:0}}
@keyframes dm-up{from{transform:translateY(16px);opacity:0}}
@media (prefers-reduced-motion:reduce){.dm-win,.dm-win *{animation:none!important}}
`;

// CSS clip-path for a comic starburst (an ellipse with spikes).
const burstClip = (spikes, inner) =>
  `polygon(${Array.from({ length: spikes * 2 }, (_, i) => {
    const a = (i / (spikes * 2)) * Math.PI * 2, r = i % 2 ? inner : 1;
    return `${(50 + Math.cos(a) * 50 * r).toFixed(1)}% ${(50 + Math.sin(a) * 50 * r).toFixed(1)}%`;
  }).join(',')})`;

function createGame(shot, { W, H, Hw, PS, input }, onStop) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const root = document.getElementById('root');
  // Controls follow how the player actually plays, never the device type
  // (there's no way to ask a browser whether a keyboard is attached, and
  // touch laptops / iPads with keyboards / some Windows drivers make every
  // hardware guess wrong somewhere):
  // - open with whatever pressed the game button: a finger or pen means the
  //   on-screen stick; a mouse/trackpad click or Enter means keyboard
  // - any game key switches to keyboard mode, any touch on the screen
  //   switches to touch mode, so a wrong start corrects itself at once
  // - only if the button press is unknown, fall back to the primary pointer
  const canTouch = navigator.maxTouchPoints > 0 || matchMedia('(any-pointer: coarse)').matches;
  let isTouch = input ? input === 'touch' || input === 'pen' : matchMedia('(pointer: coarse)').matches;
  const MAX_PARTICLES = matchMedia('(pointer: coarse)').matches ? 700 : 1400; // phones/tablets: lighter
  const TOUCH_HINT = 'stick: move · up fly · down sink · push to the rim to sprint<br>tap anywhere to blast · hold blaster to charge';
  const KEY_HINT =
    'A/D move · Shift sprint · W fly · S sink · click shoot (hold Blaster to charge) · 1–4 guns · scroll to look around' +
    (canTouch ? '<br>no keyboard? touch the screen for on-screen controls' : '');

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
  // Progress counts original content only, each pixel once: rubble that lands
  // and gets blasted again doesn't count twice.
  const original = mask.slice();
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
        if (!inPoly(x + 0.5, y + 0.5, poly)) continue;
        if (!v && original[i]) {
          original[i] = 0;
          removed++;
        }
        mask[i] = v;
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
    zIndex: '2147483000', cursor: 'none', touchAction: 'none', webkitTouchCallout: 'none',
  });
  const ctx = canvas.getContext('2d');
  const voidFill = halftonePattern(ctx, '#17112f', '#2c2360'); // revealed behind destroyed page

  const hud = document.createElement('div');
  hud.className = 'dm-hud' + (isTouch ? ' touch' : '');
  hud.innerHTML = `<style>${HUD_CSS}</style>
    <div class="dm-panel dm-meter" data-meter><small>DESTRUCTION!</small><b data-pct>0.0%</b><div class="dm-track"><div class="dm-fill" data-fill></div></div></div>
    <button class="dm-panel dm-exit" data-exit>✕ Exit<span class="dm-kbd">Esc</span></button>
    <div class="dm-panel dm-hint" data-hint>${isTouch ? TOUCH_HINT : KEY_HINT}</div>
    <div class="dm-panel dm-bar" data-guns></div>
    <div class="dm-stick" data-stick><b style="top:6px">FLY</b><b style="bottom:6px">SINK</b><div class="dm-knob" data-knob></div></div>`;
  const $ = (sel) => hud.querySelector(sel);
  const pctEl = $('[data-pct]'), fillEl = $('[data-fill]'), knob = $('[data-knob]');
  const hintEl = $('[data-hint]');
  let hintTimer = setTimeout(() => (hintEl.style.opacity = '0'), isTouch ? 9000 : 7000);
  // switch control scheme, and show the new controls' hint for a moment
  function setTouch(on) {
    if (on === isTouch) return;
    isTouch = on;
    hud.classList.toggle('touch', on);
    hintEl.innerHTML = on ? TOUCH_HINT : KEY_HINT;
    hintEl.style.opacity = '1';
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => (hintEl.style.opacity = '0'), 5000);
  }
  $('[data-exit]').onclick = () => stop();

  const slots = WEAPONS.map((w, i) => {
    const b = document.createElement('button');
    b.className = 'dm-slot';
    b.title = w.name;
    b.innerHTML = `<span>${i + 1}</span><em>${w.name.split(' ')[0]}</em><i></i>`;
    const ic = document.createElement('canvas');
    ic.width = 56 * dpr;
    ic.height = 38 * dpr;
    const ig = ic.getContext('2d');
    ig.setTransform(dpr, 0, 0, dpr, 0, 0);
    // fit the gun's drawn box (art: [left, top, right, bottom] around the
    // grip) into the top of the slot, clear of the name label
    const [x0, y0, x1, y1] = w.art, k = Math.min(1, 52 / (x1 - x0), 30 / (y1 - y0));
    ig.translate(28 - ((x0 + x1) / 2) * k, 16 - ((y0 + y1) / 2) * k);
    ig.scale(k, k);
    if (w.id === 'drones') drawDrone(ig, { x: 0, y: 0, dir: 0, dropped: true }, 0);
    else drawGun(ig, w);
    b.prepend(ic);
    b.onclick = () => setWeapon(i);
    $('[data-guns]').append(b);
    return b;
  });
  const cooldowns = slots.map((b) => b.querySelector('i'));

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
    vx: 0, vy: 0, ground: false, walk: 0, recoil: 0, ghost: false, thrust: false, sprint: false,
  };
  let camY = 0, follow = true;
  const mouse = { x: P.x + 200, y: P.y + 120 }; // screen coords
  const aimW = () => ({ x: mouse.x, y: mouse.y + camY }); // world coords
  let weapon = 0, firing = false, tapped = false, fireId = null, shake = 0, raf = 0, last = performance.now();
  const lastShot = WEAPONS.map(() => -1e9);
  let chunks = [], bullets = [], particles = [], drones = [], bombs = [], marks = [];
  let t = 0, lastSfx = -1e9;
  const gun = { spin: 0, spinUp: 0, heat: 0, charge: 0, loaded: true, t: 0 }; // live gun state, drawn by drawGun
  const stats = { shots: 0, booms: 0 };
  let won = false, celebrated = false, winEl = null, party = 0;
  const speech = { text: pick(SPAWN_LINES), life: 2.8, max: 2.8 };
  const say = (text, life = 1.4) => Object.assign(speech, { text, life, max: life });
  // scarf: verlet chain anchored at the neck
  const scarf = Array.from({ length: 7 }, () => ({ x: P.x, y: P.y - 47, px: P.x, py: P.y - 47 }));

  function setWeapon(i) {
    if (i === weapon && slots[i].classList.contains('on')) return;
    weapon = i;
    gun.charge = 0;
    slots.forEach((b, j) => b.classList.toggle('on', j === i));
    if (t > 0.5) say(WEAPONS[i].name.toUpperCase() + '!', 0.9);
  }
  setWeapon(0);

  // ---------- sound: synthesized, no assets ----------
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
  // a sliding tone: bomb whistle, spin-up whine, fanfare notes
  function tone(f0, f1, dur, vol, type = 'sine', delay = 0) {
    if (!audio) return;
    const o = audio.createOscillator(), g = audio.createGain(), at = audio.currentTime + delay;
    o.type = type;
    o.frequency.setValueAtTime(f0, at);
    o.frequency.exponentialRampToValueAtTime(f1, at + dur);
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + dur);
    o.connect(g).connect(audio.destination);
    o.start(at);
    o.stop(at + dur);
  }

  // ---------- input ----------
  const keys = new Set();
  const onKey = (e) => {
    const key = e.key.toLowerCase();
    const map = { arrowleft: 'a', arrowright: 'd', arrowup: 'w', ' ': 'w', arrowdown: 's' };
    const kk = map[key] || key;
    if (e.type === 'keydown') {
      if (key === 'escape') return stop();
      if (won) return;
      if ('adws'.includes(kk) || kk === 'shift' || /^Digit[1-4]$/.test(e.code)) setTouch(false);
      // e.code, not e.key: with Shift held the digits arrive as !@#$
      const digit = /^Digit([1-4])$/.exec(e.code);
      if (digit) setWeapon(+digit[1] - 1);
      if ('adws'.includes(kk)) follow = true;
      keys.add(kk);
    } else keys.delete(kk);
    if (key in map) e.preventDefault();
  };
  const clearKeys = () => keys.clear();
  const onAnyPointer = (e) => e.pointerType !== 'mouse' && setTouch(true);
  const onWheel = (e) => {
    e.preventDefault();
    e.stopPropagation(); // keep Lenis (window listener) from scrolling underneath
    camY = Math.max(0, Math.min(Hw - H, camY + e.deltaY));
    follow = false;
  };
  const blockTouch = (e) => {
    if (won) return; // the reward screen's buttons need normal touches
    e.preventDefault();
    e.stopPropagation();
  };
  // Only the pointer that's aiming moves the crosshair: on touch the other
  // thumb is on the joystick.
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' && e.pointerId !== fireId) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };
  const onDown = (e) => {
    if (won || (e.pointerType === 'mouse' && e.button !== 0)) return;
    audio?.resume();
    fireId = e.pointerId;
    onMove(e);
    firing = tapped = true; // tapped: a click shorter than a frame still fires once
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onUp = (e) => {
    audio?.resume(); // iOS sometimes only unlocks audio on pointerup
    if (e.pointerId !== fireId) return;
    fireId = null;
    firing = false;
    if (WEAPONS[weapon].id === 'blaster') releaseBlaster(performance.now());
  };

  // Touch joystick: left/right walk (analog), up flies, down sinks, the rim sprints.
  const stick = { x: 0, id: null };
  const stickEl = $('[data-stick]');
  function onStick(e) {
    if (e.type === 'pointerdown') {
      audio?.resume();
      stick.id = e.pointerId;
      stickEl.setPointerCapture?.(e.pointerId);
    }
    if (e.pointerId !== stick.id) return;
    const r = stickEl.getBoundingClientRect(), R = r.width / 2; // knob centre can reach the rim
    let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > R) (dx *= R / d), (dy *= R / d);
    const nx = dx / R, ny = dy / R, mag = Math.min(1, d / R);
    stick.x = Math.abs(nx) > 0.2 ? nx : 0;
    const set = (k, on) => (on ? keys.add(k) : keys.delete(k));
    set('w', ny < -0.5);
    set('s', ny > 0.6);
    set('shift', mag > 0.92);
    follow = true;
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    knob.classList.toggle('fast', mag > 0.92);
  }
  function endStick(e) {
    if (e.pointerId !== stick.id) return;
    stick.id = null;
    stick.x = 0;
    ['w', 's', 'shift'].forEach((k) => keys.delete(k));
    knob.style.transform = '';
    knob.classList.remove('fast');
  }
  stickEl.addEventListener('pointerdown', onStick);
  stickEl.addEventListener('pointermove', onStick);
  stickEl.addEventListener('pointerup', endStick);
  stickEl.addEventListener('pointercancel', endStick);

  // The snapshot, mask and layout are fixed at start: a new width (rotation,
  // desktop resize) means a different page, so leave. A height-only change is
  // the mobile URL bar; just resize the view.
  const onResize = () => {
    if (innerWidth !== W) return stop();
    H = innerHeight;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    camY = Math.max(0, Math.min(Hw - H, camY));
  };

  addEventListener('keydown', onKey);
  addEventListener('keyup', onKey);
  addEventListener('blur', clearKeys);
  addEventListener('resize', onResize);
  addEventListener('pointerdown', onAnyPointer, true);
  addEventListener('wheel', onWheel, { passive: false, capture: true });
  addEventListener('touchmove', blockTouch, { passive: false, capture: true });
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  // ---------- effects ----------
  // One particle list; `t` picks behaviour and look.
  function fx(p) {
    p.max = p.life;
    particles.push(p);
    if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
  }
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

  // quiet: one of several bombs landing together; skip the word, flash and
  // full-volume bang so a strike doesn't triple everything.
  function explode(x, y, w, { quiet = false, word } = {}) {
    stats.booms++;
    crater(x, y, w.crater, w.chunks, w.power);
    fx({ t: 'burst', x, y, r: w.crater * 1.7, shape: starShape(14), rot: rand(0, 6), layers: [RED, '#ff8c1a', YELLOW, '#fffbe6'], life: 0.38 });
    fx({ t: 'lines', x, y, r: w.crater * 1.5, lines: Array.from({ length: 34 }, () => [rand(0, Math.PI * 2), rand(1.5, 4), rand(80, 260)]), life: 0.2 });
    fx({ t: 'ring', x, y, r: w.crater * 2.6, life: 0.35 });
    if (!quiet) fx({ t: 'screen', x, y, life: 0.09 });
    burst(x, y, quiet ? 14 : 26, 'spark', 950, { life: 0.4 });
    burst(x, y, quiet ? 14 : 26, 'bit', 620, { color: colorAt(x, y) });
    burst(x, y, quiet ? 8 : 16, 'ink', 520, { size: rand(3, 7) });
    for (let i = 0; i < (quiet ? 5 : 9); i++) {
      const a = rand(0, Math.PI * 2), d = rand(10, w.crater * 0.9);
      const dark = i % 3 === 0;
      cloud(x + Math.cos(a) * d, y + Math.sin(a) * d, rand(16, 28), rand(0.9, 1.6), dark ? '#5b5470' : '#fbf7ee', dark ? '#3a3450' : '#c9c3d6', Math.cos(a) * 60, Math.sin(a) * 60 - 50);
    }
    if (!quiet) sfx(x, y - w.crater * 0.4, word || pick(BOOM_WORDS), 58, ['#fff27a', '#ffb31a', RED], { bubble: '#fff', shape: starShape(13), life: 1 });
    boom(0.9, 450, quiet ? 0.45 : 1);
    shake = Math.max(shake, quiet ? w.kick * 0.5 : w.kick);
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
  // Barrel tip in world space. bore: the barrel's height above the arm line
  // in gun units; the hero is mirrored when aiming left, so it flips sides.
  const muzzle = (w) => {
    const a = aimAngle(), s = shoulder(), reach = (12 + w.len * GUN_SCALE) * HERO_SCALE;
    const off = (w.bore || 0) * GUN_SCALE * HERO_SCALE * (aimW().x < P.x ? -1 : 1);
    return { a, x: s.x + Math.cos(a) * reach - Math.sin(a) * off, y: s.y + Math.sin(a) * reach + Math.cos(a) * off };
  };

  // Fire a projectile from the muzzle that lands exactly on the crosshair
  // (± spread), then calls onHit there.
  function launch(w, { kind, speed, spread = 0, r = 0, onHit }) {
    const m = muzzle(w), target = aimW();
    const dist = Math.hypot(target.x - m.x, target.y - m.y);
    // from the barrel tip straight to the crosshair (the barrel sits a little off the arm line)
    const a = Math.atan2(target.y - m.y, target.x - m.x) + (Math.random() - 0.5) * 2 * spread;
    bullets.push({ x: m.x, y: m.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, a, speed, dist: spread ? dist * rand(0.97, 1.03) : dist, trav: 0, kind, r, onHit });
    stats.shots++;
    return m;
  }

  function muzzleFx(w, m, { size = 10, words = w.sfx, wordSize = 24, recoil = w.recoil, kick = w.kick, every = w.sfxEvery || 0 }) {
    P.vx -= Math.cos(m.a) * recoil;
    P.vy -= Math.sin(m.a) * recoil * 0.5;
    P.recoil = 1;
    fx({ t: 'burst', x: m.x, y: m.y, r: size, shape: starShape(7), rot: m.a, layers: [YELLOW, '#fffbe6'], life: 0.06 });
    const now = performance.now();
    if (words && now - lastSfx > every && (every || Math.random() < 0.6)) {
      lastSfx = now;
      sfx(m.x + Math.cos(m.a) * 30, m.y + Math.sin(m.a) * 30 - 18, pick(words), wordSize, w.colors);
    }
    if (w.casing) {
      const s = shoulder(), back = Math.cos(m.a) > 0 ? -1 : 1;
      fx({ t: 'casing', x: s.x + Math.cos(m.a) * 18, y: s.y + Math.sin(m.a) * 18, vx: back * rand(60, 160), vy: rand(-260, -160), rot: 0, va: rand(-20, 20), life: 2.5, color: w.casing });
    }
    shake = Math.max(shake, kick * 0.35);
  }

  function releaseBlaster(now) {
    const w = WEAPONS[0], c = gun.charge;
    gun.charge = 0;
    if (won || now - lastShot[0] < w.rate) return;
    lastShot[0] = now;
    const big = c > 0.35;
    const spec = { crater: 20 + 52 * c, chunks: 3 + ((12 * c) | 0), power: 300 + 450 * c, kick: 4 + 16 * c };
    const m = launch(w, {
      kind: big ? 'plasma' : 'bolt', speed: big ? 1500 : w.speed, r: 4 + 9 * c,
      onHit: (x, y) => (big ? explode(x, y, spec, { word: pick(w.bigSfx) }) : hit(x, y, spec)),
    });
    muzzleFx(w, m, { size: 10 + 18 * c, words: big ? w.bigSfx : w.sfx, wordSize: big ? 30 : 22, recoil: w.recoil + 220 * c, kick: spec.kick });
    if (big) burst(m.x, m.y, 10, 'spark', 500, { life: 0.25 });
    tone(big ? 900 : 1800, big ? 120 : 500, big ? 0.4 : 0.12, big ? 0.18 : 0.08, 'square');
  }

  function callStrike() {
    const mark = aimW();
    stats.shots++;
    const dir = mark.x < W / 2 ? -1 : 1; // fly in from the far side, toward the mark
    const fromX = dir > 0 ? -60 : W + 60;
    // hover just above the mark (lower if the mark is near the top of the view)
    const y0 = mark.y - Math.min(110, Math.max(70, mark.y - camY - 40));
    const m = { x: mark.x, y: mark.y };
    marks.push(m);
    // lead drone takes the far spot, so nobody flies through a hovering one
    [1, 0, -1].forEach((k, i) =>
      drones.push({
        x: fromX - dir * i * 80, y: y0 - i * 10, dir, speed: DRONE_SPEED, tilt: 0.16, hover: 0, phase: rand(0, 6),
        dropX: mark.x + k * dir * 85, ty: mark.y + (k ? rand(-18, 18) : 0), main: k === 0, mark: m, dropped: false,
      }),
    );
    say(pick(STRIKE_LINES), 1.6);
    tone(1200, 1500, 0.08, 0.06, 'square');
    tone(1500, 1200, 0.08, 0.06, 'square', 0.1);
  }

  function updateWeapon(dt, now) {
    const w = WEAPONS[weapon];
    // minigun: barrels spin up before firing, then fire faster and spray wider as they heat
    const mini = w.id === 'minigun' && firing;
    if (mini && gun.spinUp === 0) {
      sfx(P.x + 30, P.y - PH - 10, 'WHIRRR...', 20, w.colors);
      tone(150, 600, 0.35, 0.07, 'sawtooth');
    }
    gun.spinUp = mini ? Math.min(1, gun.spinUp + dt / 0.35) : Math.max(0, gun.spinUp - dt / 0.8);
    gun.heat = mini && gun.spinUp >= 1 ? Math.min(1, gun.heat + dt / 2) : Math.max(0, gun.heat - dt / 1.2);
    gun.spin += gun.spinUp * dt * 60;
    gun.loaded = now - lastShot[2] > WEAPONS[2].rate * 0.8;
    gun.t = t;
    const pull = firing || tapped;
    tapped = false;
    if (!pull || won) return;
    if (w.id === 'blaster') {
      // charging: fires on release (a sub-frame tap already fired in onUp)
      if (!firing) return;
      const before = gun.charge;
      gun.charge = Math.min(1, gun.charge + dt / 0.8);
      if (gun.charge === 1 && before < 1) say('FULLY CHARGED!', 0.8);
      return;
    }
    const rate = w.id === 'minigun' ? w.rate - (w.rate - w.minRate) * gun.heat : w.rate;
    if (w.id === 'minigun' && gun.spinUp < 1) return;
    if (now - lastShot[weapon] < rate) return;
    lastShot[weapon] = now;
    if (w.id === 'minigun') {
      const m = launch(w, { kind: 'tracer', speed: w.speed, spread: w.spread + (w.maxSpread - w.spread) * gun.heat, onHit: (x, y) => hit(x, y, w) });
      muzzleFx(w, m, { size: 11, wordSize: 26 });
      boom(0.07, 2600, 0.3);
    } else if (w.id === 'rocket') {
      const m = launch(w, { kind: 'rocket', speed: w.speed, onHit: (x, y) => explode(x, y, w) });
      muzzleFx(w, m, { size: 22, wordSize: 22 });
      cloud(m.x - Math.cos(m.a) * 50, m.y - Math.sin(m.a) * 50, 14, 0.6, '#fbf7ee', '#c9c3d6', -Math.cos(m.a) * 120, -Math.sin(m.a) * 120);
      boom(0.35, 300, 0.5);
    } else {
      callStrike();
    }
  }

  function updateStrikes(dt) {
    const w = WEAPONS[3];
    // Fly in at speed, brake onto the drop point, hover a beat, release,
    // then speed off. Tilt follows speed, like a real quadcopter.
    for (const d of drones) {
      if (!d.dropped) {
        const dist = (d.dropX - d.x) * d.dir;
        d.speed += (Math.min(DRONE_SPEED, Math.max(0, dist) * 5 + 25) - d.speed) * Math.min(1, dt * 6);
        if (dist <= 2) {
          d.x = d.dropX;
          d.speed = 0;
          d.hover += dt;
        }
      } else d.speed = Math.min(DRONE_SPEED, d.speed + 1100 * dt);
      d.x += d.dir * d.speed * dt;
      d.tilt += ((d.speed / DRONE_SPEED) * 0.18 - d.tilt) * Math.min(1, dt * 5);
      if (!d.dropped && d.hover > 0.18) {
        d.dropped = true;
        bombs.push({ x: d.dropX, y: d.y + 21, vy: 0, ty: d.ty, main: d.main, mark: d.mark });
        tone(1500, 380, Math.sqrt((2 * Math.max(10, d.ty - d.y)) / G), 0.05);
      }
      if (d.dropped && (d.x < -120 || d.x > W + 120)) d.done = true;
    }
    drones = drones.filter((d) => !d.done);
    for (const b of bombs) {
      b.vy += G * dt;
      b.y += b.vy * dt;
      if (b.y >= b.ty) {
        b.done = true;
        explode(b.x, b.ty, w, { quiet: !b.main });
        if (b.main) b.mark.done = true;
      }
    }
    bombs = bombs.filter((b) => !b.done);
    marks = marks.filter((m) => !m.done);
  }

  // ---------- reward ----------
  const fmtTime = (s) => `${(s / 60) | 0}:${String(s % 60 | 0).padStart(2, '0')}`;
  const rankFor = (s) => RANKS.find(([max]) => s <= max)[1];

  function win() {
    if (won) return;
    won = true;
    firing = false;
    fireId = null;
    gun.charge = 0;
    keys.clear();
    party = 3;
    document.documentElement.classList.remove('dm-playing'); // real cursor over the reward
    const time = fmtTime(t), rank = rankFor(t);
    for (let i = 0; i < 180; i++)
      fx({ t: 'confetti', x: rand(0, W), y: camY - rand(10, H * 0.6), vx: rand(-90, 90), vy: rand(0, 160), rot: rand(0, 6), va: rand(-10, 10),
        w: rand(5, 10), h: rand(3, 6), color: pick([YELLOW, RED, ORANGE, CYAN, '#fff', '#7cc248']), life: rand(3, 5) });
    [523, 659, 784, 1046].forEach((f, i) => tone(f, f, i === 3 ? 0.7 : 0.18, 0.12, 'square', 0.35 + i * 0.16));
    winEl = document.createElement('div');
    winEl.className = 'dm-win';
    winEl.innerHTML = `<div class="dm-rays"></div>
      <div class="dm-panel dm-card" role="dialog" aria-label="Site destroyed">
        <div class="dm-issue">FINAL ISSUE · #100%</div>
        <div class="dm-burst"><div style="background:#111;clip-path:${burstClip(18, 0.72)}"></div><div style="inset:5px;background:#fff;clip-path:${burstClip(18, 0.72)}"></div></div>
        <h2 class="dm-title">${[...WIN_LETTERS].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</h2>
        <div class="dm-stamp">RANK: ${rank}</div>
        <div class="dm-stats">
          <div style="--i:0"><b>${time}</b><small>TIME</small></div>
          <div style="--i:1"><b>${stats.shots}</b><small>SHOTS FIRED</small></div>
          <div style="--i:2"><b>${stats.booms}</b><small>EXPLOSIONS</small></div>
        </div>
        <div class="dm-actions">
          <button data-shot>📸 Screenshot</button>
          <button data-keep>Keep smashing</button>
          <button data-leave>Exit</button>
        </div>
      </div>`;
    hud.append(winEl);
    winEl.querySelector('[data-shot]').onclick = () => screenshot(time, rank);
    winEl.querySelector('[data-leave]').onclick = () => stop();
    winEl.querySelector('[data-keep]').onclick = () => {
      winEl.remove();
      won = false;
      document.documentElement.classList.add('dm-playing');
    };
    // Buttons stay inert while they're still invisible, so a click meant for
    // the last bomb can't hit an unseen Exit.
    const actions = winEl.querySelector('.dm-actions');
    setTimeout(() => {
      actions.style.pointerEvents = 'auto';
      actions.querySelector('[data-keep]').focus({ preventScroll: true });
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 2300);
  }

  // The wrecked view plus a comic caption, saved (or shared, on phones) as PNG.
  function screenshot(time, rank) {
    const c = document.createElement('canvas');
    c.width = canvas.width;
    c.height = canvas.height;
    const g = c.getContext('2d');
    g.drawImage(canvas, 0, 0);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bw = Math.min(W - 24, 520), bh = 92, bx = (W - bw) / 2, by = H - bh - 22;
    g.fillStyle = INK;
    g.fillRect(bx + 6, by + 6, bw, bh);
    g.fillStyle = YELLOW;
    g.fillRect(bx, by, bw, bh);
    g.lineWidth = 3;
    g.strokeStyle = INK;
    g.strokeRect(bx, by, bw, bh);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    g.font = `${Math.min(44, bw / 9)}px ${FONT}`;
    g.lineWidth = 7;
    g.strokeText(WIN_LETTERS, W / 2 + 3, by + 36 + 3);
    g.fillStyle = RED;
    g.fillText(WIN_LETTERS, W / 2 + 3, by + 36 + 3);
    g.strokeText(WIN_LETTERS, W / 2, by + 36);
    g.fillStyle = '#fff';
    g.fillText(WIN_LETTERS, W / 2, by + 36);
    g.font = `17px ${FONT}`;
    g.fillStyle = INK;
    g.fillText(`${rank} · ${time} · ${location.host}`, W / 2, by + 72);
    const name = 'site-destroyed.png';
    try {
      c.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], name, { type: 'image/png' });
        if (isTouch && navigator.canShare?.({ files: [file] })) {
          try {
            return await navigator.share({ files: [file], title: `I destroyed ${location.host}` });
          } catch (err) {
            if (err.name === 'AbortError') return; // share sheet dismissed
            // anything else: fall back to a download
          }
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }, 'image/png');
    } catch (err) {
      console.error('Screenshot failed:', err); // a cross-origin image tainted the snapshot
    }
  }

  // DEV only: tap the meter to preview the reward screen.
  if (import.meta.env.DEV) {
    const meter = $('[data-meter]');
    meter.style.pointerEvents = 'auto';
    meter.classList.add('dm-dev');
    meter.title = 'DEV: tap to preview the reward screen';
    meter.onclick = win;
    window.__dm = { crater, win, P, size: () => ({ W, Hw, initialSolid, removed }) };
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
    const kdir = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0);
    const dir = kdir || stick.x;
    P.sprint = keys.has('shift') && (dir !== 0 || keys.has('w') || keys.has('s'));
    const sp = P.sprint ? SPRINT : 1;
    P.vx += (dir * SPEED * sp - P.vx) * Math.min(1, dt * (P.ground ? 14 : 5));
    P.thrust = keys.has('w') && !P.ground;
    if (keys.has('w') && P.ground) {
      P.vy = -JUMP * (P.sprint ? 1.2 : 1);
      P.ground = false;
    } else if (P.thrust) {
      // jetpack: holding up keeps lifting
      P.vy = Math.max(-JETPACK_MAX * (P.sprint ? 1.6 : 1), P.vy - JETPACK * (P.sprint ? 1.4 : 1) * dt);
      if (Math.random() < dt * (P.sprint ? 24 : 12)) cloud(P.x - (aimW().x < P.x ? -15 : 15), P.y - 30, 5, 0.45, '#fbf7ee', '#c9c3d6', 0, 120);
    }
    if (P.sprint && P.ground && Math.abs(P.vx) > SPEED && Math.random() < dt * 14)
      cloud(P.x - Math.sign(P.vx) * 12, P.y - 4, 5, 0.35, '#fbf7ee', '#c9c3d6', -P.vx * 0.2, -30);

    // Holding down sinks through whatever is underfoot; after release it only
    // finishes passing through the thing its feet are in.
    const feetIn = () => solid(P.x, P.y - 1);
    P.ghost = keys.has('s') || (P.ghost && feetIn());
    if (P.ghost) {
      P.ground = false;
      P.vy = Math.min(MAX_FALL * sp, Math.max(P.vy, 140 * sp) + G_PLAYER * sp * dt);
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
    camY += (target - camY) * Math.min(1, dt * (P.sprint ? 10 : 7));
  }

  let shownPct = '';
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
    updateWeapon(dt, now);
    updateStrikes(dt);

    // projectiles fly to the crosshair and destroy exactly there
    for (const b of bullets) {
      const step = b.speed * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.trav += step;
      if (b.trav >= b.dist) {
        b.done = true;
        const back = b.trav - b.dist; // land on the exact point
        b.onHit(b.x - Math.cos(b.a) * back, b.y - Math.sin(b.a) * back);
      } else if (b.kind === 'rocket') {
        if (Math.random() < 0.45) cloud(b.x - Math.cos(b.a) * 16, b.y - Math.sin(b.a) * 16, rand(5, 8), 0.55, '#fbf7ee', '#c9c3d6', rand(-15, 15), rand(-25, 0));
      } else if (b.kind === 'plasma' && Math.random() < 0.5) {
        fx({ t: 'spark', x: b.x, y: b.y, vx: rand(-80, 80), vy: rand(-80, 80), life: 0.2, size: 2 });
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

    // celebration fireworks behind the reward screen
    if (party > 0) {
      party -= dt;
      if (Math.random() < dt * 5) {
        const x = rand(W * 0.1, W * 0.9), y = camY + rand(H * 0.1, H * 0.8);
        fx({ t: 'burst', x, y, r: rand(40, 80), shape: starShape(12), rot: rand(0, 6), layers: [pick([RED, CYAN, ORANGE]), YELLOW, '#fffbe6'], life: 0.4 });
        burst(x, y, 14, 'spark', 700, { life: 0.5 });
        sfx(x, y, pick(BOOM_WORDS), 44, ['#fff27a', '#ffb31a', RED]);
        boom(0.5, 600, 0.35);
      }
    }

    for (const p of particles) {
      p.life -= dt;
      if (p.t === 'sfx') {
        p.y -= 26 * dt;
        continue;
      }
      if (p.t === 'burst' || p.t === 'ring' || p.t === 'lines' || p.t === 'screen') continue;
      if (p.t === 'confetti') {
        p.vy = Math.min(p.vy + 240 * dt, 140);
        p.x += (p.vx + Math.sin(t * 4 + p.va) * 50) * dt;
        p.y += p.vy * dt;
        p.rot += p.va * dt;
        continue;
      }
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

    // cooldown shade on slow guns
    WEAPONS.forEach((w, i) => {
      if (w.rate < 800) return;
      const left = Math.max(0, 1 - (now - lastShot[i]) / w.rate);
      cooldowns[i].style.transform = `scaleY(${left.toFixed(2)})`;
    });

    const progress = Math.min(1, removed / Math.max(1, initialSolid * WIN_AT));
    const pct = (progress * 100).toFixed(1) + '%';
    if (shownPct !== pct) {
      shownPct = pct;
      pctEl.textContent = pct;
      fillEl.style.width = pct;
      pctEl.classList.remove('dm-pop');
      void pctEl.offsetWidth;
      pctEl.classList.add('dm-pop');
    }
    if (progress >= 1 && !celebrated) {
      celebrated = true; // once per game; the DEV preview doesn't use it up
      win();
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

    for (const m of marks) drawTarget(ctx, m.x, m.y, t);
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
      } else if (p.t === 'casing' || p.t === 'confetti') {
        ctx.globalAlpha = Math.min(1, kk * 3);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const w = p.w || 7, h = p.h || 3.6;
        ctx.fillStyle = p.color;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = INK;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
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
      if (b.kind === 'rocket') {
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
      } else if (b.kind === 'plasma') {
        const r = b.r * (0.9 + Math.random() * 0.2);
        for (const [c, f] of [[INK, 1.25], [CYAN, 1], ['#fff', 0.5]]) {
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.arc(b.x, b.y, r * f, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // tracer (minigun, orange) / bolt (blaster, cyan)
        const bolt = b.kind === 'bolt';
        ctx.lineCap = 'round';
        for (const [c, w] of [[INK, 6], [bolt ? CYAN : ORANGE, 3.5], [bolt ? '#fff' : '#fff6c8', 1.5]]) {
          ctx.strokeStyle = c;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(b.x - b.vx * (bolt ? 0.024 : 0.016), b.y - b.vy * (bolt ? 0.024 : 0.016));
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const b of bombs) drawBomb(ctx, b.x, b.y);
    for (const d of drones) drawDrone(ctx, d, t);

    // speed lines while sprinting
    if (P.sprint && Math.abs(P.vx) > SPEED * 1.1) {
      const back = -Math.sign(P.vx);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const y = P.y - 12 - i * 16 - Math.random() * 6, x0 = P.x + back * (16 + Math.random() * 8);
        ctx.moveTo(x0, y);
        ctx.lineTo(x0 + back * (22 + Math.random() * 26), y);
      }
      ctx.stroke();
    }

    const flip = aimW().x < P.x;
    drawScarf(ctx, scarf);
    drawHero(ctx, P, aimAngle(), flip, WEAPONS[weapon], t, gun);
    if (gun.charge > 0) {
      // plasma ball gathering at the muzzle, sparks pulled in
      // sits at the barrel mouth, growing outward along the barrel
      const c = gun.charge, r = 3 + 9 * c + (c === 1 ? Math.sin(t * 30) * 1.5 : 0), tip = muzzle(WEAPONS[0]);
      const m = { x: tip.x + Math.cos(tip.a) * r * 0.8, y: tip.y + Math.sin(tip.a) * r * 0.8 };
      ctx.lineWidth = 2;
      ctx.strokeStyle = CYAN;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = t * 9 + i * 1.57, d = r + 8 + ((t * 40 + i * 7) % 12);
        ctx.moveTo(m.x + Math.cos(a) * d, m.y + Math.sin(a) * d);
        ctx.lineTo(m.x + Math.cos(a) * (d - 6), m.y + Math.sin(a) * (d - 6));
      }
      ctx.stroke();
      for (const [col, f] of [[INK, 1.3], [CYAN, 1], ['#fff', 0.5]]) {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(m.x, m.y, r * f, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (speech.life > 0) drawSpeech(ctx, P.x + 18, P.y - PH * 1.1, speech.text, speech.life / speech.max, camY + 110, W);

    for (const p of particles) if (p.t === 'sfx' && view(p)) drawSfx(ctx, p);
    ctx.restore();

    for (const p of particles) {
      if (p.t !== 'screen') continue; // impact frame flash
      ctx.fillStyle = `rgba(255,250,230,${k(p) * 0.4})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (!won) drawCrosshair(ctx, mouse.x, mouse.y);
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
      removeEventListener('resize', onResize);
      removeEventListener('pointerdown', onAnyPointer, true);
      removeEventListener('wheel', onWheel, { capture: true });
      removeEventListener('touchmove', blockTouch, { capture: true });
      document.documentElement.style.overflow = prevOverflow;
      document.documentElement.classList.remove('dm-playing');
      canvas.remove();
      hud.remove();
      audio?.close();
      if (import.meta.env.DEV) delete window.__dm;
      onStop?.();
    },
  };
}
