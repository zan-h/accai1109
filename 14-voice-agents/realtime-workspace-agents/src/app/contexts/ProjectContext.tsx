"use client";

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  PropsWithChildren,
  FC,
} from "react";
import type { WorkspaceTab } from "@/app/types";
import { generateProjectId } from "@/app/lib/projectUtils";

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  modifiedAt: number;
  tabs: WorkspaceTab[];
  activeBriefSectionIds: string[]; // IDs of brief sections active in this project
}

export interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  recentProjectIds: string[]; // Last 3 accessed
  
  // Mutators
  createProject: (name: string) => Project;
  deleteProject: (id: string) => void;
  renameProject: (id: string, newName: string) => void;
  switchToProject: (id: string) => void;
  getCurrentProject: () => Project | null;
  updateProjectTabs: (projectId: string, tabs: WorkspaceTab[]) => void;
  updateProjectBriefSections: (projectId: string, sectionIds: string[]) => void;
}

const ProjectContext = createContext<ProjectState | undefined>(undefined);

const STORAGE_KEY = 'projectState';
const OLD_WORKSPACE_KEY = 'workspaceState';

/**
 * Migration function: convert old workspace state to first project
 */
function migrateFromOldWorkspace(): Project | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const oldWorkspaceData = localStorage.getItem(OLD_WORKSPACE_KEY);
    if (!oldWorkspaceData) return null;
    
    const oldWorkspace = JSON.parse(oldWorkspaceData);
    
    // Create default project from old workspace
    const defaultProject: Project = {
      id: generateProjectId(),
      name: oldWorkspace.name || 'Default Project',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      tabs: Array.isArray(oldWorkspace.tabs) ? oldWorkspace.tabs : [],
      activeBriefSectionIds: [],
    };
    
    console.log('✅ Migrated old workspace to project system');
    return defaultProject;
  } catch (error) {
    console.error('Failed to migrate old workspace:', error);
    return null;
  }
}

export const ProjectProvider: FC<PropsWithChildren> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [recentProjectIds, setRecentProjectIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount with migration support
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProjects(parsed.projects || []);
        setCurrentProjectId(parsed.currentProjectId || null);
        setRecentProjectIds(parsed.recentProjectIds || []);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load project state:', error);
        setIsInitialized(true);
      }
    } else {
      // No project state exists - check for old workspace to migrate
      const migratedProject = migrateFromOldWorkspace();
      
      if (migratedProject) {
        setProjects([migratedProject]);
        setCurrentProjectId(migratedProject.id);
        setRecentProjectIds([migratedProject.id]);
      }
      
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;
    
    const state = {
      projects,
      currentProjectId,
      recentProjectIds,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [projects, currentProjectId, recentProjectIds, isInitialized]);

  // Create a new project
  const createProject = useCallback((name: string): Project => {
    const newProject: Project = {
      id: generateProjectId(),
      name: name || 'Untitled Project',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      tabs: [],
      activeBriefSectionIds: [],
    };
    
    setProjects((prev) => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    
    // Update recent projects
    setRecentProjectIds((prev) => {
      const updated = [newProject.id, ...prev.filter(id => id !== newProject.id)];
      return updated.slice(0, 3); // Keep only last 3
    });
    
    return newProject;
  }, []);

  // Delete a project
  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const updated = prev.filter(p => p.id !== id);
      
      // If deleting current project, switch to another
      if (currentProjectId === id) {
        const nextProject = updated[0];
        setCurrentProjectId(nextProject?.id || null);
      }
      
      return updated;
    });
    
    // Remove from recent
    setRecentProjectIds((prev) => prev.filter(pid => pid !== id));
  }, [currentProjectId]);

  // Rename a project
  const renameProject = useCallback((id: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, name: newName, modifiedAt: Date.now() }
          : p
      )
    );
  }, []);

  // Switch to a different project
  const switchToProject = useCallback((id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    setCurrentProjectId(id);
    
    // Update recent projects
    setRecentProjectIds((prev) => {
      const updated = [id, ...prev.filter(pid => pid !== id)];
      return updated.slice(0, 3); // Keep only last 3
    });
    
    // Update modified time
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, modifiedAt: Date.now() } : p
      )
    );
  }, [projects]);

  // Get current project
  const getCurrentProject = useCallback((): Project | null => {
    if (!currentProjectId) return null;
    return projects.find(p => p.id === currentProjectId) || null;
  }, [currentProjectId, projects]);

  // Update project tabs (called by WorkspaceContext)
  const updateProjectTabs = useCallback((projectId: string, tabs: WorkspaceTab[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, tabs, modifiedAt: Date.now() }
          : p
      )
    );
  }, []);

  // Update project brief sections
  const updateProjectBriefSections = useCallback((projectId: string, sectionIds: string[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, activeBriefSectionIds: sectionIds, modifiedAt: Date.now() }
          : p
      )
    );
  }, []);

  const value: ProjectState = {
    projects,
    currentProjectId,
    recentProjectIds,
    createProject,
    deleteProject,
    renameProject,
    switchToProject,
    getCurrentProject,
    updateProjectTabs,
    updateProjectBriefSections,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export function useProject(): ProjectState {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return ctx;
}

