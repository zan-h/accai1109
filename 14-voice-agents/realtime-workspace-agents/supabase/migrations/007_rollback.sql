-- Rollback: Daily Work Journal
-- Description: Safely remove daily_work_journal table and related objects
-- Created: Nov 17, 2025

-- Drop helper functions
DROP FUNCTION IF EXISTS get_entry_counts_for_range(TEXT, DATE, DATE);
DROP FUNCTION IF EXISTS get_daily_entry_count(TEXT, DATE);

-- Drop trigger function
DROP FUNCTION IF EXISTS update_daily_work_journal_updated_at() CASCADE;

-- Drop table (CASCADE removes dependent objects like triggers, indexes, policies)
DROP TABLE IF EXISTS daily_work_journal CASCADE;

