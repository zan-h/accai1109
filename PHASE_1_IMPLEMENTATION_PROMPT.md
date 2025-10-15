# Phase 1 Implementation - Production Foundation
## AI Assistant Implementation Prompt

**Copy this entire prompt to give to Claude, GPT, or any AI coding assistant**

---

## Your Mission

Implement **Phase 1: Foundation (Weeks 1-4)** of the production roadmap to transform the voice agent platform from a localhost demo into a production-ready multi-tenant SaaS application with authentication, database persistence, and enterprise-grade security.

## Context

You're working on a Next.js 15 voice agent platform that currently:
- ✅ Has multi-suite voice agents (Energy & Focus, Baby Care)
- ✅ Uses OpenAI Realtime API for voice interactions
- ✅ Has workspace system with markdown/CSV tabs
- ✅ Stores everything in localStorage (client-side only)
- ❌ **NO authentication** - anyone can use it
- ❌ **NO database** - data lost on browser clear
- ❌ **NO multi-tenancy** - single user only
- ❌ **OpenAI API key exposed** client-side (security risk!)

**Project Location:** `/Users/mizan/100MRR/bh-refactor/14-voice-agents/realtime-workspace-agents/`

## Reference Documents

You have access to these critical documents:
1. **`.cursor/PRODUCTION_ROADMAP.md`** - Complete production plan (21k words)
2. **`.cursor/ARCHITECTURE_DEEP_DIVE.md`** - Current architecture (2k lines)
3. **`.cursor/scratchpad.md`** - Project history and decisions
4. **Current codebase** - See `src/app/` directory

**READ PRODUCTION_ROADMAP.md SECTIONS 2, 3, 6, 7 FIRST** - They contain the exact schema, auth flow, and security requirements.

---

## Phase 1 Goals

### What We're Building

Transform from this:
```
User → localhost:3000 → localStorage → OpenAI (exposed API key)
```

To this:
```
User → Login (Clerk) → Authenticated API → Supabase (PostgreSQL) → OpenAI (server-side key)
```

### Success Criteria

By end of Phase 1, the system must:
- ✅ Users can create accounts (email/password, Google, GitHub)
- ✅ Users can login/logout securely
- ✅ All projects/workspaces saved to PostgreSQL database
- ✅ Each user sees only their own data (Row-Level Security)
- ✅ OpenAI API key moved to server-side only
- ✅ API routes protected with authentication
- ✅ Existing localStorage data can be migrated
- ✅ No functionality breaks (workspace, agents, projects all work)
- ✅ All tests pass
- ✅ Build succeeds without errors

---

## Technical Stack Decisions

Based on the production roadmap analysis:

### Database: **Supabase** ✅
**Why:**
- PostgreSQL with built-in Row-Level Security
- Realtime subscriptions (future feature)
- Managed backups and scaling
- Free tier for development
- Easy migration path to enterprise

**Alternative considered:** AWS RDS (more complex, overkill for MVP)

### Authentication: **Clerk** ✅
**Why:**
- Best developer experience
- Pre-built React components
- Supports email, Google, GitHub out of box
- Multi-factor auth included
- Reasonable pricing ($25/month → $99/month at scale)
- Excellent Next.js integration

**Alternatives considered:** 
- Auth0 (more expensive, overkill features)
- Supabase Auth (good, but Clerk has better DX)

### Hosting: **Vercel** ✅
**Why:**
- Already using Next.js
- Zero-config deployment
- Edge functions for low latency
- Excellent performance

### Rate Limiting: **Upstash Redis** ✅
**Why:**
- Serverless Redis (no server to manage)
- HTTP-based (works in edge functions)
- Free tier: 10k requests/day

---

## Implementation Tasks

### Task 1: Set Up Supabase Database (60 min)

#### 1.1 Create Supabase Project

