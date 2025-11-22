"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  FC,
  PropsWithChildren,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { TranscriptItem } from "@/app/types";

// Maximum number of transcript items to keep in memory (prevents unbounded growth)
const MAX_TRANSCRIPT_ITEMS = 200;

// Debounce duration for auto-save (milliseconds)
const AUTOSAVE_DEBOUNCE_MS = 3000;

type TranscriptContextValue = {
  // Transcript data
  transcriptItems: TranscriptItem[];
  
  // Session state
  currentSessionId: string | null;
  isLoadingTranscript: boolean;
  isSavingTranscript: boolean;
  isViewingHistoricalSession: boolean;
  
  // Transcript mutations (existing API)
  addTranscriptMessage: (
    itemId: string,
    role: "user" | "assistant",
    text: string,
    isHidden?: boolean,
    isSystemMessage?: boolean,
  ) => void;
  updateTranscriptMessage: (itemId: string, text: string, isDelta: boolean) => void;
  addTranscriptBreadcrumb: (title: string, data?: Record<string, any>) => void;
  toggleTranscriptItemExpand: (itemId: string) => void;
  updateTranscriptItem: (itemId: string, updatedProperties: Partial<TranscriptItem>) => void;
  
  // Session management (new API)
  setCurrentSession: (sessionId: string | null) => void;
  loadTranscriptFromSession: (sessionId: string) => Promise<void>;
  saveTranscriptToDatabase: () => Promise<void>;
  clearTranscript: () => void;
  setIsViewingHistoricalSession: (isHistorical: boolean) => void;
  
  // New: Manual save and new conversation
  saveSessionWithTitle: (title: string) => Promise<any>;
  startNewConversation: () => Promise<void>;
};

const TranscriptContext = createContext<TranscriptContextValue | undefined>(undefined);

