"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TranscriptItem } from "@/app/types";
import { ImageOptimized } from "./ui/ImageOptimized";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { GuardrailChip } from "./GuardrailChip";
import { useResponsive } from "./layouts/ResponsiveLayout";
import { useProjectContext } from "@/app/contexts/ProjectContext";
import SessionMenu from "./SessionMenu";
import PushToTalkButton from "./PushToTalkButton";
import type { VoiceSessionWithMetadata } from "@/app/lib/supabase/types";
import { SessionStatus } from "@/app/types";
import { motion } from "framer-motion";

export interface TranscriptProps {
  onSendMessage: (message: string) => void;
  canSend: boolean;
  downloadRecording: () => void;
  isVisible?: boolean;
  sessionStatus: SessionStatus;
  isPTTActive: boolean;
  setIsPTTActive: (active: boolean) => void;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
}

function Transcript({
  onSendMessage,
  canSend,
  downloadRecording,
  isVisible = true,
  sessionStatus,
  isPTTActive,
  setIsPTTActive,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
}: TranscriptProps) {
  const { 
    transcriptItems, 
    toggleTranscriptItemExpand,
    currentSessionId,
    isLoadingTranscript,
    isViewingHistoricalSession,
    loadTranscriptFromSession,
    setIsViewingHistoricalSession,
    saveSessionWithTitle,
    startNewConversation,
  } = useTranscript();
  
  const { currentProjectId } = useProjectContext();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);
  const [justCopied, setJustCopied] = useState(false);
  const { isMobile } = useResponsive();
  
  // Session history state
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [sessions, setSessions] = useState<VoiceSessionWithMetadata[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const sessionHistoryRef = useRef<HTMLDivElement | null>(null);
  
  // Save session dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function scrollToBottom() {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    const hasNewMessage = transcriptItems.length > prevLogs.length;
    const hasUpdatedMessage = transcriptItems.some((newItem, index) => {
      const oldItem = prevLogs[index];
      return (
        oldItem &&
        (newItem.title !== oldItem.title || newItem.data !== oldItem.data)
      );
    });

    if (hasNewMessage || hasUpdatedMessage) {
      scrollToBottom();
    }

    setPrevLogs(transcriptItems);
  }, [transcriptItems]);

  // Spacebar keyboard shortcut for PTT
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        isPTTActive &&
        !e.repeat &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        handleTalkButtonDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        isPTTActive &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        handleTalkButtonUp();
      }
    };

    if (isPTTActive) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [isPTTActive, handleTalkButtonDown, handleTalkButtonUp]);

  const handleCopyTranscript = async () => {
    if (!transcriptRef.current) return;
    try {
      await navigator.clipboard.writeText(transcriptRef.current.innerText);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy transcript:", error);
    }
  };

  // Load sessions when session history is opened
  useEffect(() => {
    if (showSessionHistory && currentProjectId) {
      fetchSessions();
    }
  }, [showSessionHistory, currentProjectId]);

  // Close session history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sessionHistoryRef.current &&
        !sessionHistoryRef.current.contains(event.target as Node)
      ) {
        setShowSessionHistory(false);
      }
    };

    if (showSessionHistory) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSessionHistory]);

  const fetchSessions = async () => {
    if (!currentProjectId) return;
    
    setLoadingSessions(true);
    try {
      const response = await fetch(`/api/sessions?projectId=${currentProjectId}&saved=true&limit=20`);
      if (response.ok) {
        const { sessions: fetchedSessions } = await response.json();
        setSessions(fetchedSessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleOpenSaveDialog = () => {
    const now = new Date();
    const defaultTitle = `Session ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    setSessionTitle(defaultTitle);
    setShowSaveDialog(true);
  };

  const handleSaveSession = async () => {
    if (!sessionTitle.trim()) return;
    
    setIsSaving(true);
    try {
      await saveSessionWithTitle(sessionTitle);
      setShowSaveDialog(false);
      setSessionTitle('');
      fetchSessions();
    } catch (error) {
      console.error('Failed to save session:', error);
      alert('Failed to save session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewConversation = async () => {
    if (!confirm('Start a new conversation? Your current transcript will be saved and cleared.')) {
      return;
    }
    
    try {
      await startNewConversation();
    } catch (error) {
      console.error('Failed to start new conversation:', error);
      alert('Failed to start new conversation. Please try again.');
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      await loadTranscriptFromSession(sessionId);
      setIsViewingHistoricalSession(sessionId !== currentSessionId);
      setShowSessionHistory(false);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const handleBackToLive = () => {
    if (currentSessionId) {
      loadTranscriptFromSession(currentSessionId);
      setIsViewingHistoricalSession(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      className={
        (isVisible 
          ? isMobile 
            ? "w-full overflow-auto" 
            : "flex-1 min-w-[400px] overflow-auto" 
          : "w-0 overflow-hidden opacity-0") +
        " transition-all duration-200 ease-in-out flex-col glass-panel border-0 min-h-0 flex"
      }
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header - responsive layout */}
        {!isMobile && (
          <div className="sticky top-0 z-10 border-b border-white/10 bg-bg-secondary/50">
            <div className="flex items-center justify-between px-6 py-3 gap-x-4">
              <div className="flex items-center gap-x-3">
                <span className="font-semibold uppercase tracking-widest text-base">Session</span>
                {isViewingHistoricalSession && (
                  <div className="flex items-center gap-x-2">
                    <span className="text-xs text-text-secondary font-mono">Viewing Past Session</span>
                    <button
                      onClick={handleBackToLive}
                      className="text-xs px-2 py-1 border border-accent-primary bg-bg-tertiary hover:bg-accent-primary/10 text-accent-primary flex items-center justify-center gap-x-1 transition-all font-mono"
                    >
                      Back to Live
                    </button>
                  </div>
                )}
                {isLoadingTranscript && (
                  <span className="text-xs text-text-tertiary font-mono animate-pulse">Loading...</span>
                )}
              </div>

              <div className="flex-1 flex justify-center">
                <PushToTalkButton
                  isConnected={sessionStatus === "CONNECTED"}
                  isPTTActive={isPTTActive}
                  onToggle={setIsPTTActive}
                  isSpeaking={isPTTUserSpeaking}
                  onPressDown={handleTalkButtonDown}
                  onPressUp={handleTalkButtonUp}
                />
              </div>

              <SessionMenu
                onViewHistory={() => setShowSessionHistory(!showSessionHistory)}
                showHistoryDropdown={showSessionHistory}
                onSaveSession={handleOpenSaveDialog}
                canSave={!!currentSessionId && transcriptItems.length > 0}
                onNewConversation={handleNewConversation}
                canStartNew={!!currentSessionId}
                onCopyTranscript={handleCopyTranscript}
                justCopied={justCopied}
                onDownloadAudio={downloadRecording}
              />
            </div>
          </div>
        )}

        {isMobile && (
          <div className="sticky top-0 z-10 border-b border-white/10 bg-bg-secondary/50">
            <div className="px-3 py-2">
              <PushToTalkButton
                isConnected={sessionStatus === "CONNECTED"}
                isPTTActive={isPTTActive}
                onToggle={setIsPTTActive}
                isSpeaking={isPTTUserSpeaking}
                onPressDown={handleTalkButtonDown}
                onPressUp={handleTalkButtonUp}
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-x-2 text-xs">
                {isViewingHistoricalSession && (
                  <span className="text-text-secondary font-mono">Past Session</span>
                )}
                {isLoadingTranscript && (
                  <span className="text-text-tertiary font-mono animate-pulse">Loading...</span>
                )}
              </div>
              <SessionMenu
                onViewHistory={() => setShowSessionHistory(!showSessionHistory)}
                showHistoryDropdown={showSessionHistory}
                onSaveSession={handleOpenSaveDialog}
                canSave={!!currentSessionId && transcriptItems.length > 0}
                onNewConversation={handleNewConversation}
                canStartNew={!!currentSessionId}
                onCopyTranscript={handleCopyTranscript}
                justCopied={justCopied}
                onDownloadAudio={downloadRecording}
              />
            </div>
          </div>
        )}

        {showSessionHistory && !isMobile && (
          <div 
            ref={sessionHistoryRef}
            className="absolute right-6 top-14 w-80 max-h-96 overflow-y-auto border border-white/20 glass-panel-heavy shadow-lg z-20 rounded-xl"
          >
            <div className="p-3 border-b border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-primary">Saved Sessions</span>
            </div>
            {loadingSessions ? (
              <div className="p-4 text-center text-text-tertiary text-sm font-mono">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center text-text-tertiary text-sm font-mono">No saved sessions yet</div>
            ) : (
              <div className="divide-y divide-white/10">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleLoadSession(session.id)}
                    className="w-full px-3 py-2 hover:bg-white/5 text-left transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-xs text-text-primary font-mono font-semibold">
                          {(session as any).title || 'Untitled Session'}
                        </div>
                        <div className="text-xs text-text-tertiary font-mono mt-1">
                          {formatSessionDate(session.started_at)}
                        </div>
                        <div className="text-xs text-text-tertiary font-mono mt-1">
                          {session.messageCount || 0} messages • {formatDuration(session.duration)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          ref={transcriptRef}
          className={`overflow-auto flex flex-col gap-y-4 h-full ${isMobile ? 'p-2' : 'p-4'}`}
          data-lenis-prevent
        >
          {[...transcriptItems]
            .sort((a, b) => a.createdAtMs - b.createdAtMs)
            .map((item) => {
              const {
                itemId,
                type,
                role,
                data,
                expanded,
                timestamp,
                title = "",
                isHidden,
                isSystemMessage,
                guardrailResult,
              } = item;

            if (isHidden || isSystemMessage) {
              return null;
            }

            if (type === "MESSAGE") {
              const isUser = role === "user";
              const containerClasses = `flex justify-end flex-col ${
                isUser ? "items-end" : "items-start"
              }`;
              const bubbleBase = `max-w-lg p-3 rounded-2xl relative group ${
                isUser 
                  ? "bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 border border-accent-primary/30 text-text-primary" 
                  : "glass-panel text-text-primary border border-white/20"
              }`;
              const isBracketedMessage =
                title.startsWith("[") && title.endsWith("]");
              const messageStyle = isBracketedMessage
                ? 'italic text-text-tertiary'
                : '';
              const displayTitle = isBracketedMessage
                ? title.slice(1, -1)
                : title;

              return (
                <motion.div 
                  key={itemId} 
                  className={containerClasses}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                  }}
                >
                  <motion.div 
                    className="max-w-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      className={`${bubbleBase} ${
                        guardrailResult ? "rounded-b-none" : ""
                      }`}
                    >
                      <div
                        className={`text-xs ${
                          isUser ? "text-accent-primary/70" : "text-text-secondary"
                        } font-mono mb-1`}
                      >
                        {timestamp}
                      </div>
                      <div className={`whitespace-pre-wrap ${messageStyle}`}>
                        <ReactMarkdown>{displayTitle}</ReactMarkdown>
                      </div>
                      
                      <div 
                        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                          isUser ? 'bg-accent-primary/5' : 'bg-white/5'
                        }`}
                      />
                    </div>
                    {guardrailResult && (
                      <div className="bg-bg-tertiary border border-border-primary px-3 py-2 rounded-b-xl">
                        <GuardrailChip guardrailResult={guardrailResult} />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            } else if (type === "BREADCRUMB") {
              return (
                <motion.div
                  key={itemId}
                  className="flex flex-col justify-start items-start text-text-secondary text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-xs font-mono">{timestamp}</span>
                  <div
                    className={`whitespace-pre-wrap flex items-center font-mono text-sm text-text-primary ${
                      data ? "cursor-pointer" : ""
                    }`}
                    onClick={() => data && toggleTranscriptItemExpand(itemId)}
                  >
                    {data && (
                      <span
                        className={`text-text-tertiary mr-1 transform transition-transform duration-200 select-none font-mono ${
                          expanded ? "rotate-90" : "rotate-0"
                        }`}
                      >
                        ▶
                      </span>
                    )}
                    {title}
                  </div>
                  {expanded && data && (
                    <div className="text-text-primary text-left">
                      <pre className="border-l-2 ml-1 border-border-primary whitespace-pre-wrap break-words font-mono text-xs mb-2 mt-2 pl-2 bg-bg-tertiary p-2">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}
                </motion.div>
              );
            } else {
              return (
                <div
                  key={itemId}
                  className="flex justify-center text-text-tertiary text-sm italic font-mono"
                >
                  Unknown item type: {type}{" "}
                  <span className="ml-2 text-xs">{timestamp}</span>
                </div>
              );
            }
          })}
        </div>
      </div>

      <TranscriptInput canSend={canSend} onSendMessage={onSendMessage} isMobile={isMobile} />

      {/* Save Session Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-tertiary border border-border-primary p-6 max-w-md w-full mx-4 rounded-xl glass-panel-heavy">
            <h3 className="text-text-primary font-mono font-semibold mb-4 uppercase tracking-wide">
              Save Session
            </h3>
            <p className="text-text-tertiary text-sm font-mono mb-4">
              Give this conversation a memorable name so you can find it later.
            </p>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="w-full bg-bg-primary border border-white/20 text-text-primary px-3 py-2 font-mono focus:outline-none focus:border-accent-primary mb-4 rounded-lg"
              placeholder="e.g., Project Planning Discussion"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSaving) {
                  handleSaveSession();
                } else if (e.key === 'Escape') {
                  setShowSaveDialog(false);
                }
              }}
            />
            <div className="flex gap-x-2 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                disabled={isSaving}
                className="px-4 py-2 border border-white/20 text-text-primary font-mono uppercase tracking-wide text-sm hover:border-accent-secondary transition-colors disabled:opacity-30 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSession}
                disabled={!sessionTitle.trim() || isSaving}
                className="px-4 py-2 bg-accent-primary text-bg-primary font-mono uppercase tracking-wide text-sm hover:bg-accent-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-lg"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transcript;

interface TranscriptInputProps {
  canSend: boolean;
  onSendMessage: (message: string) => void;
  isMobile: boolean;
}

const TranscriptInput = React.memo(function TranscriptInput({
  canSend,
  onSendMessage,
  isMobile,
}: TranscriptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (canSend && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [canSend]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleSubmit = useCallback(() => {
    if (!canSend) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setValue("");
  }, [canSend, onSendMessage, value]);

  return (
    <div
      className={`flex items-center gap-x-2 flex-shrink-0 border-t border-white/10 bg-bg-tertiary ${
        isMobile ? "p-2" : "p-4"
      }`}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && canSend) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className={`flex-1 bg-bg-primary border border-white/10 text-text-primary focus:outline-none focus:border-accent-primary font-mono transition-colors placeholder:text-text-tertiary resize-none overflow-y-auto min-h-[40px] max-h-[200px] rounded-lg ${
          isMobile ? "px-2 py-1 text-sm" : "px-4 py-2"
        }`}
        placeholder={
          isMobile ? "Type a message..." : "Type a message... (Shift+Enter for new line)"
        }
      />
      <button
        onClick={handleSubmit}
        disabled={!canSend || !value.trim()}
        className={`bg-accent-primary text-bg-primary hover:bg-accent-secondary active:bg-accent-secondary rounded-full disabled:opacity-30 transition-all shadow-[0_0_10px_rgba(0,217,255,0.3)] touch-manipulation flex items-center justify-center ${
          isMobile ? "p-2" : "px-2 py-2"
        }`}
      >
        <ImageOptimized src="/arrow.svg" alt="Send" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} />
      </button>
    </div>
  );
});