**Steps:**
1. Go to https://supabase.com
2. Create account (use GitHub OAuth)
3. Create new project:
   - Name: `voice-agents-dev` (or your app name)
   - Database password: **Save securely** (1Password recommended)
   - Region: Choose closest to your users
   - Plan: Free tier for now

4. Wait for project to provision (~2 minutes)

5. Get connection details:
   - Go to Project Settings → Database
   - Copy these values:
     - `Database URL` (postgres://...)
     - `Connection pooling URL` (postgres://...)
     - `API URL` (https://xxx.supabase.co)
     - `Anon public key`
     - `Service role key` (⚠️ keep secret!)

#### 1.2 Install Supabase Client

```bash
cd /Users/mizan/100MRR/bh-refactor/14-voice-agents/realtime-workspace-agents
npm install @supabase/supabase-js @supabase/ssr
```

#### 1.3 Configure Environment Variables

**File:** `.env.local` (create if doesn't exist)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Keep secret!

# OpenAI (move from client to server)
OPENAI_API_KEY=sk-proj-... # Already exists, keep it

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ CRITICAL:** Add `.env.local` to `.gitignore` if not already there!

#### 1.4 Create Database Schema

**File:** `supabase/migrations/001_initial_schema.sql` (create new file)

```sql
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
```

**Run Migration:**

Option A - Supabase Dashboard (Easier):
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire SQL above
3. Click "Run"
4. Verify tables created in Table Editor

Option B - Supabase CLI (Better for production):
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push
```

#### 1.5 Create Supabase Client Utility

**File:** `src/app/lib/supabase/client.ts` (new file)

```typescript
import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**File:** `src/app/lib/supabase/server.ts` (new file)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './types';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
```

**File:** `src/app/lib/supabase/types.ts` (new file)

```typescript
// Generate this file automatically with:
// supabase gen types typescript --project-id YOUR_PROJECT_REF > src/app/lib/supabase/types.ts

// Or manually define types:
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
```

---

### Task 2: Integrate Clerk Authentication (90 min)

#### 2.1 Create Clerk Account

**Steps:**
1. Go to https://clerk.com
2. Sign up (use GitHub OAuth)
3. Create new application:
   - Name: Your app name
   - Enable sign-in methods:
     - ✅ Email & Password
     - ✅ Google
     - ✅ GitHub
   - Leave other settings default for now

4. Copy API keys:
   - Go to API Keys
   - Copy `Publishable key` (starts with `pk_test_...`)
   - Copy `Secret key` (starts with `sk_test_...`)

#### 2.2 Install Clerk

```bash
npm install @clerk/nextjs
```

#### 2.3 Configure Environment Variables

**Add to `.env.local`:**

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (optional, use defaults)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### 2.4 Wrap App with ClerkProvider

**File:** `src/app/layout.tsx`

**Current code:**
```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Update to:**
```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

#### 2.5 Create Middleware for Auth

**File:** `middleware.ts` (create at project root, same level as `src/`)

```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that don't require authentication
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)", // For Stripe webhooks later
  ],
  
  // Routes that require authentication
  // Everything else is protected by default
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

#### 2.6 Create Sign-In/Sign-Up Pages

**File:** `src/app/sign-in/[[...sign-in]]/page.tsx` (new file)

```typescript
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <SignIn />
    </div>
  );
}
```

**File:** `src/app/sign-up/[[...sign-up]]/page.tsx` (new file)

```typescript
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <SignUp />
    </div>
  );
}
```

#### 2.7 Update App.tsx to Show User Info

**File:** `src/app/App.tsx`

Add at the top of the file:
```typescript
import { useUser, UserButton } from '@clerk/nextjs';

// Inside the App component:
const { user, isLoaded } = useUser();

// In the header, add:
<div className="flex items-center gap-4">
  {isLoaded && user && (
    <>
      <span className="text-text-secondary text-sm font-mono">
        {user.emailAddresses[0].emailAddress}
      </span>
      <UserButton afterSignOutUrl="/" />
    </>
  )}
</div>
```

#### 2.8 Create User Sync Webhook

When a user signs up in Clerk, we need to create their profile in Supabase.

**File:** `src/app/api/webhooks/clerk/route.ts` (new file)

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    const supabase = createClient();
    
    // Create user in our database
    const { error } = await supabase.from('users').insert({
      clerk_user_id: id,
      email: email_addresses[0].email_address,
      display_name: first_name && last_name ? `${first_name} ${last_name}` : null,
      avatar_url: image_url,
      subscription_tier: 'free',
    });
    
    if (error) {
      console.error('Error creating user:', error);
      return new Response('Error creating user', { status: 500 });
    }
    
    console.log('✅ User created:', id);
  }
  
  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    const supabase = createClient();
    
    const { error } = await supabase
      .from('users')
      .update({
        email: email_addresses[0].email_address,
        display_name: first_name && last_name ? `${first_name} ${last_name}` : null,
        avatar_url: image_url,
      })
      .eq('clerk_user_id', id);
    
    if (error) {
      console.error('Error updating user:', error);
    }
  }
  
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    const supabase = createClient();
    
    // Soft delete (set is_active = false) or hard delete
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('clerk_user_id', id);
    
    if (error) {
      console.error('Error deleting user:', error);
    }
  }

  return new Response('', { status: 200 });
}
```

**Configure Webhook in Clerk:**
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk` (use ngrok for local testing)
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy signing secret and add to `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

---

### Task 3: Migrate Data Layer from localStorage to Database (120 min)

#### 3.1 Create Project Context (Database-backed)

**File:** `src/app/contexts/ProjectContext.tsx`

Currently uses localStorage. Update to use Supabase:

```typescript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/app/lib/supabase/client';
import { Database } from '@/app/lib/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectContextValue {
  projects: Project[];
  currentProjectId: string | null;
  isLoading: boolean;
  createProject: (name: string, suiteId: string) => Promise<Project>;
  switchProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load projects from database
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    loadProjects();
  }, [user]);

  async function loadProjects() {
    setIsLoading(true);
    
    // First, get our user ID from the users table
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user!.id)
      .single();
    
    if (!userData) {
      console.error('User not found in database');
      setIsLoading(false);
      return;
    }
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userData.id)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error loading projects:', error);
    } else {
      setProjects(data || []);
      
      // Set current project from localStorage or first project
      const savedProjectId = localStorage.getItem('currentProjectId');
      if (savedProjectId && data?.find(p => p.id === savedProjectId)) {
        setCurrentProjectId(savedProjectId);
      } else if (data && data.length > 0) {
        setCurrentProjectId(data[0].id);
      }
    }
    
    setIsLoading(false);
  }

  async function createProject(name: string, suiteId: string): Promise<Project> {
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user!.id)
      .single();
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userData!.id,
        name,
        suite_id: suiteId,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    setProjects(prev => [data, ...prev]);
    setCurrentProjectId(data.id);
    
    return data;
  }

  function switchProject(projectId: string) {
    setCurrentProjectId(projectId);
    localStorage.setItem('currentProjectId', projectId);
    
    // Update last_accessed_at
    supabase
      .from('projects')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', projectId)
      .then(() => {});
  }

  async function updateProject(projectId: string, updates: Partial<Project>) {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId);
    
    if (error) throw error;
    
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, ...updates } : p))
    );
  }

  async function deleteProject(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .update({ is_archived: true })
      .eq('id', projectId);
    
    if (error) throw error;
    
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    if (currentProjectId === projectId) {
      setCurrentProjectId(projects[0]?.id || null);
    }
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProjectId,
        isLoading,
        createProject,
        switchProject,
        updateProject,
        deleteProject,
        refreshProjects: loadProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
}
```

#### 3.2 Update WorkspaceContext (Database-backed)

**File:** `src/app/contexts/WorkspaceContext.tsx`

Update to save/load from Supabase instead of localStorage:

```typescript
// Add Supabase client
import { createClient } from '@/app/lib/supabase/client';
import { useProjectContext } from './ProjectContext';

