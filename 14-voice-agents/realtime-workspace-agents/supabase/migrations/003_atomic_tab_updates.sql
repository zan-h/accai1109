-- Migration: Add atomic tab update function
-- This replaces the dangerous delete-then-insert pattern with a safe atomic operation
-- Prevents data loss if the insert operation fails

CREATE OR REPLACE FUNCTION update_project_tabs_atomic(
  p_project_id UUID,
  p_tabs JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tab_record JSONB;
  tab_index INTEGER := 0;
  existing_tab_ids TEXT[];
  new_tab_ids TEXT[];
BEGIN
  -- Start a transaction (this function is already in a transaction context)
  
  -- Extract all new tab IDs
  SELECT ARRAY_AGG(tab->>'id')
  INTO new_tab_ids
  FROM jsonb_array_elements(p_tabs) AS tab;
  
  -- Get existing tab IDs for this project
  SELECT ARRAY_AGG(id::TEXT)
  INTO existing_tab_ids
  FROM workspace_tabs
  WHERE project_id = p_project_id;
  
  -- Update or insert each tab
  FOR tab_record IN SELECT * FROM jsonb_array_elements(p_tabs)
  LOOP
    -- Upsert tab (insert or update if exists)
    INSERT INTO workspace_tabs (
      id,
      project_id,
      name,
      type,
      content,
      position,
      created_at,
      updated_at
    )
    VALUES (
      (tab_record->>'id')::UUID,
      p_project_id,
      tab_record->>'name',
      (tab_record->>'type')::TEXT,
      tab_record->>'content',
      tab_index,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      type = EXCLUDED.type,
      content = EXCLUDED.content,
      position = EXCLUDED.position,
      updated_at = NOW();
    
    tab_index := tab_index + 1;
  END LOOP;
  
  -- Delete tabs that are no longer in the new set (orphaned tabs)
  -- This happens AFTER successful inserts, so data is never lost
  DELETE FROM workspace_tabs
  WHERE project_id = p_project_id
    AND id::TEXT != ALL(new_tab_ids);
    
  -- Update project's updated_at timestamp
  UPDATE projects
  SET updated_at = NOW()
  WHERE id = p_project_id;
  
END;
$$;

-- Grant execute permission to authenticated users (via RLS policies)
GRANT EXECUTE ON FUNCTION update_project_tabs_atomic(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_project_tabs_atomic(UUID, JSONB) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION update_project_tabs_atomic IS 
  'Atomically updates all tabs for a project. Uses upsert pattern to prevent data loss. Safe alternative to delete-then-insert.';

