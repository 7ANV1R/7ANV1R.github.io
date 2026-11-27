// Material 3 Expressive-style "cookie" shapes, shared by the cursor dot and
// the title reveal: [lobes, lobe depth]. Blobs spin slowly and morph from one
// shape to the next.
const SHAPES = [
  [9, 0.085],
  [4, 0.13],
  [7, 0.09],
  [12, 0.05],
  [6, 0.1],
];
const SHAPE_HOLD_S = 2.4; // time per shape (the last 40% is the morph)
const SPIN_RAD_S = 0.35;

/** Deepest lobe, so callers can keep a blob inside a box: r * (1 + MAX_DEPTH). */
export const MAX_DEPTH = Math.max(...SHAPES.map(([, a]) => a));

/** clip-path polygon for a cookie blob of radius r at (x, y), at `time` seconds. */
export function blobPath(x, y, r, time, still = false, points = 144) {
  if (r < 0.5) return 'circle(0 at 0 0)';
  const seg = time / SHAPE_HOLD_S;
  const i = Math.floor(seg) % SHAPES.length;
  const [n1, a1] = SHAPES[still ? 0 : i];
  const [n2, a2] = SHAPES[(i + 1) % SHAPES.length];
  let m = still ? 0 : Math.min(1, Math.max(0, ((seg % 1) - 0.6) / 0.4));
  m = m * m * (3 - 2 * m); // smoothstep
  const rot = still ? 0 : time * SPIN_RAD_S;
  const pts = [];
  for (let k = 0; k < points; k++) {
    const t = (k / points) * Math.PI * 2;
    const wave = (1 - m) * a1 * Math.cos(n1 * (t + rot)) + m * a2 * Math.cos(n2 * (t + rot));
    const rr = r * (1 + wave);
    pts.push(`${(x + rr * Math.cos(t)).toFixed(1)}px ${(y + rr * Math.sin(t)).toFixed(1)}px`);
  }
  return `polygon(${pts.join(',')})`;
}
