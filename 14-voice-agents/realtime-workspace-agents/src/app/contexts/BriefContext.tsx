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
import { generateProjectId } from "@/app/lib/projectUtils";
import { useProject } from "./ProjectContext";

export interface BriefSection {
  id: string;
  title: string;
  icon?: string; // Emoji or icon identifier
  content: string; // Markdown content
  isGlobal: boolean; // If true, appears in all projects
  order: number; // For drag-and-drop reordering
  createdAt: number;
  modifiedAt: number;
}

export interface BriefState {
  sections: BriefSection[];
  isExpanded: boolean;
  autoCollapse: boolean;
  
  // Mutators
  createSection: (template: BriefSectionTemplate) => BriefSection;
  updateSection: (id: string, updates: Partial<BriefSection>) => void;
  deleteSection: (id: string) => void;
  reorderSections: (sections: BriefSection[]) => void;
  toggleExpanded: () => void;
  setAutoCollapse: (enabled: boolean) => void;
  getVisibleSections: () => BriefSection[]; // Get sections visible in current project
}

export type BriefSectionTemplate = 'goals' | 'values' | 'schedule' | 'custom';

// Templates for new sections
export const BRIEF_TEMPLATES: Record<BriefSectionTemplate, Partial<BriefSection>> = {
  goals: {
    title: 'Goals',
    icon: '🎯',
    content: '# My Goals\n\n- Goal 1\n- Goal 2\n- Goal 3',
  },
  values: {
    title: 'Values',
    icon: '💡',
    content: '# Core Values\n\n- Value 1\n- Value 2\n- Value 3',
  },
  schedule: {
    title: 'Best Work Times',
    icon: '⏰',
    content: '# Optimal Schedule\n\n**Peak Hours:** 9am-12pm\n**Focus Time:** 2pm-5pm',
  },
  custom: {
    title: 'New Section',
    icon: '📝',
    content: '# Title\n\nContent here...',
  },
};

const BriefContext = createContext<BriefState | undefined>(undefined);

const STORAGE_KEY = 'briefState';

export const BriefProvider: FC<PropsWithChildren> = ({ children }) => {
  const { getCurrentProject, currentProjectId, updateProjectBriefSections } = useProject();
  
  const [sections, setSections] = useState<BriefSection[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoCollapse, setAutoCollapse] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSections(parsed.sections || []);
        setIsExpanded(parsed.isExpanded || false);
        setAutoCollapse(parsed.autoCollapse || false);
      } catch (error) {
        console.error('Failed to load brief state:', error);
      }
    }
    
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;
    
    const state = {
      sections,
      isExpanded,
      autoCollapse,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [sections, isExpanded, autoCollapse, isInitialized]);

  // Auto-collapse timer
  useEffect(() => {
    if (!autoCollapse || !isExpanded) return;
    
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [autoCollapse, isExpanded]);

  // Create a new section
  const createSection = useCallback((template: BriefSectionTemplate): BriefSection => {
    const templateData = BRIEF_TEMPLATES[template];
    const maxOrder = sections.reduce((max, s) => Math.max(max, s.order), -1);
    
    const newSection: BriefSection = {
      id: generateProjectId(),
      title: templateData.title || 'New Section',
      icon: templateData.icon,
      content: templateData.content || '',
      isGlobal: false,
      order: maxOrder + 1,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    
    setSections((prev) => [...prev, newSection]);
    return newSection;
  }, [sections]);

  // Update a section
  const updateSection = useCallback((id: string, updates: Partial<BriefSection>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...updates, modifiedAt: Date.now() }
          : s
      )
    );
  }, []);

  // Delete a section
  const deleteSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Reorder sections
  const reorderSections = useCallback((newSections: BriefSection[]) => {
    // Update order numbers
    const reordered = newSections.map((s, idx) => ({
      ...s,
      order: idx,
      modifiedAt: Date.now(),
    }));
    
    setSections(reordered);
  }, []);

  // Toggle expanded state
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Get sections visible in current project
  const getVisibleSections = useCallback((): BriefSection[] => {
    const currentProject = getCurrentProject();
    if (!currentProject) return sections.filter(s => s.isGlobal);
    
    // Return global sections + project-specific sections
    return sections.filter(s => 
      s.isGlobal || currentProject.activeBriefSectionIds.includes(s.id)
    ).sort((a, b) => a.order - b.order);
  }, [sections, getCurrentProject]);

  // Update project's active sections when sections change
  useEffect(() => {
    if (!currentProjectId || !isInitialized) return;
    
    const currentProject = getCurrentProject();
    if (!currentProject) return;
    
    // Get non-global sections that should be active in this project
    const projectSectionIds = sections
      .filter(s => !s.isGlobal && currentProject.activeBriefSectionIds.includes(s.id))
      .map(s => s.id);
    
    updateProjectBriefSections(currentProjectId, projectSectionIds);
  }, [sections, currentProjectId, getCurrentProject, updateProjectBriefSections, isInitialized]);

  const value: BriefState = {
    sections,
    isExpanded,
    autoCollapse,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    toggleExpanded,
    setAutoCollapse,
    getVisibleSections,
  };

  return (
    <BriefContext.Provider value={value}>
      {children}
    </BriefContext.Provider>
  );
};

export function useBrief(): BriefState {
  const ctx = useContext(BriefContext);
  if (!ctx) {
    throw new Error("useBrief must be used within a BriefProvider");
  }
  return ctx;
}

