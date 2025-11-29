# Vercel Deployment for ACCAI Voice Agents App

## Background and Motivation

**User Request:** 
> "How can I host this on a website? I do have a domain: accai.io"

**Goal:**
Deploy the Next.js voice agent application to production on Vercel with custom domain accai.io. The app is a sophisticated real-time voice AI workspace with:
- OpenAI Realtime API integration
- Clerk authentication
- Supabase database
- Multiple API routes and webhooks
- Real-time WebSocket connections

**Why Vercel:**
- Zero-config Next.js deployment
- Automatic HTTPS and global CDN
- Serverless functions work out of the box
- Easy environment variable management
- Seamless custom domain setup
- Built by Next.js creators

## Key Challenges and Analysis

### Application Architecture
This is a **full-stack Next.js 15 app** with:
- **Frontend**: React 19, TypeScript, TailwindCSS
- **Backend**: API routes, Server Actions, Middleware
- **Real-time**: OpenAI Realtime API with WebSocket connections
- **Auth**: Clerk (OAuth + webhooks)
- **Database**: Supabase (PostgreSQL)
- **Assets**: 3D graphics (Three.js), animations (GSAP, Framer Motion)

### Critical Dependencies
1. **OpenAI Realtime API** - Needs valid API key, uses gpt-4o-realtime-preview model
2. **Clerk** - Requires webhook endpoint for user sync
3. **Supabase** - Production database with migrations
4. **Environment Variables** - 10+ secrets needed

### Deployment Considerations
1. **Serverless Functions**: All API routes need to work as Vercel Functions
2. **WebSocket Support**: Real-time connections via OpenAI's API (client → OpenAI, not self-hosted)
3. **Build Size**: Large dependencies (Three.js, GSAP, etc.) - may need optimization
4. **Database Migrations**: Need to run Supabase migrations in production
5. **Webhook Endpoints**: Clerk webhook must be publicly accessible
6. **Domain DNS**: Need to configure accai.io DNS records

## High-level Task Breakdown

### **Phase 1: Pre-Deployment Prerequisites** (User Action Required)
These steps require the user to set up accounts and gather credentials.

#### Task 1.1: Verify GitHub Repository Setup
- **Action**: Confirm code is pushed to GitHub repository
- **Success Criteria**: 
  - Repository exists on GitHub
  - Latest code is committed and pushed
  - `.env.local` is NOT committed (in .gitignore)
- **Owner**: User
- **Estimated Time**: 5 minutes

#### Task 1.2: Gather Environment Variables
- **Action**: Collect all required secrets from existing `.env.local` file
- **Required Variables**:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
  CLERK_SECRET_KEY=
  CLERK_WEBHOOK_SECRET=
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  OPENAI_API_KEY=
  ```
- **Success Criteria**: All values documented and ready to paste
- **Owner**: User
- **Estimated Time**: 5 minutes

#### Task 1.3: Create Vercel Account
- **Action**: Sign up at vercel.com (can use GitHub OAuth)
- **Success Criteria**: Account created, logged in
- **Owner**: User
- **Estimated Time**: 2 minutes

---

### **Phase 2: Vercel Project Setup** (Guided Execution)

#### Task 2.1: Import Project to Vercel
- **Action**: Connect GitHub repository to Vercel
- **Steps**:
  1. Click "Add New Project" in Vercel dashboard
  2. Select GitHub repository
  3. Configure build settings (auto-detected for Next.js)
  4. Set root directory: `14-voice-agents/realtime-workspace-agents`
- **Success Criteria**: Project imported, not yet deployed
- **Estimated Time**: 5 minutes

#### Task 2.2: Configure Environment Variables
- **Action**: Add all environment variables in Vercel dashboard
- **Steps**:
  1. Go to Project Settings → Environment Variables
  2. Add each variable (Production, Preview, Development)
  3. Verify no typos
- **Success Criteria**: All 9 environment variables added
- **Estimated Time**: 10 minutes

#### Task 2.3: Initial Deployment
- **Action**: Deploy the application
- **Success Criteria**: 
  - Build succeeds
  - No build errors
  - App accessible at Vercel-provided URL (*.vercel.app)
- **Estimated Time**: 5 minutes (build time)

---

### **Phase 3: External Services Configuration** (Critical for functionality)

#### Task 3.1: Update Clerk Production URLs
- **Action**: Add Vercel deployment URL to Clerk allowed domains
- **Steps**:
  1. Go to Clerk Dashboard
  2. Navigate to "Domains"
  3. Add production URL (both .vercel.app and accai.io)
  4. Update webhook endpoint to `https://[your-domain]/api/webhooks/clerk`
