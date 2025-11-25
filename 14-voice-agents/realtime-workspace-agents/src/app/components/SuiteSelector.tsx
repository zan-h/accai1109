// src/app/components/SuiteSelector.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { AgentSuite, SuiteCategory } from '@/app/agentConfigs/types';
import { getAllAvailableSuites, searchAllSuites, findSuitesByCategory } from '@/app/agentConfigs';
import SuiteCard from './SuiteCard';
import { motion, AnimatePresence } from 'framer-motion';

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
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div 
            className="w-full max-w-4xl glass-panel-heavy border border-accent-primary/50 shadow-glow-cyan max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="suite-selector-title"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4 bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <h2 
                  id="suite-selector-title"
                  className="text-white uppercase tracking-widest text-lg font-mono font-bold"
                >
                  Select Agent Suite
                </h2>
                <button
                  onClick={onClose}
                  className="text-text-secondary hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search suites by name or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 text-white font-mono rounded-xl focus:outline-none focus:border-accent-primary transition-all focus:shadow-glow-cyan-subtle"
                  aria-label="Search suites"
                />
                <span className="absolute left-3 top-3.5 text-text-tertiary">🔍</span>
              </div>
            </div>
            
            {/* Category Tabs */}
            <div className="border-b border-white/10 px-6 py-3 flex gap-2 overflow-x-auto bg-black/20 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 text-xs uppercase tracking-wide font-mono transition-all whitespace-nowrap rounded-full border ${
                    selectedCategory === cat
                      ? 'bg-accent-primary/20 text-accent-primary border-accent-primary shadow-glow-cyan-subtle'
                      : 'text-text-secondary hover:text-white border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                  aria-pressed={selectedCategory === cat}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            
            {/* Suite Cards */}
            <div className="flex-1 overflow-y-auto p-6 bg-black/40">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
              >
                {filteredSuites.map(suite => (
                  <motion.div
                    key={suite.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <SuiteCard
                      suite={suite}
                      isExpanded={expandedSuiteId === suite.id}
                      onExpand={() => setExpandedSuiteId(
                        expandedSuiteId === suite.id ? null : suite.id
                      )}
                      onSelect={() => onSelectSuite(suite)}
                    />
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Empty State */}
              {filteredSuites.length === 0 && (
                <div className="flex flex-col items-center justify-center text-text-tertiary font-mono py-20">
                  <div className="text-4xl mb-4 opacity-50">🔍</div>
                  <div className="text-center">
                    <p className="mb-2 text-lg">No suites found</p>
                    {searchQuery && (
                      <p className="text-xs">Try a different search term or category</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}



