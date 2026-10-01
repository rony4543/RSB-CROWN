-- ==========================================================================
-- JANKALI School Survey — MASTER DATABASE SCHEMA
-- Supabase PostgreSQL — Complete Hybrid Architecture
-- Version: 2.0.0 | Date: 2026-09-26
-- ==========================================================================
-- 
-- ARCHITECTURE OVERVIEW:
-- 1. school_surveys     — One row per survey, JSONB responses column
-- 2. survey_versions    — Track form version history
-- 3. question_registry  — Complete schema dictionary for AI
-- 4. ai_analysis        — Separate AI interpretation layer
-- 5. schools            — School master data (kept for FK reference)
-- 6. attachments        — File references
-- 7. works              — Problem→Work conversions
-- 8. survey_audit_logs  — Audit trail
-- 9. school_survey_overview — Materialized view for dashboard
-- ==========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- ==========================================================================
-- 1. SURVEY VERSIONS — Track form structure changes
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.survey_versions (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  version     TEXT NOT NULL UNIQUE,
  form_name   TEXT NOT NULL DEFAULT 'JANKALI School Survey',
  description TEXT,
  total_questions INTEGER DEFAULT 0,
  total_sections  INTEGER DEFAULT 0,
  schema_snapshot JSONB,  -- Optional: freeze the question_registry at this version
  created_at  TIMESTAMPTZ DEFAULT now(),
  is_active   BOOLEAN DEFAULT true
);

-- Insert the current version
INSERT INTO public.survey_versions (version, form_name, description, total_questions, total_sections, is_active)
VALUES ('1.0.0', 'JANKALI School Survey', 'Initial comprehensive school survey form', 40, 17, true)
ON CONFLICT (version) DO NOTHING;

-- ==========================================================================
-- 2. SCHOOLS — Master school data (kept as searchable reference)
-- ==========================================================================
-- Keep existing schools table structure for backward compatibility
-- No changes needed — it's already correct

