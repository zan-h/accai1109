// src/app/components/SuiteIndicator.tsx

import React from 'react';
import { AgentSuite } from '@/app/agentConfigs/types';

interface SuiteIndicatorProps {
  currentSuite: AgentSuite | null;
  onChangeSuite: () => void;
}

export default function SuiteIndicator({ currentSuite, onChangeSuite }: SuiteIndicatorProps) {
  if (!currentSuite) return null;
  
  return (
    <div 
      onClick={onChangeSuite}
      className="flex items-center gap-2 px-3 py-2 border border-border-primary bg-bg-secondary hover:border-accent-primary cursor-pointer transition-all group"
      role="button"
      aria-label={`Current suite: ${currentSuite.name}. Click to change.`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChangeSuite();
        }
      }}
    >
      <span className="text-2xl" role="img" aria-label={currentSuite.name}>
        {currentSuite.icon}
      </span>
      <div className="flex flex-col">
        <span className="text-text-primary text-xs font-mono group-hover:text-accent-primary transition-colors">
          {currentSuite.name}
        </span>
        <span className="text-text-tertiary text-xs">
          {currentSuite.agents.length} {currentSuite.agents.length === 1 ? 'agent' : 'agents'}
        </span>
      </div>
      <svg 
        className="w-4 h-4 text-text-tertiary group-hover:text-accent-primary ml-2 transition-colors" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}



