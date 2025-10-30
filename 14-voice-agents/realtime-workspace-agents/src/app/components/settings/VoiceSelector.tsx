"use client";

import React from 'react';
import { OpenAIVoiceName } from '@/app/lib/supabase/types';
import { VOICE_DESCRIPTIONS } from '@/app/lib/voiceUtils';

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
  disabled?: boolean;
}

const VOICE_OPTIONS: OpenAIVoiceName[] = [
  'alloy',
  'echo',
  'sage',
  'shimmer',
  'fable',
  'onyx',
  'nova',
  'verse',
];

export default function VoiceSelector({
  selectedVoice,
  onSelectVoice,
  disabled = false,
}: VoiceSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-text-secondary font-mono text-sm uppercase tracking-wider">
        Select Voice
      </label>
      
      <div className={`space-y-2 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
        {VOICE_OPTIONS.map((voice) => {
          const isSelected = selectedVoice === voice;
          
          return (
            <button
              key={voice}
              onClick={() => onSelectVoice(voice)}
              disabled={disabled}
              className={`
                w-full p-3 flex items-center justify-between
                border rounded transition-all
                ${
                  isSelected
                    ? 'bg-accent-primary/20 border-accent-primary shadow-glow-cyan'
                    : 'bg-bg-tertiary border-border-secondary hover:border-accent-primary/50'
                }
                disabled:cursor-not-allowed
              `}
            >
              {/* Radio indicator + Voice info */}
              <div className="flex items-center space-x-3">
                {/* Radio button */}
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${
                      isSelected
                        ? 'border-accent-primary bg-accent-primary'
                        : 'border-border-primary'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-bg-primary" />
                  )}
                </div>
                
                {/* Voice name and description */}
                <div className="text-left">
                  <div className={`font-mono font-semibold capitalize ${isSelected ? 'text-accent-primary' : 'text-text-primary'}`}>
                    {voice}
                  </div>
                  <div className="text-text-tertiary text-sm font-mono">
                    {VOICE_DESCRIPTIONS[voice]}
                  </div>
                </div>
              </div>
              
              {/* Preview button (disabled for now - Phase 2 feature) */}
              {/* <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Preview voice
                }}
                className="text-accent-primary hover:text-accent-secondary transition-colors p-1"
                title="Preview voice"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </button> */}
            </button>
          );
        })}
      </div>
    </div>
  );
}

