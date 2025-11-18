"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  DotsVerticalIcon,
  ClockIcon,
  BookmarkIcon,
  PlusIcon,
  ClipboardCopyIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";

export interface SessionMenuProps {
  // Session history
  onViewHistory: () => void;
  showHistoryDropdown: boolean;
  
  // Save session
  onSaveSession: () => void;
  canSave: boolean;
  
  // New conversation
  onNewConversation: () => void;
  canStartNew: boolean;
  
  // Copy transcript
  onCopyTranscript: () => void;
  justCopied: boolean;
  
  // Download audio
  onDownloadAudio: () => void;
}

export function SessionMenu({
  onViewHistory,
  // showHistoryDropdown is currently unused but kept in props interface for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showHistoryDropdown,
  onSaveSession,
  canSave,
  onNewConversation,
  canStartNew,
  onCopyTranscript,
  justCopied,
  onDownloadAudio,
}: SessionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const handleMenuItemClick = (action: () => void, closesMenu = true) => {
    action();
    if (closesMenu) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Menu Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 border border-border-primary bg-bg-tertiary hover:border-accent-primary hover:shadow-glow-cyan text-text-primary flex items-center justify-center transition-all font-mono uppercase tracking-wide text-sm"
        aria-label="Session menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <DotsVerticalIcon className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-64 border border-border-primary bg-bg-tertiary shadow-lg z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Sessions History */}
          <button
            onClick={() => handleMenuItemClick(onViewHistory, false)}
            className="w-full px-4 py-3 hover:bg-bg-secondary text-left transition-colors flex items-center gap-x-3 text-text-primary font-mono text-sm"
            role="menuitem"
          >
            <ClockIcon className="w-4 h-4 text-accent-primary" />
            <span>Sessions History</span>
          </button>

          {/* Save Session */}
          <button
            onClick={() => handleMenuItemClick(onSaveSession)}
            disabled={!canSave}
            className="w-full px-4 py-3 hover:bg-bg-secondary text-left transition-colors flex items-center gap-x-3 text-text-primary font-mono text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            role="menuitem"
          >
            <BookmarkIcon className="w-4 h-4 text-accent-primary" />
            <span>Save Session</span>
          </button>

          {/* New Conversation */}
          <button
            onClick={() => handleMenuItemClick(onNewConversation)}
            disabled={!canStartNew}
            className="w-full px-4 py-3 hover:bg-bg-secondary text-left transition-colors flex items-center gap-x-3 text-text-primary font-mono text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            role="menuitem"
          >
            <PlusIcon className="w-4 h-4 text-accent-secondary" />
            <span>New Conversation</span>
          </button>

          {/* Separator */}
          <div className="h-px bg-border-primary my-1" role="separator" />

          {/* Copy Session Text */}
          <button
            onClick={() => handleMenuItemClick(onCopyTranscript)}
            className="w-full px-4 py-3 hover:bg-bg-secondary text-left transition-colors flex items-center gap-x-3 text-text-primary font-mono text-sm"
            role="menuitem"
          >
            <ClipboardCopyIcon className="w-4 h-4 text-text-secondary" />
            <span>{justCopied ? "Copied!" : "Copy Session Text"}</span>
          </button>

          {/* Download Audio */}
          <button
            onClick={() => handleMenuItemClick(onDownloadAudio)}
            className="w-full px-4 py-3 hover:bg-bg-secondary text-left transition-colors flex items-center gap-x-3 text-text-primary font-mono text-sm"
            role="menuitem"
          >
            <DownloadIcon className="w-4 h-4 text-text-secondary" />
            <span>Download Audio</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default SessionMenu;