// Inside WorkspaceProvider:
const supabase = createClient();
const { currentProjectId } = useProjectContext();

// Replace localStorage save/load with Supabase queries
async function loadWorkspaceTabs() {
  if (!currentProjectId) return;
  
  const { data, error } = await supabase
    .from('workspace_tabs')
    .select('*')
    .eq('project_id', currentProjectId)
    .order('position');
  
  if (error) {
    console.error('Error loading tabs:', error);
    return;
  }
  
  setTabs(data || []);
}

async function saveTab(tab: WorkspaceTab) {
  const { error } = await supabase
    .from('workspace_tabs')
    .upsert({
      id: tab.id,
      project_id: currentProjectId!,
      name: tab.name,
      type: tab.type,
      content: tab.content,
      position: tab.position,
    });
  
  if (error) {
    console.error('Error saving tab:', error);
  }
}

// Similar updates for all workspace operations
```

#### 3.3 Create Migration Tool

**File:** `src/app/components/MigrationPrompt.tsx` (new file)

```typescript
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/app/lib/supabase/client';
import { useProjectContext } from '@/app/contexts/ProjectContext';

export function MigrationPrompt() {
  const { user } = useUser();
  const { createProject } = useProjectContext();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);
  
  // Check if user has old localStorage data
  const hasOldData = typeof window !== 'undefined' && 
    (localStorage.getItem('projects') || localStorage.getItem('workspace-state'));
  
  if (!hasOldData || migrated) return null;
  
  async function handleMigrate() {
    setIsMigrating(true);
    
    try {
      const supabase = createClient();
      
      // Get user's database ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', user!.id)
        .single();
      
      // Migrate projects from localStorage
      const oldProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      
      for (const oldProject of oldProjects) {
        // Create project in database
        const newProject = await createProject(
          oldProject.name || 'Migrated Project',
          oldProject.suiteId || 'energy-focus'
        );
        
        // Migrate workspace tabs
        const oldWorkspace = JSON.parse(
          localStorage.getItem(`workspace-${oldProject.id}`) || '{"tabs": []}'
        );
        
        for (const [index, tab] of oldWorkspace.tabs.entries()) {
          await supabase.from('workspace_tabs').insert({
            project_id: newProject.id,
            name: tab.name,
            type: tab.type,
            content: tab.content,
            position: index,
          });
        }
      }
      
      // Clear old localStorage
      localStorage.removeItem('projects');
      localStorage.removeItem('workspace-state');
      
      setMigrated(true);
      alert('Migration complete! Your data has been moved to the cloud.');
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed. Please contact support.');
    } finally {
      setIsMigrating(false);
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-secondary border border-border-primary p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-bold text-text-primary mb-4 font-mono uppercase">
          Migrate Your Data
        </h2>
        <p className="text-text-secondary mb-4 font-mono">
          We found existing projects in your browser. Would you like to migrate them to your account?
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="flex-1 px-4 py-2 bg-accent-primary text-bg-primary font-mono uppercase hover:bg-accent-secondary transition-colors disabled:opacity-50"
          >
            {isMigrating ? 'Migrating...' : 'Migrate'}
          </button>
          <button
            onClick={() => setMigrated(true)}
            className="px-4 py-2 border border-border-primary text-text-secondary font-mono uppercase hover:bg-bg-tertiary transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
```

Add to `page.tsx`:
```typescript
import { MigrationPrompt } from '@/app/components/MigrationPrompt';

// Inside the render:
<MigrationPrompt />
```

---

### Task 4: Secure API Routes (60 min)

#### 4.1 Move OpenAI API Key to Server-Side

**Current issue:** API key is exposed in client-side code.

**File:** `src/app/api/session/route.ts`

**Current code:** Generates ephemeral tokens client-side.

**Update to:**
```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  // Check authentication
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Generate OpenAI ephemeral key server-side
  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview-2024-06-03',
      voice: 'sage',
    }),
  });
  
  const session = await response.json();
  
  return NextResponse.json(session);
}
```

**Update client code** to call this endpoint instead of creating sessions directly.

#### 4.2 Add Rate Limiting

**Install Upstash:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Create Upstash account:**
1. Go to https://upstash.com
2. Create Redis database (free tier)
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

**Add to `.env.local`:**
```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXX...
```

**File:** `src/app/lib/ratelimit.ts` (new file)

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter that allows 100 requests per hour
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true,
});
```

