"use client";

// Project state management - now using server-side API routes + Supabase database

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  PropsWithChildren,
  FC,
  useEffect,
} from "react";

import { useUser } from '@clerk/nextjs';
import type { WorkspaceTab } from "@/app/types";

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  suiteId: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  tabs: WorkspaceTab[];
  activeBriefSectionIds: string[];
  suiteTemplatePreferences?: Record<string, 'add' | 'skip'>;  // Track user's template preference per suite
}

export interface ProjectState {
  // Data
  projects: Project[];
  currentProjectId: string | null;
  recentProjectIds: string[];
  isLoading: boolean;
  
  // Selectors
  getCurrentProject: () => Project | null;
  getProject: (id: string) => Project | undefined;
  
  // Mutators (now async!)
  createProject: (name: string, suiteId: string, tabs?: WorkspaceTab[]) => Promise<string>;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  switchToProject: (id: string) => void;
  updateProjectTabs: (id: string, tabs: WorkspaceTab[]) => Promise<void>;
  updateProjectBriefSections: (id: string, sectionIds: string[]) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectState | undefined>(undefined);

const CURRENT_PROJECT_KEY = 'currentProjectId';

export const ProjectProvider: FC<PropsWithChildren> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [recentProjectIds, setRecentProjectIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // -----------------------------------------------------------------------
  // Load projects from API
  // -----------------------------------------------------------------------
  const loadProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.statusText}`);
      }

      const data = await response.json();
      setProjects(data.projects || []);
      
      console.log('✅ Loaded projects from database:', data.projects?.length || 0);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load projects on mount and when user changes
  useEffect(() => {
    if (isLoaded) {
      loadProjects();
    }
  }, [isLoaded, loadProjects]);

  // Load currentProjectId from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedId = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (savedId) setCurrentProjectId(savedId);
  }, []);

  // Save currentProjectId to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentProjectId) {
      localStorage.setItem(CURRENT_PROJECT_KEY, currentProjectId);
    }
  }, [currentProjectId]);

  // -----------------------------------------------------------------------
  // Selectors
  // -----------------------------------------------------------------------
  const getCurrentProject = useCallback((): Project | null => {
    if (!currentProjectId) return null;
    return projects.find(p => p.id === currentProjectId) || null;
  }, [currentProjectId, projects]);

  const getProject = useCallback((id: string): Project | undefined => {
    return projects.find(p => p.id === id);
  }, [projects]);

  // -----------------------------------------------------------------------
  // Mutators (API calls)
  // -----------------------------------------------------------------------
  const createProject = useCallback(async (
    name: string,
    suiteId: string,
    tabs?: WorkspaceTab[]
  ): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, suiteId, tabs }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create project');
    }

    const { project } = await response.json();
    
    setProjects(prev => [project, ...prev]);
    setCurrentProjectId(project.id);
    setRecentProjectIds(prev => [project.id, ...prev.filter(id => id !== project.id)].slice(0, 3));

    console.log('✅ Created project:', project.name);
    return project.id;
  }, [user]);

  const updateProject = useCallback(async (
    id: string,
    updates: Partial<Omit<Project, 'id'>>
  ): Promise<void> => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update project');
    }

    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));

    console.log('✅ Updated project:', id);
  }, []);

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete project');
    }

    setProjects(prev => prev.filter(p => p.id !== id));
    
    if (currentProjectId === id) {
      const remaining = projects.filter(p => p.id !== id);
      setCurrentProjectId(remaining[0]?.id || null);
    }

    setRecentProjectIds(prev => prev.filter(projectId => projectId !== id));

    console.log('✅ Deleted project:', id);
  }, [currentProjectId, projects]);

  const switchToProject = useCallback((id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) {
      console.warn('Project not found:', id);
      return;
    }

    setCurrentProjectId(id);
    setRecentProjectIds(prev => [id, ...prev.filter(projectId => projectId !== id)].slice(0, 3));

    console.log('✅ Switched to project:', project.name);
  }, [projects]);

  const updateProjectTabs = useCallback(async (id: string, tabs: WorkspaceTab[]): Promise<void> => {
    const response = await fetch(`/api/projects/${id}/tabs`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tabs }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update tabs');
    }

    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, tabs } : p
    ));

    console.log('✅ Updated tabs for project:', id);
  }, []);

  const updateProjectBriefSections = useCallback((id: string, sectionIds: string[]) => {
    // Update locally (API call happens in updateProject)
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, activeBriefSectionIds: sectionIds } : p
    ));

    // Persist to database
    updateProject(id, { activeBriefSectionIds: sectionIds }).catch(err => {
      console.error('Failed to update brief sections:', err);
    });
  }, [updateProject]);

  const refreshProjects = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  // -----------------------------------------------------------------------
  // Context value
  // -----------------------------------------------------------------------
  const value: ProjectState = {
    projects,
    currentProjectId,
    recentProjectIds,
    isLoading,
    getCurrentProject,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    switchToProject,
    updateProjectTabs,
    updateProjectBriefSections,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
};
