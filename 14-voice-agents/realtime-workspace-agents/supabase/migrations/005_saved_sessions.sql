-- ============================================
-- MIGRATION 005: Add saved sessions support
-- ============================================
-- This migration adds the ability to distinguish between:
-- 1. Working sessions (auto-save, one per project, continuous)
-- 2. Saved sessions (user-created snapshots with titles)

-- Add columns to voice_sessions table
ALTER TABLE voice_sessions 
  ADD COLUMN is_saved BOOLEAN DEFAULT false,
  ADD COLUMN title TEXT;

-- Create index for efficient querying of working vs saved sessions
CREATE INDEX idx_sessions_saved ON voice_sessions(project_id, is_saved, is_active);

-- Update existing sessions to be marked as saved (preserve current data)
-- Give them default titles based on their start time
UPDATE voice_sessions 
SET 
  is_saved = true,
  title = 'Session ' || to_char(started_at, 'Mon DD, HH24:MI')
WHERE is_saved IS NULL OR is_saved = false;

-- Add comment explaining the fields
COMMENT ON COLUMN voice_sessions.is_saved IS 'false = working session (auto-saves, resumes), true = saved session (snapshot with title)';
COMMENT ON COLUMN voice_sessions.title IS 'User-provided title for saved sessions, NULL for working sessions';