- **Success Criteria**: 
  - Sign-in works on production URL
  - Webhook endpoint configured
- **Estimated Time**: 10 minutes

#### Task 3.2: Update Supabase Configuration
- **Action**: Add production URL to Supabase allowed redirect URLs
- **Steps**:
  1. Go to Supabase Dashboard → Authentication → URL Configuration
  2. Add production URLs to "Redirect URLs"
  3. Verify database is accessible (not localhost)
- **Success Criteria**: Database connections work from Vercel
- **Estimated Time**: 5 minutes

#### Task 3.3: Verify OpenAI API Access
- **Action**: Confirm OpenAI API key works and has sufficient credits
- **Steps**:
  1. Test API endpoint: `/api/session`
  2. Verify realtime model access (gpt-4o-realtime-preview-2025-06-03)
- **Success Criteria**: Can create OpenAI realtime sessions
- **Estimated Time**: 3 minutes

---

### **Phase 4: Custom Domain Setup** (accai.io)

#### Task 4.1: Configure DNS Records
- **Action**: Point accai.io to Vercel
- **Steps**:
  1. In Vercel: Project Settings → Domains → Add accai.io
  2. Vercel provides DNS records (A or CNAME)
  3. In domain registrar (where you bought accai.io):
     - Add A record or CNAME as instructed
     - Wait for DNS propagation (5-60 minutes)
- **Success Criteria**: accai.io resolves to Vercel app
- **Owner**: User (domain access required)
- **Estimated Time**: 15 minutes + DNS propagation wait

#### Task 4.2: SSL Certificate
- **Action**: Wait for Vercel to provision SSL certificate
- **Success Criteria**: https://accai.io works with valid SSL
- **Estimated Time**: Automatic (5-10 minutes after DNS)

#### Task 4.3: Update Services with Final Domain
- **Action**: Update Clerk and Supabase with accai.io
- **Success Criteria**: All auth flows work on accai.io
- **Estimated Time**: 5 minutes

---

### **Phase 5: Testing & Validation**

#### Task 5.1: Functional Testing
- **Action**: Test all major features on production
- **Test Cases**:
  - [ ] User sign-up/sign-in
  - [ ] Create project
  - [ ] Start voice session
  - [ ] Timer functionality
  - [ ] Save session
  - [ ] Work journal
  - [ ] Feedback submission
- **Success Criteria**: All features work as expected
- **Estimated Time**: 20 minutes

#### Task 5.2: Performance Check
- **Action**: Verify performance and loading times
- **Checks**:
  - Lighthouse score
  - Initial page load < 3s
  - Voice connection latency acceptable
- **Success Criteria**: Performance acceptable
- **Estimated Time**: 10 minutes

#### Task 5.3: Error Monitoring Setup
- **Action**: Check Vercel logs for any runtime errors
- **Success Criteria**: No critical errors in production logs
- **Estimated Time**: 5 minutes

---

### **Phase 6: Documentation & Handoff**

#### Task 6.1: Document Deployment
- **Action**: Create deployment documentation
- **Contents**:
  - Environment variables reference
  - Deployment process
  - Troubleshooting guide
  - Rollback procedures
- **Success Criteria**: Documentation exists for future deployments
- **Estimated Time**: 15 minutes

---

## **Total Estimated Time**: 2-3 hours (excluding DNS propagation wait time)

## Project Status Board

**Current Phase: PLANNER MODE - Deployment Plan Created**

### Quick Reference Checklist

**Phase 1: Pre-Deployment Prerequisites (USER ACTION REQUIRED)**
- [ ] 1.1: GitHub repository verified and up-to-date
- [ ] 1.2: Environment variables documented
- [ ] 1.3: Vercel account created

**Phase 2: Vercel Project Setup**
- [ ] 2.1: Project imported to Vercel
- [ ] 2.2: Environment variables configured
- [ ] 2.3: Initial deployment successful

**Phase 3: External Services Configuration**
- [ ] 3.1: Clerk production URLs updated
- [ ] 3.2: Supabase configuration updated  
- [ ] 3.3: OpenAI API access verified