-- ==========================================================================
-- 3. SCHOOL_SURVEYS — The primary survey table (HYBRID ARCHITECTURE)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.school_surveys (
  -- Primary identifiers
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  survey_id       TEXT NOT NULL UNIQUE,  -- Human-readable ID: SUR-XXXX
  
  -- School reference (searchable columns)
  school_id       TEXT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
  school_name     TEXT NOT NULL,
  village         TEXT,
  panchayat       TEXT,   -- gram_panchayat
  block           TEXT,   -- panchayat_samiti
  district        TEXT,
  udise_code      TEXT,
  
  -- Survey metadata
  survey_date     DATE DEFAULT CURRENT_DATE,
  submitted_by    TEXT,
  status          TEXT DEFAULT 'draft' CHECK(status IN ('draft','submitted','reviewed','archived')),
  current_section INTEGER DEFAULT 0,
  
  -- Version tracking
  survey_version  TEXT DEFAULT '1.0.0' REFERENCES public.survey_versions(version),
  
  -- ================================================================
  -- THE COMPLETE SURVEY RESPONSE — JSONB
  -- Every question, sub-question, option, and answer is stored here
  -- ================================================================
  responses       JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  submitted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Sequence for human-readable survey IDs
CREATE SEQUENCE IF NOT EXISTS survey_id_seq START 1;

-- Function to generate human-readable survey ID
CREATE OR REPLACE FUNCTION generate_survey_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.survey_id IS NULL OR NEW.survey_id = '' THEN
    NEW.survey_id := 'SUR-' || LPAD(nextval('survey_id_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate survey_id
DROP TRIGGER IF EXISTS trg_generate_survey_id ON public.school_surveys;
CREATE TRIGGER trg_generate_survey_id
  BEFORE INSERT ON public.school_surveys
  FOR EACH ROW
  EXECUTE FUNCTION generate_survey_id();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_school_surveys_timestamp ON public.school_surveys;
CREATE TRIGGER trg_update_school_surveys_timestamp
  BEFORE UPDATE ON public.school_surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ==========================================================================
-- 4. QUESTION REGISTRY — Permanent schema dictionary for AI
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.question_registry (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id       TEXT NOT NULL UNIQUE,     -- e.g., "q1", "q9_existing_rooms"
  section_id        TEXT NOT NULL,            -- e.g., "section_01_academic"
  section_name      TEXT NOT NULL,            -- e.g., "शैक्षणिक जानकारी"
  question_number   TEXT,                     -- e.g., "Q1", "Q9B"
  question_text     TEXT NOT NULL,            -- Full original Hindi text
  question_text_en  TEXT,                     -- English translation
  question_type     TEXT NOT NULL,            -- text, number, radio, checkbox, select, textarea, table, file, date
  options           JSONB,                    -- Available options for radio/select/checkbox
  required          BOOLEAN DEFAULT false,
  conditional_logic JSONB,                    -- e.g., {"depends_on": "q14", "show_when": "हाँ"}
  parent_question   TEXT,                     -- Parent question ID for sub-questions
  data_path         TEXT NOT NULL,            -- JSONB path: "responses.section_01_academic.q1"
  unit              TEXT,                     -- e.g., "मीटर", "किलोमीटर", "बीघा"
  validation_rules  JSONB,                   -- min, max, pattern, etc.
  display_order     INTEGER DEFAULT 0,
  version           TEXT DEFAULT '1.0.0',
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================================
-- 5. AI ANALYSIS — Separate from raw survey data
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.ai_analysis (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id             TEXT NOT NULL REFERENCES public.school_surveys(id) ON DELETE CASCADE,
  
  -- Structured analysis fields (JSONB for flexibility)
  summary               TEXT,
  key_findings          JSONB,       -- ["finding1", "finding2"]
  critical_issues       JSONB,       -- [{"issue": "...", "severity": "high"}]
  infrastructure_analysis JSONB,     -- {"buildings": {...}, "water": {...}}
  teacher_analysis      JSONB,       -- {"vacancies": 5, "shortage_areas": [...]}
  student_analysis      JSONB,       -- {"enrollment_trends": {...}}
  requirement_analysis  JSONB,       -- {"top_requirements": [...]}
  recommendations       JSONB,       -- [{"action": "...", "priority": "high"}]
  priority              TEXT CHECK(priority IN ('critical', 'high', 'medium', 'low')),
  risk_flags            JSONB,       -- ["no_water", "no_electricity"]
  
  -- AI metadata
  generated_at          TIMESTAMPTZ DEFAULT now(),
  model                 TEXT,         -- e.g., "gemini-2.5-pro"
  analysis_version      TEXT DEFAULT '1.0.0',
  raw_prompt            TEXT,         -- Optional: store the prompt used
  raw_response          TEXT,         -- Optional: store raw AI response
  
  -- Ensure one analysis per survey (latest wins, old ones preserved)
  is_latest             BOOLEAN DEFAULT true,
  
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================================
-- 6. ATTACHMENTS — File references linked to surveys
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.survey_attachments (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id       TEXT NOT NULL REFERENCES public.school_surveys(id) ON DELETE CASCADE,
  question_id     TEXT,            -- Which question this attachment belongs to
  file_name       TEXT NOT NULL,
  file_path       TEXT NOT NULL,   -- Supabase Storage path
  file_type       TEXT,
  file_size       INTEGER,
  geo_lat         TEXT,            -- Geolocation latitude
  geo_lng         TEXT,            -- Geolocation longitude
  metadata        JSONB,           -- Any additional file metadata
  uploaded_at     TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================================
-- 7. WORKS — Problem→Work conversion (operational layer)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.survey_works (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  survey_id           TEXT NOT NULL REFERENCES public.school_surveys(id) ON DELETE CASCADE,
  school_id           TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  source_question_id  TEXT,          -- Which question generated this work
  category            TEXT,
  title               TEXT NOT NULL,
  problem             TEXT,
  requirement         TEXT,
  quantity            TEXT,
  unit                TEXT,
  priority            TEXT DEFAULT 'medium' CHECK(priority IN ('critical', 'high', 'medium', 'low')),
  estimated_cost      TEXT,
  status              TEXT DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','cancelled')),
  assigned_department TEXT,
  assigned_person     TEXT,
  remarks             TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_update_survey_works_timestamp ON public.survey_works;
CREATE TRIGGER trg_update_survey_works_timestamp
  BEFORE UPDATE ON public.survey_works
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ==========================================================================
-- 8. SURVEY AUDIT LOGS — Complete audit trail
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.survey_audit_log (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id   TEXT NOT NULL REFERENCES public.school_surveys(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,   -- created, updated, submitted, reviewed, ai_analyzed
  details     JSONB,           -- Structured details of what changed
  user_info   TEXT,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================================
-- 9. INDEXES FOR QUERY OPTIMIZATION
-- ==========================================================================

-- school_surveys: Primary search columns
CREATE INDEX IF NOT EXISTS idx_ss_survey_id ON public.school_surveys(survey_id);
CREATE INDEX IF NOT EXISTS idx_ss_school_id ON public.school_surveys(school_id);
CREATE INDEX IF NOT EXISTS idx_ss_school_name ON public.school_surveys USING gin(school_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_ss_village ON public.school_surveys(village);
CREATE INDEX IF NOT EXISTS idx_ss_panchayat ON public.school_surveys(panchayat);
CREATE INDEX IF NOT EXISTS idx_ss_block ON public.school_surveys(block);
CREATE INDEX IF NOT EXISTS idx_ss_district ON public.school_surveys(district);
CREATE INDEX IF NOT EXISTS idx_ss_status ON public.school_surveys(status);
CREATE INDEX IF NOT EXISTS idx_ss_survey_date ON public.school_surveys(survey_date);
CREATE INDEX IF NOT EXISTS idx_ss_submitted_by ON public.school_surveys(submitted_by);
CREATE INDEX IF NOT EXISTS idx_ss_udise_code ON public.school_surveys(udise_code);

-- JSONB indexes: Only for frequently-queried response fields
CREATE INDEX IF NOT EXISTS idx_ss_responses_gin ON public.school_surveys USING gin(responses jsonb_path_ops);

-- AI analysis indexes
CREATE INDEX IF NOT EXISTS idx_ai_survey_id ON public.ai_analysis(survey_id);
CREATE INDEX IF NOT EXISTS idx_ai_priority ON public.ai_analysis(priority);
CREATE INDEX IF NOT EXISTS idx_ai_is_latest ON public.ai_analysis(is_latest) WHERE is_latest = true;

-- Works indexes
CREATE INDEX IF NOT EXISTS idx_sw_survey_id ON public.survey_works(survey_id);
CREATE INDEX IF NOT EXISTS idx_sw_school_id ON public.survey_works(school_id);
CREATE INDEX IF NOT EXISTS idx_sw_status ON public.survey_works(status);
CREATE INDEX IF NOT EXISTS idx_sw_priority ON public.survey_works(priority);

-- Attachments indexes
CREATE INDEX IF NOT EXISTS idx_sa_survey_id ON public.survey_attachments(survey_id);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_sal_survey_id ON public.survey_audit_log(survey_id);
CREATE INDEX IF NOT EXISTS idx_sal_action ON public.survey_audit_log(action);

-- Question registry indexes
CREATE INDEX IF NOT EXISTS idx_qr_section_id ON public.question_registry(section_id);
CREATE INDEX IF NOT EXISTS idx_qr_question_number ON public.question_registry(question_number);

-- ==========================================================================
-- 10. VIEW: school_survey_overview — Dashboard view
-- ==========================================================================
CREATE OR REPLACE VIEW public.school_survey_overview WITH (security_invoker = on) AS
SELECT
  ss.survey_id,
  ss.school_name,
  ss.village,
  ss.panchayat,
  ss.block,
  ss.district,
  ss.udise_code,
  ss.survey_date,
  ss.status,
  ss.submitted_by,
  
  -- Extract key metrics from JSONB for display
  -- Student count (from enrollment data in responses)
  (
    SELECT COALESCE(SUM(
      (elem->>'boys')::int + (elem->>'girls')::int
    ), 0)
    FROM jsonb_array_elements(
      COALESCE(ss.responses->'section_04_enrollment'->'q28'->'answer', '[]'::jsonb)
    ) AS elem
    WHERE elem->>'boys' IS NOT NULL
  ) AS student_count,
  
  -- Teacher count (working staff from responses)
  (
    SELECT COALESCE(SUM((elem->>'working')::int), 0)
    FROM jsonb_array_elements(
      COALESCE(ss.responses->'section_03_staff'->'q7'->'answer', '[]'::jsonb)
    ) AS elem
    WHERE elem->>'working' IS NOT NULL
  ) AS teacher_count,
  
  -- Infrastructure status (composite from key questions)
  CASE
    WHEN ss.responses->'section_06_electricity'->'q11_electricity'->>'answer' = 'नहीं'
      OR ss.responses->'section_10_toilet_water'->'q25'->>'answer' = 'नहीं'
      OR ss.responses->'section_10_toilet_water'->'q23_available'->>'answer' = 'नहीं'
    THEN 'Critical'
    WHEN ss.responses->'section_08_boundary'->'q16'->>'answer' = 'नहीं'
      OR ss.responses->'section_06_electricity'->'q13_internet'->>'answer' = 'नहीं'
    THEN 'Needs Attention'
    ELSE 'Adequate'
  END AS infrastructure_status,
  
  -- Critical issues array
  (
    SELECT jsonb_agg(issue) FROM (
      SELECT 'बिजली नहीं'::text AS issue WHERE ss.responses->'section_06_electricity'->'q11_electricity'->>'answer' = 'नहीं'
      UNION ALL
      SELECT 'पेयजल नहीं' WHERE ss.responses->'section_10_toilet_water'->'q25'->>'answer' = 'नहीं'
      UNION ALL
      SELECT 'शौचालय नहीं' WHERE ss.responses->'section_10_toilet_water'->'q23_available'->>'answer' = 'नहीं'
      UNION ALL
      SELECT 'चारदीवारी नहीं' WHERE ss.responses->'section_08_boundary'->'q16'->>'answer' = 'नहीं'
      UNION ALL
      SELECT 'इंटरनेट नहीं' WHERE ss.responses->'section_06_electricity'->'q13_internet'->>'answer' = 'नहीं'
      UNION ALL
      SELECT 'सड़क नहीं' WHERE ss.responses->'section_09_road'->'q21'->>'answer' = 'नहीं'
    ) issues
  ) AS critical_issues,
  
  -- AI Priority (from latest analysis)
  ai.priority AS ai_priority,
  ai.summary AS ai_summary,
  
  ss.updated_at AS last_updated

FROM public.school_surveys ss
LEFT JOIN public.ai_analysis ai ON ai.survey_id = ss.id AND ai.is_latest = true;

-- ==========================================================================
-- 11. ROW LEVEL SECURITY (RLS) 
-- ==========================================================================
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'school_surveys', 'survey_versions', 'question_registry',
    'ai_analysis', 'survey_attachments', 'survey_works',
    'survey_audit_log'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    
    -- Drop existing policies
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'allow_read_' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'allow_insert_' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'allow_update_' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'allow_delete_' || tbl, tbl);

    -- Create permissive policies (application manages access control)
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true);',
      'allow_read_' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true);',
      'allow_insert_' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);',
      'allow_update_' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO anon, authenticated USING (true);',
      'allow_delete_' || tbl, tbl);
  END LOOP;
END $$;

-- ==========================================================================
-- 12. GRANTS FOR DATA API ACCESS
-- ==========================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ==========================================================================
-- 13. DATA ACCESS FUNCTIONS (AI-Ready API Layer)
-- ==========================================================================

-- Get complete survey by survey_id (human-readable)
CREATE OR REPLACE FUNCTION public.get_school_survey(p_survey_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'survey_id', ss.survey_id,
    'school_id', ss.school_id,
    'school_name', ss.school_name,
    'village', ss.village,
    'panchayat', ss.panchayat,
    'block', ss.block,
    'district', ss.district,
    'udise_code', ss.udise_code,
    'survey_date', ss.survey_date,
    'status', ss.status,
    'submitted_by', ss.submitted_by,
    'survey_version', ss.survey_version,
    'responses', ss.responses,
    'submitted_at', ss.submitted_at,
    'created_at', ss.created_at,
    'updated_at', ss.updated_at,
    'attachments', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'file_name', sa.file_name,
        'file_path', sa.file_path,
        'question_id', sa.question_id,
        'geo_lat', sa.geo_lat,
        'geo_lng', sa.geo_lng
      )), '[]'::jsonb)
      FROM public.survey_attachments sa WHERE sa.survey_id = ss.id
    ),
    'works', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', sw.id,
        'category', sw.category,
        'title', sw.title,
        'problem', sw.problem,
        'priority', sw.priority,
        'status', sw.status
      )), '[]'::jsonb)
      FROM public.survey_works sw WHERE sw.survey_id = ss.id
    ),
    'ai_analysis', (
      SELECT jsonb_build_object(
        'summary', ai.summary,
        'key_findings', ai.key_findings,
        'critical_issues', ai.critical_issues,
        'priority', ai.priority,
        'risk_flags', ai.risk_flags,
        'recommendations', ai.recommendations,
        'generated_at', ai.generated_at,
        'model', ai.model
      )
      FROM public.ai_analysis ai 
      WHERE ai.survey_id = ss.id AND ai.is_latest = true
      LIMIT 1
    )
  ) INTO result
  FROM public.school_surveys ss
  WHERE ss.survey_id = p_survey_id OR ss.id = p_survey_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Get school by school_id
