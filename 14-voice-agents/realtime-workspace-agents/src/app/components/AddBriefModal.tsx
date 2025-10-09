"use client";

import React, { useEffect, useRef } from "react";
import { useBrief, BRIEF_TEMPLATES, BriefSectionTemplate } from "@/app/contexts/BriefContext";
import { useProject } from "@/app/contexts/ProjectContext";

interface AddBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBriefModal({ isOpen, onClose }: AddBriefModalProps) {
  const { createSection } = useBrief();
  const { currentProjectId, updateProjectBriefSections, getCurrentProject } = useProject();
  const modalRef = useRef<HTMLDivElement>(null);

  const templates: Array<{ key: BriefSectionTemplate; label: string; description: string }> = [
    { key: 'goals', label: 'Goals', description: 'Track your objectives and targets' },
    { key: 'values', label: 'Values', description: 'Define your core principles' },
    { key: 'schedule', label: 'Best Work Times', description: 'Optimal hours for productivity' },
    { key: 'custom', label: 'Custom Section', description: 'Create your own section' },
  ];

  const handleSelectTemplate = (templateKey: BriefSectionTemplate) => {
    const newSection = createSection(templateKey);
    
    // If not global and we have a current project, add to project
    if (!newSection.isGlobal && currentProjectId) {
      const currentProject = getCurrentProject();
      if (currentProject) {
        const updatedSectionIds = [...currentProject.activeBriefSectionIds, newSection.id];
        updateProjectBriefSections(currentProjectId, updatedSectionIds);
      }
    }
    
    onClose();
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-[20vh]">
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan mx-4"
      >
        {/* Header */}
        <div className="border-b border-border-primary px-4 py-3">
          <div className="text-text-secondary text-xs uppercase tracking-widest font-mono">
            Add Brief Section
          </div>
        </div>

        {/* Template Options */}
        <div className="p-4 space-y-2">
          {templates.map((template) => (
            <button
              key={template.key}
              onClick={() => handleSelectTemplate(template.key)}
              className="w-full px-4 py-3 border border-border-primary bg-bg-tertiary hover:bg-bg-primary hover:border-accent-primary transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {BRIEF_TEMPLATES[template.key].icon}
                </span>
                <div className="flex-1">
                  <div className="text-text-primary font-mono text-sm group-hover:text-accent-primary transition-colors">
                    {template.label}
                  </div>
                  <div className="text-text-tertiary text-xs font-mono">
                    {template.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="border-t border-border-primary px-4 py-2 bg-bg-primary">
          <div className="text-text-tertiary text-xs font-mono">
            <span className="text-accent-primary">Click</span> to select · {" "}
            <span className="text-accent-primary">Esc</span> to close
          </div>
        </div>
      </div>
    </div>
  );
}

