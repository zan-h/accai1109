// Timer.tsx - Cinematic progress ring
"use client";

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useWorkspaceContext } from '@/app/contexts/WorkspaceContext';

export default function Timer() {
  const activeTimer = useWorkspaceContext((state) => state.activeTimer);
  const pauseTimer = useWorkspaceContext((state) => state.pauseTimer);
  const resumeTimer = useWorkspaceContext((state) => state.resumeTimer);
  const stopTimer = useWorkspaceContext((state) => state.stopTimer);
  const toggleTimerNotifications = useWorkspaceContext((state) => state.toggleTimerNotifications);
  
  const [currentTime, setCurrentTime] = useState(Date.now());
  const controls = useAnimation();
  
  // Update current time every 100ms for smooth countdown
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return;
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
    
    return () => clearInterval(interval);
  }, [activeTimer]);
  
  // Check for completion
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return;
    
    const now = Date.now();
    const elapsed = activeTimer.elapsedMs + (now - activeTimer.startedAt);
    const remaining = Math.max(0, activeTimer.durationMs - elapsed);
    
    if (remaining === 0 && elapsed >= activeTimer.durationMs) {
      // Fire celebration only once
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
      
      // Emit completion event
      const event = new CustomEvent('timer.complete', {
        detail: {
          label: activeTimer.label,
          durationMs: activeTimer.durationMs,
          timerId: activeTimer.id,
        },
      });
      window.dispatchEvent(event);
    }
  }, [activeTimer, currentTime, controls]);

  // Detect and emit interval notifications
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return;
    
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = activeTimer.elapsedMs + (now - activeTimer.startedAt);
      const remaining = Math.max(0, activeTimer.durationMs - elapsed);
      const percentComplete = Math.min(100, (elapsed / activeTimer.durationMs) * 100);
      
      // Helper function to emit interval event
      const emitTimerIntervalEvent = (type: string) => {
        if (!activeTimer.agentNotificationsEnabled) return;
        if (activeTimer.triggeredIntervals.has(type)) return;
        
        activeTimer.triggeredIntervals.add(type);
        
        const event = new CustomEvent('timer.interval', {
          detail: {
            type,
            percentComplete: Math.round(percentComplete),
            remainingMs: remaining,
            remainingMinutes: Math.floor(remaining / 60000),
            label: activeTimer.label,
            timerId: activeTimer.id,
          },
        });
        window.dispatchEvent(event);
      };
      
      // Check intervals (25%, 50%, 75%, final stretch)
      if (activeTimer.notificationPreferences.enable25Percent && percentComplete >= 25 && !activeTimer.triggeredIntervals.has('25%')) emitTimerIntervalEvent('25_percent');
      if (activeTimer.notificationPreferences.enableHalfway && percentComplete >= 50 && !activeTimer.triggeredIntervals.has('50%')) emitTimerIntervalEvent('halfway');
      if (activeTimer.notificationPreferences.enable75Percent && percentComplete >= 75 && !activeTimer.triggeredIntervals.has('75%')) emitTimerIntervalEvent('75_percent');
      if (activeTimer.notificationPreferences.enableFinalStretch && remaining < 300000 && remaining > 60000 && !activeTimer.triggeredIntervals.has('final_stretch')) emitTimerIntervalEvent('final_stretch');
      if (activeTimer.notificationPreferences.enableCompletion && remaining === 0 && elapsed >= activeTimer.durationMs && !activeTimer.triggeredIntervals.has('complete')) emitTimerIntervalEvent('complete');
      
    }, 100);
    
    return () => clearInterval(checkInterval);
  }, [activeTimer, currentTime]);
  
  if (!activeTimer) return null;
  
  const now = currentTime;
  const elapsed = activeTimer.status === 'running' 
    ? activeTimer.elapsedMs + (now - activeTimer.startedAt)
    : activeTimer.elapsedMs;
  
  const remaining = Math.max(0, activeTimer.durationMs - elapsed);
  
  // Circular Progress Calculation
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, remaining / activeTimer.durationMs));
  const strokeDashoffset = circumference - (progress * circumference);
  
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="fixed bottom-8 right-8 z-40 pointer-events-none">
      <motion.div 
        className="glass-panel-heavy rounded-3xl p-6 relative pointer-events-auto"
        animate={controls}
        whileHover={{ scale: 1.05 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Constraints handled by parent or just allow free drag
      >
        {/* Close Button */}
        <button 
          onClick={stopTimer}
          className="absolute top-4 right-4 text-text-tertiary hover:text-white z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* SVG circular progress */}
        <svg className="w-48 h-48" viewBox="0 0 240 240">
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          
          {/* Progress circle with glow */}
          <motion.circle
            cx="120"
            cy="120"
            r={radius}
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
            initial={{ strokeDashoffset: 0 }}
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
            {timeDisplay}
          </text>
          
          <text
            x="120"
            y="140"
            textAnchor="middle"
            className="font-mono text-xs fill-text-secondary"
          >
            {activeTimer.label}
          </text>
        </svg>
        
        {/* Play/pause control */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {activeTimer.status === 'running' ? (
            <motion.button
              className="glass-panel px-6 py-2 rounded-full neon-border-cyan bg-bg-secondary/80 backdrop-blur-sm"
              onClick={pauseTimer}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="font-mono text-sm text-accent-primary font-bold">
                PAUSE
              </span>
            </motion.button>
          ) : activeTimer.status === 'paused' ? (
            <motion.button
              className="glass-panel px-6 py-2 rounded-full neon-border-cyan bg-bg-secondary/80 backdrop-blur-sm"
              onClick={resumeTimer}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="font-mono text-sm text-accent-primary font-bold">
                RESUME
              </span>
            </motion.button>
          ) : (
            <div className="text-status-success font-mono text-sm font-bold">
              COMPLETE
            </div>
          )}
        </div>

        {/* Notifications Toggle */}
        <div className="absolute top-4 left-4 z-20 flex flex-col items-start group">
          <button
            onClick={toggleTimerNotifications}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full border transition-all ${
              activeTimer.agentNotificationsEnabled 
                ? 'bg-accent-primary/10 border-accent-primary text-accent-primary shadow-[0_0_10px_rgba(0,217,255,0.2)]' 
                : 'bg-white/5 border-white/10 text-text-tertiary hover:text-white hover:border-white/30'
            }`}
          >
            <span className="text-xs">🔔</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Agent
            </span>
          </button>
          
          {/* Hover Tooltip */}
          <div className="absolute top-full left-0 mt-2 w-40 p-2 rounded-lg bg-black/90 border border-white/10 text-[10px] text-text-secondary leading-tight opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-md">
            {activeTimer.agentNotificationsEnabled 
              ? "Agent will receive progress updates to encourage you."
              : "Agent updates disabled. The timer runs silently."}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
