# Scroll-Aware Hover Effects

## 📖 Overview

This document explains the implementation of scroll-aware hover effects that allow elements to show hover states during scroll without moving the mouse. This solves the common UX issue where browsers disable CSS `:hover` styles during active scrolling.

## 🎯 Problem Solved

**Default Browser Behavior**: Browsers disable CSS `:hover` styles during scroll to improve performance. This creates poor UX when users scroll with a stationary mouse - elements passing under the cursor don't show hover effects until scrolling stops.

**Our Solution**: Track mouse position and manually apply hover effects to elements under the cursor during scroll, providing seamless hover feedback.

## 🏗️ Architecture

### Core Components

1. **Custom Hook**: `useScrollAwareHover()` - Main logic for scroll detection and hover management
2. **CSS Classes**: `.scroll-hover` - Applied to elements during scroll hover
3. **CSS Rules**: Specific rules that mirror `:hover` and `group-hover:` effects
4. **Exclusion System**: `no-scroll-hover` class to opt-out specific elements

## 📁 File Structure

```
src/
├── hooks/
│   └── useScrollAwareHover.js    # Main hook implementation
├── index.css                     # CSS rules for scroll hover effects
└── App.jsx                       # Global hook initialization
```

## 🔧 Implementation Details

### 1. Custom Hook (`useScrollAwareHover.js`)

#### Key Features:

- **Multi-container support**: Works with both window and container scrolling
- **Mouse movement detection**: Debounced mouse movement to distinguish from scroll
- **Element detection**: Uses `document.elementFromPoint()` to find elements under cursor
- **Hoverable element detection**: Identifies elements with hover classes
- **Performance optimization**: Element caching with WeakMap for better performance
- **Memory management**: Proper cleanup of event listeners and timeouts

#### Core Logic:

```javascript
// Track mouse position and detect movement
const handleMouseMove = (e) => {
  mousePosition.current.x = e.clientX;
  mousePosition.current.y = e.clientY;
  isMouseMoving.current = true;

  // Clear scroll hover when mouse moves
  if (lastHoveredElement.current) {
    lastHoveredElement.current.classList.remove('scroll-hover');
  }
};

// Handle scroll events
const handleScroll = () => {
  if (isMouseMoving.current) return; // Skip if mouse is moving

  requestAnimationFrame(() => {
    const elementUnderMouse = document.elementFromPoint(
      mousePosition.current.x,
      mousePosition.current.y,
    );

    const hoverableElement = findClosestHoverableElement(elementUnderMouse);

    if (hoverableElement && hoverableElement !== lastHoveredElement.current) {
      // Apply scroll hover
      hoverableElement.classList.add('scroll-hover');
      lastHoveredElement.current = hoverableElement;
    }
  });
};
```

### 2. CSS Implementation (`index.css`)

#### Base Rules:

```css
/* Scroll hover base class */
.scroll-hover {
  transition: all 0.3s ease;
}

/* Group hover effects */
.scroll-hover.group .group-hover\:text-accent {
  color: var(--accent) !important;
}

.scroll-hover.group .group-hover\:scale-\[1\.02\] {
  transform: scale(1.02) !important;
}

/* Individual hover effects */
.scroll-hover.hover\:text-accent {
  color: var(--accent) !important;
}

.scroll-hover.hover\:scale-105 {
  transform: scale(1.05) !important;
}
```

#### Exclusion System:

```css
/* Elements with this class are excluded from scroll hover */
.no-scroll-hover {
  /* This element will only respond to native hover */
}
```

### 3. Global Initialization (`App.jsx`)

```javascript
import useScrollAwareHover from './hooks/useScrollAwareHover';

const App = () => {
  useScrollAwareHover(); // Initialize globally
  return (
    // ... app content
  );
};
```

## 🚀 How to Implement for New Sections

### Step 1: Add Hover Classes

Ensure your elements have proper hover classes:

```jsx
// For individual hover effects
<div className="hover:scale-105 hover:text-accent transition-all duration-300">
  Content
</div>

// For group hover effects
<div className="group cursor-pointer">
  <h3 className="group-hover:text-accent">Title</h3>
  <p className="group-hover:opacity-100">Description</p>
</div>
```

