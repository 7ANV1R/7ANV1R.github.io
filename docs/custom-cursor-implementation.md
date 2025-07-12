# Custom Company Logo Cursor Implementation

## 📖 Overview

This document describes the implementation of a custom cursor that displays company logos when hovering over work experience items. The cursor integrates with GSAP for smooth animations and the existing scroll-aware hover system.

## 🎯 Features

- **Company Logo Display**: Shows company logos as custom cursor when hovering over work experience items
- **GSAP Animations**: Smooth cursor movement and transitions using GSAP
- **Scroll-Aware Integration**: Works with existing scroll-aware hover system
- **Performance Optimized**: Uses requestAnimationFrame and proper cleanup
- **Responsive Design**: Works across different screen sizes
- **Error Handling**: Gracefully handles missing or failed logo loads

## 🏗️ Architecture

### Core Components

1. **CompanyLogoCursor**: Main cursor component with GSAP animations
2. **WorkExperience**: Updated to include data attributes for logo detection
3. **useScrollAwareHover**: Enhanced to recognize work experience items
4. **CSS Rules**: Added hover effects for work experience items

### File Structure

```
src/
├── components/
│   ├── ui/
│   │   └── CompanyLogoCursor.jsx    # Main cursor component
│   └── sections/
│       └── WorkExperience.jsx       # Updated with data attributes
├── hooks/
│   └── useScrollAwareHover.js       # Enhanced hover detection
├── data/
│   └── work_experience.json         # Company logo paths
├── assets/
│   └── experience/                  # Company logo SVGs
└── App.jsx                          # Global cursor initialization
```

## 🔧 Implementation Details

### 1. CompanyLogoCursor Component

#### Key Features:

- **GSAP Integration**: Smooth animations for cursor movement and visibility
- **Logo Detection**: Automatically detects company logos from work experience items
- **Scroll Integration**: Works with existing scroll-aware hover system
- **Performance Optimization**: Uses requestAnimationFrame and proper cleanup
- **Error Handling**: Handles missing logos gracefully

#### Core Logic:

```javascript
// GSAP animation for smooth cursor movement
const animateCursor = useCallback((x, y) => {
  if (!cursorRef.current) return;

  // Cancel any pending animation frame
  if (animationFrameRef.current) {
    cancelAnimationFrame(animationFrameRef.current);
  }

  // Use requestAnimationFrame for smooth performance
  animationFrameRef.current = requestAnimationFrame(() => {
    gsap.to(cursorRef.current, {
      x: x - 30, // Center the 60x60 cursor
      y: y - 30,
      duration: 0.3,
      ease: 'power2.out',
    });
  });
}, []);

// Logo detection from work experience items
const getCompanyLogo = useCallback((element) => {
  if (!element) return null;

  // Find the closest work experience item
  const workItem =
    element.closest('.work-experience-item') ||
    element.closest('[data-work-item]') ||
    element;

  // Try to get logo from data attribute first
  const logoFromData = workItem.getAttribute('data-company-logo');
  if (logoFromData) {
    return logoFromData;
  }

  return null;
}, []);
```

### 2. WorkExperience Component Updates

#### Data Attributes Added:

```jsx
<div
  className="flex items-stretch work-experience-item group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
  data-work-item={experience.id}
  data-company-logo={experience.companyLogo}
>
```

#### Key Changes:

- Added `work-experience-item` class for cursor detection
- Added `data-work-item` attribute for unique identification
- Added `data-company-logo` attribute for logo path
- Added hover effects and transitions
- Added `group` class for group hover effects

### 3. Scroll-Aware Hover Integration

#### Enhanced Detection:

```javascript
// Check for work experience items
if (
  element.classList.contains('work-experience-item') ||
  element.closest('.work-experience-item')
) {
  return true;
}
```

#### Integration Points:

- **Mouse Movement**: Detects work experience items on mouse move
- **Scroll Events**: Detects work experience items during scroll
- **Mutation Observer**: Listens for scroll-hover class changes
- **Performance**: Uses cached element lookups

### 4. CSS Implementation

#### Work Experience Hover Effects:

```css
/* Work Experience hover effects */
.scroll-hover.work-experience-item {
  transform: scale(1.02) !important;
}

.scroll-hover.work-experience-item .group-hover\:scale-\[1\.02\] {
  transform: scale(1.02) !important;
}
```

#### Cursor Styling:

```css
.company-logo-cursor {
  mix-blend-mode: difference;
  pointer-events: none;
  z-index: 9999;
}
```

## 🚀 How It Works

### 1. Mouse Movement Detection

1. **Mouse Move Event**: Tracks mouse position and animates cursor
2. **Element Detection**: Uses `document.elementFromPoint()` to find element under cursor
3. **Work Experience Check**: Determines if element is a work experience item
4. **Logo Retrieval**: Gets company logo path from data attributes
5. **Cursor Display**: Shows/hides cursor with appropriate logo

