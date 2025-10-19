"use client";

// Command palette for switching between projects

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useProjectContext } from "@/app/contexts/ProjectContext";
import { filterProjects, formatTimestamp } from "@/app/lib/projectUtils";

interface ProjectSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  sessionStatus?: string;
}

export default function ProjectSwitcher({ isOpen, onClose, sessionStatus = "DISCONNECTED" }: ProjectSwitcherProps) {
  const {
    projects,
    currentProjectId,
    recentProjectIds,
    switchToProject,
    createProject,
    updateProject,
    deleteProject,
  } = useProjectContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  // Filter projects based on search
  const { recent, all } = filterProjects(projects, searchQuery, recentProjectIds);
  
  // Combine into single list for keyboard navigation
  const allItems = [...recent, ...all.filter((p) => !recent.find((r) => r.id === p.id))];
  const totalItems = allItems.length + 1; // +1 for "Create New" option

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      setIsCreatingNew(false);
      setNewProjectName("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Focus create input when entering create mode
  useEffect(() => {
    if (isCreatingNew) {
      setTimeout(() => createInputRef.current?.focus(), 0);
    }
  }, [isCreatingNew]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isCreatingNew) {
      if (e.key === "Escape") {
        setIsCreatingNew(false);
        setNewProjectName("");
        e.preventDefault();
      } else if (e.key === "Enter") {
        handleCreateProject();
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        setSelectedIndex((prev) => (prev + 1) % totalItems);
        e.preventDefault();
        break;
      case "ArrowUp":
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        e.preventDefault();
        break;
      case "Enter":
        handleSelect(selectedIndex);
        e.preventDefault();
        break;
      case "Escape":
        onClose();
        e.preventDefault();
        break;
    }
  };

  const handleSelect = (index: number) => {
    if (index === allItems.length) {
      // "Create New Project" option
      setIsCreatingNew(true);
    } else {
      const project = allItems[index];
      if (project && project.id !== currentProjectId) {
        // Confirmation if agent is connected
        if (sessionStatus === "CONNECTED") {
          const confirmed = window.confirm(
            `Agent is currently connected. Switching to "${project.name}" will disconnect the conversation. Continue?`
          );
          if (!confirmed) return;
        }
        switchToProject(project.id);
        onClose();
      } else if (project && project.id === currentProjectId) {
        // Already on this project, just close
        onClose();
      }
    }
  };

  const handleRenameProject = async (projectId: string, newName: string) => {
    if (newName.trim()) {
      try {
        await updateProject(projectId, { name: newName.trim() });
        setRenamingProjectId(null);
      } catch (error) {
        console.error('Failed to rename project:', error);
        alert('Failed to rename project. Please try again.');
      }
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (projects.length === 1) {
      alert("Cannot delete the last project. At least one project must exist.");
      return;
    }
    
    const confirmed = window.confirm(
      `Delete project "${projectName}"? This cannot be undone.`
    );
    if (confirmed) {
      try {
        await deleteProject(projectId);
        if (projects.length === 1) {
          onClose(); // Close if this was the last project
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleCreateProject = async () => {
    const name = newProjectName.trim();
    if (name) {
      try {
        // Get current suite ID from localStorage or use default
        const suiteId = typeof window !== 'undefined' 
          ? localStorage.getItem('selectedSuiteId') || 'energy-focus'
          : 'energy-focus';
        
        await createProject(name, suiteId);
        onClose();
      } catch (error) {
        console.error('Failed to create project:', error);
        alert('Failed to create project. Please try again.');
      }
    }
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-bg-overlay z-50 flex items-start justify-center pt-[20vh]"
      onClick={handleClickOutside}
    >
      <div
        className="w-full max-w-2xl bg-bg-secondary border-2 border-accent-primary shadow-glow-cyan"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="border-b border-border-primary px-4 py-3">
          <div className="text-text-secondary text-xs uppercase tracking-widest font-mono">
            {isCreatingNew ? "Create New Project" : "Switch Project"}
          </div>
        </div>

        {/* Search Input or Create Input */}
        {isCreatingNew ? (
          <div className="px-4 py-3 border-b border-border-primary">
            <input
              ref={createInputRef}
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full bg-bg-primary text-text-primary font-mono focus:outline-none"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleCreateProject}
                className="px-3 py-1 bg-bg-tertiary border border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-bg-primary transition-all text-xs uppercase tracking-wide font-mono"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingNew(false);
                  setNewProjectName("");
                }}
                className="px-3 py-1 bg-bg-tertiary border border-border-primary text-text-secondary hover:border-text-secondary transition-all text-xs uppercase tracking-wide font-mono"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0); // Reset selection on search
            }}
            placeholder="Type to search projects..."
            className="w-full px-4 py-3 bg-bg-primary border-b border-border-primary text-text-primary font-mono focus:outline-none"
          />
        )}

        {/* Project List */}
        {!isCreatingNew && (
          <div className="max-h-96 overflow-y-auto">
            {/* Recent Section */}
            {recent.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs text-text-tertiary uppercase tracking-wide font-mono">
                  Recent
                </div>
                {recent.map((project, idx) => {
                  const globalIndex = idx;
                  const isSelected = selectedIndex === globalIndex;
                  const isCurrent = project.id === currentProjectId;
                  const isRenaming = renamingProjectId === project.id;

                  return (
                    <div
                      key={project.id}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`px-4 py-3 border-l-2 transition-all group ${
                        isSelected
                          ? "bg-bg-tertiary border-accent-primary"
                          : "border-transparent hover:bg-bg-tertiary hover:border-accent-primary"
                      }`}
                    >
                      {isRenaming ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameProject(project.id, renameValue);
                              if (e.key === 'Escape') setRenamingProjectId(null);
                            }}
                            className="flex-1 px-2 py-1 bg-bg-primary border border-accent-primary text-text-primary font-mono text-sm focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRenameProject(project.id, renameValue)}
                            className="px-2 py-1 text-xs text-accent-primary hover:text-accent-secondary"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setRenamingProjectId(null)}
                            className="px-2 py-1 text-xs text-text-tertiary hover:text-text-secondary"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleSelect(globalIndex)}
                            >
                              <div className="text-text-primary font-mono">
                                ⭐ {project.name}
                                {isCurrent && (
                                  <span className="ml-2 text-accent-primary text-xs">
                                    [CURRENT]
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-text-tertiary text-xs font-mono">
                                {project.tabs.length} tabs
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRenamingProjectId(project.id);
                                    setRenameValue(project.name);
                                  }}
                                  className="px-1.5 py-0.5 text-xs text-text-tertiary hover:text-accent-primary"
                                  title="Rename project"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project.id, project.name);
                                  }}
                                  className="px-1.5 py-0.5 text-xs text-text-tertiary hover:text-status-error"
                                  title="Delete project"
                                >
                                  🗑
                                </button>
                              </div>
                            </div>
                          </div>
                          <div 
                            className="text-text-tertiary text-xs font-mono cursor-pointer"
                            onClick={() => handleSelect(globalIndex)}
                          >
                            Modified: {formatTimestamp(new Date(project.updatedAt).getTime())}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* All Projects Section */}
            {all.length > recent.length && (
              <>
                <div className="px-4 py-2 text-xs text-text-tertiary uppercase tracking-wide border-t border-border-primary mt-2 font-mono">
                  All Projects
                </div>
                {all
                  .filter((p) => !recent.find((r) => r.id === p.id))
                  .map((project) => {
                    const globalIndex = recent.length + all.filter((p) => !recent.find((r) => r.id === p.id)).indexOf(project);
                    const isSelected = selectedIndex === globalIndex;
                    const isCurrent = project.id === currentProjectId;
                    const isRenaming = renamingProjectId === project.id;

                    return (
                      <div
                        key={project.id}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`px-4 py-3 border-l-2 transition-all group ${
                          isSelected
                            ? "bg-bg-tertiary border-accent-primary"
                            : "border-transparent hover:bg-bg-tertiary hover:border-accent-primary"
                        }`}
                      >
                        {isRenaming ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameProject(project.id, renameValue);
                                if (e.key === 'Escape') setRenamingProjectId(null);
                              }}
                              className="flex-1 px-2 py-1 bg-bg-primary border border-accent-primary text-text-primary font-mono text-sm focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleRenameProject(project.id, renameValue)}
                              className="px-2 py-1 text-xs text-accent-primary hover:text-accent-secondary"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setRenamingProjectId(null)}
                              className="px-2 py-1 text-xs text-text-tertiary hover:text-text-secondary"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => handleSelect(globalIndex)}
                              >
                                <div className="text-text-primary font-mono">
                                  {project.name}
                                  {isCurrent && (
                                    <span className="ml-2 text-accent-primary text-xs">
                                      [CURRENT]
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-text-tertiary text-xs font-mono">
                                  {project.tabs.length} tabs
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRenamingProjectId(project.id);
                                      setRenameValue(project.name);
                                    }}
                                    className="px-1.5 py-0.5 text-xs text-text-tertiary hover:text-accent-primary"
                                    title="Rename project"
                                  >
                                    ✎
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteProject(project.id, project.name);
                                    }}
                                    className="px-1.5 py-0.5 text-xs text-text-tertiary hover:text-status-error"
                                    title="Delete project"
                                  >
                                    🗑
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div 
                              className="text-text-tertiary text-xs font-mono cursor-pointer"
                              onClick={() => handleSelect(globalIndex)}
                            >
                              Modified: {formatTimestamp(new Date(project.updatedAt).getTime())}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
              </>
            )}

            {/* Create New Option */}
            <div
              onClick={() => handleSelect(allItems.length)}
              onMouseEnter={() => setSelectedIndex(allItems.length)}
              className={`px-4 py-3 border-t border-border-primary cursor-pointer transition-all ${
                selectedIndex === allItems.length
                  ? "bg-bg-tertiary"
                  : "hover:bg-bg-tertiary"
              }`}
            >
              <div className="text-accent-primary font-mono">
                + Create New Project
              </div>
            </div>

            {/* Empty State */}
            {allItems.length === 0 && (
              <div className="px-4 py-8 text-center text-text-tertiary font-mono">
                No projects found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

