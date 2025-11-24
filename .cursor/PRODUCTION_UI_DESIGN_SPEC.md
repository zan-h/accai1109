# Production UI/UX Design Specification
## Enterprise-Grade Visual Experience with Cutting-Edge Web Technologies

**Document Version:** 1.0  
**Created:** November 23, 2025  
**Design Philosophy:** Push the limits of web technology while maintaining conversion effectiveness and enterprise credibility

---

## Executive Summary

### Vision Statement
Transform the current functional prototype into a **visually striking, enterprise-grade web application** that balances aesthetic impact with usability. The redesign incorporates shader-based animations, smooth scroll interactions, glassmorphism effects, and ambient motion to create an immersive yet professional experience that converts visitors into users.

### Key Design Pillars
1. **Visual Excellence** - WebGL shaders, particle systems, smooth animations
2. **Enterprise Credibility** - Professional polish, accessible design, performance optimization
3. **Progressive Disclosure** - Developer features hidden behind settings, clean default UI
4. **Conversion-Focused** - Clear CTAs, trust signals, guided user journeys
5. **Accessibility First** - WCAG 2.1 AAA compliance, reduced motion support

### Core Improvements at a Glance
- ✨ **Shader-based background animations** (WebGL particle fields, gradient mesh)
- 🎨 **Glassmorphism + Neon aesthetic** (frosted panels, dynamic glow effects)
- 📜 **Smooth scroll animations** (GSAP ScrollTrigger, parallax layering)
- 🔧 **Developer mode toggle** (move technical features to settings panel)
- 🎭 **Micro-interactions everywhere** (haptic feedback, spring animations)
- 🌊 **Ambient motion** (floating elements, breathing UI components)
- 🎯 **Conversion-optimized flows** (clear value props, social proof, friction reduction)

---

## 1. Visual System 2.0: Technical Foundation

### 1.1 Design Tokens - Enhanced Palette

```typescript
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
```

### 1.2 Motion Design System

```typescript
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
```

### 1.3 Glassmorphism Component Base

```css
/* globals.css - Glassmorphism utilities */

.glass-panel {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.glass-panel-heavy {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 100%
  );
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 12px 48px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.neon-border-cyan {
  border: 1px solid #00d9ff;
  box-shadow: 
    0 0 10px rgba(0, 217, 255, 0.5),
    0 0 20px rgba(0, 217, 255, 0.3),
    inset 0 0 10px rgba(0, 217, 255, 0.1);
  animation: neon-pulse-cyan 2s ease-in-out infinite;
}

@keyframes neon-pulse-cyan {
  0%, 100% {
    box-shadow: 
      0 0 10px rgba(0, 217, 255, 0.5),
      0 0 20px rgba(0, 217, 255, 0.3),
      inset 0 0 10px rgba(0, 217, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 0 15px rgba(0, 217, 255, 0.6),
      0 0 30px rgba(0, 217, 255, 0.4),
      inset 0 0 15px rgba(0, 217, 255, 0.15);
  }
}

.shimmer-effect {
  position: relative;
  overflow: hidden;
}

.shimmer-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}
```

---

## 2. Background Ambient System

### 2.1 WebGL Particle Field Shader

Create an immersive particle field background using WebGL (Three.js or custom shader):

