import { useEffect, useId, useRef } from 'react';
import './Icon.css';

// Every icon on the site, drawn inline so its parts can move.
//
// The geometry is NOT a lookalike: each `d` is the exact string from the
// react-icons glyph it replaces (named per entry), only split into parts. A
// split that lands on a relative `m` was rewritten to its absolute start, so
// standing still these are pixel-identical to the old icons.
//
// The motion lives in Icon.css. Every flourish starts and ends at the plain
// icon (keyframes are identity at 0% and 100%), so a flourish is a moment,
// never a permanent change. Accents that only exist mid-flourish (stars,
// hearts, rings) are always mounted at opacity 0.

const LINE = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' };
const SOLID = { fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0 };

// The mail letter's rise and sink. The letter is DRAWN at rest (tucked inside,
// clipped away), so before/after the animation it is simply not there; shared by the letter and its mask so they never drift.
const LETTER_MOVE = (
  <animateTransform
    attributeName="transform"
    type="translate"
    begin="indefinite"
    dur="1.4s"
    calcMode="spline"
    values="0 0; 0 0; 0 -11.6; 0 -11; 0 -11; 0 0; 0 0"
    keyTimes="0; 0.22; 0.45; 0.52; 0.62; 0.8; 1"
    keySplines="0 0 1 1; 0.2 0.8 0.3 1; 0.4 0 0.6 1; 0 0 1 1; 0.4 0 1 1; 0 0 1 1"
  />
);

