// BottomToolbar.tsx - Cleaned up control bar
import React from "react";
import { SessionStatus } from "@/app/types";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (val: boolean) => void;
  isTranscriptVisible: boolean;
  setIsTranscriptVisible: (val: boolean) => void;
  currentProjectName?: string;
}

function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
  isTranscriptVisible,
  setIsTranscriptVisible,
  currentProjectName,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  function getConnectionButtonLabel() {
    if (isConnected) return "Disconnect";
    if (isConnecting) return "Connecting...";
    if (currentProjectName) return `Connect to ${currentProjectName}`;
    return "Connect";
  }

  function getConnectionButtonClasses() {
    const baseClasses = "text-base p-2 px-6 font-mono uppercase tracking-wider transition-all border-2 touch-manipulation rounded-lg";
    const mobileClasses = "w-full min-h-[48px] lg:w-auto lg:h-full";
    const cursorClass = isConnecting ? "cursor-not-allowed" : "cursor-pointer";

    if (isConnected) {
      return `bg-bg-secondary text-status-error border-status-error hover:bg-status-error/10 active:bg-status-error/20 ${cursorClass} ${baseClasses} ${mobileClasses}`;
    }
    return `bg-accent-primary/10 text-accent-primary border-accent-primary hover:bg-accent-primary hover:text-bg-primary hover:shadow-glow-cyan ${cursorClass} ${baseClasses} ${mobileClasses}`;
  }

  return (
    <div className="p-4 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-x-8 bg-bg-secondary border-t border-white/10 glass-panel-heavy relative z-20">
      <button
        onClick={onToggleConnection}
        className={getConnectionButtonClasses()}
        disabled={isConnecting}
      >
        {getConnectionButtonLabel()}
      </button>

      <div className="flex flex-row items-center gap-2">
        <input
          id="audio-playback"
          type="checkbox"
          checked={isAudioPlaybackEnabled}
          onChange={(e) => setIsAudioPlaybackEnabled(e.target.checked)}
          disabled={!isConnected}
          className="w-4 h-4 bg-bg-tertiary border border-white/20 checked:bg-accent-primary checked:border-accent-primary focus:ring-accent-primary accent-accent-primary cursor-pointer disabled:opacity-30 rounded"
        />
        <label
          htmlFor="audio-playback"
          className="flex items-center cursor-pointer text-text-secondary font-mono text-sm"
        >
          Audio playback
        </label>
      </div>

      <div className="flex flex-row items-center gap-2">
        <input
          id="transcript"
          type="checkbox"
          checked={isTranscriptVisible}
          onChange={(e) => setIsTranscriptVisible(e.target.checked)}
          className="w-4 h-4 bg-bg-tertiary border border-white/20 checked:bg-accent-primary checked:border-accent-primary focus:ring-accent-primary accent-accent-primary cursor-pointer rounded"
        />
        <label htmlFor="transcript" className="flex items-center cursor-pointer text-text-secondary font-mono text-sm">
          Session
        </label>
      </div>
    </div>
  );
}

export default BottomToolbar;
