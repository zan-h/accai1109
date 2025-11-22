// src/app/components/OnboardingWelcome.tsx

import React, { useEffect } from 'react';

interface OnboardingWelcomeProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingWelcome({ onComplete, onSkip }: OnboardingWelcomeProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onComplete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete, onSkip]);

  return (
    <div 
      className="fixed inset-0 bg-bg-overlay z-50 flex items-center justify-center animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-headline"
      aria-describedby="onboarding-subheadline"
    >
      <div 
        className="w-full max-w-2xl mx-4 bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan p-8 md:p-12 animate-scaleIn"
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="text-6xl md:text-7xl animate-iconPulse" role="img" aria-label="Microphone">
            🎙️
          </div>
        </div>

        {/* Headline */}
        <h1 
          id="onboarding-headline"
          className="text-text-primary font-mono text-2xl md:text-4xl font-bold tracking-tight text-center mb-6 max-w-xl mx-auto"
        >
          Get More Done, Feel Better Doing It
        </h1>

        {/* Subheadline */}
        <p 
          id="onboarding-subheadline"
          className="text-text-secondary font-mono text-base md:text-xl leading-relaxed text-center mb-10 max-w-lg mx-auto"
        >
          Voice AI that adapts to your energy, focus, and work style in real-time.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onComplete}
            className="w-full md:w-auto px-8 py-4 bg-accent-primary hover:bg-accent-primary/90 text-bg-primary font-mono text-lg font-semibold border-2 border-accent-primary transition-all duration-200 hover:shadow-glow-cyan focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-secondary"
            aria-label="Choose the way you want to work"
          >
            Choose the way you want to work →
          </button>

          {/* Skip Link */}
          <button
            onClick={onSkip}
            className="text-text-tertiary hover:text-accent-primary font-mono text-sm underline-offset-4 hover:underline transition-colors duration-200 focus:outline-none focus:text-accent-primary"
            aria-label="Skip onboarding for now"
          >
            Skip for now
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="mt-8 text-center text-text-tertiary font-mono text-xs">
          <span className="hidden md:inline">Press Enter to continue • Press Esc to skip</span>
        </div>
      </div>
    </div>
  );
}

