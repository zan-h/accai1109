// BottomNav.tsx - Mobile navigation with glassmorphism
"use client";

import React from 'react';
import { motion } from 'framer-motion';

export type MobileTab = 'workspace' | 'transcript';

export interface BottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 h-20 px-4 pb-4 flex items-end justify-center pointer-events-none lg:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="w-full max-w-sm flex items-center bg-bg-secondary/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1 pointer-events-auto shadow-lg shadow-black/50">
        <NavButton 
          isActive={activeTab === 'workspace'}
          onClick={() => onTabChange('workspace')}
          icon={(
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          )}
          label="Workspace"
        />
        
        <NavButton 
          isActive={activeTab === 'transcript'}
          onClick={() => onTabChange('transcript')}
          icon={(
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          )}
          label="Session"
        />
      </div>
    </nav>
  );
};

function NavButton({ isActive, onClick, icon, label }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-300 ${
        isActive ? 'text-white' : 'text-text-tertiary hover:text-text-primary'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-white/10 rounded-xl"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      
      <svg 
        className={`w-6 h-6 mb-0.5 relative z-10 transition-colors ${isActive ? 'stroke-accent-primary' : 'stroke-current'}`}
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2}
        stroke="currentColor"
      >
        {icon}
      </svg>
      
      <span className={`text-[10px] font-mono uppercase tracking-wider relative z-10 ${isActive ? 'font-bold text-accent-primary' : ''}`}>
        {label}
      </span>
    </button>
  );
}
