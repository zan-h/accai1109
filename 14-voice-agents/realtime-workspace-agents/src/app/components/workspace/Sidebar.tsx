"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import type { WorkspaceTab } from "@/app/types";
import React, { useState, useEffect } from "react";

interface Props {
  tabs: WorkspaceTab[];
  selectedTabId: string;
  onSelect: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function Sidebar({
  tabs,
  selectedTabId,
  onSelect,
  onRename,
  onDelete,
  onAdd,
}: Props) {
  // Local handler to add a default tab if none exist
  const handleAddDefaultTab = () => {
    onAdd();
  };

  return (
    <div className="flex flex-col h-full px-2 py-3 space-y-2 relative">
      <ul className="space-y-1 overflow-y-auto max-h-[60vh] pr-1">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === selectedTabId}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </ul>

      <button
        onClick={handleAddDefaultTab}
        className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-accent-primary transition-colors font-mono uppercase tracking-wide py-1"
      >
        <FontAwesomeIcon icon={faPlus} className="h-3 w-3" /> Add tab
      </button>

      <div className="flex-1" />
      {/* Reset Button sticky at the bottom of the sidebar */}
      <button
        onClick={() => {
          localStorage.removeItem('workspaceState');
          window.location.reload();
        }}
        className="w-full mb-1 py-2 border border-border-primary bg-bg-tertiary text-text-secondary hover:text-status-error hover:border-status-error transition-all text-xs font-medium font-mono uppercase tracking-wide"
        style={{ position: 'sticky', bottom: 0 }}
        title="Reset workspace to default"
      >
        <span className="flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
          Reset Workspace
        </span>
      </button>
    </div>
  );
}

interface ItemProps {
  tab: WorkspaceTab;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

function TabItem({ tab, isActive, onSelect, onRename, onDelete }: ItemProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(tab.name ?? "");

  // Sync draftName with tab.name when editing starts or tab changes
  useEffect(() => {
    if (editing) {
      setDraftName(tab.name ?? "");
    }
  }, [editing, tab.name]);

  const saveName = () => {
    const trimmed = typeof draftName === "string" ? draftName.trim() : "";
    if (trimmed && trimmed !== tab.name) {
      onRename(tab.id, trimmed);
    }
    setEditing(false);
  };

  return (
    <li
      className={`group relative flex items-center justify-between px-2 py-1.5 text-xs font-medium transition-all cursor-pointer border border-transparent font-mono ${isActive ? "bg-bg-tertiary border-accent-primary text-text-primary shadow-glow-cyan" : "text-text-secondary hover:bg-bg-tertiary/50 hover:border-border-primary hover:text-text-primary"}`}
      onClick={() => onSelect(tab.id)}
    >
      {editing ? (
        <input
          className="w-full bg-transparent outline-none border-none text-xs text-text-primary font-mono"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveName();
            }
            if (e.key === "Escape") {
              setDraftName(tab.name);
              setEditing(false);
            }
          }}
          autoFocus
        />
      ) : (
        <span className="truncate mr-5 select-none">{tab.name}</span>
      )}

      {/* Hover controls */}
      {!editing && (
        <div className="absolute right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="text-text-tertiary hover:text-accent-primary transition-colors p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            <FontAwesomeIcon icon={faPen} className="h-2.5 w-2.5" />
          </button>
          <button
            className="text-text-tertiary hover:text-status-error transition-colors p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(tab.id);
            }}
          >
            <FontAwesomeIcon icon={faTrash} className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
    </li>
  );
}
