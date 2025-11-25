// MagneticButton.tsx - Magnetic hover effect button
'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import { useResponsive } from '../layouts/ResponsiveLayout';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function MagneticButton({ 
  children, 
  className = '', 
  onClick, 
  disabled,
  variant = 'primary' 
}: MagneticButtonProps) {
  const { isMobile } = useResponsive();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for magnetic pull
  const mouseX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || disabled) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Limit the magnetic pull range
    if (Math.abs(distanceX) < width && Math.abs(distanceY) < height) {
      x.set(distanceX * 0.2); // Factor determines strength
      y.set(distanceY * 0.2);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const getVariantClasses = () => {
    switch(variant) {
      case 'primary':
        return 'bg-accent-primary text-bg-primary hover:bg-accent-secondary hover:shadow-glow-cyan';
      case 'secondary':
        return 'bg-white/10 text-white hover:bg-white/20 border border-white/10';
      case 'ghost':
        return 'bg-transparent text-text-secondary hover:text-white hover:bg-white/5';
      default:
        return '';
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: mouseX, y: mouseY }}
      className="inline-block"
    >
      <motion.button
        className={`relative px-4 py-2 rounded-lg font-mono text-sm uppercase tracking-wide transition-colors ${getVariantClasses()} ${className}`}
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}

