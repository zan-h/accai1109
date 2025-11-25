// MobileLayout.tsx - Container for mobile view with gestures
'use client';

import { ReactNode } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface MobileLayoutProps {
  children: ReactNode;
  onOpenDrawer: () => void;
  className?: string;
}

export function MobileLayout({ children, onOpenDrawer, className = '' }: MobileLayoutProps) {
  
  // Simple edge swipe detection
  // We use a dedicated area on the left edge to capture start of swipe
  // to avoid conflicting with internal horizontal scrolls
  
  return (
    <div className={`flex-1 flex flex-col relative overflow-hidden ${className}`}>
      {/* Edge Swipe Zone */}
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-6 z-30"
        onPanEnd={(e, info: PanInfo) => {
          if (info.offset.x > 50 && info.velocity.x > 0) {
            onOpenDrawer();
          }
        }}
        style={{ touchAction: 'pan-y' }} // Allow vertical scroll, capture horizontal? No, pan-y allows vertical scroll.
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}

