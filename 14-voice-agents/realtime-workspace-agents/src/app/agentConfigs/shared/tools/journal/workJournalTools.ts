// src/app/agentConfigs/shared/tools/journal/workJournalTools.ts

import { tool } from '@openai/agents/realtime';

// ---------------------------------------------------------------------------
// Helper functions (used by agent tools)
// ---------------------------------------------------------------------------

export async function addWorkJournalEntryHelper(input: any) {
  const { note, projectId, durationMs } = input as {
    note: string;
    projectId?: string;
    durationMs?: number;
  };

  // Validate note
  if (!note || typeof note !== 'string') {
    return { error: 'Note is required and must be a string.' };
  }

  if (note.length > 200) {
    return { error: 'Note must be 200 characters or less.' };
  }

  // Dispatch custom event that WorkJournalContext will listen for
  const event = new CustomEvent('workJournal.addEntry', {
    detail: {
      note,
      projectId: projectId || undefined,
      durationMs: durationMs || undefined,
      metadata: {
        agentLogged: true,
        timestamp: new Date().toISOString(),
      },
    },
  });
  window.dispatchEvent(event);

  return {
    success: true,
    message: `Logged to journal: "${note.substring(0, 50)}${note.length > 50 ? '...' : ''}"`,
    note,
  };
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

/**
 * Tool: add_work_journal_entry
 *
 * Allows agents to log user accomplishments to their daily work journal.
 * Use this to capture progress, milestones, or completed tasks.
 *
 * Best practices:
 * - Write entries conversationally and naturally
 * - Be specific about what was accomplished
 * - Keep entries concise (under 200 chars)
 * - Use when user reports completing something
 * - Log after timer completion with task details
 *
 * Examples:
 * - "Completed wireframe sketches for landing page"
 * - "Debugged API authentication issue"
 * - "Wrote 800 words of blog post draft"
 * - "Deep focus session: edited 3 video clips"
 */
export const addWorkJournalEntryTool = tool({
  name: 'add_work_journal_entry',
  description: `Log an accomplishment or progress note to the user's daily work journal.
  
  Use this when:
  - User reports completing a task or making progress
  - A timer/ritual completes and you want to log what was done
  - User achieves a milestone worth celebrating
  - You want to help them track their work for the day
  
  The entry will appear in the work journal UI with a 🤖 icon showing it came from you.
  
  Write entries naturally and conversationally - focus on what the user accomplished, not what they did.
  Good: "Completed wireframe sketches" | Bad: "User worked on wireframes"`,
  parameters: {
    type: 'object',
    properties: {
      note: {
        type: 'string',
        description:
          'Brief description of what was accomplished (max 200 chars). Be specific and conversational.',
        maxLength: 200,
      },
      projectId: {
        type: 'string',
        description:
          'Optional UUID of the project this work relates to. Will auto-associate with current project if not provided.',
      },
      durationMs: {
        type: 'number',
        description:
          'Optional duration in milliseconds. Use this if you know how long the work took (e.g., from a timer).',
      },
    },
    required: ['note'],
    additionalProperties: false,
  },
  execute: addWorkJournalEntryHelper,
});

// Export as collection
export const journalTools = [addWorkJournalEntryTool];