const ICONS = {
  // hi2 HiOutlineUser — hops up and nods hello
  user: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 1.5 },
    body: (
      <>
        <path className="p-body" d="M4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        <path className="p-head" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </>
    ),
  },
  // hi2 HiOutlineBriefcase — picked up by the handle, swings
  briefcase: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 1.5 },
    body: (
      <>
        <path className="p-handle" d="M15.75 6.144V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894" />
        <path className="p-case" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
      </>
    ),
  },
  // hi2 HiOutlineBuildingOffice — lights come on floor by floor, door opens
  office: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 1.5 },
    body: (
      <>
        <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18" />
        {['M9 6.75h1.5', 'M13.5 6.75H15', 'M9 9.75h1.5', 'M13.5 9.75H15', 'M9 12.75h1.5', 'M13.5 12.75H15'].map((d, i) => (
          <path key={d} className="p-win" style={{ '--i': i }} d={d} />
        ))}
        <path className="p-door" d="M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </>
    ),
  },
  // hi2 HiOutlineWrenchScrewdriver — wrench turns a bolt, screwdriver jabs
  tools: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 1.5 },
    body: (
      <>
        <path className="p-driver" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M10.016 11.607L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26M18.375 18.375L15.75 15.75" />
        <path className="p-wrench" d="M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63M15.124 11.374c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085M10.015 11.606l1.745-1.437M4.867 19.125h.008v.008h-.008v-.008Z" />
      </>
    ),
  },
  // io5 IoGameControllerOutline — rumbles, buttons get mashed
  controller: {
    box: '0 0 512 512',
    a: SOLID,
    body: (
      <g className="p-pad">
        <path fill="none" strokeMiterlimit="10" strokeWidth="32" d="M467.51 248.83c-18.4-83.18-45.69-136.24-89.43-149.17A91.5 91.5 0 0 0 352 96c-26.89 0-48.11 16-96 16s-69.15-16-96-16a99.09 99.09 0 0 0-27.2 3.66C89 112.59 61.94 165.7 43.33 248.83c-19 84.91-15.56 152 21.58 164.88 26 9 49.25-9.61 71.27-37 25-31.2 55.79-40.8 119.82-40.8s93.62 9.6 118.66 40.8c22 27.41 46.11 45.79 71.42 37.16 41.02-14.01 40.44-79.13 21.43-165.04z" />
        <circle className="p-btn" style={{ '--i': 0 }} cx="336" cy="180" r="20" />
        <circle className="p-btn" style={{ '--i': 1 }} cx="380" cy="224" r="20" />
        <path className="p-btn" style={{ '--i': 2 }} d="M336 288a20 20 0 1 1 20-19.95A20 20 0 0 1 336 288z" />
        <circle className="p-btn" style={{ '--i': 3 }} cx="292" cy="224" r="20" />
        <path fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M160 176v96m48-48h-96" />
      </g>
    ),
  },
  // ThemeToggle's own sun — rays spin a notch (8-fold, so 90° lands home)
  sun: {
    box: '0 0 20 20',
    a: SOLID,
    body: (
      <path
        className="p-sun"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
      />
    ),
  },
  // ThemeToggle's own moon — rocks like a cradle, two stars twinkle
  moon: {
    box: '0 0 20 20',
    a: SOLID,
    body: (
      <>
        <path className="p-moon" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        <path className="p-star" style={{ '--i': 0 }} d="M14 2.2l.45 1.15 1.15.45-1.15.45L14 5.4l-.45-1.15-1.15-.45 1.15-.45z" />
        <path className="p-star" style={{ '--i': 1 }} d="M17.4 6.4l.3.8.8.3-.8.3-.3.8-.3-.8-.8-.3.8-.3z" />
      </>
    ),
  },
  // fi FiGithub — the octocat waves
  github: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 2 },
    body: (
      <>
        <path className="p-arm" d="M9 19c-5 1.5-5-2.5-7-3" />
        <path className="p-cat" d="M16 22v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </>
    ),
  },
  // fi FiLinkedin — the i's dot jumps and lands on its stem
  linkedin: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 2 },
    body: (
      <>
        <path className="p-n" d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect className="p-stem" x="2" y="9" width="4" height="12" />
        <circle className="p-dot" cx="4" cy="4" r="2" />
      </>
    ),
  },
  // fi FiMail — opens: flap swings up, a letter slides out and back, flap snaps shut.
  // SMIL, not CSS: it moves the flap's real points, so the stroke never thins
  // the way a scaleY flip squashes it. Letter is clipped at the envelope's top
  // edge (it lives inside) and masks the open flap (it stands in front of it).
  mail: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 2 },
    body: (id) => (
      <>
        <defs>
          <clipPath id={`${id}c`}>
            <rect x="-4" y="-12" width="32" height="15.5" />
          </clipPath>
          <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="-4" y="-12" width="32" height="40">
            <rect x="-4" y="-12" width="32" height="40" fill="#fff" stroke="none" />
            <g clipPath={`url(#${id}c)`}>
              <rect x="6" y="6.5" width="12" height="10" fill="#000" stroke="#000" strokeWidth="4">
                {LETTER_MOVE}
              </rect>
            </g>
          </mask>
        </defs>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" mask={`url(#${id}m)`}>
          <animate
            attributeName="points"
            begin="indefinite"
            dur="1.4s"
            calcMode="spline"
            values="22,6 12,13 2,6; 22,6 12,6 2,6; 22,6 12,-0.3 2,6; 22,6 12,0.5 2,6; 22,6 12,0.5 2,6; 22,6 12,6 2,6; 22,6 12,13.8 2,6; 22,6 12,13 2,6"
            keyTimes="0; 0.1; 0.2; 0.27; 0.8; 0.88; 0.95; 1"
            keySplines="0.4 0 1 1; 0 0 0.6 1; 0.4 0 0.6 1; 0 0 1 1; 0.4 0 1 1; 0 0 0.6 1; 0.4 0 0.6 1"
          />
        </polyline>
        <g clipPath={`url(#${id}c)`}>
          <g strokeWidth="1.5">
            {LETTER_MOVE}
            <rect x="6" y="6.5" width="12" height="10" rx="1" />
            <path d="M9 9.5h6M9 12h4" />
          </g>
        </g>
      </>
    ),
  },
  // hi HiOutlineCode — brackets push apart, the slash flips
  code: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 2 },
    body: (
      <>
        <path className="p-lt" d="M6 16l-4-4 4-4" />
        <path className="p-sl" d="M10 20l4-16" />
        <path className="p-gt" d="M18 8l4 4-4 4" />
      </>
    ),
  },
  // hi HiOutlineTemplate — layout blocks hop into place one by one
  template: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 2 },
    body: (
      <>
        <path className="p-blk" style={{ '--i': 0 }} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
        <path className="p-blk" style={{ '--i': 1 }} d="M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
        <path className="p-blk" style={{ '--i': 2 }} d="M16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </>
    ),
  },
  // hi HiOutlineArrowRight — winds back, then dashes
  arrowRight: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 2 },
    body: (
      <>
        <path className="p-shaft" d="M21 12H3" />
        <path className="p-head" d="M14 5l7 7m0 0l-7 7" />
      </>
    ),
  },
  // fi FiArrowUpRight — launches out the corner, comes back round
  arrowUpRight: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 2 },
    body: (
      <g className="p-all">
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
      </g>
    ),
  },
  // hi HiOutlinePhotograph — the sun rises over the hills
  photo: {
    box: '0 0 24 24',
    a: { ...LINE, strokeWidth: 2 },
    body: (
      <>
        <path className="p-sun" d="M14 8h.01" />
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
        <path className="p-hill" d="M14 14l1.586-1.586a2 2 0 012.828 0L20 14" />
        <path d="M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </>
    ),
  },
  // fa FaGamepad — rumbles
  gamepad: {
    box: '0 0 640 512',
    a: SOLID,
    body: <path className="p-all" d="M480.07 96H160a160 160 0 1 0 114.24 272h91.52A160 160 0 1 0 480.07 96zM248 268a12 12 0 0 1-12 12h-52v52a12 12 0 0 1-12 12h-24a12 12 0 0 1-12-12v-52H84a12 12 0 0 1-12-12v-24a12 12 0 0 1 12-12h52v-52a12 12 0 0 1 12-12h24a12 12 0 0 1 12 12v52h52a12 12 0 0 1 12 12zm216 76a40 40 0 1 1 40-40 40 40 0 0 1-40 40zm64-96a40 40 0 1 1 40-40 40 40 0 0 1-40 40z" />,
  },
  // fa FaYoutube — the play button gets pressed
  youtube: {
    box: '0 0 576 512',
    a: SOLID,
    body: <path className="p-all" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />,
  },
  // fa FaInstagram — shutter click with a flash ring
  instagram: {
    box: '0 0 448 512',
    a: SOLID,
    body: (
      <>
        <path className="p-all" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
        <circle className="p-flash" cx="224" cy="256" r="115" fill="none" strokeWidth="28" />
      </>
    ),
  },
  // fa FaTwitter — hops and chirps
  twitter: {
    box: '0 0 512 512',
    a: SOLID,
    body: <path className="p-all" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />,
  },
  // fa FaFacebook — a tilt-and-pop "like"
  facebook: {
    box: '0 0 512 512',
    a: SOLID,
    body: <path className="p-all" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" />,
  },
  // fa FaLinkedin — hops
  linkedinSolid: {
    box: '0 0 448 512',
    a: SOLID,
    body: <path className="p-all" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />,
  },
  // fa FaFileAlt — the page lifts off the desk
  file: {
    box: '0 0 384 512',
    a: SOLID,
    body: <path className="p-all" d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm64 236c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-64c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-72v8c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zm96-114.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z" />,
  },
  // fa FaHeart — lub-dub
  heart: {
    box: '0 0 512 512',
    a: SOLID,
    body: <path className="p-all" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z" />,
  },
  // fa FaApple — the leaf flutters
  apple: {
    box: '0 0 384 512',
    a: SOLID,
    body: (
      <>
        <path className="p-fruit" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9z" />
        <path className="p-leaf" d="M262.1 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </>
    ),
  },
  // fa FaGooglePlay — nudged like a play button
  googlePlay: {
    box: '0 0 512 512',
    a: SOLID,
    body: <path className="p-all" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />,
  },
};

