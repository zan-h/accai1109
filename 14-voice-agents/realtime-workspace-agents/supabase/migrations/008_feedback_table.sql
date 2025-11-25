-- Create feedback table for user feedback and suggestions
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  session_id UUID REFERENCES voice_sessions(id) ON DELETE SET NULL,
  
  -- Feedback content
  feedback_text TEXT NOT NULL,
  feedback_type TEXT CHECK (feedback_type IN ('bug', 'idea', 'annoyance', 'other')),
  
  -- Auto-captured context
  suite_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by user and date
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);

-- RLS Policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert feedback"
  ON feedback
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON feedback
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Service role can view all feedback (for admin dashboard later)
CREATE POLICY "Service role can view all feedback"
  ON feedback
  FOR SELECT
  USING (auth.role() = 'service_role');

