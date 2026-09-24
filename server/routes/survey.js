const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun, saveDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

// Create new survey (draft)
router.post('/', (req, res) => {
  try {
    const userEmail = req.user?.email || 'unknown';
    
    // Rule: One account = One Survey Form
    const existingSurvey = dbGet('SELECT id FROM survey_responses WHERE submitted_by = ?', [userEmail]);
    if (existingSurvey && userEmail !== 'unknown') {
      return res.status(403).json({ error: 'एक अकाउंट से केवल एक ही स्कूल का फॉर्म भरा जा सकता है। कृपया नए स्कूल के लिए नया अकाउंट बनाएं।' });
    }

    const { school } = req.body;
    let schoolId = uuidv4();

    const existingSchool = school.udise_code
      ? dbGet('SELECT id FROM schools WHERE udise_code = ?', [school.udise_code])
      : null;

    if (existingSchool) {
      schoolId = existingSchool.id;
      dbRun(`UPDATE schools SET name=?, village=?, gram_panchayat=?, panchayat_samiti=?,
        school_code=?, principal_name=?, principal_mobile=?, principal_email=?, updated_at=datetime('now')
        WHERE id=?`,
        [school.name, school.village, school.gram_panchayat, school.panchayat_samiti,
         school.school_code || '', school.principal_name, school.principal_mobile, school.principal_email, schoolId]);
    } else {
      dbRun(`INSERT INTO schools (id, name, village, gram_panchayat, panchayat_samiti, udise_code, school_code, principal_name, principal_mobile, principal_email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [schoolId, school.name, school.village, school.gram_panchayat, school.panchayat_samiti,
         school.udise_code, school.school_code || '', school.principal_name, school.principal_mobile, school.principal_email]);
    }

    const surveyId = uuidv4();
    dbRun(`INSERT INTO survey_responses (id, school_id, status, survey_data, submitted_by) VALUES (?, ?, 'draft', '{}', ?)`,
      [surveyId, schoolId, userEmail]);

    dbRun(`INSERT INTO survey_audit_logs (survey_id, action, details) VALUES (?, 'created', 'Survey draft created')`,
      [surveyId]);

    res.status(201).json({ surveyId, schoolId });
  } catch (err) {
    console.error('Error creating survey:', err);
    res.status(500).json({ error: 'सर्वे बनाने में त्रुटि हुई।' });
  }
});

// Get all surveys
router.get('/', (req, res) => {
  try {
    const { status, search, village, page = 1, limit = 20 } = req.query;
    let query = `SELECT sr.*, s.name as school_name, s.village, s.udise_code, s.gram_panchayat
      FROM survey_responses sr JOIN schools s ON sr.school_id = s.id WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND sr.status = ?'; params.push(status); }
    if (village) { query += ' AND s.village LIKE ?'; params.push(`%${village}%`); }
    if (search) {
      query += ' AND (s.name LIKE ? OR s.udise_code LIKE ? OR s.village LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY sr.updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const surveys = dbAll(query, params);

    let countQuery = `SELECT COUNT(*) as total FROM survey_responses sr JOIN schools s ON sr.school_id = s.id WHERE 1=1`;
    const countParams = [];
    if (status) { countQuery += ' AND sr.status = ?'; countParams.push(status); }
    if (village) { countQuery += ' AND s.village LIKE ?'; countParams.push(`%${village}%`); }
    if (search) {
      countQuery += ' AND (s.name LIKE ? OR s.udise_code LIKE ? OR s.village LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const totalRow = dbGet(countQuery, countParams);

    res.json({ surveys, total: totalRow ? totalRow.total : 0, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Error fetching surveys:', err);
    res.status(500).json({ error: 'सर्वे सूची लाने में त्रुटि हुई।' });
  }
});

// Get single survey with all related data
router.get('/:id', (req, res) => {
  try {
    const survey = dbGet(`SELECT sr.*, s.name as school_name, s.village, s.gram_panchayat,
      s.panchayat_samiti, s.udise_code, s.school_code, s.principal_name, s.principal_mobile, s.principal_email
      FROM survey_responses sr JOIN schools s ON sr.school_id = s.id WHERE sr.id = ?`, [req.params.id]);

    if (!survey) return res.status(404).json({ error: 'सर्वे नहीं मिला।' });

    survey.survey_data = JSON.parse(survey.survey_data || '{}');
    survey.staff_positions = dbAll('SELECT * FROM staff_positions WHERE survey_id = ?', [req.params.id]);
    survey.staff_members = dbAll('SELECT * FROM staff_members WHERE survey_id = ?', [req.params.id]);
    survey.student_enrollment = dbAll('SELECT * FROM student_enrollment WHERE survey_id = ?', [req.params.id]);
    survey.palanhar_students = dbAll('SELECT * FROM palanhar_students WHERE survey_id = ?', [req.params.id]);
    survey.disabled_students = dbAll('SELECT * FROM disabled_students WHERE survey_id = ?', [req.params.id]);
    survey.player_students = dbAll('SELECT * FROM player_students WHERE survey_id = ?', [req.params.id]);
    survey.scout_ncc_students = dbAll('SELECT * FROM scout_ncc_students WHERE survey_id = ?', [req.params.id]);
    survey.labs = dbAll('SELECT * FROM labs WHERE survey_id = ?', [req.params.id]);
    survey.lab_requirements = dbAll('SELECT * FROM lab_requirements WHERE survey_id = ?', [req.params.id]);
    survey.committee_members = dbAll('SELECT * FROM committee_members WHERE survey_id = ?', [req.params.id]);
    survey.panchayat_members = dbAll('SELECT * FROM panchayat_members WHERE survey_id = ?', [req.params.id]);
    survey.exam_results = dbAll('SELECT * FROM exam_results WHERE survey_id = ?', [req.params.id]);
    survey.requirements = dbAll('SELECT * FROM school_requirements WHERE survey_id = ?', [req.params.id]);
    survey.works = dbAll('SELECT * FROM works WHERE survey_id = ?', [req.params.id]);
    survey.attachments = dbAll('SELECT * FROM attachments WHERE survey_id = ?', [req.params.id]);

    res.json(survey);
  } catch (err) {
    console.error('Error fetching survey:', err);
    res.status(500).json({ error: 'सर्वे डेटा लाने में त्रुटि हुई।' });
  }
});

// Update survey (save/autosave)
router.put('/:id', (req, res) => {
  try {
    const { survey_data, current_section, school, staff_positions, staff_members,
      student_enrollment, palanhar_students, disabled_students, player_students,
      scout_ncc_students, labs, lab_requirements, committee_members, panchayat_members,
      exam_results, requirements } = req.body;

    const survey = dbGet('SELECT * FROM survey_responses WHERE id = ?', [req.params.id]);
    if (!survey) return res.status(404).json({ error: 'सर्वे नहीं मिला।' });

    if (school) {
      dbRun(`UPDATE schools SET name=?, village=?, gram_panchayat=?, panchayat_samiti=?,
        udise_code=?, school_code=?, principal_name=?, principal_mobile=?, principal_email=?, updated_at=datetime('now')
        WHERE id=?`,
        [school.name, school.village, school.gram_panchayat, school.panchayat_samiti,
         school.udise_code, school.school_code || '', school.principal_name, school.principal_mobile, school.principal_email,
         survey.school_id]);
    }

    if (survey_data) {
      dbRun(`UPDATE survey_responses SET survey_data=?, current_section=?, updated_at=datetime('now') WHERE id=?`,
        [JSON.stringify(survey_data), current_section || 0, req.params.id]);
    }

    // Helper to replace related data
    const replaceRelated = (table, data, insertSql, mapRow) => {
      if (data !== undefined) {
        dbRun(`DELETE FROM ${table} WHERE survey_id = ?`, [req.params.id]);
        if (data && data.length > 0) {
          data.forEach(row => dbRun(insertSql, mapRow(row)));
        }
      }
    };

    replaceRelated('staff_positions', staff_positions,
      'INSERT INTO staff_positions (survey_id, post_name, sanctioned, working, vacant, remarks) VALUES (?,?,?,?,?,?)',
      r => [req.params.id, r.post_name, r.sanctioned||'', r.working||'', r.vacant||'', r.remarks||'']);

    replaceRelated('staff_members', staff_members,
      'INSERT INTO staff_members (survey_id, name, staff_id, post, subject, mobile, email) VALUES (?,?,?,?,?,?,?)',
      r => [req.params.id, r.name, r.staff_id||'', r.post, r.subject, r.mobile, r.email]);

    replaceRelated('student_enrollment', student_enrollment,
      'INSERT INTO student_enrollment (survey_id, class_name, boys, girls, total) VALUES (?,?,?,?,?)',
      r => [req.params.id, r.class_name, r.boys||0, r.girls||0, r.total||0]);

    replaceRelated('palanhar_students', palanhar_students,
      'INSERT INTO palanhar_students (survey_id, student_name, class_name, palanhar_number, palanhar_category) VALUES (?,?,?,?,?)',
      r => [req.params.id, r.student_name, r.class_name, r.palanhar_number, r.palanhar_category]);

    replaceRelated('disabled_students', disabled_students,
      'INSERT INTO disabled_students (survey_id, student_name, class_name, disability_type, percentage, certificate_number) VALUES (?,?,?,?,?,?)',
      r => [req.params.id, r.student_name, r.class_name, r.disability_type, r.percentage, r.certificate_number]);

    replaceRelated('player_students', player_students,
      'INSERT INTO player_students (survey_id, student_name, class_name, sport, level) VALUES (?,?,?,?,?)',
      r => [req.params.id, r.student_name, r.class_name, r.sport, r.level]);

    replaceRelated('scout_ncc_students', scout_ncc_students,
      'INSERT INTO scout_ncc_students (survey_id, student_name, class_name, level, details) VALUES (?,?,?,?,?)',
      r => [req.params.id, r.student_name, r.class_name, r.level, r.details]);

    replaceRelated('labs', labs,
      'INSERT INTO labs (survey_id, lab_type, available, condition, details) VALUES (?,?,?,?,?)',
      r => [req.params.id, r.lab_type, r.available?1:0, r.condition, r.details]);

    replaceRelated('lab_requirements', lab_requirements,
      'INSERT INTO lab_requirements (survey_id, lab_type, equipment, quantity, condition, details) VALUES (?,?,?,?,?,?)',
      r => [req.params.id, r.lab_type, r.equipment, r.quantity||0, r.condition, r.details]);

    replaceRelated('committee_members', committee_members,
      'INSERT INTO committee_members (survey_id, committee_type, name, post, mobile, occupation, tenure, details) VALUES (?,?,?,?,?,?,?,?)',
      r => [req.params.id, r.committee_type, r.name, r.post, r.mobile, r.occupation, r.tenure, r.details]);

    replaceRelated('panchayat_members', panchayat_members,
      'INSERT INTO panchayat_members (survey_id, member_type, name, mobile, ward_number, details) VALUES (?,?,?,?,?,?)',
      r => [req.params.id, r.member_type, r.name, r.mobile, r.ward_number, r.details]);

    replaceRelated('exam_results', exam_results,
      'INSERT INTO exam_results (survey_id, class_name, first_div, second_div, third_div, total) VALUES (?,?,?,?,?,?)',
      r => [req.params.id, r.class_name, r.first_div||0, r.second_div||0, r.third_div||0, r.total||0]);

    replaceRelated('school_requirements', requirements,
      'INSERT INTO school_requirements (survey_id, name, category, description, quantity, unit, priority, estimated_cost, location, details, question_number) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      r => [req.params.id, r.name, r.category, r.description, r.quantity, r.unit, r.priority||'medium', r.estimated_cost, r.location, r.details, r.question_number]);

    dbRun('INSERT INTO survey_audit_logs (survey_id, action, details) VALUES (?, ?, ?)',
      [req.params.id, 'updated', `Section ${current_section || 'unknown'} updated`]);

    res.json({ success: true, message: 'सर्वे सफलतापूर्वक सेव किया गया।' });
  } catch (err) {
    console.error('Error updating survey:', err);
    res.status(500).json({ error: 'सर्वे सेव करने में त्रुटि हुई।' });
  }
});

// Submit survey
router.put('/:id/submit', (req, res) => {
  try {
    const survey = dbGet('SELECT * FROM survey_responses WHERE id = ?', [req.params.id]);
    if (!survey) return res.status(404).json({ error: 'सर्वे नहीं मिला।' });
    if (survey.status === 'submitted') return res.status(400).json({ error: 'यह सर्वे पहले ही जमा हो चुका है।' });

    dbRun(`UPDATE survey_responses SET status='submitted', submitted_at=datetime('now'), updated_at=datetime('now') WHERE id=?`,
      [req.params.id]);

    generateWorks(req.params.id, survey.school_id);

    dbRun('INSERT INTO survey_audit_logs (survey_id, action, details) VALUES (?, ?, ?)',
      [req.params.id, 'submitted', 'Survey submitted']);

    res.json({ success: true, message: 'सर्वे सफलतापूर्वक जमा किया गया।' });
  } catch (err) {
    console.error('Error submitting survey:', err);
    res.status(500).json({ error: 'सर्वे जमा करने में त्रुटि हुई।' });
  }
});

// Delete draft
router.delete('/:id', (req, res) => {
  try {
    const survey = dbGet('SELECT * FROM survey_responses WHERE id = ?', [req.params.id]);
    if (!survey) return res.status(404).json({ error: 'सर्वे नहीं मिला।' });
    if (survey.status === 'submitted') return res.status(400).json({ error: 'जमा किए गए सर्वे को हटाया नहीं जा सकता।' });

    const tables = ['staff_positions','staff_members','student_enrollment','palanhar_students',
      'disabled_students','player_students','scout_ncc_students','labs','lab_requirements',
      'committee_members','panchayat_members','exam_results','school_requirements','works',
      'attachments','survey_audit_logs'];
    tables.forEach(t => dbRun(`DELETE FROM ${t} WHERE survey_id = ?`, [req.params.id]));
    dbRun('DELETE FROM survey_responses WHERE id = ?', [req.params.id]);

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting survey:', err);
    res.status(500).json({ error: 'सर्वे हटाने में त्रुटि हुई।' });
  }
});

function generateWorks(surveyId, schoolId) {
  const surveyRow = dbGet('SELECT survey_data FROM survey_responses WHERE id = ?', [surveyId]);
  const surveyData = JSON.parse(surveyRow?.survey_data || '{}');
  const worksToCreate = [];

  if (surveyData.q16 === 'नहीं') {
    worksToCreate.push({ question: 'Q16/Q17', category: 'चारदीवारी', title: 'चारदीवारी निर्माण', problem: 'चारदीवारी नहीं है', quantity: surveyData.q17_meters || '', unit: 'मीटर' });
  }
  if (surveyData.q21 === 'नहीं') {
    worksToCreate.push({ question: 'Q21/Q22', category: 'सड़क', title: 'सड़क मार्ग निर्माण', problem: 'सड़क मार्ग उपलब्ध नहीं है', quantity: surveyData.q22_distance || '', unit: 'किलोमीटर' });
  }
  if (surveyData.q23_available === 'नहीं') {
    worksToCreate.push({ question: 'Q23', category: 'शौचालय', title: 'शौचालय निर्माण', problem: 'शौचालय उपलब्ध नहीं है' });
  }
  if (surveyData.q24 === 'नहीं') {
    worksToCreate.push({ question: 'Q24', category: 'शौचालय', title: 'शौचालय जल कनेक्शन', problem: 'शौचालय में जल कनेक्शन नहीं है' });
  }
  if (surveyData.q25 === 'नहीं') {
    worksToCreate.push({ question: 'Q25', category: 'पेयजल', title: 'पेयजल व्यवस्था', problem: 'पेयजल स्रोत उपलब्ध नहीं है' });
  }
  if (surveyData.q11_electricity === 'नहीं') {
    worksToCreate.push({ question: 'Q11', category: 'बिजली', title: 'बिजली कनेक्शन', problem: 'बिजली कनेक्शन उपलब्ध नहीं है' });
  }
  if (surveyData.q13_internet === 'नहीं') {
    worksToCreate.push({ question: 'Q13', category: 'इंटरनेट', title: 'इंटरनेट कनेक्शन', problem: 'इंटरनेट कनेक्शन नहीं है' });
  }
  if (surveyData.q33 === 'नहीं') {
    worksToCreate.push({ question: 'Q33', category: 'स्मार्ट क्लासरूम', title: 'Smart Classroom स्थापना', problem: 'स्मार्ट क्लासरूम उपलब्ध नहीं है' });
  }
  if (surveyData.q27 === 'नहीं') {
    worksToCreate.push({ question: 'Q27', category: 'भवन', title: 'रेन शेड निर्माण', problem: 'रेन शेड उपलब्ध नहीं है' });
  }

  const reqs = dbAll('SELECT * FROM school_requirements WHERE survey_id = ?', [surveyId]);
  reqs.forEach(r => {
    worksToCreate.push({
      question: r.question_number || 'Q40', category: r.category || 'अन्य',
      title: r.name || 'आवश्यकता', problem: r.description,
      quantity: r.quantity, unit: r.unit, priority: r.priority,
      estimated_cost: r.estimated_cost, requirement_id: r.id
    });
  });

  worksToCreate.forEach(w => {
    dbRun(`INSERT INTO works (id, survey_id, school_id, requirement_id, question_number, category, title, problem, requirement, quantity, unit, priority, estimated_cost, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [uuidv4(), surveyId, schoolId, w.requirement_id || null, w.question, w.category, w.title,
       w.problem || '', w.requirement || '', w.quantity || '', w.unit || '', w.priority || 'medium', w.estimated_cost || '']);
  });
}

module.exports = router;