CREATE OR REPLACE FUNCTION public.get_school_by_id(p_school_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'school', jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'village', s.village,
      'gram_panchayat', s.gram_panchayat,
      'panchayat_samiti', s.panchayat_samiti,
      'udise_code', s.udise_code,
      'school_code', s.school_code,
      'principal_name', s.principal_name,
      'principal_mobile', s.principal_mobile,
      'principal_email', s.principal_email
    ),
    'surveys', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'survey_id', ss.survey_id,
        'status', ss.status,
        'survey_date', ss.survey_date,
        'submitted_at', ss.submitted_at
      )), '[]'::jsonb)
      FROM public.school_surveys ss WHERE ss.school_id = p_school_id
    )
  ) INTO result
  FROM public.schools s
  WHERE s.id = p_school_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Get schools by village
CREATE OR REPLACE FUNCTION public.get_schools_by_village(p_village TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'survey_id', ss.survey_id,
      'school_name', ss.school_name,
      'village', ss.village,
      'status', ss.status,
      'survey_date', ss.survey_date
    )), '[]'::jsonb)
    FROM public.school_surveys ss
    WHERE ss.village ILIKE '%' || p_village || '%'
  );
END;
$$;

-- Get schools by panchayat
CREATE OR REPLACE FUNCTION public.get_schools_by_panchayat(p_panchayat TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'survey_id', ss.survey_id,
      'school_name', ss.school_name,
      'panchayat', ss.panchayat,
      'village', ss.village,
      'status', ss.status,
      'survey_date', ss.survey_date
    )), '[]'::jsonb)
    FROM public.school_surveys ss
    WHERE ss.panchayat ILIKE '%' || p_panchayat || '%'
  );