**Update API routes to use rate limiting:**

```typescript
import { ratelimit } from '@/app/lib/ratelimit';
import { auth } from '@clerk/nextjs';

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Rate limit check
  const { success } = await ratelimit.limit(userId);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }
  
  // ... rest of endpoint
}
```

#### 4.3 Add Input Validation with Zod

**Already have Zod installed** - use it for validation.

**Example:** Validate project creation

```typescript
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  suiteId: z.string(),
  description: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  
  // Validate input
  const result = createProjectSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: result.error },
      { status: 400 }
    );
  }
  
  // ... create project with validated data
}
```

---

### Task 5: Testing & Verification (45 min)

#### 5.1 Manual Testing Checklist

Test each flow:

**Authentication:**
- [ ] Can sign up with email/password
- [ ] Can sign up with Google
- [ ] Can sign up with GitHub
- [ ] User appears in Supabase `users` table
- [ ] Can log out
- [ ] Can log back in
- [ ] Session persists across page refreshes
- [ ] Middleware redirects unauthenticated users to sign-in

**Projects:**
- [ ] Can create a new project
- [ ] Project appears in database
- [ ] Can switch between projects
- [ ] Can rename project
- [ ] Can delete project (archived in DB)
- [ ] Different users see only their own projects

**Workspace:**
- [ ] Tabs load from database
- [ ] Can create new tab
- [ ] Can edit tab content
- [ ] Can rename tab
- [ ] Can delete tab
- [ ] Changes save to database
- [ ] Refresh preserves all changes

