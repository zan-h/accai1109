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
    };
  };
};




