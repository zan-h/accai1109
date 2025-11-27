-- Create experiments table for structured research data
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  experiment_type TEXT NOT NULL, -- 'experiment_1' or 'experiment_2'
  status TEXT NOT NULL DEFAULT 'started', -- 'started', 'completed', 'abandoned'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Session context
  session_id UUID REFERENCES voice_sessions(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  timer_duration_ms INTEGER,
  
  -- Results (JSONB for flexibility as questions might change)
  results JSONB,
  
  -- Metadata
  user_agent TEXT,
  platform TEXT
);

-- Index for querying by user
CREATE INDEX idx_experiments_user_id ON experiments(user_id);
CREATE INDEX idx_experiments_type ON experiments(experiment_type);
CREATE INDEX idx_experiments_created_at ON experiments(started_at DESC);

-- RLS Policies
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

-- Users can insert their own experiments
CREATE POLICY "Users can insert experiments"
  ON experiments
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own experiments (to mark completed)
CREATE POLICY "Users can update own experiments"
  ON experiments
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Users can view their own experiments
CREATE POLICY "Users can view own experiments"
  ON experiments
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Service role can view all
CREATE POLICY "Service role can view all experiments"
  ON experiments
  FOR SELECT
  USING (auth.role() = 'service_role');

