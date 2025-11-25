
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
  isActive: boolean;
  currentStepIndex: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  steps: TourStep[];
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-project-switcher',
    title: 'Project & Suite',
    content: 'Switch between different projects and specialized agent suites here.',
    position: 'bottom',
  },
  {
    targetId: 'tour-ptt-button',
    title: 'Push to Talk',
    content: 'Hold to speak to your agent. Release to send. It captures your voice instantly.',
    position: 'top',
  },
  {
    targetId: 'tour-transcript',
    title: 'Live Transcript',
    content: 'See your conversation in real-time. You can scroll back to review past interactions.',
    position: 'left',
  },
  {
    targetId: 'tour-settings',
    title: 'Settings',
    content: 'Customize your experience, change audio devices, and access developer tools.',
    position: 'bottom', // assuming top right
  },
  {
    targetId: 'tour-work-journal',
    title: 'Work Journal',
    content: 'Track your progress, log daily entries, and review your productivity over time.',
    position: 'right',
  },
  {
    targetId: 'tour-feedback',
    title: 'Feedback',
    content: 'Found a bug or have an idea? Let us know quickly with this button.',
    position: 'top', // bottom right
  }
];

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    // Optionally save "tour completed" state to local storage here
    localStorage.setItem('has_seen_tour', 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      endTour();
    }
  }, [currentStepIndex, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  // Close tour on Escape
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        endTour();
      } else if (e.key === 'ArrowRight') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, endTour, nextStep, prevStep]);

  return (
    <TourContext.Provider value={{
      isActive,
      currentStepIndex,
      startTour,
      endTour,
      nextStep,
      prevStep,
      steps: TOUR_STEPS
    }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

