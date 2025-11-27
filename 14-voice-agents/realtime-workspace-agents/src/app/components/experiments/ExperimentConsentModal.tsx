// ExperimentConsentModal.tsx
'use client';

import { motion } from 'framer-motion';
import { useExperimentStore } from '@/app/hooks/useExperimentStore';

const SURVEY_URL_EXP1 = 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=8l9CbGVo30Kk245q9jSBPefPE1UEnRFNhWiGNiCok5xUMEJSU0hNSDMxVU5RMjg1NllFSjVCNVJaUy4u';
const INFO_URL = 'https://docs.google.com/document/d/1auA42890XrsMVqL61s-kGKLIPAIgZwrciGiDaHQ0C4A/edit?usp=sharing';
const SURVEY_URL_EXP2 = 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=8l9CbGVo30Kk245q9jSBPefPE1UEnRFNhWiGNiCok5xUMUtTWEJRRTc4VFU2RVo1RFBaS1FPSDRSVS4u';

export function ExperimentConsentModal() {
  const { stage, type, startExperiment, completeExperiment, resetExperiment } = useExperimentStore();

  if (stage !== 'instructions') return null;

  const content = type === 'experiment_1' ? {
    title: 'Experiment 1: In-the-Moment Session',
    duration: '15–20 minutes',
    steps: [
      {
        title: 'Step 1: Participant Info & Consent',
        description: 'Review the participant information sheet and consent form (opens in new tabs).',
        icon: '📝'
      },
      {
        title: 'Step 2: The Session',
        description: 'Pick a task, set a timer for 10-15 min, and work naturally with the agent.',
        icon: '⏱️'
      },
      {
        title: 'Step 3: Post-Session',
        description: 'When the timer ends, a quick final survey will appear here.',
        icon: '🏁'
      }
    ]
  } : {
    title: 'Experiment 2: Retrospective Analysis',
    duration: '10–15 minutes',
    steps: [
      {
        title: 'Step 1: Participant Info',
        description: 'Review the participant information sheet (opens in new tab).',
        icon: 'ℹ️'
      },
      {
        title: 'Step 2: Analysis',
        description: 'Complete the structured retrospective questionnaire (opens in new tab).',
        icon: '📊'
      }
    ]
  };

  const handleStart = () => {
    // Open Info Sheet for both
    window.open(INFO_URL, '_blank');
    
    if (type === 'experiment_1') {
      // Open the pre-survey in a new tab
      // Use setTimeout to avoid browser blocking the second popup
      setTimeout(() => {
        window.open(SURVEY_URL_EXP1, '_blank');
      }, 100);
      
      // Start the session state immediately
      startExperiment();
    } else {
      // Open the retrospective survey
      setTimeout(() => {
        window.open(SURVEY_URL_EXP2, '_blank');
      }, 100);
      
      // For retrospective, we're done
      resetExperiment();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{content.title}</h2>
              <p className="text-white/50 text-sm mt-1">Total time: {content.duration}</p>
            </div>
            <button 
              onClick={resetExperiment}
              className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            {content.steps.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-2xl">{step.icon}</div>
                <div>
                  <h3 className="font-bold text-white text-sm">{step.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
             <p className="text-xs text-white/30 text-center mb-4">
              By continuing, you agree to participate in this study.
            </p>

            <div className="flex gap-3">
              <button
                onClick={resetExperiment}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                className="flex-[2] px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all font-bold text-sm flex items-center justify-center gap-2"
              >
                <span>Agree & Open Forms</span>
                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
