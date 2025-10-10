"use client";

// Project state management - manages multiple projects, each with their own tabs

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  PropsWithChildren,
  FC,
  useEffect,
} from "react";

import { generateProjectId } from "@/app/lib/projectUtils";
import type { WorkspaceTab } from "@/app/types";

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  modifiedAt: number;
  tabs: WorkspaceTab[];
  activeBriefSectionIds: string[]; // IDs of brief sections active in this project
}

export interface ProjectState {
  // Data
  projects: Project[];
  currentProjectId: string | null;
  recentProjectIds: string[]; // Last 3 accessed project IDs
  
  // Selectors
  getCurrentProject: () => Project | null;
  getProject: (id: string) => Project | undefined;
  
  // Mutators
  createProject: (name: string, tabs?: WorkspaceTab[]) => string;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
  deleteProject: (id: string) => void;
  switchToProject: (id: string) => void;
  updateProjectTabs: (id: string, tabs: WorkspaceTab[]) => void;
  updateProjectBriefSections: (id: string, sectionIds: string[]) => void;
}

const ProjectContext = createContext<ProjectState | undefined>(undefined);

const STORAGE_KEY = 'projectState';

export const ProjectProvider: FC<PropsWithChildren> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [recentProjectIds, setRecentProjectIds] = useState<string[]>([]);

  // -----------------------------------------------------------------------
  // Load from localStorage on mount & migration
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const projectState = localStorage.getItem(STORAGE_KEY);
    const oldWorkspaceState = localStorage.getItem('workspaceState');
    
    if (projectState) {
      // Load existing project state
      try {
        const parsed = JSON.parse(projectState);
        if (Array.isArray(parsed.projects)) setProjects(parsed.projects);
        if (parsed.currentProjectId) setCurrentProjectId(parsed.currentProjectId);
        if (Array.isArray(parsed.recentProjectIds)) setRecentProjectIds(parsed.recentProjectIds);
        console.log('✅ Loaded project state:', parsed.projects.length, 'projects');
      } catch (e) {
        console.error('Failed to load project state:', e);
      }
    } else if (oldWorkspaceState) {
      // Migration from old single-workspace system
      try {
        const oldWorkspace = JSON.parse(oldWorkspaceState);
        const defaultProject: Project = {
          id: generateProjectId(),
          name: oldWorkspace.name || 'Default Project',
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          tabs: oldWorkspace.tabs || [],
          activeBriefSectionIds: [],
        };
        
        setProjects([defaultProject]);
        setCurrentProjectId(defaultProject.id);
        setRecentProjectIds([defaultProject.id]);
        
        console.log('✅ Migrated old workspace to project system');
      } catch (e) {
        console.error('Failed to migrate workspace:', e);
      }
    } else {
      // No existing state - create a default project
      const defaultProject: Project = {
        id: generateProjectId(),
        name: 'Default Project',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        tabs: [],
        activeBriefSectionIds: [],
      };
      
      setProjects([defaultProject]);
      setCurrentProjectId(defaultProject.id);
      setRecentProjectIds([defaultProject.id]);
      
      console.log('✅ Created default project');
    }
  }, []);

  // -----------------------------------------------------------------------
  // Save to localStorage on any change
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (projects.length === 0) return; // Don't save empty state
    
    const state = { projects, currentProjectId, recentProjectIds };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [projects, currentProjectId, recentProjectIds]);

  // -----------------------------------------------------------------------
  // Selectors
  // -----------------------------------------------------------------------
  const getCurrentProject = useCallback((): Project | null => {
    if (!currentProjectId) return null;
    return projects.find((p) => p.id === currentProjectId) || null;
  }, [projects, currentProjectId]);

  const getProject = useCallback((id: string): Project | undefined => {
    return projects.find((p) => p.id === id);
  }, [projects]);

  // -----------------------------------------------------------------------
  // Mutators
  // -----------------------------------------------------------------------
  const createProject = useCallback((name: string, tabs: WorkspaceTab[] = []): string => {
    const newProject: Project = {
      id: generateProjectId(),
      name: name.trim() || 'Untitled Project',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      tabs,
      activeBriefSectionIds: [],
    };
    
    setProjects((prev) => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    setRecentProjectIds((prev) => {
      const updated = [newProject.id, ...prev.filter((id) => id !== newProject.id)];
      return updated.slice(0, 3); // Keep only last 3
    });
    
    console.log('✅ Created project:', newProject.name);
    return newProject.id;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Omit<Project, 'id'>>) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      return {
        ...p,
        ...updates,
        modifiedAt: Date.now(),
      };
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      
      // If deleting current project, switch to another
      if (currentProjectId === id) {
        const nextProject = updated[0];
        if (nextProject) {
          setCurrentProjectId(nextProject.id);
        } else {
          // No projects left, create a new default one
          const defaultProject: Project = {
            id: generateProjectId(),
            name: 'Default Project',
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            tabs: [],
            activeBriefSectionIds: [],
          };
          setCurrentProjectId(defaultProject.id);
          return [defaultProject];
        }
      }
      
      return updated;
    });
    
    // Remove from recent
    setRecentProjectIds((prev) => prev.filter((pid) => pid !== id));
    
    console.log('✅ Deleted project:', id);
  }, [currentProjectId]);

  const switchToProject = useCallback((id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) {
      console.error('Project not found:', id);
      return;
    }
    
    setCurrentProjectId(id);
    setRecentProjectIds((prev) => {
      const updated = [id, ...prev.filter((pid) => pid !== id)];
      return updated.slice(0, 3); // Keep only last 3
    });
    
    // Update modifiedAt
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      return { ...p, modifiedAt: Date.now() };
    }));
    
    console.log('✅ Switched to project:', project.name);
  }, [projects]);

  const updateProjectTabs = useCallback((id: string, tabs: WorkspaceTab[]) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      return {
        ...p,
        tabs,
        modifiedAt: Date.now(),
      };
    }));
  }, []);

  const updateProjectBriefSections = useCallback((id: string, sectionIds: string[]) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      return {
        ...p,
        activeBriefSectionIds: sectionIds,
        modifiedAt: Date.now(),
      };
    }));
  }, []);

  // -----------------------------------------------------------------------
  // Compose state object
  // -----------------------------------------------------------------------
  const value: ProjectState = {
    projects,
    currentProjectId,
    recentProjectIds,
    getCurrentProject,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    switchToProject,
    updateProjectTabs,
    updateProjectBriefSections,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export function useProjectContext(): ProjectState {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return ctx;
}

