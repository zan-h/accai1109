-- Rollback migration for feedback table
-- Run this if you need to revert the feedback feature

-- Drop policies first
DROP POLICY IF EXISTS "Service role can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert feedback" ON feedback;

-- Drop indexes
DROP INDEX IF EXISTS idx_feedback_type;
DROP INDEX IF EXISTS idx_feedback_created_at;
DROP INDEX IF EXISTS idx_feedback_user_id;

-- Drop table
DROP TABLE IF EXISTS feedback;