**Voice Agents:**
- [ ] Can connect to voice agent
- [ ] Agent responds to voice
- [ ] Agent can create/edit tabs
- [ ] Handoffs work between agents
- [ ] Transcript saves properly

**Migration:**
- [ ] Migration prompt appears for users with old data
- [ ] Migration successfully copies projects
- [ ] Migration successfully copies workspace tabs
- [ ] Old localStorage cleared after migration

**Security:**
- [ ] Cannot access `/dashboard` without login
- [ ] Cannot call API routes without auth
- [ ] Rate limiting works (test with >100 requests)
- [ ] Cannot see other users' data

#### 5.2 Automated Tests

**File:** `__tests__/api/projects.test.ts` (new file)

```typescript
import { describe, test, expect } from '@jest/globals';

describe('Projects API', () => {
  test('requires authentication', async () => {
    const response = await fetch('http://localhost:3000/api/projects');
    expect(response.status).toBe(401);
  });
  
  // Add more tests...
});
```

Run tests:
```bash
npm run test
```

#### 5.3 Database Verification

**Check data in Supabase:**
1. Go to Supabase Dashboard → Table Editor
2. Verify `users` table has entries
3. Verify `projects` table has entries
4. Verify `workspace_tabs` table has entries
5. Check that user_id matches correctly

**Check RLS is working:**
```sql
-- Run in Supabase SQL Editor
-- This should return only the authenticated user's projects
SELECT * FROM projects;
```

---

### Task 6: Documentation & Cleanup (30 min)

#### 6.1 Update README

**File:** `README.md`

Add section:

```markdown
## Phase 1: Production Setup Complete ✅

### Environment Variables Required

Create a `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXX...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create Supabase project
2. Run migration: `supabase/migrations/001_initial_schema.sql`
3. Verify tables created in Table Editor

### Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign up!
```

#### 6.2 Create Migration Rollback

**File:** `supabase/migrations/001_rollback.sql` (new file)

```sql
-- Rollback script in case something goes wrong
DROP TABLE IF EXISTS workspace_history CASCADE;
DROP TABLE IF EXISTS workspace_tabs CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

#### 6.3 Update Scratchpad

**File:** `.cursor/scratchpad.md`

Add section documenting Phase 1 completion with all decisions made, issues encountered, and solutions.

---

## Success Criteria Verification

Before marking Phase 1 complete, verify ALL of these:

### ✅ Authentication
- [ ] Users can sign up/sign in
- [ ] Clerk webhook syncs users to database
- [ ] Middleware protects routes
- [ ] User profile displays in app

### ✅ Database
- [ ] All tables created successfully
- [ ] RLS policies working (users can't see each other's data)
- [ ] Indexes created for performance
- [ ] Migrations documented

### ✅ Data Persistence
- [ ] Projects saved to database
- [ ] Workspace tabs saved to database
- [ ] Voice session transcripts saved
- [ ] No localStorage dependency for core features

### ✅ Security
- [ ] OpenAI API key server-side only
- [ ] All API routes protected with auth
- [ ] Rate limiting implemented
- [ ] Input validation with Zod

### ✅ Migration
- [ ] Migration tool built and tested
- [ ] Existing users can migrate data
- [ ] Old localStorage cleaned up post-migration

### ✅ No Breaking Changes
- [ ] All existing features still work
- [ ] Voice agents functional
- [ ] Workspace editing functional
- [ ] Project switching functional
- [ ] Suite switching functional

### ✅ Code Quality
- [ ] No TypeScript errors
- [ ] No linter errors
- [ ] Build succeeds: `npm run build`
- [ ] All tests pass: `npm run test`

### ✅ Documentation
- [ ] README updated with setup instructions
- [ ] Environment variables documented
- [ ] Migration process documented
- [ ] Scratchpad updated

---

## Common Issues & Solutions

### Issue: "Cannot connect to Supabase"
**Fix:** Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and keys. Restart dev server after adding env vars.

### Issue: "User not found in database"
**Fix:** Ensure Clerk webhook is configured and firing. Check Clerk Dashboard → Webhooks → Logs. User should be created on signup.

### Issue: "Row-Level Security blocking queries"
**Fix:** Check that JWT is being passed correctly. Supabase needs `auth.jwt()` to identify the user. May need to configure Clerk JWT template in Clerk Dashboard → JWT Templates.

### Issue: "Rate limit too strict during testing"
**Fix:** Increase limit in `ratelimit.ts` or use different limit for development:
```typescript
const limit = process.env.NODE_ENV === 'development' ? 1000 : 100;
```

### Issue: "Migration not finding old data"
**Fix:** Check localStorage in browser DevTools. Old data should be at keys: `projects`, `workspace-state`, `workspace-{projectId}`.

### Issue: "Build fails with module not found"
**Fix:** Run `npm install` to ensure all dependencies installed. Check imports are correct case-sensitive paths.

---

## Next Steps After Phase 1

Once Phase 1 is complete:

1. **Phase 2:** Multi-tenancy & Stripe payments
2. **Phase 3:** Landing page & marketing site
3. **Phase 4:** Enterprise features & SOC 2
4. **Phase 5:** Scale & optimization

See `.cursor/PRODUCTION_ROADMAP.md` for details.

---

## Questions & Support

If you encounter issues during implementation:

1. Check `PRODUCTION_ROADMAP.md` for architecture details
2. Check `ARCHITECTURE_DEEP_DIVE.md` for current system understanding
3. Check `.cursor/scratchpad.md` for project history
4. Search existing issues in the codebase
5. Ask for help with specific error messages

**Time Estimate:** 6-8 hours for complete Phase 1 implementation

---

**Good luck! 🚀**

You're building the foundation for a production SaaS platform. Take your time, test thoroughly, and don't skip security steps.