**Visual Description:**
- Thousands of small, glowing particles floating in 3D space
- Particles respond to mouse movement (subtle parallax)
- Smooth depth-of-field blur on distant particles
- Color palette: cyan (#00d9ff) and magenta (#ff00e5) with 70% opacity
- Particles slowly drift upward (like embers or snow)
- Connection lines appear between nearby particles (< 150px distance)

**Technical Implementation:**

```typescript
// ParticleField.tsx - WebGL particle background component
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleFieldProps {
  particleCount?: number;
  mouseInfluence?: number;
  driftSpeed?: number;
}

export function ParticleField({
  particleCount = 2000,
  mouseInfluence = 0.05,
  driftSpeed = 0.1,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true,
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;
    
    // Particle geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    const cyanColor = new THREE.Color(0x00d9ff);
    const magentaColor = new THREE.Color(0xff00e5);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Random positions in 3D space
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 10;
      
      // Velocity for drift animation
      velocities[i] = (Math.random() - 0.5) * 0.01;
      velocities[i + 1] = Math.random() * driftSpeed * 0.01;
      velocities[i + 2] = (Math.random() - 0.5) * 0.01;
      
      // Random color between cyan and magenta
      const mixColor = new THREE.Color().lerpColors(
        cyanColor, 
        magentaColor, 
        Math.random()
      );
      colors[i] = mixColor.r;
      colors[i + 1] = mixColor.g;
      colors[i + 2] = mixColor.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    // Particle material with custom shader
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      const positionArray = particles.geometry.attributes.position.array as Float32Array;
      const velocityArray = particles.geometry.attributes.velocity.array as Float32Array;
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        // Apply velocity
        positionArray[i] += velocityArray[i];
        positionArray[i + 1] += velocityArray[i + 1];
        positionArray[i + 2] += velocityArray[i + 2];
        
        // Mouse influence (subtle parallax)
        const mouseInfluenceX = mousePos.current.x * mouseInfluence * (positionArray[i + 2] + 5) / 10;
        const mouseInfluenceY = mousePos.current.y * mouseInfluence * (positionArray[i + 2] + 5) / 10;
        positionArray[i] += mouseInfluenceX * 0.01;
        positionArray[i + 1] += mouseInfluenceY * 0.01;
        
        // Wrap around boundaries
        if (positionArray[i + 1] > 10) positionArray[i + 1] = -10;
        if (positionArray[i] > 10) positionArray[i] = -10;
        if (positionArray[i] < -10) positionArray[i] = 10;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.0002;
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [particleCount, mouseInfluence, driftSpeed]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
}
```

**Performance Optimization:**
- Use `requestAnimationFrame` with throttling on low-end devices
- Detect user's `prefers-reduced-motion` setting and disable if true
- Reduce particle count on mobile (<1000 particles)
- Use WebGL2 instancing for better performance

### 2.2 Gradient Mesh Background

Layered beneath particles, add a slowly morphing gradient mesh:

```typescript
// GradientMesh.tsx - Animated gradient background
export function GradientMesh() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
      <div 
        className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(0, 217, 255, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(255, 0, 229, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.04) 0%, transparent 50%)
          `,
          animation: 'gradientMorph 20s ease-in-out infinite alternate',
        }}
      />
    </div>
  );
}
```

```css
/* Add to globals.css */
@keyframes gradientMorph {
  0% {
    transform: translate(0%, 0%) rotate(0deg) scale(1);
  }
  100% {
    transform: translate(-10%, -10%) rotate(15deg) scale(1.1);
  }
}
```

---

## 3. Component-by-Component Redesign

### 3.1 Header / Navigation Bar

**Current State:** Simple horizontal bar with logo, user info, and suite indicator

**Redesign Goals:**
- Glassmorphism with blur backdrop
- Sticky header with scroll-based reveal animation
- Neon accent line underneath
- Micro-interactions on hover

**Implementation:**

```tsx
// Header.tsx - Enhanced navigation component
'use client';

import { useEffect, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Transform opacity based on scroll
  const headerOpacity = useTransform(scrollY, [0, 100], [0.8, 0.95]);
  const borderGlow = useTransform(scrollY, [0, 100], [0.3, 0.6]);
  
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
    return unsubscribe;
  }, [scrollY]);
  
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass-panel"
      style={{ 
        opacity: headerOpacity,
        backdropFilter: isScrolled ? 'blur(30px)' : 'blur(20px)',
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo with glow effect */}
        <motion.div 
          className="flex items-center gap-3 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-neon-cyan-glow rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img 
              src="/openai-logomark.svg" 
              alt="Logo" 
              className="w-8 h-8 relative z-10"
            />
          </div>
          <div className="font-mono text-xl font-bold tracking-wider">
            <span className="text-white">accai</span>
            <span className="text-text-secondary ml-2">Agent</span>
          </div>
        </motion.div>
        
        {/* Center navigation (if needed) */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* Add nav items here if expanding beyond single-page app */}
        </nav>
        
        {/* Right side: User + Suite */}
        <div className="flex items-center gap-4">
          {/* Suite indicator with neon border */}
          <motion.div 
            className="glass-panel px-4 py-2 rounded-lg neon-border-cyan"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm font-mono text-accent-primary">
              {/* Suite name */}
              Energy Aligned Work
            </span>
          </motion.div>
          
          {/* User button */}
          <UserButton />
        </div>
      </div>
      
      {/* Neon accent line */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-primary to-transparent"
        style={{ 
          opacity: borderGlow,
        }}
      />
    </motion.header>
  );
}
```

### 3.2 Main Content Layout - Smooth Scroll Sections

**Current State:** Static three-column layout (Workspace | Transcript | Events)

**Redesign Goals:**
- Implement smooth scroll snap sections
- Add parallax depth on scroll
- Floating panel effects (cards lift on scroll)
- Staggered entrance animations

**Implementation:**

```tsx
// Layout.tsx - Scroll-optimized layout
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ContentLayout({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Parallax effect on panels
    const panels = containerRef.current.querySelectorAll('.content-panel');
    
    panels.forEach((panel, index) => {
      gsap.to(panel, {
        y: -50 * (index + 1), // Different speeds for depth
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
      
      // Fade in + lift animation on scroll into view
      gsap.from(panel, {
        opacity: 0,
        y: 60,
        scale: 0.95,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: panel,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
        },
      });
    });
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen pt-24 pb-12 px-6"
      style={{
        scrollBehavior: 'smooth',
      }}
    >
      {children}
    </div>
  );
}
```

### 3.3 Workspace Panel - Floating Card Design

**Current State:** Static panel with tabs and content

**Redesign Goals:**
- Glass morphism card with depth shadow
- Tabs with smooth slider indicator
- Content area with ambient glow
- Hover effects on interactive elements

**Implementation:**

```tsx
// Workspace.tsx - Enhanced glass panel design
export function Workspace() {
  const [activeTab, setActiveTab] = useState('work-journal');
  const [hoverGlow, setHoverGlow] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };
  
  return (
    <motion.div 
      className="content-panel glass-panel-heavy rounded-2xl p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
    >
      {/* Mouse-follow glow effect */}
      <div 
        className="absolute w-96 h-96 pointer-events-none rounded-full opacity-20 blur-3xl transition-transform duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(0,217,255,0.3) 0%, transparent 70%)',
          left: hoverGlow.x - 192,
          top: hoverGlow.y - 192,
        }}
      />
      
      {/* Header with project switcher */}
      <div className="relative z-10 flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <motion.button
          className="glass-panel px-4 py-2 rounded-lg hover:neon-border-cyan transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="font-mono text-sm text-accent-primary">Project Name</span>
        </motion.button>
        
        {/* Live indicator with breathing animation */}
        <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full">
          <motion.div 
            className="w-2 h-2 rounded-full bg-status-success"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <span className="text-xs font-mono text-status-success uppercase tracking-wider">Live</span>
        </div>
      </div>
      
      {/* Tabs with animated slider */}
      <div className="relative z-10 mb-6">
        <div className="flex gap-2 relative">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-colors relative ${
                activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  className="absolute inset-0 glass-panel neon-border-cyan rounded-lg -z-10"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Content area */}
      <div className="relative z-10">
        <TabContent activeTab={activeTab} />
      </div>
    </motion.div>
  );
}
```

### 3.4 Transcript/Session Panel - Message Bubbles 2.0

**Current State:** Simple message bubbles with basic styling

**Redesign Goals:**
- Smooth entrance animations (fade + slide)
- Typing indicator with animated dots
- Message bubbles with subtle glow on hover
- Scroll-triggered parallax for older messages

**Implementation:**

```tsx
// TranscriptMessage.tsx - Enhanced message component
import { motion } from 'framer-motion';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  index: number;
}

