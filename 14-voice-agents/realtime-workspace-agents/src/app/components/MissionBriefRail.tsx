"use client";

import React, { useState } from "react";
import { useBrief } from "@/app/contexts/BriefContext";
import { useProject } from "@/app/contexts/ProjectContext";
import BriefSection from "./BriefSection";
import AddBriefModal from "./AddBriefModal";

export default function MissionBriefRail() {
  const {
    isExpanded,
    toggleExpanded,
    getVisibleSections,
    deleteSection,
  } = useBrief();
  
  const { currentProjectId, updateProjectBriefSections, getCurrentProject } = useProject();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const visibleSections = getVisibleSections();
  const currentProject = getCurrentProject();

  // Handle toggling a section's visibility in the current project
  const handleToggleSectionInProject = (sectionId: string, isGlobal: boolean) => {
    if (isGlobal || !currentProjectId || !currentProject) return;
    
    const currentSectionIds = currentProject.activeBriefSectionIds;
    const newSectionIds = currentSectionIds.includes(sectionId)
      ? currentSectionIds.filter(id => id !== sectionId)
      : [...currentSectionIds, sectionId];
    
    updateProjectBriefSections(currentProjectId, newSectionIds);
  };

  // Collapsed state (40px vertical rail with icon buttons)
  if (!isExpanded) {
    return (
      <div className="w-10 bg-bg-secondary border-r border-border-primary flex flex-col items-center py-4 gap-4">
        {visibleSections.map((section) => (
          <button
            key={section.id}
            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-bg-tertiary hover:shadow-glow-cyan transition-all border border-transparent hover:border-accent-primary"
            title={section.title}
            onClick={toggleExpanded}
            aria-label={`Open ${section.title}`}
          >
            {section.icon || '📋'}
          </button>
        ))}
        
        {/* Add Section Button at bottom */}
        <button
          className="mt-auto w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-accent-primary transition-colors"
          onClick={() => {
            toggleExpanded();
            setTimeout(() => setIsAddModalOpen(true), 300);
          }}
          aria-label="Add section"
        >
          +
        </button>
      </div>
    );
  }

  // Expanded state (300px panel)
  return (
    <>
      <div className="w-80 bg-bg-secondary border-r border-border-primary flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
          <div className="text-text-primary uppercase tracking-widest font-mono text-sm">
            Mission Brief
          </div>
          <button
            className="text-text-tertiary hover:text-accent-primary transition-colors text-xl"
            onClick={toggleExpanded}
            aria-label="Collapse panel"
          >
            ×
          </button>
        </div>
        
        {/* Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {visibleSections.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary font-mono text-sm">
              <div className="mb-2">No sections yet</div>
              <div className="text-xs">Click + below to add one</div>
            </div>
          ) : (
            visibleSections.map((section) => (
              <BriefSection
                key={section.id}
                section={section}
                isEditing={editingSectionId === section.id}
                onEdit={() => setEditingSectionId(section.id)}
                onSave={() => setEditingSectionId(null)}
                onCancel={() => setEditingSectionId(null)}
                onDelete={() => {
                  if (confirm(`Delete "${section.title}"?`)) {
                    deleteSection(section.id);
                  }
                }}
                onToggleInProject={(isInProject) => {
                  if (!section.isGlobal) {
                    handleToggleSectionInProject(section.id, section.isGlobal);
                  }
                }}
              />
            ))
          )}
        </div>
        
        {/* Add Section Button */}
        <div className="p-4 border-t border-border-primary">
          <button
            className="w-full py-2 border border-border-primary bg-bg-tertiary text-text-secondary hover:text-accent-primary hover:border-accent-primary transition-all uppercase text-xs tracking-wide font-mono"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add Section
          </button>
        </div>
      </div>

      {/* Add Brief Modal */}
      <AddBriefModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}

