# Hover Effect During Scroll

## 🧠 Problem

By default, browsers **disable CSS `:hover` styles during active scrolling** to improve performance.
If the user **keeps the mouse still** (e.g., in the center of the screen) and uses the scroll wheel, elements scrolling under the cursor **do not get hover effects** until scrolling stops.

This creates a **poor UX** for apps or portfolios relying on hover-based interactivity.

---

## ✅ Goal

Allow elements to **appear hovered even while scrolling**, **without waiting for scroll to stop**, if the pointer is over them.

---

## 🚀 Current Implementation (Prototype)

We track the mouse position and manually detect which element is under it during scroll. That element is given a `.hover` class, which simulates the `:hover` state.

### JS Logic (React)

```jsx
useEffect(() => {
  const mouseRef = { x: -1, y: -1 };
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  const onMouseMove = (e) => {
    mouseRef.x = e.clientX;
    mouseRef.y = e.clientY;

    if (!isScrolling.current) {
      document
        .querySelectorAll('.hover-item.hover')
        .forEach((el) => el.classList.remove('hover'));
    }
  };

  const onScroll = () => {
    isScrolling.current = true;
    document.body.classList.add('scrolling');

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    requestAnimationFrame(() => {
      const el = document.elementFromPoint(mouseRef.x, mouseRef.y);
      document.querySelectorAll('.hover-item').forEach((item) => {
        item.classList.toggle('hover', item === el);
      });
    });

    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
      document.body.classList.remove('scrolling');
      document
        .querySelectorAll('.hover-item.hover')
        .forEach((el) => el.classList.remove('hover'));

      // Restore native hover
      const el = document.elementFromPoint(mouseRef.x, mouseRef.y);
      if (el) {
        el.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles: true,
            cancelable: true,
            clientX: mouseRef.x,
            clientY: mouseRef.y,
          }),
        );
      }
    }, 100);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
  };
}, []);
```

### CSS

```css
.hover-item:hover,
.hover-item.hover {
  background: #d0f0ff;
  border-color: #6dd;
}

body.scrolling .hover-item:hover {
  pointer-events: none;
  background: white;
  border-color: #ddd;
}
```

---

## 🔍 Issues with Current Implementation

- ⚠️ `:hover` suppression is hacked via `.scrolling` + `pointer-events: none`.
- ⚠️ Requires DOM access and manual class management.
- ⚠️ Triggers synthetic events (`pointermove`) to restore `:hover`, which is non-standard and inconsistent across browsers.
- ⚠️ Fragile under high frame drops or scroll acceleration (macOS inertia scroll).

---

## 🛠 Future Plan: Making it Standard & Production-Ready

1. **Extract to Hook**
   Create a reusable hook like:

   ```tsx
   useScrollAwareHover({
     selector: '.hover-item',
     container: window,
   });
   ```

   Wrap internal listeners, refs, and cleanup for DRY usage.

2. **Native-Like Hover Sync**
   Explore alternatives:

   - `IntersectionObserver` + static cursor position (may improve performance).
   - Tracking `:hover` via `CSS.paintWorklet` or `:has(:hover)` once fully supported.

3. **Add Feature Detection**
   Only apply workaround if browser exhibits scroll-hover-throttle (Chrome/Edge/Firefox) — skip on Safari where hover remains active during scroll.

4. **Fallback for Mobile**
   Ignore logic entirely on touch-only devices (no hover on mobile):

   ```js
   if ('ontouchstart' in window) return;
   ```
