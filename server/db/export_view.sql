-- ==========================================================================
-- JANKALI School Survey — Unified Export View
-- Run this in the Supabase SQL Editor
-- ==========================================================================

CREATE OR REPLACE VIEW public.v_survey_export WITH (security_invoker = on) AS
SELECT 
  sr.id AS survey_id,
  sr.status,
  sr.submitted_at,
  s.name AS school_name,
  s.village,
  s.gram_panchayat,
  s.panchayat_samiti,
  s.udise_code,
  s.school_code,
  s.principal_name,
  s.principal_mobile,
  s.principal_email,
  
  -- The flat survey data JSON (General questions)
  sr.survey_data,

  -- ==========================================
  -- AGGREGATING CHILD TABLES INTO JSON ARRAYS
  -- ==========================================
  
  (SELECT jsonb_agg(jsonb_build_object(
      'post_name', sp.post_name, 
      'sanctioned', sp.sanctioned, 
      'working', sp.working, 
      'vacant', sp.vacant
    )) FROM staff_positions sp WHERE sp.survey_id = sr.id) AS staff_positions_data,

  (SELECT jsonb_agg(jsonb_build_object(
      'name', sm.name, 
      'post', sm.post, 
      'subject', sm.subject,
      'mobile', sm.mobile
    )) FROM staff_members sm WHERE sm.survey_id = sr.id) AS staff_members_data,

  (SELECT jsonb_agg(jsonb_build_object(
      'class_name', se.class_name, 
      'boys', se.boys, 
      'girls', se.girls, 
      'total', se.total
    )) FROM student_enrollment se WHERE se.survey_id = sr.id) AS enrollment_data,

  (SELECT jsonb_agg(jsonb_build_object(
      'name', ps.student_name, 
      'class', ps.class_name, 
      'category', ps.palanhar_category
    )) FROM palanhar_students ps WHERE ps.survey_id = sr.id) AS palanhar_students_data,

  (SELECT jsonb_agg(jsonb_build_object(
      'name', ds.student_name, 
      'class', ds.class_name, 
      'disability', ds.disability_type
    )) FROM disabled_students ds WHERE ds.survey_id = sr.id) AS disabled_students_data,

  (SELECT jsonb_agg(jsonb_build_object(
      'lab_type', l.lab_type, 
      'available', l.available, 
      'condition', l.condition
    )) FROM labs l WHERE l.survey_id = sr.id) AS labs_data,

  (SELECT jsonb_agg(jsonb_build_object(
      'committee', cm.committee_type, 
      'name', cm.name, 
      'post', cm.post
    )) FROM committee_members cm WHERE cm.survey_id = sr.id) AS committees_data,

  (SELECT jsonb_agg(jsonb_build_object(
      'class', er.class_name, 
      'first_div', er.first_div, 
      'total', er.total
    )) FROM exam_results er WHERE er.survey_id = sr.id) AS exam_results_data,

  (SELECT jsonb_agg(jsonb_build_object(
      'requirement', r.name, 
      'category', r.category, 
      'priority', r.priority, 
      'cost', r.estimated_cost
    )) FROM school_requirements r WHERE r.survey_id = sr.id) AS requirements_data

FROM survey_responses sr
JOIN schools s ON sr.school_id = s.id;
