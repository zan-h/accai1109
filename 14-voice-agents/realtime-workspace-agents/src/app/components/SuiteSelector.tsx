// src/app/components/SuiteSelector.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { AgentSuite, SuiteCategory } from '@/app/agentConfigs/types';
import { getAllAvailableSuites, searchAllSuites, findSuitesByCategory } from '@/app/agentConfigs';
import SuiteCard from './SuiteCard';

interface SuiteSelectorProps {
  onSelectSuite: (suite: AgentSuite) => void;
  onClose: () => void;
  isOpen: boolean;
}

const CATEGORIES: Array<SuiteCategory | 'all'> = [
  'all',
  'productivity',
  'coaching',
  'planning',
  'mental-health',
  'learning',
  'creativity'
];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  productivity: 'Productivity',
  coaching: 'Coaching',
  planning: 'Planning',
  'mental-health': 'Mental Health',
  learning: 'Learning',
  creativity: 'Creativity',
};

export default function SuiteSelector({ onSelectSuite, onClose, isOpen }: SuiteSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SuiteCategory | 'all'>('all');
  const [expandedSuiteId, setExpandedSuiteId] = useState<string | null>(null);
  
  const allSuites = useMemo(() => getAllAvailableSuites(), []);
  
  const filteredSuites = useMemo(() => {
    let suites = allSuites;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      suites = findSuitesByCategory(selectedCategory);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      suites = searchAllSuites(searchQuery);
    }
    
    return suites;
  }, [allSuites, selectedCategory, searchQuery]);
  
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-bg-overlay z-50 flex items-start justify-center pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-4xl bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan max-h-[80vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="suite-selector-title"
      >
        {/* Header */}
        <div className="border-b border-border-primary px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 
              id="suite-selector-title"
              className="text-text-primary uppercase tracking-widest text-lg font-mono"
            >
              Select Agent Suite
            </h2>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-accent-primary text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search suites by name or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-bg-primary border border-border-primary text-text-primary font-mono focus:outline-none focus:border-accent-primary transition-colors"
            aria-label="Search suites"
          />
        </div>
        
        {/* Category Tabs */}
        <div className="border-b border-border-primary px-6 py-2 flex gap-2 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs uppercase tracking-wide font-mono transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-accent-primary text-bg-primary'
                  : 'text-text-secondary hover:text-accent-primary border border-border-primary hover:border-accent-primary'
              }`}
              aria-pressed={selectedCategory === cat}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
        
        {/* Suite Cards */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuites.map(suite => (
            <SuiteCard
              key={suite.id}
              suite={suite}
              isExpanded={expandedSuiteId === suite.id}
              onExpand={() => setExpandedSuiteId(
                expandedSuiteId === suite.id ? null : suite.id
              )}
              onSelect={() => onSelectSuite(suite)}
            />
          ))}
        </div>
        
        {/* Empty State */}
        {filteredSuites.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary font-mono p-8">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-center">
              <p className="mb-2">No suites found</p>
              {searchQuery && (
                <p className="text-xs">Try a different search term</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



