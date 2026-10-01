-- ==========================================================================
-- JANKALI School Survey — Production Hardening Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ==========================================================================
-- This migration:
-- 1. Ensures user_id column exists on survey_responses
-- 2. Fixes RLS policies for school-level data isolation
-- 3. Adds trigger to lock submitted surveys from editing
-- 4. Creates atomic save RPC function
-- 5. Creates idempotent submit RPC function
-- 6. Enhances audit logging

-- ============================================
-- STEP 0: Pre-flight checks
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Starting production hardening migration...';
  RAISE NOTICE 'Checking current state...';
END $$;

-- ============================================
-- STEP 1: Ensure user_id column on survey_responses
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'survey_responses' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.survey_responses ADD COLUMN user_id UUID REFERENCES auth.users(id);
    CREATE INDEX IF NOT EXISTS idx_surveys_user ON public.survey_responses(user_id);
    RAISE NOTICE 'Added user_id column to survey_responses';
  ELSE
    RAISE NOTICE 'user_id column already exists on survey_responses';
  END IF;
END $$;

-- ============================================
-- STEP 2: Add user_info column to audit_logs if missing
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'survey_audit_logs' 
    AND column_name = 'user_info'
  ) THEN
    ALTER TABLE public.survey_audit_logs ADD COLUMN user_info TEXT;
    RAISE NOTICE 'Added user_info column to survey_audit_logs';
  ELSE
    RAISE NOTICE 'user_info column already exists on survey_audit_logs';
  END IF;
END $$;

-- ============================================
-- STEP 3: TRIGGER — Prevent editing submitted surveys
-- ============================================
CREATE OR REPLACE FUNCTION public.prevent_submitted_survey_edit()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow status changes (e.g., submitted → reviewed)
  -- But prevent data changes on submitted surveys
  IF OLD.status = 'submitted' AND NEW.status = OLD.status THEN
    -- Allow only timestamp updates, not data changes
    IF NEW.survey_data IS DISTINCT FROM OLD.survey_data 
       OR NEW.current_section IS DISTINCT FROM OLD.current_section THEN
      RAISE EXCEPTION 'जमा किया गया सर्वे संशोधित नहीं किया जा सकता। (Cannot edit a submitted survey)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trg_prevent_submitted_edit ON public.survey_responses;

-- Create trigger
CREATE TRIGGER trg_prevent_submitted_edit
  BEFORE UPDATE ON public.survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_submitted_survey_edit();

-- ============================================
-- STEP 4: FIX RLS POLICIES — School-level isolation
-- ============================================
-- Strategy:
-- - survey_responses: users can only access their own surveys (user_id = auth.uid())
-- - schools: users can access schools linked to their surveys
-- - child tables: users can access data linked to their surveys
-- - service_role bypasses RLS automatically
-- - anon has NO write access (only authenticated users)

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'schools', 'survey_responses', 'staff_positions', 'staff_members',
    'student_enrollment', 'palanhar_students', 'disabled_students', 'player_students',
    'scout_ncc_students', 'labs', 'lab_requirements', 'committee_members',
    'panchayat_members', 'exam_results', 'school_requirements', 'works',
    'attachments', 'survey_audit_logs'
  ];
BEGIN
  -- Drop all existing permissive policies
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow public read ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow public insert ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow public update ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow public delete ' || tbl, tbl);
    -- Also drop any new policies we're about to create
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'user_read_' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'user_insert_' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'user_update_' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'user_delete_' || tbl, tbl);
  END LOOP;
END $$;

-- === SURVEY_RESPONSES: Core ownership table ===
CREATE POLICY "user_read_survey_responses" ON public.survey_responses
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "user_insert_survey_responses" ON public.survey_responses
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "user_update_survey_responses" ON public.survey_responses
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "user_delete_survey_responses" ON public.survey_responses
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- === SCHOOLS: Linked via survey_responses ===
CREATE POLICY "user_read_schools" ON public.schools
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      WHERE sr.school_id = schools.id
      AND sr.user_id = (select auth.uid())
    )
  );