END;
$$;

-- Get schools by block
CREATE OR REPLACE FUNCTION public.get_schools_by_block(p_block TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'survey_id', ss.survey_id,
      'school_name', ss.school_name,
      'block', ss.block,
      'panchayat', ss.panchayat,
      'village', ss.village,
      'status', ss.status
    )), '[]'::jsonb)
    FROM public.school_surveys ss
    WHERE ss.block ILIKE '%' || p_block || '%'
  );
END;
$$;

-- Get schools by district
CREATE OR REPLACE FUNCTION public.get_schools_by_district(p_district TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'survey_id', ss.survey_id,
      'school_name', ss.school_name,
      'district', ss.district,
      'block', ss.block,
      'panchayat', ss.panchayat,
      'village', ss.village,
      'status', ss.status
    )), '[]'::jsonb)
    FROM public.school_surveys ss
    WHERE ss.district ILIKE '%' || p_district || '%'
  );
END;
$$;

-- Search survey responses (full-text JSONB search)
CREATE OR REPLACE FUNCTION public.search_survey_responses(p_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'survey_id', ss.survey_id,
      'school_name', ss.school_name,
      'village', ss.village,
      'status', ss.status,
      'match_context', ss.responses::text
    )), '[]'::jsonb)
    FROM public.school_surveys ss
    WHERE ss.responses::text ILIKE '%' || p_query || '%'
       OR ss.school_name ILIKE '%' || p_query || '%'
       OR ss.village ILIKE '%' || p_query || '%'
       OR ss.survey_id ILIKE '%' || p_query || '%'
    LIMIT 50
  );
