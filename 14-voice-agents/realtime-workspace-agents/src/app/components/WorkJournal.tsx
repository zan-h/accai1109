'use client';

import React, { useState, useEffect } from 'react';
import { useWorkJournal } from '@/app/contexts/WorkJournalContext';

export const WorkJournal: React.FC = () => {
  const {
    entriesByDate,
    entryCounts,
    selectedDate,
    loading,
    error,
    recentlyAddedEntryId,
    selectDate,
    navigateWeek,
    addEntry,
    updateEntry,
    deleteEntry,
    getTodayString,
    getWeekDates,
    clearRecentlyAdded,
  } = useWorkJournal();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntryNote, setNewEntryNote] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const today = getTodayString();
  const weekDates = getWeekDates();
  const selectedEntries = entriesByDate[selectedDate] || [];

  // ============================================
  // NOTIFICATION HANDLING
  // ============================================

  useEffect(() => {
    if (recentlyAddedEntryId) {
      const entry = selectedEntries.find((e) => e.id === recentlyAddedEntryId);
      if (entry && entry.source === 'agent') {
        setNotificationMessage(`🤖 Agent logged: ${entry.note}`);
        setShowNotification(true);

        // Auto-dismiss after 3 seconds
        const timer = setTimeout(() => {
          setShowNotification(false);
          clearRecentlyAdded();
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [recentlyAddedEntryId, selectedEntries, clearRecentlyAdded]);

  // ============================================
  // ENTRY MANAGEMENT
  // ============================================

  const handleAddEntry = async () => {
    if (!newEntryNote.trim()) return;

    await addEntry(newEntryNote.trim());
    setNewEntryNote('');
    setShowAddForm(false);
  };

  const handleStartEdit = (entryId: string, currentNote: string) => {
    setEditingEntryId(entryId);
    setEditingNote(currentNote);
  };

  const handleSaveEdit = async () => {
    if (!editingEntryId || !editingNote.trim()) return;

    const success = await updateEntry(editingEntryId, {
      note: editingNote.trim(),
    });

    if (success) {
      setEditingEntryId(null);
      setEditingNote('');
    }
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditingNote('');
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm('Delete this journal entry?')) {
      await deleteEntry(entryId);
    }
  };

  // ============================================
  // TIME FORMATTING
  // ============================================

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (durationMs: number | null | undefined) => {
    if (!durationMs) return null;
    const minutes = Math.round(durationMs / 60000);
    return `${minutes} min`;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'agent':
        return '🤖';
      case 'timer':
        return '⏱️';
      default:
        return '';
    }
  };

  // ============================================
  // DAY TAB RENDERING
  // ============================================

  const renderDayTab = (date: string) => {
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    const dayNum = dateObj.getDate();
    const isToday = date === today;
    const isSelected = date === selectedDate;
    const isFuture = date > today;
    const entryCount = entryCounts[date] || 0;

    return (
      <button
        key={date}
        onClick={() => !isFuture && selectDate(date)}
        disabled={isFuture}
        className={`
          flex flex-col items-center px-1 py-1 rounded transition-all text-[10px] relative
          ${isSelected ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-primary hover:bg-bg-secondary'}
          ${isToday ? 'font-bold' : ''}
          ${isFuture ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={`${dateObj.toLocaleDateString('en-US', { weekday: 'long' })}, ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
      >
        <span>{dayName}</span>
        <span className="text-xs font-semibold">{dayNum}</span>
        {entryCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-secondary" title={`${entryCount} entries`}></span>
        )}
      </button>
    );
  };

  // ============================================
  // ENTRY RENDERING
  // ============================================

  const renderEntry = (entry: typeof selectedEntries[0]) => {
    const isEditing = editingEntryId === entry.id;

    return (
      <div
        key={entry.id}
        className="flex items-start gap-2 p-3 rounded-lg bg-bg-tertiary hover:bg-bg-secondary transition-colors animate-fade-in"
      >
        {/* Source icon */}
        <span className="text-lg">{getSourceIcon(entry.source)}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Time + Note */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs text-text-secondary font-mono">
              [{formatTime(entry.timestamp)}]
            </span>

            {isEditing ? (
              <textarea
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                className="flex-1 px-2 py-1 bg-bg-primary border border-border-primary rounded text-sm text-text-primary resize-none"
                rows={2}
                maxLength={200}
                autoFocus
              />
            ) : (
              <span
                className="text-sm text-text-primary cursor-pointer hover:text-accent-primary"
                onClick={() => handleStartEdit(entry.id, entry.note)}
                title="Click to edit"
              >
                {entry.note}
              </span>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
            {entry.projectName && (
              <span className="px-1.5 py-0.5 rounded bg-bg-primary border border-border-primary">
                {entry.projectName}
              </span>
            )}
            {entry.durationMs && (
              <span className="px-1.5 py-0.5 rounded bg-bg-primary border border-border-primary">
                {formatDuration(entry.durationMs)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {!isEditing && (
          <button
            onClick={() => handleDeleteEntry(entry.id)}
            className="text-xs text-text-tertiary hover:text-red-500 transition-colors"
            title="Delete entry"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      {/* Agent Notification Banner */}
      {showNotification && (
        <div className="px-3 py-2 bg-accent-primary text-white text-xs flex items-center justify-between animate-slide-down">
          <span className="truncate">{notificationMessage}</span>
          <button
            onClick={() => {
              setShowNotification(false);
              clearRecentlyAdded();
            }}
            className="ml-2 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Week Navigation */}
      <div className="px-3 py-3 border-b border-border-primary flex-shrink-0">
        <div className="flex items-center justify-between gap-1">
          {/* Previous Week Button */}
          <button
            onClick={() => navigateWeek('prev')}
            className="p-1 rounded hover:bg-bg-tertiary text-text-primary transition-colors text-sm"
            title="Previous week"
          >
            ←
          </button>

          {/* Day Tabs - Compact grid for smaller screens */}
          <div className="grid grid-cols-7 gap-0.5 flex-1">
            {weekDates.map((date) => renderDayTab(date))}
          </div>

          {/* Next Week Button */}
          <button
            onClick={() => navigateWeek('next')}
            className="p-1 rounded hover:bg-bg-tertiary text-text-primary transition-colors text-sm"
            title="Next week"
          >
            →
          </button>
        </div>
      </div>

      {/* Entry List */}
      <div className="px-3 py-3 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-text-tertiary text-sm">
            Loading entries...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-red-500 text-sm">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-accent-primary text-white rounded hover:bg-accent-secondary"
            >
              Retry
            </button>
          </div>
        ) : selectedEntries.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-text-tertiary text-sm">
            No work logged for this day
          </div>
        ) : (
          <div className="space-y-2">
            {selectedEntries.map((entry) => renderEntry(entry))}
          </div>
        )}

        {/* Add Entry Form */}
        {showAddForm ? (
          <div className="mt-4 p-3 rounded-lg bg-bg-tertiary border border-border-primary">
            <textarea
              value={newEntryNote}
              onChange={(e) => setNewEntryNote(e.target.value)}
              placeholder="What did you accomplish?"
              className="w-full px-2 py-1 bg-bg-primary border border-border-primary rounded text-sm text-text-primary resize-none"
              rows={2}
              maxLength={200}
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-text-tertiary">
                {newEntryNote.length}/200
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewEntryNote('');
                  }}
                  className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEntry}
                  disabled={!newEntryNote.trim()}
                  className="px-3 py-1 text-sm bg-accent-primary text-white rounded hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 w-full py-2 border-2 border-dashed border-border-primary rounded-lg text-sm text-text-secondary hover:border-accent-primary hover:text-accent-primary transition-colors"
          >
            + Add Entry
          </button>
        )}
      </div>
    </div>
  );
};

