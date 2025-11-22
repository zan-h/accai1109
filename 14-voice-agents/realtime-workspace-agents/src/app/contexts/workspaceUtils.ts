// src/app/contexts/workspaceUtils.ts

import { v4 as uuidv4 } from 'uuid';
import type { WorkspaceTab } from '@/app/types';

/**
 * Regex used to determine whether a tab id is already a UUID. If it is not,
 * we generate a fresh id so tools can reference tabs by stable identifiers.
 */
export const WORKSPACE_TAB_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generate a RFC4122 UUID. Uses the browser crypto API when available and
 * falls back to uuidv4 for environments where it is not.
 */
export const createTabId = (): string => {
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    try {
      return globalThis.crypto.randomUUID();
    } catch (error) {
      console.warn('crypto.randomUUID failed, falling back to uuidv4()', error);
    }
  }
  return uuidv4();
};

/**
 * Resolve the best tab id based on an explicit id, index, or tab name.
 */
export function resolveTabId(
  tabs: WorkspaceTab[],
  opts: { id?: string; index?: number; name?: string }
): string | undefined {
  const { id, index, name } = opts;
  if (typeof id === 'string' && id) {
    return id;
  }

  if (typeof name === 'string') {
    const tabByName = tabs.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (tabByName) return tabByName.id;
  }

  if (typeof index === 'number' && index >= 0 && index < tabs.length) {
    return tabs[index]?.id;
  }

  return undefined;
}
