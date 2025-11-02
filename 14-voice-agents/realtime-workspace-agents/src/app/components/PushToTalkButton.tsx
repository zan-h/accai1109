"use client";

import React from "react";
import { useResponsive } from "./layouts/ResponsiveLayout";

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
  onPressUp,
}: PushToTalkButtonProps) {
  const { isMobile } = useResponsive();
  const [isHoldingButton, setIsHoldingButton] = React.useState(false);

  // Determine button state and styling
  const getButtonClasses = () => {
    const baseClasses = "flex items-center justify-center gap-x-2 font-mono uppercase tracking-wider transition-all border-2 touch-manipulation";
    
    // Mobile: full-width, larger touch target
    const sizeClasses = isMobile 
      ? "w-full min-h-[48px] px-4 py-3 text-sm" 
      : "px-4 py-2 text-xs";

    if (!isConnected) {
      // Disabled (not connected)
      return `${baseClasses} ${sizeClasses} opacity-30 cursor-not-allowed border-border-primary bg-bg-tertiary text-text-tertiary`;
    }

    if (isSpeaking) {
      // Speaking (user talking) - pulsing glow
      return `${baseClasses} ${sizeClasses} bg-accent-primary text-bg-primary border-accent-primary shadow-glow-cyan animate-pulse-glow cursor-pointer`;
    }

    if (isPTTActive) {
      // Active (PTT on, ready) - border glow
      return `${baseClasses} ${sizeClasses} border-accent-primary bg-bg-tertiary text-accent-primary shadow-glow-cyan-subtle animate-pulse-border cursor-pointer hover:shadow-glow-cyan`;
    }

    // Enabled (PTT off)
    return `${baseClasses} ${sizeClasses} border-border-primary bg-bg-tertiary text-text-primary hover:border-accent-primary hover:shadow-glow-cyan cursor-pointer`;
  };

  const getButtonLabel = () => {
    if (!isConnected) return "Push to Talk";
    if (isSpeaking) return "Speaking...";
    if (isPTTActive) return isMobile ? "Push to Talk" : "Press Space";
    return "Push to Talk";
  };

  const getButtonIcon = () => {
    return (
      <svg
        className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    );
  };

  const handleClick = () => {
    // Only toggle mode if not holding the button
    if (isConnected && !isHoldingButton) {
      onToggle(!isPTTActive);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isConnected || !isPTTActive) return;
    
    // Prevent click event from firing
    e.preventDefault();
    
    setIsHoldingButton(true);
    onPressDown();
  };

  const handleMouseUp = () => {
    if (!isConnected || !isPTTActive || !isHoldingButton) return;
    
    setIsHoldingButton(false);
    onPressUp();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isConnected || !isPTTActive) return;
    
    e.preventDefault();
    
    setIsHoldingButton(true);
    onPressDown();
  };

  const handleTouchEnd = () => {
    if (!isConnected || !isPTTActive || !isHoldingButton) return;
    
    setIsHoldingButton(false);
    onPressUp();
  };

  // Clean up if user moves mouse away while holding
  const handleMouseLeave = () => {
    if (isHoldingButton) {
      setIsHoldingButton(false);
      onPressUp();
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={!isConnected}
      className={getButtonClasses()}
      title={
        !isConnected
          ? "Connect to enable push-to-talk"
          : isPTTActive
          ? "Hold to speak, or press spacebar"
          : "Click to enable push-to-talk mode"
      }
      aria-label={getButtonLabel()}
      aria-pressed={isPTTActive}
    >
      {getButtonIcon()}
      <span>{getButtonLabel()}</span>
    </button>
  );
}

export default PushToTalkButton;

