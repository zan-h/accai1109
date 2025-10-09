"use client";

import React, { useState } from "react";
import type { BriefSection as BriefSectionType } from "@/app/contexts/BriefContext";
import { useBrief } from "@/app/contexts/BriefContext";
import { useProject } from "@/app/contexts/ProjectContext";

interface BriefSectionProps {
  section: BriefSectionType;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onToggleInProject: (isInProject: boolean) => void;
}

export default function BriefSection({
  section,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: BriefSectionProps) {
  const { updateSection } = useBrief();
  const { getCurrentProject } = useProject();
  const currentProject = getCurrentProject();
  
  const [editedTitle, setEditedTitle] = useState(section.title);
  const [editedContent, setEditedContent] = useState(section.content);
  const [editedIcon, setEditedIcon] = useState(section.icon || '');

  const handleSave = () => {
    updateSection(section.id, {
      title: editedTitle,
      content: editedContent,
      icon: editedIcon,
    });
    onSave();
  };

  const handleCancel = () => {
    setEditedTitle(section.title);
    setEditedContent(section.content);
    setEditedIcon(section.icon || '');
    onCancel();
  };

  const handleToggleGlobal = () => {
    updateSection(section.id, {
      isGlobal: !section.isGlobal,
    });
  };

  const isActiveInProject = currentProject
    ? section.isGlobal || currentProject.activeBriefSectionIds.includes(section.id)
    : section.isGlobal;

  if (isEditing) {
    return (
      <div className="border border-border-primary bg-bg-tertiary">
        {/* Edit Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border-primary">
          <input
            type="text"
            value={editedIcon}
            onChange={(e) => setEditedIcon(e.target.value)}
            placeholder="Icon"
            className="w-12 px-2 py-1 bg-bg-primary border border-border-primary text-text-primary font-mono text-sm focus:outline-none focus:border-accent-primary"
          />
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="flex-1 px-2 py-1 bg-bg-primary border border-border-primary text-text-primary font-mono text-sm focus:outline-none focus:border-accent-primary"
          />
        </div>
        
        {/* Edit Content */}
        <div className="p-3">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 bg-bg-primary border border-border-primary text-text-primary font-mono text-sm focus:outline-none focus:border-accent-primary resize-none"
          />
        </div>
        
        {/* Edit Actions */}
        <div className="px-3 py-2 border-t border-border-primary flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-1 bg-accent-primary text-bg-primary hover:shadow-glow-cyan transition-all uppercase text-xs tracking-wide font-mono"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-1 border border-border-primary bg-bg-primary text-text-secondary hover:text-status-error hover:border-status-error transition-all uppercase text-xs tracking-wide font-mono"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border-primary bg-bg-tertiary">
      {/* Section Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-primary">
        <div className="flex items-center gap-2">
          <span className="text-lg">{section.icon}</span>
          <span className="font-mono text-sm text-text-primary">{section.title}</span>
        </div>
        <div className="flex gap-2">
          <button
            className="text-text-tertiary hover:text-accent-primary text-sm transition-colors"
            onClick={onEdit}
            aria-label="Edit section"
          >
            ✎
          </button>
          <button
            className="text-text-tertiary hover:text-status-error text-sm transition-colors"
            onClick={onDelete}
            aria-label="Delete section"
          >
            🗑
          </button>
        </div>
      </div>
      
      {/* Section Content */}
      <div className="p-3 text-sm text-text-primary font-mono whitespace-pre-wrap">
        {section.content}
      </div>
      
      {/* Section Footer */}
      <div className="px-3 py-2 border-t border-border-primary flex items-center gap-2">
        <input
          type="checkbox"
          checked={section.isGlobal}
          onChange={handleToggleGlobal}
          className="w-3 h-3 bg-bg-primary border border-border-primary accent-accent-primary cursor-pointer"
          id={`global-${section.id}`}
        />
        <label
          htmlFor={`global-${section.id}`}
          className="text-xs text-text-tertiary font-mono cursor-pointer select-none"
        >
          Show in all projects
        </label>
        
        {!section.isGlobal && (
          <div className="ml-auto">
            {isActiveInProject ? (
              <span className="text-xs text-accent-primary font-mono">Active in project</span>
            ) : (
              <span className="text-xs text-text-tertiary font-mono">Not in project</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

