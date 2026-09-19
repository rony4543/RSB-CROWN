-- JANKALI School Survey — SQLite Schema
-- All tables for the digital survey system

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============================================
-- SCHOOLS
-- ============================================
CREATE TABLE IF NOT EXISTS schools (
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SURVEY RESPONSES
-- ============================================
CREATE TABLE IF NOT EXISTS survey_responses (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft','submitted','reviewed')),
  survey_data TEXT DEFAULT '{}',
  current_section INTEGER DEFAULT 0,
  submitted_at DATETIME,
  submitted_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- ============================================
-- STAFF POSITIONS (Q7)
-- ============================================
CREATE TABLE IF NOT EXISTS staff_positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  post_name TEXT NOT NULL,
  sanctioned TEXT DEFAULT 'नहीं',
  working TEXT DEFAULT 'नहीं',
  vacant TEXT DEFAULT 'नहीं',
  remarks TEXT,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- STAFF MEMBERS (Q8)
-- ============================================
CREATE TABLE IF NOT EXISTS staff_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  name TEXT NOT NULL,
  staff_id TEXT,
  post TEXT,
  subject TEXT,
  mobile TEXT,
  email TEXT,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- STUDENT ENROLLMENT (Q28)
-- ============================================
CREATE TABLE IF NOT EXISTS student_enrollment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  boys INTEGER DEFAULT 0,
  girls INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- PALANHAR STUDENTS (Q29)
-- ============================================
CREATE TABLE IF NOT EXISTS palanhar_students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  student_name TEXT,
  class_name TEXT,
  palanhar_number TEXT,
  palanhar_category TEXT,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- DISABLED STUDENTS (Q30)
-- ============================================
CREATE TABLE IF NOT EXISTS disabled_students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  student_name TEXT,
  class_name TEXT,
  disability_type TEXT,
  percentage TEXT,
  certificate_number TEXT,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- PLAYER STUDENTS (Q31)
-- ============================================
CREATE TABLE IF NOT EXISTS player_students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  student_name TEXT,
  class_name TEXT,
  sport TEXT,
  level TEXT,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- SCOUT/NCC STUDENTS (Q32)
-- ============================================
CREATE TABLE IF NOT EXISTS scout_ncc_students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  student_name TEXT,
  class_name TEXT,
  level TEXT,
  details TEXT,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- LABS (Q14)
-- ============================================
CREATE TABLE IF NOT EXISTS labs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  lab_type TEXT NOT NULL,
  available INTEGER DEFAULT 0,
  condition TEXT,
  details TEXT,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- LAB REQUIREMENTS (Q15)
-- ============================================
CREATE TABLE IF NOT EXISTS lab_requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  lab_type TEXT,
  equipment TEXT,
  quantity INTEGER DEFAULT 0,
  condition TEXT,
  details TEXT,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- COMMITTEE MEMBERS (Q36, Q38)
-- ============================================
CREATE TABLE IF NOT EXISTS committee_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  committee_type TEXT,
  name TEXT,
  post TEXT,
  mobile TEXT,
  occupation TEXT,
  tenure TEXT,
  details TEXT,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- PANCHAYAT MEMBERS (Q37)
-- ============================================
CREATE TABLE IF NOT EXISTS panchayat_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  member_type TEXT CHECK(member_type IN ('sarpanch','ward_panch')),
  name TEXT,
  mobile TEXT,
  ward_number TEXT,
  details TEXT,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- EXAM RESULTS (Q39)
-- ============================================
CREATE TABLE IF NOT EXISTS exam_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  class_name TEXT,
  first_div INTEGER DEFAULT 0,
  second_div INTEGER DEFAULT 0,
  third_div INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- SCHOOL REQUIREMENTS (Q40 + auto-generated)
-- ============================================
CREATE TABLE IF NOT EXISTS school_requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  name TEXT,
  category TEXT,
  description TEXT,
  quantity TEXT,
  unit TEXT,
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('high','medium','low')),
  estimated_cost TEXT,
  location TEXT,
  details TEXT,
  question_number TEXT,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- WORKS (Problem → Work Conversion)
-- ============================================
CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL,
  school_id TEXT NOT NULL,
  requirement_id INTEGER,
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id),
  FOREIGN KEY (school_id) REFERENCES schools(id),
  FOREIGN KEY (requirement_id) REFERENCES school_requirements(id)
);

-- ============================================
-- ATTACHMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  question_number TEXT,
  file_name TEXT,
  file_path TEXT,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS survey_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  survey_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  user_info TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES survey_responses(id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_schools_udise ON schools(udise_code);
CREATE INDEX IF NOT EXISTS idx_schools_village ON schools(village);
CREATE INDEX IF NOT EXISTS idx_surveys_school ON survey_responses(school_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON survey_responses(status);
CREATE INDEX IF NOT EXISTS idx_works_school ON works(school_id);
CREATE INDEX IF NOT EXISTS idx_works_status ON works(status);
CREATE INDEX IF NOT EXISTS idx_works_priority ON works(priority);
CREATE INDEX IF NOT EXISTS idx_attachments_survey ON attachments(survey_id);
