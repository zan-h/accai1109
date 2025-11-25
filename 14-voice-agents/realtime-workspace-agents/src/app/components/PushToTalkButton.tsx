// PushToTalkButton.tsx - Hero CTA with advanced interactions
"use client";

import { motion, useAnimation } from 'framer-motion';
import { useState } from 'react';
import { useResponsive } from './layouts/ResponsiveLayout';

export interface PushToTalkButtonProps {
  isConnected: boolean;
  isPTTActive: boolean;
  onToggle: (active: boolean) => void;
  isSpeaking: boolean;
  onPressDown: () => void;
  onPressUp: () => void;
}

export function PushToTalkButton({ 
  isConnected, 
  isPTTActive,
  onToggle,
  isSpeaking, 
  onPressDown, 
  onPressUp 
}: PushToTalkButtonProps) {
  const controls = useAnimation();
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const { isMobile } = useResponsive();
  
  // Ripple effect on press
  const handlePress = (e: React.MouseEvent) => {
    if (!isConnected) return;
    
    // Toggle mode if clicking
    if (!isPTTActive) {
      onToggle(true);
      return;
    }

    onPressDown();
    
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
      scale: 0.95,
      transition: { duration: 0.1 },
    });
  };
  
  const handleRelease = () => {
    if (!isConnected || !isPTTActive) return;
    onPressUp();
    controls.start({
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 20 },
    });
  };

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isConnected) return;
    if (!isPTTActive) {
      onToggle(true);
      return;
    }
    e.preventDefault();
    onPressDown();
    controls.start({ scale: 0.95 });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isConnected || !isPTTActive) return;
    e.preventDefault();
    onPressUp();
    controls.start({ scale: 1 });
  };
  
  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Voice waveform visualization (when speaking) */}
      {isSpeaking && (
        <motion.div 
          className="absolute -top-24 flex items-end gap-1 h-16 pointer-events-none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-accent-primary rounded-full shadow-[0_0_10px_rgba(0,217,255,0.5)]"
              animate={{
                height: [
                  Math.random() * 40 + 10,
                  Math.random() * 40 + 10,
                  Math.random() * 40 + 10,
                ],
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatType: "reverse"
              }}
            />
          ))}
        </motion.div>
      )}
      
      {/* Main button */}
      <motion.button
        className={`relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isConnected ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
        } ${isMobile ? 'w-16 h-16' : 'w-24 h-24'}`}
        animate={controls}
        onMouseDown={isConnected ? handlePress : undefined}
        onMouseUp={isConnected ? handleRelease : undefined}
        onMouseLeave={isConnected ? handleRelease : undefined}
        onTouchStart={isConnected ? handleTouchStart : undefined}
        onTouchEnd={isConnected ? handleTouchEnd : undefined}
        whileHover={isConnected ? { scale: 1.05 } : {}}
        disabled={!isConnected}
        aria-label={isSpeaking ? "Release to send" : "Hold to speak"}
        aria-pressed={isSpeaking}
      >
        {/* Background glow */}
        <div className={`absolute inset-0 rounded-full transition-colors duration-300 ${
          isSpeaking 
            ? 'bg-accent-primary animate-pulse shadow-[0_0_50px_rgba(0,217,255,0.6)]' 
            : isPTTActive 
              ? 'bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border-2 border-accent-primary shadow-[0_0_20px_rgba(0,217,255,0.2)]'
              : 'bg-white/5 border-2 border-white/10'
        }`} />
        
        {/* Glass layer */}
        <div className="absolute inset-2 rounded-full glass-panel border-white/10" />
        
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
          <svg 
            className={`w-12 h-12 transition-colors duration-300 ${
              isSpeaking || isPTTActive ? 'text-accent-primary' : 'text-text-secondary'
            }`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
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
              opacity: [0.8, 0.0, 0.8],
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
        className="text-center pointer-events-none"
        animate={{ opacity: isConnected ? 1 : 0.5 }}
      >
        <div className="font-mono text-sm text-text-primary mb-1 font-bold tracking-wide">
          {isSpeaking ? 'LISTENING...' : isPTTActive ? 'HOLD TO TALK' : 'PUSH TO TALK'}
        </div>
        <div className="font-mono text-xs text-text-tertiary">
          {!isConnected 
            ? 'Connect to start' 
            : isPTTActive 
              ? (isMobile ? 'Press & hold button' : 'Press & hold or Spacebar') 
              : 'Click to enable'}
        </div>
      </motion.div>
    </div>
  );
}

export default PushToTalkButton;
