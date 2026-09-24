const express = require('express');
const router = express.Router();
const { dbAll, dbGet } = require('../db/database');

router.get('/survey/:id', (req, res) => {
  try {
    const survey = dbGet(`SELECT sr.*, s.name as school_name, s.village, s.gram_panchayat,
      s.panchayat_samiti, s.udise_code, s.principal_name, s.principal_mobile
      FROM survey_responses sr JOIN schools s ON sr.school_id = s.id WHERE sr.id = ?`, [req.params.id]);
    if (!survey) return res.status(404).json({ error: 'सर्वे नहीं मिला।' });
    survey.survey_data = JSON.parse(survey.survey_data || '{}');
    survey.staff_positions = dbAll('SELECT * FROM staff_positions WHERE survey_id = ?', [req.params.id]);
    survey.staff_members = dbAll('SELECT * FROM staff_members WHERE survey_id = ?', [req.params.id]);
    survey.student_enrollment = dbAll('SELECT * FROM student_enrollment WHERE survey_id = ?', [req.params.id]);
    survey.requirements = dbAll('SELECT * FROM school_requirements WHERE survey_id = ?', [req.params.id]);
    survey.works = dbAll('SELECT * FROM works WHERE survey_id = ?', [req.params.id]);
    res.json(survey);
  } catch (err) { console.error(err); res.status(500).json({ error: 'त्रुटि हुई।' }); }
});

router.get('/surveys/all', (req, res) => {
  try {
    res.json({ surveys: dbAll(`SELECT sr.id, sr.status, sr.submitted_at, sr.created_at,
      s.name as school_name, s.village, s.gram_panchayat, s.udise_code, s.principal_name, s.principal_mobile
      FROM survey_responses sr JOIN schools s ON sr.school_id = s.id ORDER BY sr.created_at DESC`) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'त्रुटि हुई।' }); }
});

router.get('/surveys/full-dump', (req, res) => {
  try {
    // Fetch all surveys with their full JSON data and school details
    const data = dbAll(`
      SELECT sr.*, s.name as school_name, s.village, s.gram_panchayat,
      s.panchayat_samiti, s.udise_code, s.school_code, s.principal_name, 
      s.principal_mobile, s.principal_email
      FROM survey_responses sr 
      JOIN schools s ON sr.school_id = s.id 
      ORDER BY sr.created_at DESC
    `);
    
    // Parse survey_data for each row
    const parsedData = data.map(row => {
      row.survey_data = JSON.parse(row.survey_data || '{}');
      return row;
    });

    res.json({ surveys: parsedData });
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: 'त्रुटि हुई।' }); 
  }
});

router.get('/works/all', (req, res) => {
  try {
    res.json({ works: dbAll(`SELECT w.*, s.name as school_name, s.village, s.udise_code
      FROM works w JOIN schools s ON w.school_id = s.id ORDER BY w.created_at DESC`) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'त्रुटि हुई।' }); }
});

module.exports = router;