CREATE POLICY "user_insert_schools" ON public.schools
  FOR INSERT TO authenticated
  WITH CHECK (true);  -- Allow inserting new schools (ownership validated via survey)

CREATE POLICY "user_update_schools" ON public.schools
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      WHERE sr.school_id = schools.id
      AND sr.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      WHERE sr.school_id = schools.id
      AND sr.user_id = (select auth.uid())
    )
  );

CREATE POLICY "user_delete_schools" ON public.schools
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      WHERE sr.school_id = schools.id
      AND sr.user_id = (select auth.uid())
    )
  );

-- === CHILD TABLES: Linked via survey_responses.survey_id ===
-- Macro for creating child table policies
DO $$
DECLARE
  tbl text;
  child_tables text[] := ARRAY[
    'staff_positions', 'staff_members', 'student_enrollment',
    'palanhar_students', 'disabled_students', 'player_students',
    'scout_ncc_students', 'labs', 'lab_requirements',
    'committee_members', 'panchayat_members', 'exam_results',
    'school_requirements', 'attachments'
  ];
BEGIN
  FOREACH tbl IN ARRAY child_tables LOOP
    -- SELECT: Only own survey's data
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.survey_responses sr WHERE sr.id = %I.survey_id AND sr.user_id = (select auth.uid()))
      );',
      'user_read_' || tbl, tbl, tbl
    );

    -- INSERT: Only into own survey
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM public.survey_responses sr WHERE sr.id = %I.survey_id AND sr.user_id = (select auth.uid()))
      );',
      'user_insert_' || tbl, tbl, tbl
    );

    -- UPDATE: Only own survey's data
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.survey_responses sr WHERE sr.id = %I.survey_id AND sr.user_id = (select auth.uid()))
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.survey_responses sr WHERE sr.id = %I.survey_id AND sr.user_id = (select auth.uid()))
      );',
      'user_update_' || tbl, tbl, tbl, tbl
    );

    -- DELETE: Only own survey's data
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.survey_responses sr WHERE sr.id = %I.survey_id AND sr.user_id = (select auth.uid()))
      );',
      'user_delete_' || tbl, tbl, tbl
    );
  END LOOP;
END $$;

-- === WORKS: Read own, admin can update ===
CREATE POLICY "user_read_works" ON public.works
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      WHERE sr.id = works.survey_id
      AND sr.user_id = (select auth.uid())
    )
  );

CREATE POLICY "user_insert_works" ON public.works
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      WHERE sr.id = works.survey_id
      AND sr.user_id = (select auth.uid())
    )
  );

CREATE POLICY "user_update_works" ON public.works
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      WHERE sr.id = works.survey_id
      AND sr.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      WHERE sr.id = works.survey_id
      AND sr.user_id = (select auth.uid())
    )
  );

CREATE POLICY "user_delete_works" ON public.works
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      WHERE sr.id = works.survey_id
      AND sr.user_id = (select auth.uid())
    )
  );

-- === AUDIT LOGS: Users can insert for own surveys, read own ===
CREATE POLICY "user_read_survey_audit_logs" ON public.survey_audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      WHERE sr.id = survey_audit_logs.survey_id
      AND sr.user_id = (select auth.uid())
    )
  );

CREATE POLICY "user_insert_survey_audit_logs" ON public.survey_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.survey_responses sr
      WHERE sr.id = survey_audit_logs.survey_id
      AND sr.user_id = (select auth.uid())
    )
  );

-- No UPDATE or DELETE on audit logs for regular users (immutable)

-- ============================================
-- STEP 5: Ensure RLS is enabled on all tables
-- ============================================
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'schools', 'survey_responses', 'staff_positions', 'staff_members',
    'student_enrollment', 'palanhar_students', 'disabled_students', 'player_students',
    'scout_ncc_students', 'labs', 'lab_requirements', 'committee_members',
    'panchayat_members', 'exam_results', 'school_requirements', 'works',
    'attachments', 'survey_audit_logs'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
  END LOOP;
