-- Rollback script in case something goes wrong
-- Run this to undo the initial schema migration

DROP TABLE IF EXISTS workspace_history CASCADE;
DROP TABLE IF EXISTS workspace_tabs CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column();




