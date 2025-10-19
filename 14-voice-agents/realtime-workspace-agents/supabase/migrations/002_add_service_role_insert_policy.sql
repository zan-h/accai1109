-- Grant the Supabase service role permission to insert rows into users.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Service role can insert users'
  ) THEN
    CREATE POLICY "Service role can insert users"
      ON users FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END;
$$;