**Phase 4: Custom Domain Setup**
- [ ] 4.1: DNS records configured
- [ ] 4.2: SSL certificate provisioned
- [ ] 4.3: Services updated with final domain

**Phase 5: Testing & Validation**
- [ ] 5.1: Functional testing complete
- [ ] 5.2: Performance check passed
- [ ] 5.3: Error monitoring reviewed

**Phase 6: Documentation**
- [ ] 6.1: Deployment documentation created

---

## Critical Information for Executor

### Repository Details
- **Root**: `/Users/mizan/100MRR/accai adhd/14-voice-agents/realtime-workspace-agents/`
- **Framework**: Next.js 15.3.1
- **Node Version**: Check package.json engines field (if exists)

### API Endpoints to Verify Post-Deployment
- `/api/session` - OpenAI realtime session creation
- `/api/webhooks/clerk` - Clerk user sync webhook
- `/api/projects` - Project CRUD operations
- `/api/sessions` - Voice session management
- `/api/work-journal` - Work journal entries
- `/api/feedback` - User feedback
- `/api/experiments` - A/B testing data
- `/api/user/voice-preferences` - Voice settings

### External Service URLs
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Supabase Dashboard**: https://app.supabase.com
- **OpenAI Platform**: https://platform.openai.com
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## Executor's Feedback or Assistance Requests

**Status**: ⏳ **AWAITING USER ACTION**

**Planner Summary:**
Comprehensive deployment plan created for hosting the Next.js voice agent application on Vercel with custom domain accai.io. The plan is broken into 6 phases with clear success criteria for each task.

**User Must Complete Phase 1 Before Executor Can Begin:**
1. **Verify GitHub Repository**: Ensure latest code is pushed to GitHub
2. **Document Environment Variables**: Have all secrets from `.env.local` ready to copy
3. **Create Vercel Account**: Sign up at vercel.com

**Questions for User Before Proceeding:**
1. ❓ Do you have access to your GitHub repository with this project?
2. ❓ Do you have access to your `.env.local` file with all the API keys?
3. ❓ Do you have access to your domain registrar for accai.io (to configure DNS)?
4. ❓ Which email/account manages your Clerk, Supabase, and OpenAI services?
5. ❓ Have you run any Supabase migrations locally that need to be applied to production?

**Once User Confirms Prerequisites:**
Switch to **EXECUTOR MODE** to begin Phase 2 (Vercel Project Setup). The Executor will guide through each step with screenshots and verification.

---

## Lessons

### Deployment-Specific Lessons

**Lesson 1: Vercel monorepo structure**
The app is located at `14-voice-agents/realtime-workspace-agents/` subdirectory. When importing to Vercel, must specify root directory correctly to avoid build failures.

**Lesson 2: Environment variable naming**
Vercel requires exact environment variable names. `NEXT_PUBLIC_` prefix is critical for client-side access. Server-only secrets should NOT have this prefix.

**Lesson 3: Webhook endpoints must be public**
The Clerk webhook at `/api/webhooks/clerk` must be excluded from authentication middleware. Confirmed in `middleware.ts` that `/api/webhooks(.*)` is in public routes.

**Lesson 4: Database migrations in production**
Supabase migrations in `supabase/migrations/` need to be applied to production database before deployment. Can use Supabase CLI or dashboard.

**Lesson 5: OpenAI Realtime API model**
Uses `gpt-4o-realtime-preview-2025-06-03` model. Verify API key has access to this specific model in production.

**Lesson 6: DNS propagation timing**
DNS changes for custom domains can take 5-60 minutes. Plan deployment timing accordingly. Can use temporary .vercel.app URL for testing while waiting.

---

### Previous Project Lessons (Retained)

**Lesson 7: Simple is better**
Initial plan was overly complex with shared guidelines, multi-phase rollout, etc. User correctly identified that we just needed to update the system prompts directly. This saved significant time and complexity.

**Lesson 8: Agent prompts are powerful**
Each agent can handle multiple modes (thoughtful setup vs quick start) based on simple natural language instructions. No code changes needed - just clear prompt instructions.

**Lesson 9: Include info useful for debugging in the program output**
Always add helpful logging and error messages in production.

**Lesson 10: Read the file before you try to edit it**
Always verify file contents before making changes to avoid errors.

**Lesson 11: Security practices**
- Run `npm audit` if vulnerabilities appear in terminal
- Always ask before using `-force` git commands
- Never commit `.env.local` or secrets to repository