export function TranscriptMessage({ role, content, timestamp, index }: MessageProps) {
  const isUser = role === 'user';
  
  return (
    <motion.div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05, // Stagger effect
        ease: 'easeOut',
      }}
    >
      <motion.div 
        className={`max-w-lg glass-panel rounded-2xl p-4 relative group ${
          isUser 
            ? 'bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 border-accent-primary/30' 
            : 'border-white/20'
        }`}
        whileHover={{ 
          scale: 1.02,
          boxShadow: isUser 
            ? '0 0 30px rgba(0, 217, 255, 0.3)' 
            : '0 0 30px rgba(255, 255, 255, 0.1)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Message content */}
        <div className="font-mono text-sm text-text-primary whitespace-pre-wrap mb-2">
          {content}
        </div>
        
        {/* Timestamp */}
        <div className="text-xs text-text-tertiary font-mono opacity-60">
          {timestamp}
        </div>
        
        {/* Hover glow effect */}
        <div 
          className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
            isUser ? 'bg-accent-primary/5' : 'bg-white/5'
          }`}
        />
      </motion.div>
    </motion.div>
  );
}
```

### 3.5 Push-to-Talk Button - Hero Interaction

**Current State:** Simple button with hover states

**Redesign Goals:**
- Large, prominent, impossible to miss
- Pulsing glow animation when active
- Haptic feedback simulation (scale + shadow)
- Ripple effect on press
- Voice waveform visualization when speaking

**Implementation:**

```tsx
// PushToTalkButton.tsx - Hero CTA with advanced interactions
'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

export function PushToTalkButton({ 
  isConnected, 
  isSpeaking, 
  onPress, 
  onRelease 
}: PushToTalkButtonProps) {
  const controls = useAnimation();
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const handlePress = (e: React.MouseEvent) => {
    onPress();
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    // Haptic animation
    controls.start({
      scale: 0.9,
      transition: { duration: 0.1 },
    });
  };
  
  const handleRelease = () => {
    onRelease();
    controls.start({
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 20 },
    });
  };
  
  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Voice waveform visualization (when speaking) */}
      {isSpeaking && (
        <motion.div 
          className="absolute -top-20 flex items-end gap-1 h-16"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-accent-primary rounded-full"
              animate={{
                height: [
                  Math.random() * 60 + 10,
                  Math.random() * 60 + 10,
                  Math.random() * 60 + 10,
                ],
              }}
              transition={{
                duration: 0.3 + Math.random() * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      )}
      
      {/* Main button */}
      <motion.button
        className={`relative w-32 h-32 rounded-full flex items-center justify-center overflow-hidden ${
          isConnected ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
        }`}
        animate={controls}
        onMouseDown={isConnected ? handlePress : undefined}
        onMouseUp={isConnected ? handleRelease : undefined}
        onMouseLeave={isConnected ? handleRelease : undefined}
        whileHover={isConnected ? { scale: 1.05 } : {}}
        disabled={!isConnected}
      >
        {/* Background glow */}
        <div className={`absolute inset-0 rounded-full ${
          isSpeaking 
            ? 'bg-accent-primary animate-pulse' 
            : 'bg-gradient-to-br from-accent-primary/40 to-accent-secondary/40'
        }`} />
        
        {/* Glass layer */}
        <div className="absolute inset-2 rounded-full glass-panel" />
        
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border-2 border-accent-primary"
            initial={{ 
              width: 0, 
              height: 0, 
              left: ripple.x, 
              top: ripple.y,
              opacity: 1,
            }}
            animate={{ 
              width: 300, 
              height: 300, 
              left: ripple.x - 150, 
              top: ripple.y - 150,
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
        
        {/* Icon */}
        <motion.div 
          className="relative z-10"
          animate={isSpeaking ? {
            scale: [1, 1.2, 1],
          } : {}}
          transition={isSpeaking ? {
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          } : {}}
        >
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </motion.div>
        
        {/* Pulsing outer ring (when active) */}
        {isSpeaking && (
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-accent-primary"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 0.3, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>
      
      {/* Label */}
      <motion.div 
        className="text-center"
        animate={{ opacity: isSpeaking ? 1 : 0.7 }}
      >
        <div className="font-mono text-sm text-text-primary mb-1">
          {isSpeaking ? 'Listening...' : 'Hold to Talk'}
        </div>
        <div className="font-mono text-xs text-text-tertiary">
          {isConnected ? 'Press & hold or use Spacebar' : 'Connect to start'}
        </div>
      </motion.div>
    </div>
  );
}
```

### 3.6 Timer Component - Cinematic Progress Ring

**Current State:** Basic timer with start/stop controls

**Redesign Goals:**
- Circular progress ring with neon glow
- Smooth SVG path animation
- Time remaining in center with dynamic size
- Completion celebration effect (confetti burst)

**Implementation:**

```tsx
// Timer.tsx - Cinematic progress ring
'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export function Timer({ duration, label, onComplete }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const controls = useAnimation();
  
  const progress = (duration - timeRemaining) / duration;
  const circumference = 2 * Math.PI * 100; // radius = 100
  const strokeDashoffset = circumference - (progress * circumference);
  
  useEffect(() => {
    if (timeRemaining === 0) {
      // Completion celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00d9ff', '#ff00e5', '#00ff88'],
      });
      
      controls.start({
        scale: [1, 1.2, 1],
        rotate: [0, 360],
        transition: { duration: 0.8 },
      });
      
      onComplete?.();
    }
  }, [timeRemaining, onComplete, controls]);
  
  return (
    <div className="fixed bottom-8 right-8 z-40">
      <motion.div 
        className="glass-panel-heavy rounded-3xl p-6 relative"
        animate={controls}
        whileHover={{ scale: 1.05 }}
      >
        {/* SVG circular progress */}
        <svg className="w-48 h-48" viewBox="0 0 240 240">
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r="100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          
          {/* Progress circle with glow */}
          <motion.circle
            cx="120"
            cy="120"
            r="100"
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 120 120)"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.6))',
            }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d9ff" />
              <stop offset="100%" stopColor="#ff00e5" />
            </linearGradient>
          </defs>
          
          {/* Center text */}
          <text
            x="120"
            y="110"
            textAnchor="middle"
            className="font-mono text-4xl font-bold fill-white"
          >
            {formatTime(timeRemaining)}
          </text>
          
          <text
            x="120"
            y="140"
            textAnchor="middle"
            className="font-mono text-xs fill-text-secondary"
          >
            {label}
          </text>
        </svg>
        
        {/* Play/pause button */}
        <motion.button
          className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel px-6 py-2 rounded-full neon-border-cyan"
          onClick={() => setIsRunning(!isRunning)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="font-mono text-sm text-accent-primary">
            {isRunning ? 'Pause' : 'Start'}
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

---

## 4. Developer Mode - Settings Panel

### 4.1 Settings Modal Design

**Goal:** Hide all developer/technical features behind a settings panel accessible via header menu

**Features to Move:**
- Event logs toggle
- Codec selector (PCMU/PCMA/Opus)
- Audio recording controls
- Debug console
- Memory monitoring
- Performance metrics

**Implementation:**

```tsx
// SettingsModal.tsx - Comprehensive settings panel
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<'general' | 'developer' | 'voice'>('general');
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[800px] md:max-h-[600px] glass-panel-heavy rounded-3xl z-50 overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="border-b border-white/10 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-mono font-bold text-white">Settings</h2>
              <motion.button
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:neon-border-cyan"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            
            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-56 border-r border-white/10 p-4">
                <nav className="space-y-2">
                  {[
                    { id: 'general', label: 'General', icon: '⚙️' },
                    { id: 'voice', label: 'Voice', icon: '🎤' },
                    { id: 'developer', label: 'Developer', icon: '🔧' },
                  ].map((section) => (
                    <motion.button
                      key={section.id}
                      className={`w-full text-left px-4 py-3 rounded-lg font-mono text-sm transition-colors relative ${
                        activeSection === section.id
                          ? 'text-white'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                      onClick={() => setActiveSection(section.id as any)}
                      whileHover={{ x: 4 }}
                    >
                      <span className="mr-2">{section.icon}</span>
                      {section.label}
                      {activeSection === section.id && (
                        <motion.div 
                          className="absolute inset-0 glass-panel neon-border-cyan rounded-lg -z-10"
                          layoutId="activeSection"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </nav>
              </div>
              
              {/* Settings panels */}
              <div className="flex-1 p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeSection === 'general' && (
                    <motion.div
                      key="general"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <SettingRow
                        label="Audio Playback"
                        description="Enable voice output from agent"
                        type="toggle"
                      />
                      <SettingRow
                        label="Reduced Motion"
                        description="Minimize animations for accessibility"
                        type="toggle"
                      />
                      <SettingRow
                        label="Theme"
                        description="Choose color scheme"
                        type="select"
                        options={['Dark', 'Light', 'Auto']}
                      />
                    </motion.div>
                  )}
                  
                  {activeSection === 'voice' && (
                    <motion.div
                      key="voice"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <SettingRow
                        label="Voice Model"
                        description="Select agent voice"
                        type="select"
                        options={['Alloy', 'Echo', 'Shimmer', 'Verse']}
                      />
                      <SettingRow
                        label="Speech Speed"
                        description="Adjust voice playback speed"
                        type="slider"
                        min={0.5}
                        max={2}
                        step={0.1}
                      />
                    </motion.div>
                  )}
                  
                  {activeSection === 'developer' && (
                    <motion.div
                      key="developer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="mb-6 p-4 glass-panel rounded-lg border-l-4 border-status-warning">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">⚠️</span>
                          <div>
                            <div className="font-mono text-sm text-status-warning font-bold mb-1">
                              Developer Mode
                            </div>
                            <div className="font-mono text-xs text-text-secondary">
                              These settings are for debugging and testing. Change with caution.
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <SettingRow
                        label="Show Event Logs"
                        description="Display realtime API events"
                        type="toggle"
                      />
                      <SettingRow
                        label="Audio Codec"
                        description="Force WebRTC codec (requires reload)"
                        type="select"
                        options={['Opus (48kHz)', 'PCMU (8kHz)', 'PCMA (8kHz)']}
                      />
                      <SettingRow
                        label="Record Audio"
                        description="Save conversation audio locally"
                        type="toggle"
                      />
                      <SettingRow
                        label="Memory Monitoring"
                        description="Track memory usage in console"
                        type="toggle"
                      />
                      <SettingRow
                        label="Performance Overlay"
                        description="Show FPS and render metrics"
                        type="toggle"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Reusable setting row component
function SettingRow({ 
  label, 
  description, 
  type, 
  options,
  min,
  max,
  step,
}: {
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'slider';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}) {
  const [value, setValue] = useState(type === 'toggle' ? false : options?.[0] || 0);
  
  return (
    <div className="flex items-center justify-between p-4 glass-panel rounded-lg hover:border-white/20 transition-colors">
      <div className="flex-1">
        <div className="font-mono text-sm text-white mb-1">{label}</div>
        <div className="font-mono text-xs text-text-tertiary">{description}</div>
      </div>
      
      <div className="ml-6">
        {type === 'toggle' && (
          <motion.button
            className={`w-12 h-6 rounded-full relative transition-colors ${
              value ? 'bg-accent-primary' : 'bg-white/20'
            }`}
            onClick={() => setValue(!value)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-5 h-5 rounded-full bg-white absolute top-0.5"
              animate={{ x: value ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        )}
        
        {type === 'select' && (
          <select
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            className="glass-panel px-4 py-2 rounded-lg font-mono text-sm text-white border border-white/20 hover:border-accent-primary focus:border-accent-primary outline-none transition-colors"
          >
            {options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}
        
        {type === 'slider' && (
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value as number}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            className="w-32 accent-accent-primary"
          />
        )}
      </div>
    </div>
  );
}
```

---

## 5. Scroll Animations & Parallax

### 5.1 GSAP ScrollTrigger Setup

```typescript
// scrollAnimations.ts - Centralized scroll animation config
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  // Parallax layers
  gsap.utils.toArray('.parallax-slow').forEach((element: any) => {
    gsap.to(element, {
      y: -100,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  });
  
  gsap.utils.toArray('.parallax-fast').forEach((element: any) => {
    gsap.to(element, {
      y: -200,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  });
  
  // Fade in on scroll
  gsap.utils.toArray('.fade-in-scroll').forEach((element: any) => {
    gsap.from(element, {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'top 50%',
        toggleActions: 'play none none reverse',
      },
    });
  });
  
  // Scale on scroll
  gsap.utils.toArray('.scale-in-scroll').forEach((element: any) => {
    gsap.from(element, {
      scale: 0.8,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        end: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    });
  });
  
  // Stagger children
  gsap.utils.toArray('.stagger-children').forEach((parent: any) => {
    const children = parent.children;
    gsap.from(children, {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      scrollTrigger: {
        trigger: parent,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}
```

### 5.2 Smooth Scroll Implementation

```typescript
// smoothScroll.ts - Locomotive Scroll integration
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

export function initSmoothScroll(container: HTMLElement) {
  const scroll = new LocomotiveScroll({
    el: container,
    smooth: true,
    multiplier: 0.8, // Scroll speed
    lerp: 0.08, // Smoothness (lower = smoother but heavier)
    smartphone: {
      smooth: true,
    },
    tablet: {
      smooth: true,
    },
  });
  
  // Update ScrollTrigger on scroll
  scroll.on('scroll', ScrollTrigger.update);
  
  // Sync ScrollTrigger with Locomotive Scroll
  ScrollTrigger.scrollerProxy(container, {
    scrollTop(value) {
      return arguments.length 
        ? scroll.scrollTo(value as number, { duration: 0, disableLerp: true })
        : scroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: container.style.transform ? 'transform' : 'fixed',
  });
  
  // Refresh on update
  ScrollTrigger.addEventListener('refresh', () => scroll.update());
  ScrollTrigger.refresh();
  
  return scroll;
}
```

---

## 6. Micro-Interactions Catalog

### 6.1 Button Hover Effects

```tsx
// ButtonHover.tsx - Advanced button interactions
export function NeonButton({ children, onClick }: ButtonProps) {
  return (
    <motion.button
      className="relative px-6 py-3 rounded-lg font-mono font-bold overflow-hidden group"
      onClick={onClick}
      whileHover="hover"
      whileTap="tap"
      variants={{
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
      }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 border-2 border-accent-primary rounded-lg"
        variants={{
          hover: {
            boxShadow: [
              '0 0 10px rgba(0,217,255,0.5)',
              '0 0 20px rgba(0,217,255,0.8)',
              '0 0 10px rgba(0,217,255,0.5)',
            ],
          },
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        variants={{
          hover: {
            x: [-200, 200],
            opacity: [0, 0.3, 0],
          },
        }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Text */}
      <span className="relative z-10 text-white group-hover:text-bg-primary transition-colors">
        {children}
      </span>
    </motion.button>
  );
}
```

### 6.2 Card Hover Lift

```tsx
// CardHover.tsx - 3D lift effect on hover
export function HoverCard({ children }: { children: React.ReactNode }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * -10; // Max 10deg
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };
  
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };
  
  return (
    <motion.div
      className="glass-panel-heavy rounded-2xl p-6 relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 20px 60px rgba(0,217,255,0.3)',
      }}
    >
      {children}
    </motion.div>
  );
}
```

### 6.3 Input Focus Animations

```css
/* Enhanced input focus states */
.input-neon {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: var(--font-mono);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-neon:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: #00d9ff;
  box-shadow: 
    0 0 0 3px rgba(0, 217, 255, 0.1),
    0 0 20px rgba(0, 217, 255, 0.3);
  transform: scale(1.02);
}

/* Animated placeholder */
.input-neon::placeholder {
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.input-neon:focus::placeholder {
  color: rgba(0, 217, 255, 0.6);
  transform: translateX(4px);
}

/* Floating label animation */
.input-floating-label {
  position: relative;
}

.input-floating-label input:focus ~ label,
.input-floating-label input:not(:placeholder-shown) ~ label {
  transform: translateY(-28px) scale(0.85);
  color: #00d9ff;
}

.input-floating-label label {
  position: absolute;
  left: 16px;
  top: 12px;
  font-family: var(--font-mono);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left top;
}
```

---

## 7. Performance Optimization

### 7.1 Reduced Motion Support

```typescript
// motionPreferences.ts - Respect user accessibility preferences
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
}

// Usage in components
export function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
    >
      Content
    </motion.div>
  );
}
```

### 7.2 Lazy Loading & Code Splitting

```typescript
// Lazy load heavy components
const ParticleField = lazy(() => import('@/components/ParticleField'));
const SettingsModal = lazy(() => import('@/components/SettingsModal'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ParticleField />
</Suspense>
```

### 7.3 GPU Acceleration

```css
/* Force GPU acceleration for smooth animations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Apply to animated elements */
.glass-panel,
.neon-border-cyan,
.animate-pulse {
  transform: translateZ(0);
}
```

---

## 8. Conversion-Focused Elements

### 8.1 Hero Section (Landing View)

```tsx
// Hero.tsx - First impression that converts
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background elements */}
      <ParticleField />
      <GradientMesh />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl text-center">
        {/* Animated headline */}
        <motion.h1 
          className="text-6xl md:text-8xl font-mono font-bold mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="text-white">Work </span>
          <span 
            className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-neon-magenta"
            style={{ 
              textShadow: '0 0 40px rgba(0,217,255,0.5)',
            }}
          >
            With Focus
          </span>
        </motion.h1>
        
        {/* Value proposition */}
        <motion.p 
          className="text-xl md:text-2xl text-text-secondary font-mono mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Your AI-powered workspace that adapts to your ADHD brain. 
          Voice-first, distraction-free, always in sync.
        </motion.p>
        
        {/* CTA buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <NeonButton onClick={() => {/* Start trial */}}>
            Start Free Trial
          </NeonButton>
          
          <motion.button
            className="px-8 py-4 rounded-lg glass-panel font-mono font-bold text-white border border-white/20 hover:border-accent-primary transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Watch Demo
          </motion.button>
        </motion.div>
        
        {/* Social proof */}
        <motion.div 
          className="mt-12 flex items-center justify-center gap-8 text-text-tertiary font-mono text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div>✓ 2,000+ users</div>
          <div>✓ SOC 2 certified</div>
          <div>✓ No credit card</div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-accent-primary flex items-start justify-center p-2">
          <motion.div 
            className="w-1.5 h-1.5 rounded-full bg-accent-primary"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
```

### 8.2 Trust Signals

```tsx
// TrustBadges.tsx - Security and credibility indicators
export function TrustBadges() {
  const badges = [
    { icon: '🔒', label: 'SOC 2 Type II', sublabel: 'Enterprise Security' },
    { icon: '🛡️', label: 'HIPAA Compliant', sublabel: 'Healthcare Ready' },
    { icon: '🌍', label: 'GDPR Compliant', sublabel: 'Privacy First' },
    { icon: '⚡', label: '99.9% Uptime', sublabel: 'Reliable Service' },
  ];
  
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-3xl font-mono font-bold text-white mb-12">
          Enterprise-Grade Security
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.label}
              className="glass-panel-heavy rounded-2xl p-6 text-center hover:neon-border-cyan transition-all"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <div className="text-5xl mb-4">{badge.icon}</div>
              <div className="font-mono text-sm font-bold text-white mb-1">
                {badge.label}
              </div>
              <div className="font-mono text-xs text-text-tertiary">
                {badge.sublabel}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Install dependencies (framer-motion, three.js, gsap, locomotive-scroll)
- [ ] Set up new color tokens and CSS variables
- [ ] Implement glassmorphism base classes
- [ ] Create ParticleField component
- [ ] Add GradientMesh background

### Phase 2: Core Components (Week 2)
- [ ] Redesign Header with glassmorphism
- [ ] Enhance Workspace panel with new interactions
- [ ] Update Transcript messages with animations
- [ ] Redesign PushToTalkButton with advanced effects
- [ ] Implement Timer with circular progress

### Phase 3: Settings & Developer Mode (Week 3)
- [ ] Create SettingsModal component
- [ ] Move developer features behind settings
- [ ] Implement toggle system for technical features
- [ ] Add keyboard shortcut to open settings (Cmd+,)

### Phase 4: Scroll Animations (Week 4)
- [ ] Set up GSAP ScrollTrigger
- [ ] Implement Locomotive Scroll
- [ ] Add parallax layers
- [ ] Create fade-in and scale animations
- [ ] Add stagger effects

### Phase 5: Micro-Interactions (Week 5)
- [ ] Implement button hover effects
- [ ] Add card hover lift (3D transforms)
- [ ] Enhanced input focus states
- [ ] Ripple effects on interactions
- [ ] Loading state animations

### Phase 6: Conversion Elements (Week 6)
- [ ] Create Hero section (if expanding to landing page)
- [ ] Add trust badges
- [ ] Implement social proof elements
- [ ] Add testimonial carousel
- [ ] Create pricing section (if needed)

### Phase 7: Performance & Polish (Week 7)
- [ ] Implement reduced motion support
- [ ] Add lazy loading for heavy components
- [ ] GPU acceleration optimizations
- [ ] Cross-browser testing
- [ ] Mobile responsiveness refinement

### Phase 8: Testing & Launch (Week 8)
- [ ] Accessibility audit (WCAG 2.1 AAA)
- [ ] Performance testing (Lighthouse scores)
- [ ] User testing sessions
- [ ] Bug fixes and refinements
- [ ] Production deployment

---

## 10. Success Metrics

### User Experience Metrics
- **Time to First Interaction:** < 2 seconds (initial render + animations)
- **Lighthouse Performance Score:** > 90
- **Lighthouse Accessibility Score:** 100
- **User Engagement:** +40% increase in session duration
- **Bounce Rate:** < 15% (for landing pages)

### Technical Performance
- **FPS:** Maintain 60fps during animations
- **Memory Usage:** < 100MB for particle systems
- **Bundle Size:** Core JS < 200KB gzipped
- **Time to Interactive:** < 3 seconds on 4G

### Conversion Metrics (if applicable)
- **Trial Signup Rate:** +25% improvement
- **Activation Rate:** 80% of signups complete onboarding
- **Retention:** 70% return within 7 days

---

## 11. Dependencies & Tech Stack

### Required NPM Packages

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.95.0",
    "gsap": "^3.12.5",
    "locomotive-scroll": "^5.0.0-beta",
    "canvas-confetti": "^1.9.2",
    "react-intersection-observer": "^9.5.3"
  }
}
```

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile: iOS 14+, Android 10+

---

## 12. Accessibility Compliance

### WCAG 2.1 AAA Requirements

1. **Color Contrast:** All text meets 7:1 ratio (AAA level)
2. **Keyboard Navigation:** Every interactive element accessible via keyboard
3. **Screen Reader Support:** Proper ARIA labels and semantic HTML
4. **Focus Indicators:** Visible focus states on all focusable elements
5. **Motion Preferences:** Respect `prefers-reduced-motion`
6. **Text Resizing:** UI scales up to 200% without breaking
7. **Error Prevention:** Clear validation and confirmation dialogs

### Implementation Checklist

```tsx
// Example: Accessible button with ARIA
<motion.button
  aria-label="Start voice conversation"
  aria-pressed={isActive}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  {/* Button content */}
</motion.button>
```

---

## 13. Design System Documentation

### Component Library Structure

```
src/components/
├── ui/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   └── Button.test.tsx
│   ├── Input/
│   ├── Card/
│   └── Modal/
├── animations/
│   ├── ParticleField.tsx
│   ├── GradientMesh.tsx
│   └── transitions.ts
├── layouts/
│   ├── Header.tsx
│   ├── ContentLayout.tsx
│   └── Footer.tsx
└── features/
    ├── Workspace/
    ├── Transcript/
    └── Timer/
```

### Naming Conventions

- **Components:** PascalCase (`PushToTalkButton`)
- **Files:** PascalCase for components, camelCase for utilities
- **CSS Classes:** kebab-case (`glass-panel-heavy`)
- **Animation variants:** camelCase (`variants={{ hover: {...} }}`)
- **Props:** camelCase with descriptive names

---

## 14. QA & Testing Checklist

### Visual Regression Testing
- [ ] Desktop (1920x1080, 1440x900, 1280x720)
- [ ] Tablet (iPad Pro, iPad Mini, Surface)
- [ ] Mobile (iPhone 14 Pro, Samsung Galaxy S23, Pixel 7)

### Animation Testing
- [ ] Smooth 60fps during particle animations
- [ ] No jank during scroll
- [ ] Proper cleanup on component unmount
- [ ] Reduced motion respected

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (Safari iOS, Chrome Android)

### Accessibility Testing
- [ ] Keyboard navigation complete
- [ ] Screen reader (NVDA, JAWS, VoiceOver)
- [ ] Color contrast validation
- [ ] Focus management
- [ ] ARIA attributes correct

---

## Conclusion

This specification provides a comprehensive blueprint for transforming the current functional prototype into a **visually stunning, enterprise-grade web application** that balances cutting-edge visual effects with usability and conversion effectiveness.

The design system incorporates:
- ✨ **WebGL particle fields** for immersive backgrounds
- 🎨 **Glassmorphism + neon aesthetics** for modern, professional appeal
- 📜 **Smooth scroll animations** with parallax depth
- 🔧 **Developer mode toggle** to hide technical features
- 🎯 **Conversion-optimized flows** with clear value props
- ♿ **Accessibility-first** approach (WCAG 2.1 AAA)

By following this roadmap, the implementation team can systematically build each feature while maintaining code quality, performance, and user experience standards.

---

**Next Steps for Executor Agent:**
1. Review this spec with stakeholders
2. Set up project tracking (Jira/Linear/GitHub Projects)
3. Begin Phase 1 implementation
4. Regular design reviews at end of each phase
5. User testing sessions at Phase 7

**Estimated Timeline:** 8 weeks (with 2 developers)  
**Estimated Effort:** 320-400 developer hours

---

*Document prepared by: Design & UX Specialist*  
*For implementation by: Executor Agent*  
*Revision: 1.0 | Date: November 23, 2025*


