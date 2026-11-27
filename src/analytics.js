// PostHog analytics, tuned to stay well inside the free tier:
// ~2 auto events per visit ($pageview + $pageleave) plus a few explicit ones,
// and a lightweight session replay. Autocapture, heatmaps, web vitals etc. are off.

// Set at build time (GitHub repo → Settings → Secrets and variables → Actions → Variables,
// passed in by .github/workflows/deploy.yml). The phc_ token is public by design.
const KEY = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN ?? '';
// US cloud: https://us.i.posthog.com, EU cloud: https://eu.i.posthog.com
const HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

// Production only: a prod build served from the real domain. `npm run dev`,
// `vite preview`, LAN IPs and GitHub preview URLs all stay silent.
const PROD_HOSTS = ['tanvir.wiki', 'www.tanvir.wiki'];
const enabled =
  import.meta.env.PROD &&
  KEY.startsWith('phc_') &&
  PROD_HOSTS.includes(location.hostname);

let ph;
const queue = [];

export const track = (event, props) => {
  if (!enabled) return;
  if (ph) ph.capture(event, props);
  else queue.push([event, props]);
};

export function initAnalytics() {
  if (!enabled) return;
  // Lazy chunk: keeps posthog out of the main bundle and off the critical path.
  import('posthog-js').then(({ default: posthog }) => {
    // ponytail: no `defaults` snapshot; newest ('2026-08-30') only tweaks replay + adds JSON-LD
    // props, so everything is set explicitly below instead.
    posthog.init(KEY, {
      api_host: HOST,
      person_profiles: 'identified_only', // we never identify → anonymous events only (cheapest)
      // Replay needs PostHog's remote config, but we never evaluate feature flags (saves flag quota).
      advanced_disable_feature_flags: true,
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true, // gives time on page + scroll depth
      // Replay only runs if "Record user sessions" is on in PostHog → Settings → Session replay.
      session_recording: {
        maskAllInputs: true, // contact form text never leaves the browser
        sampling: { mousemove: 200 }, // cursor position every 200ms: choppy but readable, less data
        session_idle_threshold_ms: 30_000, // pause recording after 30s with no input (default 5 min)
      },
      enable_recording_console_log: false,
      capture_heatmaps: false,
      capture_dead_clicks: false,
      capture_performance: false,
      capture_exceptions: false,
      disable_surveys: true,
      disable_product_tours: true,
      disable_conversations: true,
    });
    ph = posthog;
    queue.splice(0).forEach(([e, p]) => ph.capture(e, p));
  });

  // Every <a href> click (socials, resume, email) — one listener instead of per-link calls.
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (a) track('link_clicked', { url: a.href });
  });
}

// A section counts as "viewed" after 1.5s centred on screen, once per page load,
// so fast scrolls / nav jumps through it don't count.
const DWELL_MS = 1500;
const seen = new Set();
const timers = new Map();

// Call after the layout renders; returns cleanup. Re-run when Desktop/Mobile layouts swap.
export function watchSections() {
  if (!enabled) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        const name = target.dataset.section;
        if (seen.has(name)) continue;
        clearTimeout(timers.get(name));
        if (isIntersecting) {
          timers.set(
            name,
            setTimeout(() => {
              seen.add(name);
              track('section_viewed', { section: name });
            }, DWELL_MS),
          );
        }
      }
    },
    { rootMargin: '-45% 0px -45% 0px' }, // band across the middle of the viewport
  );
  document.querySelectorAll('[data-section]').forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    timers.forEach(clearTimeout);
  };
}
