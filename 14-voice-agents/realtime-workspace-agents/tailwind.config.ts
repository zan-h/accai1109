import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Mobile-first responsive breakpoints
      // Default styles apply to mobile (< 640px)
      // Use prefixes (sm:, md:, lg:, xl:, 2xl:) for larger screens
      screens: {
        'sm': '640px',   // Phones landscape / small tablets
        'md': '768px',   // Tablets portrait (iPad portrait)
        'lg': '1024px',  // Tablets landscape (iPad landscape) / small laptops
        'xl': '1280px',  // Desktop
        '2xl': '1536px', // Large desktop
      },
      colors: {
        bg: {
          primary: '#0a0a0a',
          secondary: '#131313',
          tertiary: '#1a1a1a',
          overlay: 'rgba(0, 0, 0, 0.9)',
        },
        text: {
          primary: '#e8e8e8',
          secondary: '#8a8a8a',
          tertiary: '#5a5a5a',
          dim: '#3a3a3a',
          highlight: '#ffffff',
        },
        accent: {
          primary: '#00d9ff',
          secondary: '#00b8d4',
          glow: 'rgba(0, 217, 255, 0.3)',
        },
        status: {
          success: '#00ff88',
          warning: '#ffaa00',
          error: '#ff4444',
          info: '#00d9ff',
          neutral: '#666666',
        },
        border: {
          primary: '#2a2a2a',
          secondary: '#1f1f1f',
          accent: '#00d9ff',
          dim: '#151515',
        },
        wireframe: {
          primary: '#00d9ff',
          secondary: 'rgba(0, 217, 255, 0.4)',
          grid: 'rgba(0, 217, 255, 0.15)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'Consolas', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 10px rgba(0, 217, 255, 0.3)',
        'glow-cyan-lg': '0 0 15px rgba(0, 217, 255, 0.3)',
        'glow-cyan-xl': '0 0 20px rgba(0, 217, 255, 0.3)',
        'glow-success': '0 0 10px rgba(0, 255, 136, 0.3)',
        'glow-error': '0 0 10px rgba(255, 68, 68, 0.3)',
        'glow-warning': '0 0 10px rgba(255, 170, 0, 0.3)',
      },
      letterSpacing: {
        widest: '0.1em',
      },
    },
  },
  plugins: [],
} satisfies Config;
