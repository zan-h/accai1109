-- ============================================
-- ROLLBACK: Voice Sessions & Transcript Persistence
-- ============================================
-- Purpose: Safely revert migration 004_voice_sessions_and_transcripts.sql
-- Created: 2025-11-01

-- Drop triggers first
DROP TRIGGER IF EXISTS update_session_activity_on_transcript_insert ON transcript_items;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON voice_sessions;

-- Drop functions
DROP FUNCTION IF EXISTS update_session_activity();
DROP FUNCTION IF EXISTS end_stale_sessions();

-- Drop tables (CASCADE will drop policies and indexes)
DROP TABLE IF EXISTS transcript_items CASCADE;
DROP TABLE IF EXISTS voice_sessions CASCADE;

-- Note: The update_updated_at_column() function is shared and should not be dropped

