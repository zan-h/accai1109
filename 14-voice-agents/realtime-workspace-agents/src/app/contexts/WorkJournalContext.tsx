'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  PropsWithChildren,
} from 'react';
import { useUser } from '@clerk/nextjs';
import { useProjectContext } from './ProjectContext';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface WorkJournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
  note: string;
  projectId?: string | null;
  projectName?: string | null;
  durationMs?: number | null;
  source: 'agent' | 'user' | 'timer';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface WorkJournalState {
  entries: WorkJournalEntry[]; // All entries for selected week
  entriesByDate: Record<string, WorkJournalEntry[]>; // Entries grouped by date
  entryCounts: Record<string, number>; // Entry count per date
  selectedDate: string; // YYYY-MM-DD
  weekStart: string; // YYYY-MM-DD (Monday)
  loading: boolean;
  error: string | null;
  recentlyAddedEntryId: string | null; // For showing notification
}

interface WorkJournalContextValue {
  // State
  entries: WorkJournalEntry[];
  entriesByDate: Record<string, WorkJournalEntry[]>;
  entryCounts: Record<string, number>;
  selectedDate: string;
  weekStart: string;
  loading: boolean;
  error: string | null;
  recentlyAddedEntryId: string | null;

  // Methods
  addEntry: (
    note: string,
    options?: {
      projectId?: string;
      durationMs?: number;
      source?: 'agent' | 'user' | 'timer';
      metadata?: Record<string, any>;
    }
  ) => Promise<WorkJournalEntry | null>;
  updateEntry: (
    id: string,
    updates: {
      note?: string;
      projectId?: string;
      durationMs?: number;
    }
  ) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  loadEntriesForDate: (date: string) => Promise<void>;
  loadEntriesForWeek: (weekStartDate: string) => Promise<void>;
  selectDate: (date: string) => void;
  navigateWeek: (direction: 'prev' | 'next') => void;
  getTodayString: () => string;
  getWeekDates: () => string[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  clearRecentlyAdded: () => void;
}

// ============================================
// CONTEXT
// ============================================

const WorkJournalContext = createContext<WorkJournalContextValue | undefined>(
  undefined
);

// ============================================
// PROVIDER
// ============================================

export const WorkJournalProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { user, isLoaded } = useUser();
  const { currentProjectId } = useProjectContext();

  // State
  const [state, setState] = useState<WorkJournalState>({
    entries: [],
    entriesByDate: {},
    entryCounts: {},
    selectedDate: new Date().toISOString().split('T')[0], // Today
    weekStart: getMonday(new Date()).toISOString().split('T')[0],
    loading: false,
    error: null,
    recentlyAddedEntryId: null,
  });

  // Cache to avoid repeated API calls
  const loadedWeeks = useRef<Set<string>>(new Set());

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getTodayString = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const getWeekDates = useCallback(() => {
    const dates: string[] = [];
    const start = new Date(state.weekStart);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }, [state.weekStart]);

  // ============================================
  // CRUD METHODS
  // ============================================

