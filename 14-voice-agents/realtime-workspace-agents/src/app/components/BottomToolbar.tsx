import React from "react";
import { SessionStatus } from "@/app/types";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isPTTActive: boolean;
  setIsPTTActive: (val: boolean) => void;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
  isEventsPaneExpanded: boolean;
  setIsEventsPaneExpanded: (val: boolean) => void;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (val: boolean) => void;
  codec: string;
  onCodecChange: (newCodec: string) => void;
  isTranscriptVisible: boolean;
  setIsTranscriptVisible: (val: boolean) => void;
  currentProjectName?: string;
}

function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isPTTActive,
  setIsPTTActive,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  isEventsPaneExpanded,
  setIsEventsPaneExpanded,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
  codec,
  onCodecChange,
  isTranscriptVisible,
  setIsTranscriptVisible,
  currentProjectName,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  const handleCodecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCodec = e.target.value;
    onCodecChange(newCodec);
  };

  function getConnectionButtonLabel() {
    if (isConnected) return "Disconnect";
    if (isConnecting) return "Connecting...";
    if (currentProjectName) return `Connect to ${currentProjectName}`;
    return "Connect";
  }

  function getConnectionButtonClasses() {
    const baseClasses = "text-base p-2 px-6 h-full font-mono uppercase tracking-wider transition-all border-2";
    const cursorClass = isConnecting ? "cursor-not-allowed" : "cursor-pointer";

    if (isConnected) {
      // Connected -> label "Disconnect" -> dark with red border
      return `bg-bg-secondary text-status-error border-status-error hover:bg-status-error hover:text-bg-primary hover:shadow-glow-error ${cursorClass} ${baseClasses}`;
    }
    // Disconnected or connecting -> label is either "Connect" or "Connecting"
    return `bg-bg-secondary text-accent-primary border-accent-primary hover:bg-accent-primary hover:text-bg-primary hover:shadow-glow-cyan ${cursorClass} ${baseClasses}`;
  }

  return (
    <div className="p-4 flex flex-row items-center justify-center gap-x-8 bg-bg-secondary border-t border-border-primary">
      <button
        onClick={onToggleConnection}
        className={getConnectionButtonClasses()}
        disabled={isConnecting}
      >
        {getConnectionButtonLabel()}
      </button>

      <div className="flex flex-row items-center gap-2">
        <input
          id="push-to-talk"
          type="checkbox"
          checked={isPTTActive}
          onChange={(e) => setIsPTTActive(e.target.checked)}
          disabled={!isConnected}
          className="w-4 h-4 bg-bg-tertiary border border-border-primary checked:bg-accent-primary checked:border-accent-primary focus:ring-accent-primary accent-accent-primary cursor-pointer disabled:opacity-30"
        />
        <label
          htmlFor="push-to-talk"
          className="flex items-center cursor-pointer text-text-secondary font-mono text-sm"
        >
          Push to talk
        </label>
        <button
          onMouseDown={handleTalkButtonDown}
          onMouseUp={handleTalkButtonUp}
          onTouchStart={handleTalkButtonDown}
          onTouchEnd={handleTalkButtonUp}
          disabled={!isPTTActive}
          className={
            `py-1 px-4 cursor-pointer border transition-all font-mono uppercase tracking-wide text-sm ${
              isPTTUserSpeaking 
                ? "bg-accent-primary text-bg-primary border-accent-primary shadow-glow-cyan" 
                : "bg-bg-tertiary text-text-primary border-border-primary hover:border-accent-primary"
            } ${!isPTTActive ? "opacity-30 cursor-not-allowed" : ""}`
          }
        >
          Talk
        </button>
      </div>

      <div className="flex flex-row items-center gap-2">
        <input
          id="audio-playback"
          type="checkbox"
          checked={isAudioPlaybackEnabled}
          onChange={(e) => setIsAudioPlaybackEnabled(e.target.checked)}
          disabled={!isConnected}
          className="w-4 h-4 bg-bg-tertiary border border-border-primary checked:bg-accent-primary checked:border-accent-primary focus:ring-accent-primary accent-accent-primary cursor-pointer disabled:opacity-30"
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
          id="logs"
          type="checkbox"
          checked={isEventsPaneExpanded}
          onChange={(e) => setIsEventsPaneExpanded(e.target.checked)}
          className="w-4 h-4 bg-bg-tertiary border border-border-primary checked:bg-accent-primary checked:border-accent-primary focus:ring-accent-primary accent-accent-primary cursor-pointer"
        />
        <label htmlFor="logs" className="flex items-center cursor-pointer text-text-secondary font-mono text-sm">
          Logs
        </label>
      </div>
      <div className="flex flex-row items-center gap-2">
        <input
          id="transcript"
          type="checkbox"
          checked={isTranscriptVisible}
          onChange={(e) => setIsTranscriptVisible(e.target.checked)}
          className="w-4 h-4 bg-bg-tertiary border border-border-primary checked:bg-accent-primary checked:border-accent-primary focus:ring-accent-primary accent-accent-primary cursor-pointer"
        />
        <label htmlFor="transcript" className="flex items-center cursor-pointer text-text-secondary font-mono text-sm">
          Transcript
        </label>
      </div>

      <div className="flex flex-row items-center gap-2">
        <div className="text-text-secondary font-mono text-sm uppercase tracking-wide">Codec:</div>
        {/*
          Codec selector – Lets you force the WebRTC track to use 8 kHz 
          PCMU/PCMA so you can preview how the agent will sound 
          (and how ASR/VAD will perform) when accessed via a 
          phone network.  Selecting a codec reloads the page with ?codec=...
          which our App-level logic picks up and applies via a WebRTC monkey
          patch (see codecPatch.ts).
        */}
        <select
          id="codec-select"
          value={codec}
          onChange={handleCodecChange}
          className="border border-border-primary bg-bg-tertiary text-text-primary px-2 py-1 focus:outline-none focus:border-accent-primary cursor-pointer font-mono text-sm transition-colors"
        >
          <option value="opus">Opus (48 kHz)</option>
          <option value="pcmu">PCMU (8 kHz)</option>
          <option value="pcma">PCMA (8 kHz)</option>
        </select>
      </div>
    </div>
  );
}

export default BottomToolbar;
