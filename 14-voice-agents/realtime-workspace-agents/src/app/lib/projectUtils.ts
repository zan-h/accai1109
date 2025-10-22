// Utility functions for project management

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique project ID
 */
export function generateProjectId(): string {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    try {
      return globalThis.crypto.randomUUID();
    } catch (error) {
      console.warn("crypto.randomUUID failed, falling back to uuidv4()", error);
    }
  }
  return uuidv4();
}

/**
 * Format timestamp for display in terminal format
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Simple fuzzy search - returns true if search term matches project name
 * Uses case-insensitive substring matching
 */
export function fuzzyMatch(text: string, search: string): boolean {
  if (!search) return true;
  
  const textLower = text.toLowerCase();
  const searchLower = search.toLowerCase();
  
  // Simple substring matching
  if (textLower.includes(searchLower)) return true;
  
  // Check if all characters in search appear in order in text
  let searchIndex = 0;
  for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
    if (textLower[i] === searchLower[searchIndex]) {
      searchIndex++;
    }
  }
  
  return searchIndex === searchLower.length;
}

/**
 * Filter and sort projects based on search query
 */
export function filterProjects<T extends { id: string; name: string; updatedAt: string }>(
  projects: T[],
  searchQuery: string,
  recentIds?: string[]
): { recent: T[]; all: T[] } {
  const filtered = projects.filter((p) => fuzzyMatch(p.name, searchQuery));
  
  // Sort by updatedAt (most recent first)
  const sorted = [...filtered].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  if (!recentIds || recentIds.length === 0) {
    return { recent: [], all: sorted };
  }
  
  // Separate recent projects
  const recent = recentIds
    .map((id) => sorted.find((p: any) => p.id === id))
    .filter((p): p is T => p !== undefined)
    .slice(0, 3); // Max 3 recent
  
  return { recent, all: sorted };
}
