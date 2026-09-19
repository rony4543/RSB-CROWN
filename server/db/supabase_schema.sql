-- ==========================================================================
-- JANKALI School Survey — Supabase PostgreSQL Schema
-- Complete Relational Cloud Database Schema with RLS and Indexes
-- ==========================================================================

-- Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. SCHOOLS
-- ============================================
CREATE TABLE IF NOT EXISTS public.schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  village TEXT,
  gram_panchayat TEXT,
  panchayat_samiti TEXT,
  udise_code TEXT UNIQUE,
  school_code TEXT,
  principal_name TEXT,
  principal_mobile TEXT,
  principal_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. SURVEY RESPONSES
-- ============================================
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft','submitted','reviewed')),
  survey_data JSONB DEFAULT '{}'::jsonb,
  current_section INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  submitted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. STAFF POSITIONS (Q7)
-- ============================================
CREATE TABLE IF NOT EXISTS public.staff_positions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  post_name TEXT NOT NULL,
  sanctioned TEXT DEFAULT 'नहीं',
  working TEXT DEFAULT 'नहीं',
  vacant TEXT DEFAULT 'नहीं',
  remarks TEXT
);

-- ============================================
-- 4. STAFF MEMBERS (Q8)
-- ============================================
CREATE TABLE IF NOT EXISTS public.staff_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  staff_id TEXT,
  post TEXT,
  subject TEXT,
  mobile TEXT,
  email TEXT
);

-- ============================================
-- 5. STUDENT ENROLLMENT (Q28)
-- ============================================
CREATE TABLE IF NOT EXISTS public.student_enrollment (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  boys INTEGER DEFAULT 0,
  girls INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0
);

-- ============================================
-- 6. PALANHAR STUDENTS (Q29)
-- ============================================
CREATE TABLE IF NOT EXISTS public.palanhar_students (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  student_name TEXT,
  class_name TEXT,
  palanhar_number TEXT,
  palanhar_category TEXT
);

-- ============================================
-- 7. DISABLED STUDENTS (Q30)
-- ============================================
CREATE TABLE IF NOT EXISTS public.disabled_students (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  student_name TEXT,
  class_name TEXT,
  disability_type TEXT,
  percentage TEXT,
  certificate_number TEXT
);

-- ============================================
-- 8. PLAYER STUDENTS (Q31)
-- ============================================
CREATE TABLE IF NOT EXISTS public.player_students (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  student_name TEXT,
  class_name TEXT,
  sport TEXT,
  level TEXT
);

-- ============================================
-- 9. SCOUT/NCC STUDENTS (Q32)
-- ============================================
CREATE TABLE IF NOT EXISTS public.scout_ncc_students (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  student_name TEXT,
  class_name TEXT,
  level TEXT,
  details TEXT
);

-- ============================================
-- 10. LABS (Q14)
-- ============================================
CREATE TABLE IF NOT EXISTS public.labs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  lab_type TEXT NOT NULL,
  available INTEGER DEFAULT 0,
  condition TEXT,
  details TEXT
);

-- ============================================
-- 11. LAB REQUIREMENTS (Q15)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lab_requirements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  lab_type TEXT,
  equipment TEXT,
  quantity INTEGER DEFAULT 0,
  condition TEXT,
  details TEXT
);

-- ============================================
-- 12. COMMITTEE MEMBERS (Q36, Q38)
-- ============================================
CREATE TABLE IF NOT EXISTS public.committee_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  committee_type TEXT,
  name TEXT,
  post TEXT,
  mobile TEXT,
  occupation TEXT,
  tenure TEXT,
  details TEXT
);

-- ============================================
-- 13. PANCHAYAT MEMBERS (Q37)
-- ============================================
CREATE TABLE IF NOT EXISTS public.panchayat_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  member_type TEXT CHECK(member_type IN ('sarpanch','ward_panch')),
  name TEXT,
  mobile TEXT,
  ward_number TEXT,
  details TEXT
);

-- ============================================
-- 14. EXAM RESULTS (Q39)
-- ============================================
CREATE TABLE IF NOT EXISTS public.exam_results (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  class_name TEXT,
  first_div INTEGER DEFAULT 0,
  second_div INTEGER DEFAULT 0,
  third_div INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0
);

-- ============================================
-- 15. SCHOOL REQUIREMENTS (Q40 + auto-generated)
-- ============================================
CREATE TABLE IF NOT EXISTS public.school_requirements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  name TEXT,
  category TEXT,
  description TEXT,
  quantity TEXT,
  unit TEXT,
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('high','medium','low')),
  estimated_cost TEXT,
  location TEXT,
  details TEXT,
  question_number TEXT
);

-- ============================================
-- 16. WORKS (Problem → Work Conversion)
-- ============================================
CREATE TABLE IF NOT EXISTS public.works (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  requirement_id BIGINT,
  question_number TEXT,
  category TEXT,
  title TEXT NOT NULL,
  problem TEXT,
  requirement TEXT,
  quantity TEXT,
  unit TEXT,
  priority TEXT DEFAULT 'medium',
  estimated_cost TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','cancelled')),
  assigned_department TEXT,
  assigned_person TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 17. ATTACHMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.attachments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_number TEXT,
  file_name TEXT,
  file_path TEXT,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 18. AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.survey_audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id TEXT NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  user_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ============================================
CREATE INDEX IF NOT EXISTS idx_schools_udise ON public.schools(udise_code);
CREATE INDEX IF NOT EXISTS idx_schools_village ON public.schools(village);
CREATE INDEX IF NOT EXISTS idx_surveys_school ON public.survey_responses(school_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.survey_responses(status);
CREATE INDEX IF NOT EXISTS idx_works_school ON public.works(school_id);
CREATE INDEX IF NOT EXISTS idx_works_status ON public.works(status);
CREATE INDEX IF NOT EXISTS idx_attachments_survey ON public.attachments(survey_id);

-- Sub-table foreign key indexes
CREATE INDEX IF NOT EXISTS idx_staff_positions_survey ON public.staff_positions(survey_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_survey ON public.staff_members(survey_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollment_survey ON public.student_enrollment(survey_id);
CREATE INDEX IF NOT EXISTS idx_palanhar_students_survey ON public.palanhar_students(survey_id);
CREATE INDEX IF NOT EXISTS idx_disabled_students_survey ON public.disabled_students(survey_id);
CREATE INDEX IF NOT EXISTS idx_player_students_survey ON public.player_students(survey_id);
CREATE INDEX IF NOT EXISTS idx_scout_ncc_students_survey ON public.scout_ncc_students(survey_id);
CREATE INDEX IF NOT EXISTS idx_labs_survey ON public.labs(survey_id);
CREATE INDEX IF NOT EXISTS idx_lab_requirements_survey ON public.lab_requirements(survey_id);
CREATE INDEX IF NOT EXISTS idx_committee_members_survey ON public.committee_members(survey_id);
CREATE INDEX IF NOT EXISTS idx_panchayat_members_survey ON public.panchayat_members(survey_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_survey ON public.exam_results(survey_id);
CREATE INDEX IF NOT EXISTS idx_school_requirements_survey ON public.school_requirements(survey_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
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
    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    
    -- Drop existing policies if any
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow public read ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow public insert ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow public update ' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'Allow public delete ' || tbl, tbl);

    -- Create permissive public policies for survey application
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true);', 'Allow public read ' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true);', 'Allow public insert ' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);', 'Allow public update ' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO anon, authenticated USING (true);', 'Allow public delete ' || tbl, tbl);
  END LOOP;
END $$;

-- ============================================
-- GRANTS FOR DATA API ACCESS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
