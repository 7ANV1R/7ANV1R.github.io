import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

// Inline app name (+ tiny icon) that reveals App Store / Play Store links.
// Hover opens it on desktop (CSS group-hover); tap toggles it on touch.
// The popup is always mounted and only toggles classes: SplitText rewrites the
// text nodes inside the paragraph, so React must never insert/remove nodes here.
const AppLink = ({ app }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const stores = [
    { href: app.appStore, label: 'App Store', icon: <Icon name="apple" size={15} /> },
    { href: app.playStore, label: 'Google Play', icon: <Icon name="googlePlay" size={14} /> },
  ];

  return (
    <span ref={ref} data-app-link className="group relative inline-block">
      <button
        type="button"
        aria-label={`${app.name}: show store links`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="font-semibold cursor-pointer"
        style={{ color: 'var(--text-primary)' }}
      >
        {app.icon && (
          <img
            src={app.icon}
            alt=""
            width="16"
            height="16"
            loading="lazy"
            decoding="async"
            className="inline-block w-[1em] h-[1em] rounded-[22%] mr-[0.3em] align-[-0.15em]"
          />
        )}
        {app.name}
      </button>

      {/* Outer: positions + bridges the gap (pb-1) so the pointer can travel
          up into the popup. Inner: fades/rises in from just above the name. */}
      <span
        className={`absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 pb-1 z-20 group-hover:pointer-events-auto group-focus-within:pointer-events-auto ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <span
          className={`flex gap-0.5 p-0.5 rounded-lg shadow-lg origin-bottom transition duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 ${
            open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'
          }`}
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}
        >
          {stores.map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${app.name} on ${label}`}
              title={label}
              className="p-1.5 rounded-md hover:opacity-70"
              style={{ color: 'var(--text-primary)' }}
            >
              {icon}
            </a>
          ))}
        </span>
      </span>
    </span>
  );
};

export default AppLink;
