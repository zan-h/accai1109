// src/app/components/SuiteCard.tsx

import React from 'react';
import { AgentSuite } from '@/app/agentConfigs/types';

interface SuiteCardProps {
  suite: AgentSuite;
  isExpanded: boolean;
  onExpand: () => void;
  onSelect: () => void;
}

export default function SuiteCard({ suite, isExpanded, onExpand, onSelect }: SuiteCardProps) {
  return (
    <div 
      className="border border-border-primary bg-bg-tertiary hover:border-accent-primary transition-all"
      data-suite-id={suite.id}
    >
      {/* Header */}
      <div className="p-4 border-b border-border-primary">
        <div className="flex items-start gap-3">
          <div className="text-4xl" role="img" aria-label={suite.name}>
            {suite.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary font-mono text-sm mb-1">
              {suite.name}
            </h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              {suite.description}
            </p>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {suite.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-bg-primary text-text-tertiary border border-border-primary font-mono"
            >
              {tag}
            </span>
          ))}
          {suite.tags.length > 3 && (
            <span className="text-xs text-text-tertiary font-mono">
              +{suite.tags.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      {/* Expandable Details */}
      {isExpanded && (
        <div className="p-4 border-b border-border-primary text-xs space-y-3">
          {/* Agents */}
          <div>
            <div className="text-text-secondary uppercase tracking-wide mb-1 font-mono">
              Agents
            </div>
            <div className="space-y-1">
              {suite.agents.map(agent => (
                <div key={agent.name} className="text-text-primary font-mono">
                  • {agent.name}
                </div>
              ))}
            </div>
          </div>
          
          {/* Use Cases */}
          {suite.suggestedUseCases && suite.suggestedUseCases.length > 0 && (
            <div>
              <div className="text-text-secondary uppercase tracking-wide mb-1 font-mono">
                Best For
              </div>
              <div className="space-y-1">
                {suite.suggestedUseCases.map((useCase, i) => (
                  <div key={i} className="text-text-tertiary">
                    • {useCase}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Metadata */}
          <div className="flex gap-4 pt-2 border-t border-border-primary">
            {suite.estimatedSessionLength && (
              <div className="text-text-tertiary">
                ⏱️ {suite.estimatedSessionLength} min
              </div>
            )}
            {suite.userLevel && (
              <div className="text-text-tertiary">
                📊 {suite.userLevel}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="p-4 flex gap-2">
        <button
          onClick={onExpand}
          className="flex-1 py-2 border border-border-primary text-text-secondary hover:text-accent-primary hover:border-accent-primary transition-all uppercase text-xs font-mono"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Hide Details' : 'Learn More'}
        </button>
        <button
          onClick={onSelect}
          className="flex-1 py-2 bg-accent-primary text-bg-primary hover:shadow-glow-cyan transition-all uppercase text-xs font-mono"
        >
          Start Session
        </button>
      </div>
    </div>
  );
}



