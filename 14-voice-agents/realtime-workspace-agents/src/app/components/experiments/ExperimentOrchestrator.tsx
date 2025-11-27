// ExperimentOrchestrator.tsx
'use client';

import { useEffect } from 'react';
import { useExperimentStore } from '@/app/hooks/useExperimentStore';
import { ExperimentSelectionModal } from './ExperimentSelectionModal';
import { ExperimentConsentModal } from './ExperimentConsentModal';
import { ExperimentQuestionnaireModal } from './ExperimentQuestionnaireModal';
import { useToast } from '@/app/contexts/ToastContext';

export function ExperimentOrchestrator() {
  const { isActive, type, stage, completeExperiment } = useExperimentStore();
  const { showToast } = useToast();

  // Listen for timer completion
  useEffect(() => {
    if (!isActive || stage !== 'running' || type !== 'experiment_1') return;

    const handleTimerComplete = () => {
      console.log('🧪 Experiment 1: Timer completed, showing questionnaire');
      showToast('Session complete! Please fill out the quick survey.', 'success');
      completeExperiment(); // Moves to 'completed' stage, which triggers the form
    };

    window.addEventListener('timer.complete', handleTimerComplete);
    // Also listen for the other event name just in case
    window.addEventListener('timer.completed', handleTimerComplete);

    return () => {
      window.removeEventListener('timer.complete', handleTimerComplete);
      window.removeEventListener('timer.completed', handleTimerComplete);
    };
  }, [isActive, stage, type, completeExperiment, showToast]);

  return (
    <>
      <ExperimentSelectionModal />
      <ExperimentConsentModal />
      <ExperimentQuestionnaireModal />
    </>
  );
}

