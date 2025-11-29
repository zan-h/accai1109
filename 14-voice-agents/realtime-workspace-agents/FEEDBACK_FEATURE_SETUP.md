# User Feedback Feature - Setup Guide

## Overview
This feature adds a floating feedback button that allows users to quickly submit bugs, ideas, annoyances, or general feedback. The system automatically captures contextual information (current suite, session, page URL, etc.) to help developers understand the feedback better.

## Architecture

### Components
- **FeedbackButton.tsx** - Floating button with glassmorphic modal
- **API Route** - `/api/feedback/route.ts` handles submission with authentication
- **Database Table** - `feedback` table in Supabase with RLS policies

### Auto-captured Context
- User ID (via Clerk authentication)
- Current project ID
- Current session ID
- Current suite ID
- Page URL
- User agent/device info
- Timestamp

## Setup Instructions

### Step 1: Apply Database Migration

You need to apply the migration to create the `feedback` table in your Supabase database.

#### Option A: Supabase Dashboard (Easiest)
1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Copy the contents of `supabase/migrations/008_feedback_table.sql`
5. Paste into the SQL editor
6. Click **Run** to execute

#### Option B: Supabase CLI
If you have the Supabase CLI installed:

```bash
# Navigate to project directory
cd 14-voice-agents/realtime-workspace-agents

# Apply the migration
supabase db push

# Or apply manually:
supabase db execute -f supabase/migrations/008_feedback_table.sql
```

### Step 2: Verify Migration

Check that the table was created successfully:

```sql
-- Run this in Supabase SQL Editor
SELECT * FROM feedback LIMIT 1;
```

You should see an empty table with the correct columns.

### Step 3: Test the Feature

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser

3. Look for the floating **💭** button in the bottom-right corner

4. Click the button to open the feedback modal

5. Fill out the form:
   - Select a type (Bug, Idea, Annoyance, Other)
   - Enter feedback text
   - Click "Send 🚀"

6. Verify success toast appears: "Thanks! Your feedback helps us improve 💙"

7. Check the database to confirm the feedback was saved:
   ```sql
   SELECT * FROM feedback ORDER BY created_at DESC LIMIT 5;
   ```

## Features

### User Experience
- **Low friction**: Single click to open, no required fields except feedback text
- **Quick type selection**: Visual buttons for Bug/Idea/Annoyance/Other
- **Auto-context capture**: No need to explain where you are in the app
- **Positive reinforcement**: Success toast with encouraging message
- **Accessible**: Keyboard navigation, ARIA labels, escape to close

### Technical Features
- **Authentication**: Only authenticated users can submit feedback
- **RLS Policies**: Users can only view their own feedback (admins see all with service role)
- **Validation**: Server-side validation of required fields
- **Error handling**: Graceful error messages via toast system
- **Type safety**: Full TypeScript support

## Database Schema

```sql
feedback (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id UUID (references projects),
  session_id UUID (references voice_sessions),
  feedback_text TEXT NOT NULL,
  feedback_type TEXT (bug|idea|annoyance|other),
  suite_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## Rollback

If you need to remove this feature:

1. Remove the feedback button from `App.tsx`:
   ```tsx
   // Delete these lines:
   import { FeedbackButton } from "./components/FeedbackButton";
   <FeedbackButton currentSuiteId={...} currentSessionId={...} />
   ```

2. Apply the rollback migration:
   ```bash
   # Via Supabase dashboard, run:
   supabase/migrations/008_rollback.sql
   ```

3. Optionally delete the files:
   - `src/app/components/FeedbackButton.tsx`
   - `src/app/api/feedback/route.ts`
   - `supabase/migrations/008_feedback_table.sql`
   - `supabase/migrations/008_rollback.sql`

## Future Enhancements

Potential improvements:
- Admin dashboard to view and respond to feedback
- Email notifications for new feedback
- Screenshot capture option
- Sentiment analysis on feedback text
- Integration with issue tracking (GitHub, Linear, etc.)
- Upvoting system for similar feedback
- Status tracking (new, reviewing, resolved, closed)

## Troubleshooting

### "Unauthorized" Error
- Check that user is logged in via Clerk
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### "Failed to save feedback" Error
- Verify the migration was applied successfully
- Check RLS policies are enabled
- Ensure Supabase connection is working

### Button not visible
- Check z-index conflicts with other floating elements
- Verify FeedbackButton is imported and rendered in App.tsx
- Check CSS for `bottom-6 right-6` positioning

### Toast not showing
- Verify App.tsx is wrapped in `<ToastProvider>`
- Check browser console for errors

## Files Modified

```
14-voice-agents/realtime-workspace-agents/
├── src/app/
│   ├── App.tsx (added FeedbackButton import and component)
│   ├── api/feedback/route.ts (new)
│   └── components/FeedbackButton.tsx (new)
└── supabase/migrations/
    ├── 008_feedback_table.sql (new)
    └── 008_rollback.sql (new)
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure Supabase connection is working
4. Check that the migration was applied successfully
5. Test with a different browser/device


