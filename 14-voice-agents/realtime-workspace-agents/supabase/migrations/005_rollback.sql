-- Rollback migration 005
DROP INDEX IF EXISTS idx_sessions_saved;

ALTER TABLE voice_sessions 
  DROP COLUMN IF EXISTS is_saved,
  DROP COLUMN IF EXISTS title;