END;
$$;

-- Get AI analysis for a survey
CREATE OR REPLACE FUNCTION public.get_school_ai_analysis(p_survey_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'survey_id', ss.survey_id,
    'school_name', ss.school_name,
    'analysis', jsonb_build_object(
      'summary', ai.summary,
      'key_findings', ai.key_findings,
      'critical_issues', ai.critical_issues,
      'infrastructure_analysis', ai.infrastructure_analysis,
      'teacher_analysis', ai.teacher_analysis,
      'student_analysis', ai.student_analysis,
      'requirement_analysis', ai.requirement_analysis,
      'recommendations', ai.recommendations,
      'priority', ai.priority,
      'risk_flags', ai.risk_flags,
      'generated_at', ai.generated_at,
      'model', ai.model,
      'analysis_version', ai.analysis_version
    )
  ) INTO result
  FROM public.school_surveys ss
  LEFT JOIN public.ai_analysis ai ON ai.survey_id = ss.id AND ai.is_latest = true
  WHERE ss.survey_id = p_survey_id OR ss.id = p_survey_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- ==========================================================================
-- 14. MIGRATION HELPER: Convert old survey_responses → school_surveys
-- ==========================================================================
-- This function migrates data from the old schema to the new hybrid schema.
-- It reads from survey_responses + all child tables and builds the JSONB response.

