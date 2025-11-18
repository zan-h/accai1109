"use client";

import React, { useState, useEffect } from 'react';
import { useWorkspaceContext } from '@/app/contexts/WorkspaceContext';

export default function Timer() {
  const activeTimer = useWorkspaceContext((state) => state.activeTimer);
  const pauseTimer = useWorkspaceContext((state) => state.pauseTimer);
  const resumeTimer = useWorkspaceContext((state) => state.resumeTimer);
  const stopTimer = useWorkspaceContext((state) => state.stopTimer);
  
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Update current time every 100ms for smooth countdown
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return;
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
    
    return () => clearInterval(interval);
  }, [activeTimer]);
  
  // Auto-expand when timer starts
  useEffect(() => {
    if (activeTimer) {
      setIsExpanded(true);
    }
  }, [activeTimer?.id]); // Only when a new timer starts
  
  // Emit completion event when timer reaches zero
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return;
    
    const now = Date.now();
    const elapsed = activeTimer.elapsedMs + (now - activeTimer.startedAt);
    const remaining = Math.max(0, activeTimer.durationMs - elapsed);
    
    // If timer just completed (within last 500ms)
    if (remaining === 0 && elapsed >= activeTimer.durationMs) {
      console.log('⏰ Timer complete:', activeTimer.label);
      
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
  }, [activeTimer, currentTime]);
  
  if (!activeTimer) return null;
  
  const now = currentTime;
  const elapsed = activeTimer.status === 'running' 
    ? activeTimer.elapsedMs + (now - activeTimer.startedAt)
    : activeTimer.elapsedMs;
  
  const remaining = Math.max(0, activeTimer.durationMs - elapsed);
  const percentComplete = Math.min(100, (elapsed / activeTimer.durationMs) * 100);
  
  // Format time as MM:SS
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // Color coding based on status and remaining time
  const getStatusColor = () => {
    if (activeTimer.status === 'completed') return 'text-status-success';
    if (activeTimer.status === 'paused') return 'text-status-warning';
    if (remaining < 60000) return 'text-status-error'; // Less than 1 minute
    if (remaining < 300000) return 'text-status-warning'; // Less than 5 minutes
    return 'text-accent-primary';
  };
  
  const getProgressColor = () => {
    if (activeTimer.status === 'completed') return 'bg-status-success';
    if (activeTimer.status === 'paused') return 'bg-status-warning';
    if (remaining < 60000) return 'bg-status-error';
    if (remaining < 300000) return 'bg-status-warning';
    return 'bg-accent-primary';
  };
  
  const getBorderColor = () => {
    if (activeTimer.status === 'completed') return 'border-status-success';
    if (activeTimer.status === 'paused') return 'border-status-warning';
    if (remaining < 60000) return 'border-status-error';
    if (remaining < 300000) return 'border-status-warning';
    return 'border-accent-primary';
  };
  
  const getStatusText = () => {
    if (activeTimer.status === 'completed') return '✓ COMPLETED';
    if (activeTimer.status === 'paused') return '⏸ PAUSED';
    return '⏱ RUNNING';
  };
  
  // Pulsing animation for running timer
  const pulseClass = activeTimer.status === 'running' && remaining < 60000 
    ? 'animate-pulse' 
    : '';
  
  if (!isExpanded) {
    // Minimized view - small corner indicator
    return (
      <div 
        className="fixed top-4 right-4 z-50 cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className={`
          bg-bg-secondary border-2 ${getBorderColor()}
          px-4 py-2 rounded-lg shadow-lg
          hover:shadow-glow-cyan transition-all
          ${pulseClass}
        `}>
          <div className={`font-mono text-lg font-bold ${getStatusColor()}`}>
            {timeDisplay}
          </div>
        </div>
      </div>
    );
  }
  
  // Expanded view - full timer display
  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <div className={`
        bg-bg-secondary border-2 ${getBorderColor()}
        rounded-lg shadow-2xl overflow-hidden
        ${pulseClass}
      `}>
        {/* Header */}
        <div className="px-4 py-3 bg-bg-tertiary border-b border-border-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono uppercase tracking-wider ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-text-tertiary hover:text-text-primary transition-colors text-sm"
            title="Minimize"
          >
            ─
          </button>
        </div>
        
        {/* Timer label */}
        <div className="px-4 pt-3 pb-2">
          <div className="text-text-primary font-medium text-sm truncate">
            {activeTimer.label}
          </div>
        </div>
        
        {/* Main countdown display */}
        <div className="px-4 py-6">
          <div className={`
            text-6xl font-bold font-mono text-center
            ${getStatusColor()}
            transition-colors
          `}>
            {activeTimer.status === 'completed' ? '00:00' : timeDisplay}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="px-4 pb-4">
          <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full ${getProgressColor()} transition-all duration-200 ease-linear`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-text-tertiary font-mono">
            <span>{Math.floor(elapsed / 60000)}m elapsed</span>
            <span>{Math.round(percentComplete)}%</span>
            <span>{minutes}m remaining</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="px-4 pb-4 flex gap-2">
          {activeTimer.status === 'running' && (
            <button
              onClick={pauseTimer}
              className="flex-1 py-2 px-4 bg-bg-tertiary text-text-primary border border-border-primary hover:border-status-warning hover:text-status-warning transition-all font-mono text-sm uppercase tracking-wide"
            >
              ⏸ Pause
            </button>
          )}
          
          {activeTimer.status === 'paused' && (
            <button
              onClick={resumeTimer}
              className="flex-1 py-2 px-4 bg-bg-tertiary text-text-primary border border-border-primary hover:border-accent-primary hover:text-accent-primary transition-all font-mono text-sm uppercase tracking-wide"
            >
              ▶ Resume
            </button>
          )}
          
          <button
            onClick={stopTimer}
            className="flex-1 py-2 px-4 bg-bg-tertiary text-text-primary border border-border-primary hover:border-status-error hover:text-status-error transition-all font-mono text-sm uppercase tracking-wide"
          >
            ⏹ Stop
          </button>
        </div>
        
        {/* Completion message */}
        {activeTimer.status === 'completed' && (
          <div className="px-4 pb-4">
            <div className="bg-status-success bg-opacity-10 border border-status-success rounded px-3 py-2 text-center">
              <div className="text-status-success font-mono text-sm font-bold">
                🎉 TIME&apos;S UP!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