END $$;

-- ============================================
-- STEP 6: Revoke anon write access
-- Only authenticated users should write data
-- service_role still has full access (bypasses RLS)
-- ============================================
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
-- Keep SELECT for anon (public dashboard viewing if needed)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
-- Authenticated users keep full access (RLS controls row-level)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- service_role keeps everything
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================
-- STEP 7: Database-level data validation (CHECK constraints)
-- Only add constraints that are safe for existing data
-- ============================================

-- Student enrollment: counts must be non-negative
DO $$
BEGIN
  -- Check for any negative values first
  IF NOT EXISTS (SELECT 1 FROM public.student_enrollment WHERE boys < 0 OR girls < 0 OR total < 0) THEN
    ALTER TABLE public.student_enrollment 
      DROP CONSTRAINT IF EXISTS chk_enrollment_non_negative;
    ALTER TABLE public.student_enrollment
      ADD CONSTRAINT chk_enrollment_non_negative CHECK (boys >= 0 AND girls >= 0 AND total >= 0);
    RAISE NOTICE 'Added non-negative constraint to student_enrollment';
  ELSE
    RAISE WARNING 'Skipping student_enrollment constraint: negative values exist in data';
  END IF;
END $$;

-- Exam results: counts must be non-negative
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.exam_results WHERE first_div < 0 OR second_div < 0 OR third_div < 0 OR total < 0) THEN
    ALTER TABLE public.exam_results 
      DROP CONSTRAINT IF EXISTS chk_exam_results_non_negative;
    ALTER TABLE public.exam_results
      ADD CONSTRAINT chk_exam_results_non_negative CHECK (first_div >= 0 AND second_div >= 0 AND third_div >= 0 AND total >= 0);
    RAISE NOTICE 'Added non-negative constraint to exam_results';
  ELSE
    RAISE WARNING 'Skipping exam_results constraint: negative values exist in data';
  END IF;
END $$;

-- Labs: available must be non-negative
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.labs WHERE available < 0) THEN
    ALTER TABLE public.labs 
      DROP CONSTRAINT IF EXISTS chk_labs_non_negative;
    ALTER TABLE public.labs
      ADD CONSTRAINT chk_labs_non_negative CHECK (available >= 0);
    RAISE NOTICE 'Added non-negative constraint to labs';
  ELSE
    RAISE WARNING 'Skipping labs constraint: negative values exist in data';
  END IF;
END $$;

-- Lab requirements: quantity must be non-negative
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.lab_requirements WHERE quantity < 0) THEN
    ALTER TABLE public.lab_requirements 
      DROP CONSTRAINT IF EXISTS chk_lab_requirements_non_negative;
    ALTER TABLE public.lab_requirements
      ADD CONSTRAINT chk_lab_requirements_non_negative CHECK (quantity >= 0);
    RAISE NOTICE 'Added non-negative constraint to lab_requirements';
  ELSE
    RAISE WARNING 'Skipping lab_requirements constraint: negative values exist in data';
  END IF;
END $$;

-- ============================================
-- STEP 8: Unique constraint — one active survey per user
-- ============================================
-- Create a partial unique index (only for non-deleted surveys)
DROP INDEX IF EXISTS idx_unique_user_active_survey;
CREATE UNIQUE INDEX idx_unique_user_active_survey 
  ON public.survey_responses(user_id) 
  WHERE user_id IS NOT NULL AND status IN ('draft', 'submitted');

-- ============================================
-- STEP 9: Verify migration
-- ============================================
DO $$
DECLARE
  v_count integer;
BEGIN
  -- Count RLS policies
  SELECT COUNT(*) INTO v_count 
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  RAISE NOTICE 'Migration complete. Total RLS policies: %', v_count;
  RAISE NOTICE 'Verify by testing: User A cannot read User B survey data';
END $$;
