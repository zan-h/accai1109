"use client";

import React, { useState, useEffect } from 'react';
import { VoicePreferences } from '@/app/lib/supabase/types';
import { saveVoicePreferences, fetchVoicePreferences } from '@/app/lib/voiceUtils';
import VoiceSelector from './VoiceSelector';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionStatus: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';
}

export default function VoiceSettingsModal({ 
  isOpen, 
  onClose,
  sessionStatus,
}: VoiceSettingsModalProps) {
  const [enabled, setEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);

  // Load current preferences when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const loadPreferences = async () => {
      setIsLoading(true);
      const preferences = await fetchVoicePreferences();
      
      if (preferences) {
        setEnabled(preferences.enabled);
        setSelectedVoice(preferences.voice);
      }
      
      setIsLoading(false);
    };
    
    loadPreferences();
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    const preferences: VoicePreferences = {
      enabled,
      voice: selectedVoice as any,
    };
    
    const success = await saveVoicePreferences(preferences);
    
    if (success) {
      setSaveStatus('success');
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setSaveStatus('idle');
      }, 1500);
    } else {
      setSaveStatus('error');
    }
    
    setIsSaving(false);
  };

  const handleCancel = () => {
    setSaveStatus('idle');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-bg-secondary border-2 border-border-primary rounded-lg shadow-glow-cyan w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <h2 className="text-text-primary font-mono text-lg uppercase tracking-wider">
            Voice Settings
          </h2>
          <button
            onClick={handleCancel}
            className="text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8 text-text-secondary font-mono">
              Loading preferences...
            </div>
          ) : (
            <>
              {/* Enable toggle */}
              <div className="flex items-center space-x-3 p-4 bg-bg-tertiary border border-border-secondary rounded">
                <input
                  type="checkbox"
                  id="voice-enabled"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-5 h-5 rounded border-border-primary focus:ring-2 focus:ring-accent-primary"
                />
                <label 
                  htmlFor="voice-enabled" 
                  className="text-text-primary font-mono cursor-pointer select-none"
                >
                  Use my preferred voice for all agents
                </label>
              </div>

              {/* Voice selector */}
              <VoiceSelector
                selectedVoice={selectedVoice}
                onSelectVoice={setSelectedVoice}
                disabled={!enabled}
              />

              {/* Connection status message */}
              {sessionStatus === 'CONNECTED' && (
                <div className="p-3 bg-status-warning/10 border border-status-warning/30 rounded">
                  <p className="text-status-warning text-sm font-mono">
                    ⚠️ Disconnect and reconnect to hear the new voice
                  </p>
                </div>
              )}

              {sessionStatus === 'DISCONNECTED' && enabled && (
                <div className="p-3 bg-accent-primary/10 border border-accent-primary/30 rounded">
                  <p className="text-accent-primary text-sm font-mono">
                    ℹ️ Changes will apply on next connection
                  </p>
                </div>
              )}

              {/* Save status messages */}
              {saveStatus === 'success' && (
                <div className="p-3 bg-status-success/10 border border-status-success/30 rounded">
                  <p className="text-status-success text-sm font-mono">
                    ✅ Voice preferences saved successfully!
                  </p>
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="p-3 bg-status-error/10 border border-status-error/30 rounded">
                  <p className="text-status-error text-sm font-mono">
                    ❌ Failed to save preferences. Please try again.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-border-primary">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 font-mono text-text-secondary hover:text-text-primary border border-border-primary hover:border-accent-primary rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-4 py-2 font-mono text-bg-primary bg-accent-primary hover:bg-accent-secondary border border-accent-primary rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