  const addEntry = useCallback(
    async (
      note: string,
      options?: {
        projectId?: string;
        durationMs?: number;
        source?: 'agent' | 'user' | 'timer';
        metadata?: Record<string, any>;
      }
    ) => {
      try {
        const projectId = options?.projectId || currentProjectId || undefined;
        const source = options?.source || 'user';

        const response = await fetch('/api/work-journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            note,
            projectId,
            durationMs: options?.durationMs,
            source,
            metadata: options?.metadata || {},
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to add entry:', error);
          setState((prev) => ({ ...prev, error: error.error }));
          return null;
        }

        const { entry } = await response.json();

        // Update local state optimistically
        setState((prev) => {
          const newEntries = [...prev.entries, entry];
          const entryDate = entry.date;

          // Update entries grouped by date
          const newEntriesByDate = { ...prev.entriesByDate };
          if (!newEntriesByDate[entryDate]) {
            newEntriesByDate[entryDate] = [];
          }
          newEntriesByDate[entryDate] = [...newEntriesByDate[entryDate], entry];

          // Update entry counts
          const newEntryCounts = { ...prev.entryCounts };
          newEntryCounts[entryDate] = (newEntryCounts[entryDate] || 0) + 1;

          return {
            ...prev,
            entries: newEntries,
            entriesByDate: newEntriesByDate,
            entryCounts: newEntryCounts,
            recentlyAddedEntryId: entry.id,
          };
        });

        // Dispatch event for UI notifications
        window.dispatchEvent(
          new CustomEvent('workJournal.entryAdded', {
            detail: { entry, source },
          })
        );

        return entry;
      } catch (error) {
        console.error('Error adding journal entry:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to add journal entry',
        }));
        return null;
      }
    },
    [currentProjectId]
  );

  const updateEntry = useCallback(
    async (
      id: string,
      updates: {
        note?: string;
        projectId?: string;
        durationMs?: number;
      }
    ) => {
      try {
        const response = await fetch(`/api/work-journal/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to update entry:', error);
          setState((prev) => ({ ...prev, error: error.error }));
          return false;
        }

        const { entry } = await response.json();

        // Update local state
        setState((prev) => {
          const newEntries = prev.entries.map((e) => (e.id === id ? entry : e));
          const entryDate = entry.date;

          // Update entries grouped by date
          const newEntriesByDate = { ...prev.entriesByDate };
          if (newEntriesByDate[entryDate]) {
            newEntriesByDate[entryDate] = newEntriesByDate[entryDate].map((e) =>
              e.id === id ? entry : e
            );
          }

          return {
            ...prev,
            entries: newEntries,
            entriesByDate: newEntriesByDate,
          };
        });

        return true;
      } catch (error) {
        console.error('Error updating journal entry:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to update journal entry',
        }));
        return false;
      }
    },
    []
  );

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/work-journal/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to delete entry:', error);
        setState((prev) => ({ ...prev, error: error.error }));
        return false;
      }

      // Update local state
      setState((prev) => {
        const entryToDelete = prev.entries.find((e) => e.id === id);
        if (!entryToDelete) return prev;

        const newEntries = prev.entries.filter((e) => e.id !== id);
        const entryDate = entryToDelete.date;

        // Update entries grouped by date
        const newEntriesByDate = { ...prev.entriesByDate };
        if (newEntriesByDate[entryDate]) {
          newEntriesByDate[entryDate] = newEntriesByDate[entryDate].filter(
            (e) => e.id !== id
          );
        }

        // Update entry counts
        const newEntryCounts = { ...prev.entryCounts };
        newEntryCounts[entryDate] = Math.max(
          0,
          (newEntryCounts[entryDate] || 1) - 1
        );

        return {
          ...prev,
          entries: newEntries,
          entriesByDate: newEntriesByDate,
          entryCounts: newEntryCounts,
        };
      });

      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to delete journal entry',
      }));
      return false;
    }
  }, []);

  // ============================================
  // LOAD METHODS
  // ============================================

  const loadEntriesForDate = useCallback(async (date: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/work-journal?date=${date}`);

      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const { entries } = await response.json();

      setState((prev) => ({
        ...prev,
        entries,
        entriesByDate: { [date]: entries },
        entryCounts: { [date]: entries.length },
        loading: false,
      }));
    } catch (error) {
      console.error('Error loading entries:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load entries',
      }));
    }
  }, []);

  const loadEntriesForWeek = useCallback(async (weekStartDate: string) => {
    // Check cache
    if (loadedWeeks.current.has(weekStartDate)) {
      console.log('📦 Using cached week data:', weekStartDate);
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const weekStart = new Date(weekStartDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startDate = weekStart.toISOString().split('T')[0];
      const endDate = weekEnd.toISOString().split('T')[0];

      const response = await fetch(
        `/api/work-journal?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const { entries, groupedByDate, entryCounts } = await response.json();

      setState((prev) => ({
        ...prev,
        entries,
        entriesByDate: groupedByDate || {},
        entryCounts: entryCounts || {},
        loading: false,
      }));

      // Add to cache
      loadedWeeks.current.add(weekStartDate);
    } catch (error) {
      console.error('Error loading week entries:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load entries',
      }));
    }
  }, []);

  // ============================================
  // NAVIGATION METHODS
  // ============================================

  const selectDate = useCallback((date: string) => {
    setState((prev) => ({ ...prev, selectedDate: date }));
  }, []);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setState((prev) => {
      const currentWeekStart = new Date(prev.weekStart);
      const offset = direction === 'next' ? 7 : -7;
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(currentWeekStart.getDate() + offset);

      const newWeekStartString = newWeekStart.toISOString().split('T')[0];

      return {
        ...prev,
        weekStart: newWeekStartString,
        selectedDate: newWeekStartString, // Select Monday of new week
      };
    });
  }, []);

  const clearRecentlyAdded = useCallback(() => {
    setState((prev) => ({ ...prev, recentlyAddedEntryId: null }));
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  // Load entries for current week on mount (only when user is authenticated)
  useEffect(() => {
    if (isLoaded && user) {
      loadEntriesForWeek(state.weekStart);
    }
  }, [state.weekStart, loadEntriesForWeek, isLoaded, user]);

  // Listen for agent tool events
  useEffect(() => {
    const handleAgentAddEntry = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { note, projectId, durationMs, metadata } = customEvent.detail;

      addEntry(note, {
        projectId,
        durationMs,
        source: 'agent',
        metadata,
      });
    };

    window.addEventListener('workJournal.addEntry', handleAgentAddEntry);

    return () => {
      window.removeEventListener('workJournal.addEntry', handleAgentAddEntry);
    };
  }, [addEntry]);

  // Listen for timer completion events
  useEffect(() => {
    const handleTimerComplete = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { label, durationMs } = customEvent.detail || {};

      if (label) {
        addEntry(`⏱️ ${label} completed`, {
          durationMs,
          source: 'timer',
          metadata: { autoLogged: true },
        });
      }
    };

    window.addEventListener('timer.completed', handleTimerComplete);

    return () => {
      window.removeEventListener('timer.completed', handleTimerComplete);
    };
  }, [addEntry]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: WorkJournalContextValue = {
    entries: state.entries,
    entriesByDate: state.entriesByDate,
    entryCounts: state.entryCounts,
    selectedDate: state.selectedDate,
    weekStart: state.weekStart,
    loading: state.loading,
    error: state.error,
    recentlyAddedEntryId: state.recentlyAddedEntryId,
    addEntry,
    updateEntry,
    deleteEntry,
    loadEntriesForDate,
    loadEntriesForWeek,
    selectDate,
    navigateWeek,
    getTodayString,
    getWeekDates,
    clearRecentlyAdded,
  };

  return (
    <WorkJournalContext.Provider value={value}>
      {children}
    </WorkJournalContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useWorkJournal = () => {
  const context = useContext(WorkJournalContext);
  if (!context) {
    throw new Error('useWorkJournal must be used within WorkJournalProvider');
  }
  return context;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get the Monday of the week for a given date
 */
function getMonday(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
