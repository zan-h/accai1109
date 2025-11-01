// Supabase Database Types
// Generate this file automatically with:
// supabase gen types typescript --project-id YOUR_PROJECT_REF > src/app/lib/supabase/types.ts

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          subscription_tier: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          last_active_at: string;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string;
          metadata?: Record<string, any>;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          suite_id: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
          last_accessed_at: string;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          suite_id: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          suite_id?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string;
          metadata?: Record<string, any>;
        };
      };
      workspace_tabs: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          type: 'markdown' | 'csv';
          content: string;
          position: number;
          created_at: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          type: 'markdown' | 'csv';
          content?: string;
          position: number;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          type?: 'markdown' | 'csv';
          content?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
          version?: number;
        };
      };
      workspace_history: {
        Row: {
          id: string;
          tab_id: string;
          content: string;
          changed_by: string;
          changed_at: string;
          change_type: 'user_edit' | 'agent_edit' | 'restore';
        };
        Insert: {
          id?: string;
          tab_id: string;
          content: string;
          changed_by: string;
          changed_at?: string;
          change_type: 'user_edit' | 'agent_edit' | 'restore';
        };
        Update: {
          id?: string;
          tab_id?: string;
          content?: string;
          changed_by?: string;
          changed_at?: string;
          change_type?: 'user_edit' | 'agent_edit' | 'restore';
        };
      };
      voice_sessions: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          suite_id: string;
          started_at: string;
          ended_at: string | null;
          is_active: boolean;
          is_saved: boolean;
          title: string | null;
          last_activity_at: string;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          suite_id: string;
          started_at?: string;
          ended_at?: string | null;
          is_active?: boolean;
          is_saved?: boolean;
          title?: string | null;
          last_activity_at?: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          suite_id?: string;
          started_at?: string;
          ended_at?: string | null;
          is_active?: boolean;
          is_saved?: boolean;
          title?: string | null;
          last_activity_at?: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      transcript_items: {
        Row: {
          id: string;
          session_id: string;
          item_id: string;
          type: 'MESSAGE' | 'BREADCRUMB';
          role: 'user' | 'assistant' | null;
          title: string | null;
          data: Record<string, any> | null;
          timestamp: string;
          created_at_ms: number;
          status: 'IN_PROGRESS' | 'DONE';
          is_hidden: boolean;
          guardrail_result: Record<string, any> | null;
          sequence: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          item_id: string;
          type: 'MESSAGE' | 'BREADCRUMB';
          role?: 'user' | 'assistant' | null;
          title?: string | null;
          data?: Record<string, any> | null;
          timestamp: string;
          created_at_ms: number;
          status: 'IN_PROGRESS' | 'DONE';
          is_hidden?: boolean;
          guardrail_result?: Record<string, any> | null;
          sequence: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          item_id?: string;
          type?: 'MESSAGE' | 'BREADCRUMB';
          role?: 'user' | 'assistant' | null;
          title?: string | null;
          data?: Record<string, any> | null;
          timestamp?: string;
          created_at_ms?: number;
          status?: 'IN_PROGRESS' | 'DONE';
          is_hidden?: boolean;
          guardrail_result?: Record<string, any> | null;
          sequence?: number;
          created_at?: string;
        };
      };
    };
  };
};

// ============================================
// VOICE PREFERENCES TYPES
// ============================================

/**
 * OpenAI Realtime API supported voice names
 */
export type OpenAIVoiceName = 
  | 'alloy' 
  | 'echo' 
  | 'fable' 
  | 'onyx' 
  | 'nova' 
  | 'shimmer' 
  | 'sage' 
  | 'verse';

/**
 * User's voice preferences stored in users.metadata.voicePreferences
 */
export interface VoicePreferences {
  enabled: boolean;  // If true, override default agent voices
  voice: OpenAIVoiceName;  // Selected voice to use for all agents
}

/**
 * Extended metadata type for users table
 */
export interface UserMetadata {
  voicePreferences?: VoicePreferences;
  [key: string]: any;  // Allow other metadata fields
}

// ============================================
// VOICE SESSIONS & TRANSCRIPT TYPES
// ============================================

/**
 * Type alias for voice session database rows
 */
export type VoiceSessionRow = Database['public']['Tables']['voice_sessions']['Row'];
export type VoiceSessionInsert = Database['public']['Tables']['voice_sessions']['Insert'];
export type VoiceSessionUpdate = Database['public']['Tables']['voice_sessions']['Update'];

/**
 * Type alias for transcript item database rows
 */
export type TranscriptItemRow = Database['public']['Tables']['transcript_items']['Row'];
export type TranscriptItemInsert = Database['public']['Tables']['transcript_items']['Insert'];
export type TranscriptItemUpdate = Database['public']['Tables']['transcript_items']['Update'];

/**
 * Frontend TranscriptItem type (from @/app/types)
 * Imported here for conversion utilities
 */
import type { TranscriptItem, GuardrailResultType } from '@/app/types';

/**
 * Convert database row to frontend TranscriptItem
 */
export function dbRowToTranscriptItem(row: TranscriptItemRow): TranscriptItem {
  return {
    itemId: row.item_id,
    type: row.type,
    role: row.role || undefined,
    title: row.title || undefined,
    data: row.data || undefined,
    expanded: false, // Default to collapsed when loading from DB
    timestamp: row.timestamp,
    createdAtMs: row.created_at_ms,
    status: row.status,
    isHidden: row.is_hidden,
    guardrailResult: row.guardrail_result as GuardrailResultType | undefined,
  };
}

/**
 * Convert frontend TranscriptItem to database insert format
 */
export function transcriptItemToDbInsert(
  item: TranscriptItem,
  sessionId: string,
  sequence: number
): TranscriptItemInsert {
  return {
    session_id: sessionId,
    item_id: item.itemId,
    type: item.type,
    role: item.role || null,
    title: item.title || null,
    data: item.data || null,
    timestamp: item.timestamp,
    created_at_ms: item.createdAtMs,
    status: item.status,
    is_hidden: item.isHidden,
    guardrail_result: item.guardrailResult || null,
    sequence,
  };
}

/**
 * Voice session with additional computed properties for UI
 */
export interface VoiceSessionWithMetadata extends VoiceSessionRow {
  messageCount?: number;
  duration?: number; // in seconds
}
