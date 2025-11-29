// motion.ts - Spring physics and easing curves
export const motion = {
  // Spring configurations (for framer-motion or similar)
  springs: {
    snappy: { type: 'spring', stiffness: 400, damping: 30 },
    gentle: { type: 'spring', stiffness: 200, damping: 25 },
    bouncy: { type: 'spring', stiffness: 300, damping: 15 },
    smooth: { type: 'spring', stiffness: 100, damping: 20 },
  },
  
  // Easing curves
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smoothIn: 'cubic-bezier(0.4, 0, 1, 1)',
    smoothOut: 'cubic-bezier(0, 0, 0.2, 1)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Durations (ms)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
    glacial: 1200,
  },
  
  // Scroll animation config
  scroll: {
    offset: ['start end', 'end start'], // ScrollTrigger range
    scrub: 0.5, // Smooth scrubbing
  },
};


