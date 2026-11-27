// The site's loading indicator: the 7ANV1R monogram drawing itself in outline.
// Styles (.mono-loader) live in index.html so the boot screen can use them
// before any JS. Keep these shapes in sync with the #boot SVG there.
// Colour is currentColor; the line stays ~1.25px at any size.
const MonoLoader = ({ size = 96, className = '', style }) => (
  <svg
    viewBox="0 0 100 100"
    className={`mono-loader ${className}`}
    style={{ width: size, height: size, '--mono-stroke': 125 / size, ...style }}
    aria-hidden="true"
  >
    <polygon className="glyph" style={{ '--i': 0 }} pathLength="1" points="35.21 14.15 35.21 19.88 23.97 49.95 10.69 49.95 21.22 24.03 8.54 24.03 8.54 14.15 35.21 14.15" />
    <polygon className="glyph" style={{ '--i': 1 }} pathLength="1" points="62.06 14.06 62.06 49.95 50.22 49.95 50.22 21.61 39.45 50.04 27 50.04 40.34 14.06 62.06 14.06" />
    <polygon className="glyph" style={{ '--i': 2 }} pathLength="1" points="81.83 14.24 81.83 28.41 73.99 14.24 81.83 14.24" />
    <polygon className="glyph" style={{ '--i': 2 }} pathLength="1" points="73.25 35.97 81.17 50.23 73.39 50.23 73.25 50.09 73.25 35.97" />
    <line className="glyph" style={{ '--i': 2 }} pathLength="1" x1="93.7" y1="14.06" x2="93.7" y2="50.04" />
    <polygon className="glyph" style={{ '--i': 3 }} pathLength="1" points="16.19 81.19 26.82 52.85 39.4 52.85 25.93 88.83 4.35 88.83 4.35 52.85 16.05 52.85 16.19 52.99 16.19 81.19" />
    <polygon className="glyph" style={{ '--i': 4 }} pathLength="1" points="55.12 52.85 55.12 88.83 43.1 88.83 43.1 62.63 41.88 62.64 42.18 54.59 45.38 52.85 55.12 52.85" />
    <path className="glyph" style={{ '--i': 5 }} pathLength="1" d="M58.61,52.8h16.65c6.84.31,11.48,3.08,11.89,10.39.23,4.21-.73,8.08-4.56,10.32l-.02.12,5.32,15.25h-12.87l-3.53-12.35-.94-.05v12.4h-11.93v-36.08ZM70.36,69.3h2.19c.4,0,1.06-.63,1.24-1,.57-1.14.61-4.46-.35-5.39-.13-.12-.75-.51-.89-.51h-2.19v6.9Z" />
  </svg>
);

export default MonoLoader;
