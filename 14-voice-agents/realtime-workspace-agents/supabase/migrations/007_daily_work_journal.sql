-- Migration: Daily Work Journal
-- Description: Add table for tracking user's daily work entries with agent-assisted logging
-- Created: Nov 17, 2025

-- ============================================
-- TABLE: daily_work_journal
-- ============================================

CREATE TABLE IF NOT EXISTS daily_work_journal (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User association (Clerk user ID)
  user_id TEXT NOT NULL,
  
  -- Temporal fields
  date DATE NOT NULL, -- For daily grouping (YYYY-MM-DD)
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Full datetime with timezone
  
  -- Content
  note TEXT NOT NULL CHECK (char_length(note) <= 200), -- Brief description
  
  -- Optional associations
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  duration_ms INTEGER CHECK (duration_ms IS NULL OR duration_ms >= 0), -- Optional duration tracking
  
  -- Metadata
  source TEXT NOT NULL CHECK (source IN ('agent', 'user', 'timer')), -- Entry source
  metadata JSONB DEFAULT '{}', -- Additional context (timerId, sessionId, etc.)
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Fast daily queries (most common query pattern)
CREATE INDEX idx_daily_work_journal_user_date 
  ON daily_work_journal(user_id, date DESC);

-- Fast user queries across date ranges (for week view)
CREATE INDEX idx_daily_work_journal_user_timestamp 
  ON daily_work_journal(user_id, timestamp DESC);

-- Fast project association queries
CREATE INDEX idx_daily_work_journal_project 
  ON daily_work_journal(project_id) 
  WHERE project_id IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE daily_work_journal ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own journal entries
CREATE POLICY "Users can view their own journal entries"
  ON daily_work_journal
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can insert their own journal entries
CREATE POLICY "Users can insert their own journal entries"
  ON daily_work_journal
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can update their own journal entries
CREATE POLICY "Users can update their own journal entries"
  ON daily_work_journal
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can delete their own journal entries
CREATE POLICY "Users can delete their own journal entries"
  ON daily_work_journal
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================
-- TRIGGERS
-- ============================================

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_work_journal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_work_journal_updated_at
  BEFORE UPDATE ON daily_work_journal
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_work_journal_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get entry count for a specific user and date
CREATE OR REPLACE FUNCTION get_daily_entry_count(
  p_user_id TEXT,
  p_date DATE
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM daily_work_journal
    WHERE user_id = p_user_id
      AND date = p_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get entry counts for a date range (useful for week view badges)
CREATE OR REPLACE FUNCTION get_entry_counts_for_range(
  p_user_id TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(date DATE, entry_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.date::DATE,
    COALESCE(COUNT(j.id), 0) AS entry_count
  FROM (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::DATE AS date
  ) d
  LEFT JOIN daily_work_journal j 
    ON j.user_id = p_user_id 
    AND j.date = d.date
  GROUP BY d.date
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE daily_work_journal IS 
  'Stores user work journal entries with agent-assisted logging. Entries are grouped by day and can be viewed weekly.';

COMMENT ON COLUMN daily_work_journal.date IS 
  'Date for daily grouping (YYYY-MM-DD). Used for fast daily queries and week view.';

COMMENT ON COLUMN daily_work_journal.timestamp IS 
  'Full datetime with timezone. Stored in UTC, displayed in user''s local time.';

COMMENT ON COLUMN daily_work_journal.note IS 
  'Brief description of work done (max 200 chars). Written conversationally by agents or user.';

COMMENT ON COLUMN daily_work_journal.source IS 
  'Who created this entry: "agent" (voice agent), "user" (manual entry), or "timer" (auto-logged on timer completion).';

COMMENT ON COLUMN daily_work_journal.metadata IS 
  'Additional context stored as JSONB: { timerId, sessionId, agentName, etc. }';

