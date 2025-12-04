# Phase 1 Setup Guide - Required Actions

## Overview

The codebase has been updated with Phase 1 infrastructure:
- ✅ Supabase database integration
- ✅ Clerk authentication
- ✅ Server-side API key handling
- ✅ Database-backed project storage

**You must now complete these manual setup steps to make everything work.**

---

## Step 1: Create Supabase Project (15 min)

### 1.1 Create Account
1. Go to https://supabase.com
2. Sign up (recommend using GitHub OAuth)

### 1.2 Create Project
1. Click **"New Project"**
2. Fill in details:
   - **Organization:** Create new or select existing
   - **Name:** `voice-agents-dev` (or your preferred name)
   - **Database Password:** Generate strong password and **SAVE SECURELY** (use 1Password)
   - **Region:** Choose closest to your location
   - **Plan:** Free tier is fine for development

3. Click **"Create new project"**
4. Wait ~2 minutes for project to provision

### 1.3 Run Database Migration
1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. Verify success - you should see "Success. No rows returned"

### 1.4 Verify Tables Created
1. Go to **Table Editor** (left sidebar)
2. You should see 4 tables:
   - `users`
   - `projects`
   - `workspace_tabs`
   - `workspace_history`

### 1.5 Get API Credentials
1. Go to **Project Settings** → **API** (gear icon in sidebar)
2. Copy these values (you'll need them in Step 3):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJhbGci...`)
   - **service_role** key (starts with `eyJhbGci...`) - ⚠️ **KEEP SECRET!**

---

## Step 2: Create Clerk Account (15 min)

### 2.1 Create Account
1. Go to https://clerk.com
2. Sign up (recommend using GitHub OAuth)

### 2.2 Create Application
1. Click **"+ Create application"**
2. Fill in details:
   - **Name:** Your app name (e.g., "Voice Agents")
   - **Sign-in options:** Enable:
     - ✅ Email
     - ✅ Google
     - ✅ GitHub
3. Click **"Create application"**

### 2.3 Get API Keys
1. You'll be shown your API keys immediately
2. Copy these values (you'll need them in Step 3):
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### 2.4 Configure Webhook (Important!)
1. In Clerk Dashboard, go to **Webhooks** (left sidebar)
2. Click **"+ Add Endpoint"**
3. **For local development, you need to use ngrok:**
   
   ```bash
   # Install ngrok if you don't have it
   brew install ngrok
   
   # In a separate terminal, run:
   ngrok http 3000
   
   # Copy the HTTPS URL (e.g., https://xxxx-xx-xx-xx.ngrok-free.app)
   ```

4. In Clerk webhook configuration:
   - **Endpoint URL:** `https://your-ngrok-url.ngrok-free.app/api/webhooks/clerk`
   - **Subscribe to events:**
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
   - Click **"Create"**

5. Copy the **Signing Secret** (starts with `whsec_...`)

**Note:** For production deployment, you'll replace the ngrok URL with your production URL.

---

## Step 3: Create Upstash Redis (10 min)

### 3.1 Create Account
1. Go to https://upstash.com
2. Sign up (recommend using GitHub OAuth)

### 3.2 Create Redis Database
1. Click **"Create Database"**
2. Fill in details:
   - **Name:** `voice-agents-ratelimit`
   - **Type:** Regional
   - **Region:** Choose closest to your location
   - **Plan:** Free (10k requests/day)
3. Click **"Create"**

### 3.3 Get Credentials
1. After creation, you'll see your database dashboard
2. Scroll down to **REST API** section
3. Copy these values:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

---

## Step 4: Configure Environment Variables (5 min)

### 4.1 Create .env.local File
In your project root (`14-voice-agents/realtime-workspace-agents/`), create a file named `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs (use these defaults)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# OpenAI (your existing key)
OPENAI_API_KEY=sk-proj-...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXX...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4.2 Replace Placeholder Values
Replace all `xxxxx...` values with your actual credentials from Steps 1-3.

### 4.3 Verify .gitignore
Check that `.env.local` is in your `.gitignore` (it already is, so you're good!)

---

## Step 5: Test the Setup (10 min)

### 5.1 Start Development Server
```bash
cd /Users/mizan/100MRR/bh-refactor/14-voice-agents/realtime-workspace-agents
npm run dev
```

### 5.2 Test Authentication
1. Open http://localhost:3000
2. You should be redirected to sign-in page
3. Click **"Sign up"**
4. Create an account with email or Google/GitHub
5. After sign-up, you should be redirected back to the app
6. Verify you see your email in the top-right corner

### 5.3 Verify Database Sync
1. Go to your Supabase Dashboard → **Table Editor**
2. Open the `users` table
3. You should see your user account listed!

### 5.4 Create a Test Project
1. In the app, press **Cmd+P** (or Ctrl+P on Windows)
2. Type a project name and press Enter
3. Go back to Supabase → **Table Editor** → `projects` table
4. You should see your new project!

---

## Step 6: Troubleshooting

### Issue: "Cannot connect to Supabase"
**Fix:** 
- Check that `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and keys
- Restart dev server: `npm run dev`
- Check browser console for detailed error

### Issue: "User not found in database"
**Fix:**
- Ensure Clerk webhook is configured correctly
- Check Clerk Dashboard → Webhooks → Logs
- If webhook failed, click "Resend" or manually trigger by signing up again with a different email

### Issue: "Unauthorized" when accessing app
**Fix:**
- Clear cookies and sign in again
- Check that Clerk middleware is not blocking routes
- Verify `CLERK_SECRET_KEY` is correct in `.env.local`

### Issue: "ngrok URL keeps changing"
**Fix:**
- Free ngrok URLs change on restart
- Either:
  - Keep ngrok running continuously, OR
  - Upgrade to ngrok paid plan for static URL, OR
  - For production, deploy to Vercel and use production URL

### Issue: Can't create projects
**Fix:**
- Check browser console for errors
- Verify database migration ran successfully (check `projects` table exists)
- Check that RLS policies are created (SQL Editor → run `SELECT * FROM pg_policies`)

---

## What's Next?

Once everything is working:

1. **Migration Tool:** We'll add a tool to migrate your old localStorage data to the database
2. **Rate Limiting:** We'll implement API rate limiting with Upstash Redis
3. **Secure API Routes:** We'll move OpenAI key handling to server-side only
4. **Testing:** We'll verify all security policies work correctly

---

## Quick Reference

**Project Location:**
```
/Users/mizan/100MRR/bh-refactor/14-voice-agents/realtime-workspace-agents/
```

**Key Files:**
- `.env.local` - Your environment variables (create this!)
- `supabase/migrations/001_initial_schema.sql` - Database schema
- `middleware.ts` - Route protection
- `src/app/lib/supabase/` - Database client utilities
- `src/app/api/webhooks/clerk/route.ts` - User sync webhook

**Important Commands:**
```bash
# Start dev server
npm run dev

# Start ngrok (separate terminal)
ngrok http 3000

# Check build
npm run build
```

---

## Need Help?

If you encounter issues:
1. Check the Troubleshooting section above
2. Check Supabase logs: Dashboard → Logs
3. Check Clerk logs: Dashboard → Webhooks → Logs
4. Check browser console for JavaScript errors
5. Check terminal for Next.js errors

**Ready to proceed?** Once you've completed Steps 1-5 and everything is working, let me know and I'll continue with the remaining Phase 1 tasks!

