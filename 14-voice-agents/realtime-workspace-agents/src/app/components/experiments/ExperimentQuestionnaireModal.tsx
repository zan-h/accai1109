// ExperimentQuestionnaireModal.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useExperimentStore } from '@/app/hooks/useExperimentStore';
import { useToast } from '@/app/contexts/ToastContext';

export function ExperimentQuestionnaireModal() {
  const { stage, type, closeExperiment } = useExperimentStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Common Form State
  const [controlScore, setControlScore] = useState<number | null>(null);
  const [workloadScore, setWorkloadScore] = useState<number | null>(null);
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [comments, setComments] = useState('');

  // Exp 2 Specific State
  const [productivityScore, setProductivityScore] = useState<number | null>(null);
  const [agentHelpfulnessScore, setAgentHelpfulnessScore] = useState<number | null>(null);

  // Reset state when modal opens/type changes
  useEffect(() => {
    if (stage === 'completed') {
      setControlScore(null);
      setWorkloadScore(null);
      setSafetyScore(null);
      setProductivityScore(null);
      setAgentHelpfulnessScore(null);
      setComments('');
    }
  }, [stage, type]);

  if (stage !== 'completed') return null;

  const handleSubmit = async () => {
    // Basic validation
    if (type === 'experiment_1') {
      if (controlScore === null || workloadScore === null || safetyScore === null) {
        showToast('Please answer all rating questions', 'error');
        return;
      }
    } else if (type === 'experiment_2') {
      if (productivityScore === null || agentHelpfulnessScore === null || controlScore === null) {
        showToast('Please answer all rating questions', 'error');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const results: any = {
        controlScore,
        comments,
      };

      if (type === 'experiment_1') {
        results.workloadScore = workloadScore;
        results.safetyScore = safetyScore;
      } else {
        results.productivityScore = productivityScore;
        results.agentHelpfulnessScore = agentHelpfulnessScore;
        // Re-use control score or add others if needed
      }

      // Call API to save results
      const response = await fetch('/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experimentType: type,
          results,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save results');
      }
      
      showToast('Thank you! Experiment session complete.', 'success');
      closeExperiment(); // Fully close and reset
    } catch (error) {
      console.error('Failed to submit experiment:', error);
      showToast('Failed to save results. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = type === 'experiment_1' ? 'Session Complete' : 'Retrospective Analysis';
  const subtitle = type === 'experiment_1' 
    ? 'Please answer a few quick questions about your experience.'
    : 'Reflect on your recent work sessions with the agent.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-white/60 text-sm">{subtitle}</p>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[60vh]">
          
          {type === 'experiment_1' && (
            <>
              <LikertScale 
                label="How in control did you feel during this session?"
                minLabel="Not at all"
                maxLabel="Completely"
                value={controlScore}
                onChange={setControlScore}
              />
              <LikertScale 
                label="How was the mental workload?"
                minLabel="Very Low"
                maxLabel="Very High"
                value={workloadScore}
                onChange={setWorkloadScore}
              />
              <LikertScale 
                label="How safe/comfortable did you feel?"
                minLabel="Unsafe/Uncomfortable"
                maxLabel="Very Safe/Comfortable"
                value={safetyScore}
                onChange={setSafetyScore}
              />
            </>
          )}

          {type === 'experiment_2' && (
            <>
              <LikertScale 
                label="How would you rate your productivity this week?"
                minLabel="Very Low"
                maxLabel="Very High"
                value={productivityScore}
                onChange={setProductivityScore}
              />
              <LikertScale 
                label="How helpful was the agent in maintaining focus?"
                minLabel="Hindered Focus"
                maxLabel="Greatly Helped"
                value={agentHelpfulnessScore}
                onChange={setAgentHelpfulnessScore}
              />
              <LikertScale 
                label="How in control did you feel over the agent's actions?"
                minLabel="Not at all"
                maxLabel="Completely"
                value={controlScore}
                onChange={setControlScore}
              />
            </>
          )}

          {/* Common Comments Field */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">Any additional comments? (Optional)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
              placeholder={type === 'experiment_1' ? "Bugs, annoyances, or ideas..." : "What worked well? What didn't?"}
            />
          </div>

        </div>

        <div className="p-6 border-t border-white/10 bg-[#0A0A0A] flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={closeExperiment}
            className="px-4 py-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Submitting...' : 'Submit & Finish'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function LikertScale({ 
  label, 
  minLabel, 
  maxLabel, 
  value, 
  onChange 
}: { 
  label: string; 
  minLabel: string; 
  maxLabel: string; 
  value: number | null; 
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-white">{label}</label>
      <div className="flex justify-between items-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-mono transition-all ${
              value === num 
                ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/30' 
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-white/30 px-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