/**
 * One icon that plays its flourish when its host is hovered (mouse/pen),
 * clicked/tapped, or keyboard-focused. The host is the nearest `trigger`
 * ancestor, so the whole button/link/card reacts, not just the glyph.
 */
const Icon = ({ name, size = '1em', trigger = 'a,button,label,.group', className = '', ...rest }) => {
  const ref = useRef(null);
  const uid = 'i' + useId().replace(/[^\w-]/g, '');

  useEffect(() => {
    const svg = ref.current;
    const host = svg.closest(trigger) || svg;
    // Restart: drop the class, force a style flush, add it back.
    const play = () => {
      svg.classList.remove('ico-play');
      svg.getBoundingClientRect();
      svg.classList.add('ico-play');
      // SMIL flourishes (mail) restart here; CSS can't see them, so honour reduced motion by hand.
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        svg.querySelectorAll('animate, animateTransform').forEach((a) => a.beginElement());
      }
    };
    // Touch fires pointerenter right before the tap; let the click play it once.
    const onEnter = (e) => e.pointerType !== 'touch' && play();
    const onFocus = (e) => e.target.matches?.(':focus-visible') && play();
    // Clear once every flourish has finished.
    const onEnd = () => {
      if (!svg.getAnimations({ subtree: true }).some((a) => a.animationName?.startsWith('ico-'))) {
        svg.classList.remove('ico-play');
      }
    };
    host.addEventListener('pointerenter', onEnter);
    host.addEventListener('click', play);
    host.addEventListener('focusin', onFocus);
    svg.addEventListener('animationend', onEnd);
    return () => {
      host.removeEventListener('pointerenter', onEnter);
      host.removeEventListener('click', play);
      host.removeEventListener('focusin', onFocus);
      svg.removeEventListener('animationend', onEnd);
    };
  }, [trigger]);

  const { box, a, body } = ICONS[name];
  return (
    <svg
      ref={ref}
      viewBox={box}
      width={size}
      height={size}
      {...a}
      className={`ico ico-${name} ${className}`}
      aria-hidden="true"
      {...rest}
    >
      {typeof body === 'function' ? body(uid) : body}
    </svg>
  );
};

export default Icon;
