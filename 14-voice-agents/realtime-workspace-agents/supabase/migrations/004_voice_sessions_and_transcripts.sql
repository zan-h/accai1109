-- ============================================
-- VOICE SESSIONS & TRANSCRIPT PERSISTENCE
-- ============================================
-- Purpose: Enable persistent transcripts that survive page refreshes and logout
-- Created: 2025-11-01

-- ============================================
-- VOICE SESSIONS TABLE
-- ============================================
-- Tracks each voice interaction session
-- Session = continuous conversation (user can reconnect and continue)
-- Sessions belong to projects and can span multiple connections

CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  suite_id TEXT NOT NULL,                    -- Which agent suite: 'energy-focus', 'baby-care', etc.
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,                      -- NULL if session still active/resumable
  is_active BOOLEAN DEFAULT true,            -- Can user reconnect and continue this session?
  last_activity_at TIMESTAMPTZ DEFAULT NOW(), -- Updated on each transcript save
  metadata JSONB DEFAULT '{}'::jsonb,        -- Store: agent_handoffs, tool_calls_count, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_project ON voice_sessions(project_id, started_at DESC);
CREATE INDEX idx_sessions_active ON voice_sessions(project_id, is_active) WHERE is_active = true;
CREATE INDEX idx_sessions_user ON voice_sessions(user_id, started_at DESC);
CREATE INDEX idx_sessions_activity ON voice_sessions(last_activity_at DESC) WHERE is_active = true;

-- ============================================
-- TRANSCRIPT ITEMS TABLE
-- ============================================
-- Stores individual messages, breadcrumbs, and events within a session
-- Maps 1:1 with frontend TranscriptItem type

CREATE TABLE transcript_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,                     -- Frontend itemId (e.g., "msg-abc123", "breadcrumb-xyz")
  type TEXT NOT NULL CHECK (type IN ('MESSAGE', 'BREADCRUMB')),
  role TEXT CHECK (role IN ('user', 'assistant')),
  title TEXT,                                -- Message content or breadcrumb title
  data JSONB,                                -- For breadcrumb data (tool calls, events, etc.)
  timestamp TEXT NOT NULL,                   -- Pretty timestamp: "14:23:45.123"
  created_at_ms BIGINT NOT NULL,            -- Unix timestamp in milliseconds (for ordering)
  status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS', 'DONE')),
  is_hidden BOOLEAN DEFAULT false,
  guardrail_result JSONB,                    -- Store full GuardrailResultType object
  sequence INTEGER NOT NULL,                 -- Order within session (auto-assigned on insert)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate items in same session
  UNIQUE(session_id, item_id)
);

-- Indexes for performance
CREATE INDEX idx_transcript_session ON transcript_items(session_id, sequence ASC);
CREATE INDEX idx_transcript_created ON transcript_items(session_id, created_at_ms ASC);

-- ============================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on both tables
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_items ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY users_own_sessions ON voice_sessions
  FOR ALL
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Users can only access transcript items from their own sessions
CREATE POLICY users_own_transcript_items ON transcript_items
  FOR ALL
  USING (session_id IN (
    SELECT id FROM voice_sessions WHERE user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  ));

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp on voice_sessions
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON voice_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update last_activity_at when transcript items are added
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE voice_sessions
  SET last_activity_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_activity_on_transcript_insert
  AFTER INSERT ON transcript_items
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

-- ============================================
-- HELPER FUNCTION: Auto-end stale sessions
-- ============================================
-- Mark sessions as ended if no activity for 24 hours
-- Can be called manually or via cron job

CREATE OR REPLACE FUNCTION end_stale_sessions()
RETURNS void AS $$
BEGIN
  UPDATE voice_sessions
  SET 
    is_active = false,
    ended_at = last_activity_at,
    updated_at = NOW()
  WHERE 
    is_active = true
    AND last_activity_at < NOW() - INTERVAL '24 hours'
    AND ended_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS (for documentation)
-- ============================================

COMMENT ON TABLE voice_sessions IS 'Tracks voice interaction sessions. Each session represents a continuous conversation that can span multiple connections.';
COMMENT ON TABLE transcript_items IS 'Stores individual transcript items (messages, breadcrumbs) within voice sessions.';
COMMENT ON COLUMN voice_sessions.is_active IS 'True if user can reconnect and resume this session. Auto-set to false after 24 hours of inactivity.';
COMMENT ON COLUMN transcript_items.sequence IS 'Ordering index within session. Assigned based on created_at_ms.';
COMMENT ON COLUMN transcript_items.item_id IS 'Frontend identifier. Used for deduplication (UNIQUE constraint with session_id).';