### Step 2: Add CSS Rules (if needed)

If using custom hover effects, add corresponding scroll hover rules:

```css
/* For your custom hover class */
.scroll-hover.your-custom-hover-class {
  /* Your hover styles here */
  background-color: var(--accent) !important;
  transform: translateY(-2px) !important;
}
```

### Step 3: Exclude Elements (optional)

If you don't want scroll hover on specific elements:

```jsx
<div className="hover:scale-105 no-scroll-hover">
  This element only responds to mouse hover
</div>
```

## 📋 Supported Hover Effects

### Individual Hover Effects

- `hover:scale-*` → `scroll-hover.hover:scale-*`
- `hover:text-*` → `scroll-hover.hover:text-*`
- `hover:bg-*` → `scroll-hover.hover:bg-*`
- `hover:opacity-*` → `scroll-hover.hover:opacity-*`
- `hover:translate-*` → `scroll-hover.hover:translate-*`

### Group Hover Effects

- `group-hover:scale-*` → `scroll-hover.group .group-hover:scale-*`
- `group-hover:text-*` → `scroll-hover.group .group-hover:text-*`
- `group-hover:opacity-*` → `scroll-hover.group .group-hover:opacity-*`
- `group-hover:translate-*` → `scroll-hover.group .group-hover:translate-*`

## ⚙️ Configuration Options

### Hook Parameters

Currently, the hook is designed for global use. For future enhancements, consider:

```javascript
// Future enhancement - configurable options
useScrollAwareHover({
  selector: '.custom-hover', // Custom selector
  container: document.querySelector('.scroll-container'), // Specific container
  debounceTime: 150, // Custom debounce time
  scrollTimeout: 200, // Custom scroll timeout
});
```

### CSS Customization

You can customize the transition timing and easing:

```css
.scroll-hover {
  transition: all 0.3s ease; /* Customize timing */
}

/* Custom easing for specific effects */
.scroll-hover.hover\:scale-105 {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 🔍 Debugging

### Common Issues

1. **Hover not working during scroll**

   - Check if element has proper hover classes
   - Verify element isn't excluded with `no-scroll-hover`
   - Check browser console for errors

2. **Flickering effects**

   - Ensure CSS rules have `!important` for proper specificity
   - Check for conflicting inline styles
   - Verify no duplicate CSS rules

3. **Performance issues**
   - Reduce scroll timeout (currently 150ms)
   - Check for too many hoverable elements
   - Monitor scroll event frequency

### Debug Mode

Add console logs for debugging:

```javascript
// In useScrollAwareHover.js
console.log('Scroll hover applied to:', hoverableElement);
console.log('Found scrollable containers:', scrollableContainers.length);
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Hover effects work during scroll
- [ ] Hover effects stop when mouse moves
- [ ] Native hover resumes after scroll stops
- [ ] No flickering or glitches
- [ ] Works on both desktop and mobile layouts
- [ ] Excluded elements don't respond to scroll hover

### Browser Compatibility

- ✅ Chrome/Edge (Chromium-based)
- ✅ Firefox
- ✅ Safari (limited - hover remains active during scroll)
- ✅ Mobile browsers (automatically disabled)

## 🔮 Future Enhancements

### Potential Improvements

1. **Intersection Observer**: Use `IntersectionObserver` for better performance
2. **CSS Paint Worklet**: Native CSS solution when fully supported
3. **Feature Detection**: Detect browser scroll-hover behavior
4. **Custom Selectors**: Allow custom hover class patterns
5. **Animation Control**: Fine-grained control over transition timing

### Performance Optimizations

1. **Throttling**: Implement scroll event throttling
2. **Element Pooling**: Reuse DOM queries
3. **Lazy Detection**: Only detect hoverable elements when needed
4. **Container Caching**: Cache scrollable containers

## 📚 References

- [MDN: elementFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint)
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [CSS Hover Pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:hover)
- [Browser Scroll Behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior)

---

**Last Updated**: July 2024
**Version**: 1.0.0
**Maintainer**: Development Team
