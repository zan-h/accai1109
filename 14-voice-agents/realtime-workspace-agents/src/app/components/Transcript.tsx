"use-client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TranscriptItem } from "@/app/types";
import Image from "next/image";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { DownloadIcon, ClipboardCopyIcon, ClockIcon, BookmarkIcon, PlusIcon } from "@radix-ui/react-icons";
import { GuardrailChip } from "./GuardrailChip";
import { useResponsive } from "./layouts/ResponsiveLayout";
import { useProjectContext } from "@/app/contexts/ProjectContext";
import type { VoiceSessionWithMetadata } from "@/app/lib/supabase/types";

export interface TranscriptProps {
  userText: string;
  setUserText: (val: string) => void;
  onSendMessage: () => void;
  canSend: boolean;
  downloadRecording: () => void;
  isVisible?: boolean;
}

function Transcript({
  userText,
  setUserText,
  onSendMessage,
  canSend,
  downloadRecording,
  isVisible = true,
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { isMobile } = useResponsive();
  
  // Session history state
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [sessions, setSessions] = useState<VoiceSessionWithMetadata[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
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

  // Autofocus on text box input on load
  useEffect(() => {
    if (canSend && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [canSend]);

  // Auto-grow textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight (content height)
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userText]);

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

  const fetchSessions = async () => {
    if (!currentProjectId) return;
    
    setLoadingSessions(true);
    try {
      // Only fetch saved sessions (is_saved=true)
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
    // Generate default title with current date/time
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
      // Refresh session list to show the new saved session
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
        " transition-all duration-200 ease-in-out flex-col bg-bg-secondary border border-border-primary min-h-0 flex"
      }
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Hide header on mobile - tab indicator already shows context */}
        {!isMobile && (
          <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-10 text-base border-b border-border-primary bg-bg-secondary">
            <div className="flex items-center gap-x-3">
              <span className="font-semibold uppercase tracking-widest">Transcript</span>
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
            <div className="flex gap-x-2">
              {/* Session History Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSessionHistory(!showSessionHistory)}
                  className="text-sm px-3 py-1 border border-border-primary bg-bg-tertiary hover:border-accent-primary hover:shadow-glow-cyan text-text-primary flex items-center justify-center gap-x-1 transition-all font-mono uppercase tracking-wide"
                  title="View Session History"
                >
                  <ClockIcon />
                  <span>Sessions</span>
                </button>
                {showSessionHistory && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto border border-border-primary bg-bg-tertiary shadow-lg z-20">
                    <div className="p-3 border-b border-border-primary">
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-primary">Saved Sessions</span>
                    </div>
                    {loadingSessions ? (
                      <div className="p-4 text-center text-text-tertiary text-sm font-mono">Loading...</div>
                    ) : sessions.length === 0 ? (
                      <div className="p-4 text-center text-text-tertiary text-sm font-mono">No saved sessions yet</div>
                    ) : (
                      <div className="divide-y divide-border-primary">
                        {sessions.map((session) => (
                          <button
                            key={session.id}
                            onClick={() => handleLoadSession(session.id)}
                            className="w-full px-3 py-2 hover:bg-bg-secondary text-left transition-colors"
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
              </div>

              {/* Save Session Button */}
              <button
                onClick={handleOpenSaveDialog}
                disabled={!currentSessionId || transcriptItems.length === 0}
                className="text-sm px-3 py-1 border border-border-primary bg-bg-tertiary hover:border-accent-primary hover:shadow-glow-cyan text-text-primary flex items-center justify-center gap-x-1 transition-all font-mono uppercase tracking-wide disabled:opacity-30 disabled:cursor-not-allowed"
                title="Save Session to History"
              >
                <BookmarkIcon />
                <span>Save</span>
              </button>

              {/* New Conversation Button */}
              <button
                onClick={handleNewConversation}
                disabled={!currentSessionId}
                className="text-sm px-3 py-1 border border-border-primary bg-bg-tertiary hover:border-accent-secondary hover:shadow-glow-magenta text-text-primary flex items-center justify-center gap-x-1 transition-all font-mono uppercase tracking-wide disabled:opacity-30 disabled:cursor-not-allowed"
                title="Start New Conversation"
              >
                <PlusIcon />
                <span>New</span>
              </button>

              <button
                onClick={handleCopyTranscript}
                className="w-24 text-sm px-3 py-1 border border-border-primary bg-bg-tertiary hover:border-accent-primary hover:shadow-glow-cyan text-text-primary flex items-center justify-center gap-x-1 transition-all font-mono uppercase tracking-wide"
              >
                <ClipboardCopyIcon />
                {justCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadRecording}
                className="w-40 text-sm px-3 py-1 border border-border-primary bg-bg-tertiary hover:border-accent-primary hover:shadow-glow-cyan text-text-primary flex items-center justify-center gap-x-1 transition-all font-mono uppercase tracking-wide"
              >
                <DownloadIcon />
                <span>Download Audio</span>
              </button>
            </div>
          </div>
        )}

        {/* Transcript Content - less padding on mobile */}
        <div
          ref={transcriptRef}
          className={`overflow-auto flex flex-col gap-y-4 h-full ${isMobile ? 'p-2' : 'p-4'}`}
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
                guardrailResult,
              } = item;

            if (isHidden) {
              return null;
            }

            if (type === "MESSAGE") {
              const isUser = role === "user";
              const containerClasses = `flex justify-end flex-col ${
                isUser ? "items-end" : "items-start"
              }`;
              const bubbleBase = `max-w-lg p-3 border ${
                isUser ? "bg-bg-tertiary text-text-primary border-border-primary" : "bg-bg-secondary text-text-primary border-accent-primary"
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
                <div key={itemId} className={containerClasses}>
                  <div className="max-w-lg">
                    <div
                      className={`${bubbleBase} rounded-t-xl ${
                        guardrailResult ? "" : "rounded-b-xl"
                      }`}
                    >
                      <div
                        className={`text-xs ${
                          isUser ? "text-text-tertiary" : "text-text-secondary"
                        } font-mono`}
                      >
                        {timestamp}
                      </div>
                      <div className={`whitespace-pre-wrap ${messageStyle}`}>
                        <ReactMarkdown>{displayTitle}</ReactMarkdown>
                      </div>
                    </div>
                    {guardrailResult && (
                      <div className="bg-bg-tertiary border border-border-primary px-3 py-2">
                        <GuardrailChip guardrailResult={guardrailResult} />
                      </div>
                    )}
                  </div>
                </div>
              );
            } else if (type === "BREADCRUMB") {
              return (
                <div
                  key={itemId}
                  className="flex flex-col justify-start items-start text-text-secondary text-sm"
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
                </div>
              );
            } else {
              // Fallback if type is neither MESSAGE nor BREADCRUMB
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

      {/* Input area - compact on mobile */}
      <div className={`flex items-center gap-x-2 flex-shrink-0 border-t border-border-primary bg-bg-tertiary ${
        isMobile ? 'p-2' : 'p-4'
      }`}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && canSend) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          className={`flex-1 bg-bg-primary border border-border-primary text-text-primary focus:outline-none focus:border-accent-primary font-mono transition-colors placeholder:text-text-tertiary resize-none overflow-y-auto min-h-[40px] max-h-[200px] ${
            isMobile ? 'px-2 py-1 text-sm' : 'px-4 py-2'
          }`}
          placeholder={isMobile ? "Type a message..." : "Type a message... (Shift+Enter for new line)"}
        />
        <button
          onClick={onSendMessage}
          disabled={!canSend || !userText.trim()}
          className={`bg-accent-primary text-bg-primary hover:bg-accent-secondary active:bg-accent-secondary rounded-full disabled:opacity-30 transition-all shadow-glow-cyan touch-manipulation ${
            isMobile ? 'p-2' : 'px-2 py-2'
          }`}
        >
          <Image src="arrow.svg" alt="Send" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} />
        </button>
      </div>

      {/* Save Session Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-tertiary border border-border-primary p-6 max-w-md w-full mx-4">
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
              className="w-full bg-bg-primary border border-border-primary text-text-primary px-3 py-2 font-mono focus:outline-none focus:border-accent-primary mb-4"
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
                className="px-4 py-2 border border-border-primary text-text-primary font-mono uppercase tracking-wide text-sm hover:border-accent-secondary transition-colors disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSession}
                disabled={!sessionTitle.trim() || isSaving}
                className="px-4 py-2 bg-accent-primary text-bg-primary font-mono uppercase tracking-wide text-sm hover:bg-accent-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
