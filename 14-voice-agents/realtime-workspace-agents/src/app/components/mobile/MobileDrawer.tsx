// MobileDrawer.tsx - Mobile navigation drawer
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, useUser } from '@clerk/nextjs';
import { AgentSuite } from '@/app/agentConfigs/types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSuite: AgentSuite | null;
  onSelectSuite: () => void;
  onOpenSettings: () => void;
  onOpenProjects: () => void;
}

export function MobileDrawer({
  isOpen,
  onClose,
  currentSuite,
  onSelectSuite,
  onOpenSettings,
  onOpenProjects
}: MobileDrawerProps) {
  const { user } = useUser();

  // Variants for drawer animation
  const drawerVariants = {
    closed: { x: '-100%', opacity: 0 },
    open: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            className="fixed inset-y-0 left-0 w-[80%] max-w-[300px] bg-[#050505] border-r border-white/10 z-50 flex flex-col shadow-2xl shadow-cyan-500/10"
            initial="closed"
            animate="open"
            exit="closed"
            variants={drawerVariants}
          >
            {/* Header / Profile Section */}
            <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-white/5">
              <div className="scale-125 origin-left">
                <UserButton afterSignOutUrl="/" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-white truncate">
                  {user?.fullName || user?.firstName || 'User'}
                </span>
                <span className="text-xs text-white/50 truncate font-mono">
                  {user?.emailAddresses[0]?.emailAddress}
                </span>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Current Suite */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider mb-2">Current Suite</div>
                <button 
                  onClick={() => {
                    onSelectSuite();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 active:bg-cyan-500/10 active:border-cyan-500/50 transition-all"
                >
                  <span className="text-2xl">{currentSuite?.icon || '📦'}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-white">{currentSuite?.name || 'Select Suite'}</span>
                    <span className="text-xs text-white/50">Tap to change</span>
                  </div>
                </button>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="text-xs font-mono uppercase text-magenta-400 tracking-wider mb-2">Actions</div>
                
                <DrawerItem 
                  icon="📂" 
                  label="Switch Project" 
                  onClick={() => {
                    onOpenProjects();
                    onClose();
                  }} 
                />
                
                <DrawerItem 
                  icon="⚙️" 
                  label="Settings" 
                  onClick={() => {
                    onOpenSettings();
                    onClose();
                  }} 
                />
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 text-xs text-white/30 font-mono text-center">
              accai v0.1.0
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-left group"
    >
      <span className="text-xl group-active:scale-90 transition-transform">{icon}</span>
      <span className="font-medium text-white/80 group-hover:text-white">{label}</span>
    </button>
  );
}

