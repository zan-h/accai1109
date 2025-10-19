// src/app/components/SuiteTemplatePrompt.tsx

import React, { useState } from 'react';
import { AgentSuite } from '@/app/agentConfigs/types';

interface SuiteTemplatePromptProps {
  suite: AgentSuite;
  onAdd: (remember: boolean) => void;
  onSkip: (remember: boolean) => void;
  onClose: () => void;
}

export default function SuiteTemplatePrompt({ 
  suite, 
  onAdd, 
  onSkip,
  onClose 
}: SuiteTemplatePromptProps) {
  const [remember, setRemember] = useState(false);
  
  const templateCount = suite.workspaceTemplates?.length || 0;
  
  if (templateCount === 0) {
    // No templates, skip prompt
    onSkip(false);
    return null;
  }
  
  const handleAdd = () => {
    onAdd(remember);
    onClose();
  };
  
  const handleSkip = () => {
    onSkip(remember);
    onClose();
  };
  
  return (
    <div 
      className="fixed inset-0 bg-bg-overlay z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-md bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="suite-template-prompt-title"
      >
        {/* Icon and Suite Name */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl" role="img" aria-label={suite.name}>
            {suite.icon}
          </span>
          <h2 
            id="suite-template-prompt-title"
            className="text-text-primary font-mono text-lg uppercase tracking-widest"
          >
            {suite.name}
          </h2>
        </div>
        
        {/* Message */}
        <div className="mb-6">
          <p className="text-text-primary font-mono mb-3">
            This suite has <strong>{templateCount}</strong> workspace template{templateCount !== 1 ? 's' : ''}.
          </p>
          <p className="text-text-secondary font-mono text-sm">
            Templates are example notes to help you learn. Add them to your project?
          </p>
        </div>
        
        {/* Template List Preview */}
        {templateCount > 0 && templateCount <= 5 && (
          <div className="mb-6 p-3 bg-bg-tertiary border-l-2 border-accent-primary">
            <div className="text-text-tertiary text-xs uppercase font-mono mb-2">
              Templates:
            </div>
            <ul className="space-y-1">
              {suite.workspaceTemplates?.map((template, idx) => (
                <li key={idx} className="text-text-secondary font-mono text-sm flex items-center gap-2">
                  <span className="text-accent-primary">•</span>
                  {template.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Remember Checkbox */}
        <label className="flex items-center gap-2 mb-6 cursor-pointer group">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 bg-bg-primary border border-border-primary checked:bg-accent-primary checked:border-accent-primary cursor-pointer"
          />
          <span className="text-text-secondary font-mono text-sm group-hover:text-text-primary transition-colors">
            Remember my choice for this project
          </span>
        </label>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            className="
              flex-1 px-4 py-2 
              bg-accent-primary text-bg-primary 
              hover:shadow-glow-cyan 
              uppercase text-sm font-mono
              transition-all
            "
          >
            📋 Add Templates
          </button>
          <button
            onClick={handleSkip}
            className="
              flex-1 px-4 py-2 
              border border-border-primary 
              text-text-secondary 
              hover:border-accent-primary hover:text-accent-primary
              uppercase text-sm font-mono
              transition-all
            "
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

