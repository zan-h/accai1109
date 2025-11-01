"use client";

import React from 'react';

/**
 * Mobile tab options
 */
export type MobileTab = 'workspace' | 'transcript';

/**
 * Bottom navigation props
 */
export interface BottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

/**
 * BottomNav - Mobile-only bottom tab navigation
 * 
 * Shows two tabs:
 * - Workspace: Access project tabs and content
 * - Transcript: View conversation history and send messages
 * 
 * Only displayed on mobile devices (< 768px)
 */
export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav 
      className="
        fixed bottom-0 left-0 right-0 z-50
        flex items-center justify-around
        h-16 px-4
        bg-bg-secondary border-t-2 border-border-primary
        lg:hidden
      "
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Workspace Tab */}
      <button
        onClick={() => onTabChange('workspace')}
        className={`
          flex flex-col items-center justify-center
          flex-1 h-full
          transition-all duration-200
          touch-manipulation
          ${activeTab === 'workspace' 
            ? 'text-accent-primary' 
            : 'text-text-tertiary active:text-text-secondary'
          }
        `}
        aria-label="Workspace"
        aria-current={activeTab === 'workspace' ? 'page' : undefined}
      >
        {/* Icon */}
        <svg 
          className="w-6 h-6 mb-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={activeTab === 'workspace' ? 2.5 : 2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
          />
        </svg>
        
        {/* Label */}
        <span className={`
          text-xs font-mono uppercase tracking-wider
          ${activeTab === 'workspace' ? 'font-bold' : 'font-normal'}
        `}>
          Workspace
        </span>
        
        {/* Active indicator */}
        {activeTab === 'workspace' && (
          <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-accent-primary rounded-t" />
        )}
      </button>

      {/* Transcript Tab */}
      <button
        onClick={() => onTabChange('transcript')}
        className={`
          flex flex-col items-center justify-center
          flex-1 h-full
          transition-all duration-200
          touch-manipulation
          ${activeTab === 'transcript' 
            ? 'text-accent-primary' 
            : 'text-text-tertiary active:text-text-secondary'
          }
        `}
        aria-label="Transcript"
        aria-current={activeTab === 'transcript' ? 'page' : undefined}
      >
        {/* Icon */}
        <svg 
          className="w-6 h-6 mb-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={activeTab === 'transcript' ? 2.5 : 2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
          />
        </svg>
        
        {/* Label */}
        <span className={`
          text-xs font-mono uppercase tracking-wider
          ${activeTab === 'transcript' ? 'font-bold' : 'font-normal'}
        `}>
          Transcript
        </span>
        
        {/* Active indicator */}
        {activeTab === 'transcript' && (
          <div className="absolute bottom-0 left-3/4 transform -translate-x-1/2 w-1/2 h-1 bg-accent-primary rounded-t" />
        )}
      </button>
    </nav>
  );
};

/**
 * Example usage in App.tsx:
 * 
 * const [mobileTab, setMobileTab] = useState<MobileTab>('workspace');
 * const { isMobile } = useResponsive();
 * 
 * return (
 *   <div>
 *     {isMobile ? (
 *       <>
 *         {mobileTab === 'workspace' && <Workspace />}
 *         {mobileTab === 'transcript' && <Transcript />}
 *         <BottomNav activeTab={mobileTab} onTabChange={setMobileTab} />
 *       </>
 *     ) : (
 *       <div className="flex">
 *         <Workspace />
 *         <Transcript />
 *       </div>
 *     )}
 *   </div>
 * );
 */

