// colors.ts - Enhanced color system with semantic meanings
export const colors = {
  // Base layers (glassmorphism-ready)
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    heavy: 'rgba(255, 255, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Neon accents (glows & highlights)
  neon: {
    cyan: {
      base: '#00d9ff',
      glow: 'rgba(0, 217, 255, 0.6)',
      shadow: '0 0 20px rgba(0, 217, 255, 0.4), 0 0 40px rgba(0, 217, 255, 0.2)',
    },
    magenta: {
      base: '#ff00e5',
      glow: 'rgba(255, 0, 229, 0.6)',
      shadow: '0 0 20px rgba(255, 0, 229, 0.4), 0 0 40px rgba(255, 0, 229, 0.2)',
    },
    green: {
      base: '#00ff88',
      glow: 'rgba(0, 255, 136, 0.6)',
      shadow: '0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.2)',
    },
  },
  
  // Gradient meshes
  gradients: {
    hero: 'radial-gradient(circle at 20% 50%, rgba(0, 217, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 0, 229, 0.1) 0%, transparent 50%)',
    ambient: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 0, 229, 0.05) 100%)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },
  
  // Status colors (enhanced with glow)
  status: {
    success: { base: '#00ff88', glow: 'rgba(0, 255, 136, 0.4)' },
    warning: { base: '#ffaa00', glow: 'rgba(255, 170, 0, 0.4)' },
    error: { base: '#ff4444', glow: 'rgba(255, 68, 68, 0.4)' },
    info: { base: '#00d9ff', glow: 'rgba(0, 217, 255, 0.4)' },
  },
  
  // Semantic colors
  background: {
    canvas: '#050505',      // Almost black canvas
    elevated: '#0a0a0a',    // Slightly elevated surfaces
    panel: '#0f0f0f',       // Main content panels
    overlay: 'rgba(0, 0, 0, 0.95)', // Modal overlays
  },
  
  text: {
    primary: '#f0f0f0',     // High contrast body text
    secondary: '#a0a0a0',   // Medium emphasis
    tertiary: '#707070',    // Low emphasis
    disabled: '#404040',    // Disabled state
  },
};