### 2. Scroll-Aware Integration

1. **Scroll Event**: Detects when user scrolls without moving mouse
2. **Element Detection**: Finds element under last known mouse position
3. **Logo Display**: Shows company logo if over work experience item
4. **Mutation Observer**: Listens for scroll-hover class changes
5. **Synchronization**: Keeps cursor in sync with scroll hover system

### 3. Logo Loading

1. **Path Validation**: Checks if logo path exists in work experience data
2. **Image Loading**: Loads SVG logo from assets folder
3. **Error Handling**: Hides cursor if logo fails to load
4. **Performance**: Uses proper image loading events

## 📋 Configuration

### Work Experience Data Structure

```json
{
  "id": 1,
  "company": "weDevs",
  "companyLogo": "src/assets/experience/weDevs_Logo.svg",
  "designation": "Software Engineer",
  "timeFrame": "September 2024 - Present",
  "objective": "Description..."
}
```

### Required Logo Format

- **File Type**: SVG (recommended for scalability)
- **Location**: `src/assets/experience/` folder
- **Naming**: Descriptive name with `_Logo.svg` suffix
- **Size**: Optimized for 60x60px display

### Cursor Configuration

```javascript
// Cursor size and positioning
const CURSOR_SIZE = 60; // 60x60px
const CURSOR_OFFSET = 30; // Center offset

// Animation settings
const ANIMATION_DURATION = 0.3;
const ANIMATION_EASE = 'power2.out';
```

## ⚡ Performance Optimizations

### Implemented Optimizations

1. **RequestAnimationFrame**: Smooth cursor movement with browser optimization
2. **Element Caching**: Caches work experience item lookups
3. **Event Debouncing**: Prevents excessive event handling
4. **Memory Management**: Proper cleanup of event listeners and timeouts
5. **Image Loading**: Efficient logo loading with error handling
6. **GSAP Optimization**: Uses GSAP's optimized animation engine

### Performance Benefits

- **Smooth Animations**: 60fps cursor movement
- **Reduced DOM Queries**: Cached element lookups
- **Memory Efficient**: Proper cleanup prevents memory leaks
- **Responsive**: Works well on different devices

## 🔍 Troubleshooting

### Common Issues

1. **Logo Not Showing**

   - Check if logo path exists in `work_experience.json`
   - Verify logo file exists in `src/assets/experience/`
   - Check browser console for image loading errors

2. **Cursor Not Appearing**

   - Ensure work experience items have `work-experience-item` class
   - Check if `data-company-logo` attribute is set
   - Verify scroll-aware hover is working

3. **Performance Issues**

   - Check for too many work experience items
   - Monitor scroll event frequency
   - Verify GSAP is properly loaded

### Debug Mode

Add console logs for debugging:

```javascript
// In CompanyLogoCursor.jsx
console.log('Found logo:', logoPath);
console.log('Work experience item:', element);
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Cursor appears when hovering over work experience items
- [ ] Company logo displays correctly
- [ ] Cursor follows mouse movement smoothly
- [ ] Cursor appears during scroll without mouse movement
- [ ] Cursor disappears when leaving work experience section
- [ ] No performance issues or lag
- [ ] Works on different screen sizes
- [ ] Handles missing logos gracefully

### Browser Compatibility

- ✅ Chrome/Edge (Chromium-based)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (automatically disabled)

## 🔮 Future Enhancements

### Potential Improvements

1. **Logo Preloading**: Preload logos for better performance
2. **Custom Animations**: Different animations for different companies
3. **Logo Effects**: Add hover effects to logos themselves
4. **Configuration Panel**: Allow customization of cursor behavior
5. **Accessibility**: Better support for users with disabilities

### Performance Enhancements

1. **Intersection Observer**: Use for better scroll detection
2. **Web Workers**: Offload heavy computations
3. **CSS Paint Worklet**: Native CSS solution when supported
4. **Lazy Loading**: Load logos only when needed

## 📚 References

- [GSAP Documentation](https://gsap.com/docs/v3/)
- [MDN: elementFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint)
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Scroll-Aware Hover Documentation](./scroll-aware-hover.md)

---

**Last Updated**: July 2024
**Version**: 1.0.0
**Maintainer**: Development Team

### Implementation Summary

✅ **Custom Cursor**: Company logos follow mouse cursor
✅ **GSAP Integration**: Smooth animations and transitions
✅ **Scroll-Aware**: Works with existing hover system
✅ **Performance Optimized**: Efficient event handling and cleanup
✅ **Error Handling**: Graceful handling of missing logos
✅ **Responsive Design**: Works across different devices
