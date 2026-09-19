const express = require('express');
const router = express.Router();
const { dbAll, dbGet } = require('../db/database');

router.get('/', (req, res) => {
  try {
    const { search, village, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM schools WHERE 1=1';
    const params = [];
    if (search) { query += ' AND (name LIKE ? OR udise_code LIKE ? OR school_code LIKE ? OR village LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }
    if (village) { query += ' AND village LIKE ?'; params.push(`%${village}%`); }
    query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    res.json({ schools: dbAll(query, params) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'त्रुटि हुई।' }); }
});

router.get('/:id', (req, res) => {
  try {
    const school = dbGet('SELECT * FROM schools WHERE id = ?', [req.params.id]);
    if (!school) return res.status(404).json({ error: 'विद्यालय नहीं मिला।' });
    const surveys = dbAll('SELECT * FROM survey_responses WHERE school_id = ? ORDER BY created_at DESC', [req.params.id]);
    const works = dbAll('SELECT * FROM works WHERE school_id = ?', [req.params.id]);
    res.json({ school, surveys, works });
  } catch (err) { console.error(err); res.status(500).json({ error: 'त्रुटि हुई।' }); }
});

module.exports = router;
