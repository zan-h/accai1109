-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Note: Clerk manages authentication, we just store profile data
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL, -- Clerk's user ID
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- free, pro, team, enterprise
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast lookups
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  suite_id TEXT NOT NULL, -- energy-focus, baby-care, etc.
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_projects_user ON projects(user_id) WHERE is_archived = false;
CREATE INDEX idx_projects_suite ON projects(suite_id);
CREATE INDEX idx_projects_updated ON projects(updated_at DESC);

-- ============================================
-- WORKSPACE TABS
-- ============================================
CREATE TABLE workspace_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('markdown', 'csv')),
  content TEXT DEFAULT '',
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1 -- For optimistic locking
);

-- Indexes
CREATE INDEX idx_tabs_project ON workspace_tabs(project_id);
CREATE INDEX idx_tabs_position ON workspace_tabs(project_id, position);

-- ============================================
-- WORKSPACE HISTORY (for undo/version control)
-- ============================================
CREATE TABLE workspace_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab_id UUID REFERENCES workspace_tabs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_type TEXT CHECK (change_type IN ('user_edit', 'agent_edit', 'restore'))
);

-- Index for efficient history queries
CREATE INDEX idx_history_tab ON workspace_history(tab_id, changed_at DESC);

-- ============================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY users_own_profile ON users
  FOR ALL
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Users can only see their own projects
CREATE POLICY users_own_projects ON projects
  FOR ALL
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Users can only see tabs in their projects
CREATE POLICY users_own_tabs ON workspace_tabs
  FOR ALL
  USING (project_id IN (
    SELECT id FROM projects WHERE user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  ));

-- Users can only see their own history
CREATE POLICY users_own_history ON workspace_history
  FOR ALL
  USING (changed_by IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tabs_updated_at BEFORE UPDATE ON workspace_tabs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();