CREATE OR REPLACE FUNCTION public.migrate_old_surveys()
RETURNS TABLE(migrated_count INTEGER, errors TEXT[])
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  old_survey RECORD;
  new_responses JSONB;
  school_rec RECORD;
  error_list TEXT[] := '{}';
  count_migrated INTEGER := 0;
BEGIN
  FOR old_survey IN 
    SELECT sr.*, s.name as school_name, s.village, s.gram_panchayat, 
           s.panchayat_samiti, s.udise_code, s.school_code,
           s.principal_name, s.principal_mobile, s.principal_email
    FROM public.survey_responses sr
    JOIN public.schools s ON sr.school_id = s.id
  LOOP
    BEGIN
      -- Build the complete JSONB response from old data
      new_responses := jsonb_build_object(
        'section_00_school_profile', jsonb_build_object(
          'school_name', jsonb_build_object('question_text', 'विद्यालय का नाम', 'answer', old_survey.school_name, 'type', 'text'),
          'village', jsonb_build_object('question_text', 'राजस्व गाँव', 'answer', old_survey.village, 'type', 'text'),
          'gram_panchayat', jsonb_build_object('question_text', 'ग्राम पंचायत', 'answer', old_survey.gram_panchayat, 'type', 'text'),
          'panchayat_samiti', jsonb_build_object('question_text', 'पंचायत समिति', 'answer', old_survey.panchayat_samiti, 'type', 'text'),
          'udise_code', jsonb_build_object('question_text', 'UDISE CODE', 'answer', old_survey.udise_code, 'type', 'text'),
          'school_code', jsonb_build_object('question_text', 'विद्यालय कोड', 'answer', old_survey.school_code, 'type', 'text'),
          'principal_name', jsonb_build_object('question_text', 'संस्थाप्रधान का नाम', 'answer', old_survey.principal_name, 'type', 'text'),
          'principal_mobile', jsonb_build_object('question_text', 'मोबाइल नंबर', 'answer', old_survey.principal_mobile, 'type', 'tel'),
          'principal_email', jsonb_build_object('question_text', 'ईमेल', 'answer', old_survey.principal_email, 'type', 'email')
        ),
        'section_03_staff', jsonb_build_object(
          'q7', jsonb_build_object(
            'question_text', 'विद्यालय में पदवार संस्थापन सूचना',
            'type', 'table',
            'answer', (
              SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'post_name', sp.post_name, 'sanctioned', sp.sanctioned,
                'working', sp.working, 'vacant', sp.vacant, 'remarks', sp.remarks
              )), '[]'::jsonb)
              FROM public.staff_positions sp WHERE sp.survey_id = old_survey.id
            )
          ),
          'q8', jsonb_build_object(
            'question_text', 'विद्यालय में कार्यरत कार्मिकों की सूचना',
            'type', 'table',
            'answer', (
              SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'name', sm.name, 'staff_id', sm.staff_id,
                'post', sm.post, 'subject', sm.subject,
                'mobile', sm.mobile, 'email', sm.email
              )), '[]'::jsonb)
              FROM public.staff_members sm WHERE sm.survey_id = old_survey.id
            )
          )
        ),
        'section_04_enrollment', jsonb_build_object(
          'q28', jsonb_build_object(
            'question_text', 'कक्षावार विद्यार्थियों का नामांकन',
            'type', 'table',
            'answer', (
              SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'class_name', se.class_name, 'boys', se.boys,
                'girls', se.girls, 'total', se.total
              )), '[]'::jsonb)
              FROM public.student_enrollment se WHERE se.survey_id = old_survey.id
            )
          )
        ),
        'section_11_students', jsonb_build_object(
          'q29', jsonb_build_object(
            'question_text', 'पालनहार योजना में लाभान्वित छात्र',
            'type', 'table',
            'answer', (
              SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'student_name', ps.student_name, 'class_name', ps.class_name,
                'palanhar_number', ps.palanhar_number, 'palanhar_category', ps.palanhar_category
              )), '[]'::jsonb)
              FROM public.palanhar_students ps WHERE ps.survey_id = old_survey.id
            )
          ),
          'q30', jsonb_build_object(
            'question_text', 'दिव्यांग छात्रों का विवरण',
            'type', 'table',
            'answer', (
              SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'student_name', ds.student_name, 'class_name', ds.class_name,
                'disability_type', ds.disability_type, 'percentage', ds.percentage,
                'certificate_number', ds.certificate_number
              )), '[]'::jsonb)
              FROM public.disabled_students ds WHERE ds.survey_id = old_survey.id
            )
          ),
          'q31', jsonb_build_object(
            'question_text', 'खिलाड़ी छात्रों का विवरण',
            'type', 'table',
            'answer', (
              SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'student_name', pls.student_name, 'class_name', pls.class_name,
                'sport', pls.sport, 'level', pls.level
              )), '[]'::jsonb)
              FROM public.player_students pls WHERE pls.survey_id = old_survey.id
            )
          ),
          'q32', jsonb_build_object(
            'question_text', 'Scout Guide / NCC',
            'type', 'table',
            'answer', (
              SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'student_name', sn.student_name, 'class_name', sn.class_name,
                'level', sn.level, 'details', sn.details
              )), '[]'::jsonb)
              FROM public.scout_ncc_students sn WHERE sn.survey_id = old_survey.id
            )
          )
        ),
        'section_13_committees', jsonb_build_object(
          'q36', jsonb_build_object(
            'question_text', 'विद्यालय विकास प्रबंधन स्थिति',
            'type', 'table',
            'answer', (
              SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'committee_type', cm.committee_type, 'name', cm.name,
                'post', cm.post, 'mobile', cm.mobile,
                'occupation', cm.occupation, 'tenure', cm.tenure
              )), '[]'::jsonb)
              FROM public.committee_members cm WHERE cm.survey_id = old_survey.id
            )
          ),
          'q37', jsonb_build_object(
            'question_text', 'सरपंच और वार्ड पंच की सूचना',
            'type', 'table',
            'answer', (
              SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'member_type', pm.member_type, 'name', pm.name,
                'mobile', pm.mobile, 'ward_number', pm.ward_number
              )), '[]'::jsonb)
              FROM public.panchayat_members pm WHERE pm.survey_id = old_survey.id
            )
          )
        ),
        'section_14_exams', jsonb_build_object(
          'q39', jsonb_build_object(
            'question_text', 'पिछले वर्ष का परीक्षा परिणाम',
            'type', 'table',
            'answer', (
              SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'class_name', er.class_name, 'first_div', er.first_div,
                'second_div', er.second_div, 'third_div', er.third_div,
                'total', er.total
              )), '[]'::jsonb)
              FROM public.exam_results er WHERE er.survey_id = old_survey.id
            )
          )
        ),
        'section_15_requirements', jsonb_build_object(
          'q40', jsonb_build_object(
            'question_text', 'अन्य आवश्यक सुविधाओं की मांग',
            'type', 'table',
            'answer', (
              SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'name', sr2.name, 'category', sr2.category,
                'description', sr2.description, 'quantity', sr2.quantity,
                'unit', sr2.unit, 'priority', sr2.priority,
                'estimated_cost', sr2.estimated_cost, 'location', sr2.location,
                'details', sr2.details
              )), '[]'::jsonb)
              FROM public.school_requirements sr2 WHERE sr2.survey_id = old_survey.id
            )
          )
        ),
        -- Merge the old survey_data JSONB (contains Q1-Q40 flat keys)
        'survey_data_legacy', COALESCE(old_survey.survey_data::jsonb, '{}'::jsonb)
      );

      -- Insert into new table
      INSERT INTO public.school_surveys (
        id, survey_id, school_id, school_name, village, panchayat, block,
        udise_code, survey_date, submitted_by, status, current_section,
        responses, submitted_at, created_at, updated_at
      ) VALUES (
        old_survey.id,
        'SUR-' || LPAD((nextval('survey_id_seq'))::text, 4, '0'),
        old_survey.school_id,
        old_survey.school_name,
        old_survey.village,
        old_survey.gram_panchayat,
        old_survey.panchayat_samiti,
        old_survey.udise_code,
        COALESCE(old_survey.submitted_at::date, old_survey.created_at::date),
        old_survey.submitted_by,
        old_survey.status,
        old_survey.current_section,
        new_responses,
        old_survey.submitted_at,
        old_survey.created_at,
        old_survey.updated_at
      )
      ON CONFLICT (id) DO NOTHING;
      
      count_migrated := count_migrated + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_list := array_append(error_list, 
        'Survey ' || old_survey.id || ': ' || SQLERRM);
    END;
  END LOOP;
  
  migrated_count := count_migrated;
  errors := error_list;
  RETURN NEXT;
END;
$$;
