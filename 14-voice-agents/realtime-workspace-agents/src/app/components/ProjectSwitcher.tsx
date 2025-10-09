"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProject } from "@/app/contexts/ProjectContext";
import { fuzzyMatch, formatTerminalTimestamp } from "@/app/lib/projectUtils";

interface ProjectSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectSwitcher({ isOpen, onClose }: ProjectSwitcherProps) {
  const {
    projects,
    currentProjectId,
    recentProjectIds,
    createProject,
    switchToProject,
  } = useProject();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filter projects based on search query
  const filteredProjects = projects.filter(p => 
    fuzzyMatch(searchQuery, p.name)
  );

  // Separate recent and other projects
  const recentProjects = recentProjectIds
    .map(id => projects.find(p => p.id === id))
    .filter(p => p && fuzzyMatch(searchQuery, p.name)) as typeof projects;

  const otherProjects = filteredProjects.filter(
    p => !recentProjectIds.includes(p.id)
  );

  // Total selectable items (recent + other + "create new")
  const totalItems = recentProjects.length + otherProjects.length + 1;

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      setIsCreatingNew(false);
      setNewProjectName("");
      
      // Focus input after a brief delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (isCreatingNew) {
        setIsCreatingNew(false);
        setNewProjectName("");
      } else {
        onClose();
      }
      return;
    }

    if (isCreatingNew) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (newProjectName.trim()) {
          const project = createProject(newProjectName.trim());
          switchToProject(project.id);
          onClose();
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectItem(selectedIndex);
    }
  }, [isCreatingNew, newProjectName, selectedIndex, totalItems, createProject, switchToProject, onClose]);

  // Handle item selection
  const handleSelectItem = useCallback((index: number) => {
    const recentCount = recentProjects.length;
    const otherCount = otherProjects.length;

    if (index < recentCount) {
      // Select from recent projects
      const project = recentProjects[index];
      if (project) {
        switchToProject(project.id);
        onClose();
      }
    } else if (index < recentCount + otherCount) {
      // Select from other projects
      const project = otherProjects[index - recentCount];
      if (project) {
        switchToProject(project.id);
        onClose();
      }
    } else {
      // Create new project
      setIsCreatingNew(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [recentProjects, otherProjects, switchToProject, onClose]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-[20vh]">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan mx-4"
      >
        {/* Header */}
        <div className="border-b border-border-primary px-4 py-3">
          <div className="text-text-secondary text-xs uppercase tracking-widest font-mono">
            {isCreatingNew ? 'Create New Project' : 'Switch Project'}
          </div>
        </div>

        {/* Search Input or Create Input */}
        {isCreatingNew ? (
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter project name..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-bg-primary border-b border-border-primary text-text-primary font-mono focus:outline-none focus:border-accent-primary"
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search projects..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0); // Reset selection on search
            }}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-bg-primary border-b border-border-primary text-text-primary font-mono focus:outline-none focus:border-accent-primary"
          />
        )}

        {/* Project List */}
        {!isCreatingNew && (
          <div className="max-h-96 overflow-y-auto">
            {/* Recent Projects Section */}
            {recentProjects.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs text-text-tertiary uppercase tracking-wide font-mono">
                  Recent
                </div>
                {recentProjects.map((project, idx) => (
                  <div
                    key={project.id}
                    className={`px-4 py-3 cursor-pointer border-l-2 transition-all ${
                      idx === selectedIndex
                        ? 'bg-bg-tertiary border-accent-primary'
                        : 'border-transparent hover:bg-bg-tertiary/50 hover:border-accent-primary/50'
                    }`}
                    onClick={() => handleSelectItem(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-text-primary font-mono">{project.name}</div>
                      {project.id === currentProjectId && (
                        <div className="text-accent-primary text-xs uppercase tracking-wide">
                          Current
                        </div>
                      )}
                    </div>
                    <div className="text-text-tertiary text-xs font-mono mt-1">
                      Modified: {formatTerminalTimestamp(project.modifiedAt)}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* All Projects Section */}
            {otherProjects.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs text-text-tertiary uppercase tracking-wide font-mono border-t border-border-primary mt-2">
                  {recentProjects.length > 0 ? 'Other Projects' : 'All Projects'}
                </div>
                {otherProjects.map((project, idx) => {
                  const itemIndex = recentProjects.length + idx;
                  return (
                    <div
                      key={project.id}
                      className={`px-4 py-3 cursor-pointer border-l-2 transition-all ${
                        itemIndex === selectedIndex
                          ? 'bg-bg-tertiary border-accent-primary'
                          : 'border-transparent hover:bg-bg-tertiary/50 hover:border-accent-primary/50'
                      }`}
                      onClick={() => handleSelectItem(itemIndex)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-text-primary font-mono">{project.name}</div>
                        {project.id === currentProjectId && (
                          <div className="text-accent-primary text-xs uppercase tracking-wide">
                            Current
                          </div>
                        )}
                      </div>
                      <div className="text-text-tertiary text-xs font-mono mt-1">
                        Modified: {formatTerminalTimestamp(project.modifiedAt)}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Create New Option */}
            <div
              className={`px-4 py-3 border-t border-border-primary cursor-pointer transition-all border-l-2 ${
                selectedIndex === totalItems - 1
                  ? 'bg-bg-tertiary border-accent-primary'
                  : 'border-transparent hover:bg-bg-tertiary/50 hover:border-accent-primary/50'
              }`}
              onClick={() => handleSelectItem(totalItems - 1)}
              onMouseEnter={() => setSelectedIndex(totalItems - 1)}
            >
              <div className="text-accent-primary font-mono">+ Create New Project</div>
            </div>

            {/* No results */}
            {filteredProjects.length === 0 && searchQuery && (
              <div className="px-4 py-8 text-center text-text-tertiary font-mono text-sm">
                No projects found matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!isCreatingNew && (
          <div className="border-t border-border-primary px-4 py-2 bg-bg-primary">
            <div className="text-text-tertiary text-xs font-mono">
              <span className="text-accent-primary">↑↓</span> navigate · {" "}
              <span className="text-accent-primary">Enter</span> select · {" "}
              <span className="text-accent-primary">Esc</span> close
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

