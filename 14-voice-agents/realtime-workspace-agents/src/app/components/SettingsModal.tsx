// SettingsModal.tsx - Comprehensive settings panel
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Add interface export
export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Settings state passed from parent
  settings: {
    audioPlayback: boolean;
    reducedMotion: boolean;
    particlesEnabled: boolean;
    showEventLogs: boolean;
    codec: string;
    recordAudio: boolean;
    memoryMonitoring: boolean;
    performanceOverlay: boolean;
    voiceModel: string;
    speechSpeed: number;
  };
  onUpdateSetting: (key: string, value: any) => void;
  onRestartTour?: () => void;
}

export function SettingsModal({ isOpen, onClose, settings, onUpdateSetting, onRestartTour }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<'general' | 'developer' | 'voice'>('general');
  
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[85vh] glass-panel-heavy rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/50"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-modal-title"
          >
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-5 md:px-8 md:py-6 flex items-center justify-between bg-bg-secondary/50 flex-shrink-0">
              <h2 id="settings-modal-title" className="text-xl md:text-2xl font-mono font-bold text-white tracking-tight">Settings</h2>
              <motion.button
                className="w-8 h-8 md:w-10 md:h-10 rounded-full glass-panel flex items-center justify-center hover:neon-border-cyan text-white"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close settings"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            
            {/* Content */}
            <div className="flex flex-1 overflow-hidden bg-bg-primary/80">
              {/* Sidebar */}
              <div className="hidden md:block w-56 border-r border-white/10 p-4 bg-bg-secondary/30 overflow-y-auto" data-lenis-prevent>
                <nav className="space-y-2">
                  {[
                    { id: 'general', label: 'General', icon: '⚙️' },
                    { id: 'voice', label: 'Voice', icon: '🎤' },
                    { id: 'developer', label: 'Developer', icon: '🔧' },
                  ].map((section) => (
                    <button
                      key={section.id}
                      className={`w-full text-left px-4 py-3 rounded-lg font-mono text-sm transition-all relative ${
                        activeSection === section.id
                          ? 'text-white'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                      }`}
                      onClick={() => setActiveSection(section.id as any)}
                    >
                      <span className="mr-3">{section.icon}</span>
                      {section.label}
                      {activeSection === section.id && (
                        <motion.div 
                          className="absolute inset-0 glass-panel border border-accent-primary/30 rounded-lg -z-10"
                          layoutId="activeSection"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Mobile Tabs (visible only on small screens) */}
              <div className="md:hidden w-full border-b border-white/10 bg-bg-secondary/30 overflow-x-auto flex-shrink-0">
                <div className="flex p-2 gap-2 min-w-max">
                  {[
                    { id: 'general', label: 'General', icon: '⚙️' },
                    { id: 'voice', label: 'Voice', icon: '🎤' },
                    { id: 'developer', label: 'Developer', icon: '🔧' },
                  ].map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as any)}
                      className={`flex items-center px-4 py-2 rounded-lg font-mono text-sm whitespace-nowrap transition-colors ${
                        activeSection === section.id
                          ? 'bg-accent-primary/20 text-white border border-accent-primary/30'
                          : 'text-text-secondary'
                      }`}
                    >
                      <span className="mr-2">{section.icon}</span>
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Settings panels */}
              <div className="flex-1 p-4 md:p-8 overflow-y-auto" data-lenis-prevent>
                <AnimatePresence mode="wait">
                  {activeSection === 'general' && (
                    <motion.div
                      key="general"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <SettingRow
                        label="Audio Playback"
                        description="Enable voice output from agent"
                        type="toggle"
                        value={settings.audioPlayback}
                        onChange={(v) => onUpdateSetting('audioPlayback', v)}
                      />
                      <SettingRow
                        label="Reduced Motion"
                        description="Minimize animations for accessibility"
                        type="toggle"
                        value={settings.reducedMotion}
                        onChange={(v) => onUpdateSetting('reducedMotion', v)}
                      />
                      <SettingRow
                        label="Particle Effects"
                        description="Show ambient background particles"
                        type="toggle"
                        value={settings.particlesEnabled}
                        onChange={(v) => onUpdateSetting('particlesEnabled', v)}
                      />
                      
                      {onRestartTour && (
                        <div className="flex items-center justify-between p-4 glass-panel rounded-xl hover:bg-white/5 transition-colors border border-white/5">
                          <div className="flex-1 pr-4 md:pr-8">
                            <div className="font-mono text-sm text-white mb-1 font-semibold">Product Tour</div>
                            <div className="font-mono text-xs text-text-tertiary leading-relaxed">Restart the guided walkthrough</div>
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => {
                                onRestartTour();
                                onClose();
                              }}
                              className="px-4 py-2 bg-accent-primary/10 border border-accent-primary/30 text-accent-primary hover:bg-accent-primary/20 rounded-lg font-mono text-xs uppercase tracking-wider transition-colors"
                            >
                              Restart Tour
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {activeSection === 'voice' && (
                    <motion.div
                      key="voice"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <SettingRow
                        label="Voice Model"
                        description="Select agent voice"
                        type="select"
                        options={['Alloy', 'Echo', 'Shimmer', 'Verse']}
                        value={settings.voiceModel}
                        onChange={(v) => onUpdateSetting('voiceModel', v)}
                      />
                      <SettingRow
                        label="Speech Speed"
                        description={`Adjust playback speed (${settings.speechSpeed}x)`}
                        type="slider"
                        min={0.5}
                        max={2}
                        step={0.1}
                        value={settings.speechSpeed}
                        onChange={(v) => onUpdateSetting('speechSpeed', v)}
                      />
                    </motion.div>
                  )}
                  
                  {activeSection === 'developer' && (
                    <motion.div
                      key="developer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="mb-6 p-4 bg-status-warning/10 border border-status-warning/30 rounded-lg flex gap-4">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <div className="font-mono text-sm text-status-warning font-bold mb-1">
                            Developer Mode
                          </div>
                          <div className="font-mono text-xs text-text-secondary">
                            These settings are for debugging and testing. Changes may require a refresh.
                          </div>
                        </div>
                      </div>
                      
                      <SettingRow
                        label="Show Event Logs"
                        description="Display realtime API events panel"
                        type="toggle"
                        value={settings.showEventLogs}
                        onChange={(v) => onUpdateSetting('showEventLogs', v)}
                      />
                      <SettingRow
                        label="Audio Codec"
                        description="Force WebRTC codec (requires reload)"
                        type="select"
                        options={['opus', 'pcmu', 'pcma']}
                        value={settings.codec}
                        onChange={(v) => onUpdateSetting('codec', v)}
                      />
                      <SettingRow
                        label="Record Audio"
                        description="Save conversation audio locally"
                        type="toggle"
                        value={settings.recordAudio}
                        onChange={(v) => onUpdateSetting('recordAudio', v)}
                      />
                      <SettingRow
                        label="Memory Monitoring"
                        description="Track memory usage in console"
                        type="toggle"
                        value={settings.memoryMonitoring}
                        onChange={(v) => onUpdateSetting('memoryMonitoring', v)}
                      />
                      <SettingRow
                        label="Performance Overlay"
                        description="Show FPS and render metrics"
                        type="toggle"
                        value={settings.performanceOverlay}
                        onChange={(v) => onUpdateSetting('performanceOverlay', v)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Reusable setting row component
function SettingRow({ 
  label, 
  description, 
  type, 
  options,
  min,
  max,
  step,
  value,
  onChange
}: {
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'slider';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  value: any;
  onChange: (val: any) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 glass-panel rounded-xl hover:bg-white/5 transition-colors border border-white/5">
      <div className="flex-1 pr-4 md:pr-8">
        <div className="font-mono text-sm text-white mb-1 font-semibold">{label}</div>
        <div className="font-mono text-xs text-text-tertiary leading-relaxed">{description}</div>
      </div>
      
      <div className="flex-shrink-0">
        {type === 'toggle' && (
          <button
            className={`w-12 h-6 rounded-full relative transition-all duration-300 border ${
              value 
                ? 'bg-accent-primary/20 border-accent-primary' 
                : 'bg-white/5 border-white/10'
            }`}
            onClick={() => onChange(!value)}
          >
            <motion.div
              className={`w-4 h-4 rounded-full absolute top-0.5 left-1 ${
                value ? 'bg-accent-primary' : 'bg-text-tertiary'
              }`}
              animate={{ x: value ? 22 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        )}
        
        {type === 'select' && (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="glass-panel px-3 py-2 rounded-lg font-mono text-sm text-white border border-white/20 hover:border-accent-primary focus:border-accent-primary outline-none transition-colors bg-bg-primary max-w-[120px] md:max-w-none"
          >
            {options?.map(opt => (
              <option key={opt} value={opt} className="bg-bg-secondary">{opt}</option>
            ))}
          </select>
        )}
        
        {type === 'slider' && (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-24 md:w-32 accent-accent-primary h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
            <span className="font-mono text-xs text-text-secondary w-8 text-right">{value}x</span>
          </div>
        )}
      </div>
    </div>
  );
}