export const TranscriptProvider: FC<PropsWithChildren> = ({ children }) => {
  // State
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);
  const [isViewingHistoricalSession, setIsViewingHistoricalSession] = useState(false);
  
  // Refs for debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedItemsRef = useRef<string>('[]'); // JSON stringified for comparison

  function newTimestampPretty(): string {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const ms = now.getMilliseconds().toString().padStart(3, "0");
    return `${time}.${ms}`;
  }

  const addTranscriptMessage: TranscriptContextValue["addTranscriptMessage"] = (itemId, role, text = "", isHidden = false, isSystemMessage = false) => {
    setTranscriptItems((prev) => {
      if (prev.some((log) => log.itemId === itemId && log.type === "MESSAGE")) {
        console.warn(`[addTranscriptMessage] skipping; message already exists for itemId=${itemId}, role=${role}, text=${text}`);
        return prev;
      }

      const newItem: TranscriptItem = {
        itemId,
        type: "MESSAGE",
        role,
        title: text,
        expanded: false,
        timestamp: newTimestampPretty(),
        createdAtMs: Date.now(),
        status: "IN_PROGRESS",
        isHidden,
        isSystemMessage, // NEW: Mark system messages
      };

      // Keep only the most recent MAX_TRANSCRIPT_ITEMS (FIFO eviction)
      const updated = [...prev, newItem];
      if (updated.length > MAX_TRANSCRIPT_ITEMS) {
        // Remove oldest items
        return updated.slice(-MAX_TRANSCRIPT_ITEMS);
      }
      return updated;
    });
  };

  const updateTranscriptMessage: TranscriptContextValue["updateTranscriptMessage"] = (itemId, newText, append = false) => {
    setTranscriptItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId && item.type === "MESSAGE") {
          return {
            ...item,
            title: append ? (item.title ?? "") + newText : newText,
          };
        }
        return item;
      })
    );
  };

  const addTranscriptBreadcrumb: TranscriptContextValue["addTranscriptBreadcrumb"] = (title, data) => {
    setTranscriptItems((prev) => {
      const newItem: TranscriptItem = {
        itemId: `breadcrumb-${uuidv4()}`,
        type: "BREADCRUMB",
        title,
        data,
        expanded: false,
        timestamp: newTimestampPretty(),
        createdAtMs: Date.now(),
        status: "DONE",
        isHidden: false,
      };
      
      // Keep only the most recent MAX_TRANSCRIPT_ITEMS (FIFO eviction)
      const updated = [...prev, newItem];
      if (updated.length > MAX_TRANSCRIPT_ITEMS) {
        // Remove oldest items
        return updated.slice(-MAX_TRANSCRIPT_ITEMS);
      }
      return updated;
    });
  };

  const toggleTranscriptItemExpand: TranscriptContextValue["toggleTranscriptItemExpand"] = (itemId) => {
    setTranscriptItems((prev) =>
      prev.map((log) =>
        log.itemId === itemId ? { ...log, expanded: !log.expanded } : log
      )
    );
  };

  const updateTranscriptItem: TranscriptContextValue["updateTranscriptItem"] = (itemId, updatedProperties) => {
    setTranscriptItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, ...updatedProperties } : item
      )
    );
  };

  // ============================================
  // SESSION MANAGEMENT & PERSISTENCE
  // ============================================

  /**
   * Load transcript items from database for a specific session
   */
  const loadTranscriptFromSession = useCallback(async (sessionId: string) => {
    setIsLoadingTranscript(true);
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}/transcript`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load transcript');
      }

      const { items } = await response.json();
      
      setTranscriptItems(items || []);
      setCurrentSessionId(sessionId);
      
      console.log('✅ Loaded transcript from session:', sessionId, `(${items?.length || 0} items)`);
    } catch (error) {
      console.error('Failed to load transcript from session:', error);
      throw error;
    } finally {
      setIsLoadingTranscript(false);
    }
  }, []);

  /**
   * Save current transcript items to database
   * This is called manually or via debounced auto-save
   */
  const saveTranscriptToDatabase = useCallback(async () => {
    if (!currentSessionId) {
      console.warn('No active session, skipping transcript save');
      return;
    }

    if (isViewingHistoricalSession) {
      console.warn('Viewing historical session, skipping transcript save');
      return;
    }

    // Check if transcript has changed since last save
    const currentItemsString = JSON.stringify(transcriptItems);
    if (currentItemsString === lastSavedItemsRef.current) {
      console.log('Transcript unchanged, skipping save');
      return;
    }

    setIsSavingTranscript(true);
    
    try {
      const response = await fetch(`/api/sessions/${currentSessionId}/transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: transcriptItems }),
        keepalive: true, // Ensures save completes even if page closes
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save transcript');
      }

      const { count } = await response.json();
      
      lastSavedItemsRef.current = currentItemsString;
      
      console.log('✅ Saved transcript to session:', currentSessionId, `(${count} items)`);
    } catch (error) {
      console.error('Failed to save transcript to database:', error);
      // Don't throw - we'll retry on next save attempt
    } finally {
      setIsSavingTranscript(false);
    }
  }, [currentSessionId, transcriptItems, isViewingHistoricalSession]);

  /**
   * Clear transcript (for starting new session)
   */
  const clearTranscript = useCallback(() => {
    setTranscriptItems([]);
    lastSavedItemsRef.current = '[]';
    console.log('✅ Cleared transcript');
  }, []);

  /**
   * Set current session ID
   */
  const setCurrentSession = useCallback((sessionId: string | null) => {
    setCurrentSessionId(sessionId);
    console.log('✅ Set current session:', sessionId);
  }, []);

  /**
   * Save current working session as a named snapshot
   */
  const saveSessionWithTitle = useCallback(async (title: string) => {
    if (!currentSessionId) {
      throw new Error('No active session to save');
    }

    // First, ensure current transcript is saved
    await saveTranscriptToDatabase();

    // Create saved session via API
    const response = await fetch(`/api/sessions/${currentSessionId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, copyTranscript: true }),
    });

    if (!response.ok) {
      throw new Error('Failed to save session');
    }

    const { savedSession } = await response.json();
    console.log('✅ Saved session with title:', title, '(ID:', savedSession.id, ')');
    return savedSession;
  }, [currentSessionId, saveTranscriptToDatabase]);

  /**
   * Start a new conversation (clear transcript and create new session)
   */
  const startNewConversation = useCallback(async () => {
    // Save final state of current session
    if (currentSessionId) {
      await saveTranscriptToDatabase();
      console.log('💾 Saved final state before starting new conversation');
    }

    // Clear transcript in memory
    clearTranscript();
    setCurrentSessionId(null);
    setIsViewingHistoricalSession(false);
    
    console.log('✅ Ready for new conversation (session will be created on next connect)');
  }, [currentSessionId, saveTranscriptToDatabase, clearTranscript]);

  // ============================================
  // AUTO-SAVE EFFECT
  // ============================================

  /**
   * Debounced auto-save: Save transcript to database after changes stop for N seconds
   * Only saves if there's an active session and we're not viewing historical data
   */
  useEffect(() => {
    if (!currentSessionId || isViewingHistoricalSession || transcriptItems.length === 0) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after debounce period
    saveTimeoutRef.current = setTimeout(() => {
      saveTranscriptToDatabase();
    }, AUTOSAVE_DEBOUNCE_MS);

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [transcriptItems, currentSessionId, isViewingHistoricalSession, saveTranscriptToDatabase]);

  return (
    <TranscriptContext.Provider
      value={{
        // Data
        transcriptItems,
        
        // Session state
        currentSessionId,
        isLoadingTranscript,
        isSavingTranscript,
        isViewingHistoricalSession,
        
        // Existing methods
        addTranscriptMessage,
        updateTranscriptMessage,
        addTranscriptBreadcrumb,
        toggleTranscriptItemExpand,
        updateTranscriptItem,
        
        // Session management methods
        setCurrentSession,
        loadTranscriptFromSession,
        saveTranscriptToDatabase,
        clearTranscript,
        setIsViewingHistoricalSession,
        saveSessionWithTitle,
        startNewConversation,
      }}
    >
      {children}
    </TranscriptContext.Provider>
  );
};

export function useTranscript() {
  const context = useContext(TranscriptContext);
  if (!context) {
    throw new Error("useTranscript must be used within a TranscriptProvider");
  }
  return context;
}
