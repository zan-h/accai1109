// FeedbackButton.tsx - Quick user feedback submission
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useToast } from '@/app/contexts/ToastContext';
import { useProjectContext } from '@/app/contexts/ProjectContext';

interface FeedbackButtonProps {
  currentSuiteId?: string;
  currentSessionId?: string;
  id?: string;
}

export function FeedbackButton({ currentSuiteId, currentSessionId, id }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'bug' | 'idea' | 'annoyance' | 'other'>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const { getCurrentProject } = useProjectContext();
  const currentProject = getCurrentProject();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      showToast('Please enter some feedback', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackText: feedbackText.trim(),
          feedbackType,
          projectId: currentProject?.id,
          sessionId: currentSessionId,
          suiteId: currentSuiteId,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `Failed to submit feedback (${response.status})`);
      }

      showToast('Thanks! Your feedback helps us improve 💙', 'success');
      setIsOpen(false);
      setFeedbackText('');
      setFeedbackType('other');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Failed: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <motion.button
        id={id}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full glass-panel-heavy flex items-center justify-center hover:neon-border-cyan shadow-xl shadow-black/30 group"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Send feedback"
        title="Send feedback"
      >
        <motion.span 
          className="text-2xl"
          animate={{ 
            rotate: isOpen ? 180 : 0,
          }}
          transition={{ type: 'spring', damping: 15 }}
        >
          💭
        </motion.span>
        
        {/* Pulse hint on first load */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent-primary/50"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ 
            duration: 2, 
            repeat: 3, 
            repeatDelay: 3,
            ease: 'easeOut' 
          }}
        />
      </motion.button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal */}
            <motion.div
              className="relative w-full max-w-lg glass-panel-heavy rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-modal-title"
            >
              {/* Header */}
              <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-bg-secondary/50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💭</span>
                  <h2 id="feedback-modal-title" className="text-xl font-mono font-bold text-white">
                    What&apos;s on your mind?
                  </h2>
                </div>
                <motion.button
                  className="w-8 h-8 rounded-full glass-panel flex items-center justify-center hover:neon-border-cyan text-white"
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close feedback"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-mono text-text-secondary mb-2">
                    Type (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'bug', label: '🐛 Bug', emoji: '🐛' },
                      { id: 'idea', label: '💡 Idea', emoji: '💡' },
                      { id: 'annoyance', label: '😤 Annoyance', emoji: '😤' },
                      { id: 'other', label: '💬 Other', emoji: '💬' },
                    ].map((type) => (
                      <motion.button
                        key={type.id}
                        className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                          feedbackType === type.id
                            ? 'glass-panel-heavy neon-border-cyan text-white'
                            : 'glass-panel text-text-secondary hover:text-white hover:bg-white/5'
                        }`}
                        onClick={() => setFeedbackType(type.id as any)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {type.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Feedback Text */}
                <div>
                  <label htmlFor="feedback-text" className="block text-sm font-mono text-text-secondary mb-2">
                    Tell us more
                  </label>
                  <textarea
                    id="feedback-text"
                    className="w-full h-32 px-4 py-3 rounded-lg glass-panel text-white font-mono text-sm resize-none focus:outline-none focus:neon-border-cyan transition-all"
                    placeholder="Describe any annoyance, bug, or idea to make this better..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                {/* Footer Info */}
                <p className="text-xs font-mono text-text-secondary">
                  📍 We&apos;ll automatically capture your current session context to help us understand your feedback better.
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    className="flex-1 px-4 py-3 rounded-lg glass-panel font-mono text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-all"
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="flex-1 px-4 py-3 rounded-lg glass-panel-heavy neon-border-cyan font-mono text-sm text-white hover:bg-accent-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send 🚀'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

