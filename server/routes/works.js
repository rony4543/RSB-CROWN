const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun } = require('../db/database');

router.get('/', (req, res) => {
  try {
    const { status, priority, category, school_id, search, page = 1, limit = 20 } = req.query;
    let query = `SELECT w.*, s.name as school_name, s.village, s.udise_code FROM works w JOIN schools s ON w.school_id = s.id WHERE 1=1`;
    const params = [];
    if (status) { query += ' AND w.status = ?'; params.push(status); }
    if (priority) { query += ' AND w.priority = ?'; params.push(priority); }
    if (category) { query += ' AND w.category = ?'; params.push(category); }
    if (school_id) { query += ' AND w.school_id = ?'; params.push(school_id); }
    if (search) { query += ' AND (w.title LIKE ? OR s.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY w.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page)-1)*parseInt(limit));
    const works = dbAll(query, params);

    let cq = 'SELECT COUNT(*) as total FROM works w JOIN schools s ON w.school_id = s.id WHERE 1=1';
    const cp = [];
    if (status) { cq += ' AND w.status = ?'; cp.push(status); }
    if (priority) { cq += ' AND w.priority = ?'; cp.push(priority); }
    if (category) { cq += ' AND w.category = ?'; cp.push(category); }
    const t = dbGet(cq, cp);
    res.json({ works, total: t ? t.total : 0 });
  } catch (err) { console.error(err); res.status(500).json({ error: 'त्रुटि हुई।' }); }
});

router.put('/:id', (req, res) => {
  try {
    const { status, assigned_department, assigned_person, remarks } = req.body;
    const w = dbGet('SELECT * FROM works WHERE id = ?', [req.params.id]);
    if (!w) return res.status(404).json({ error: 'कार्य नहीं मिला।' });
    dbRun(`UPDATE works SET status=?, assigned_department=?, assigned_person=?, remarks=?, updated_at=datetime('now') WHERE id=?`,
      [status || w.status, assigned_department || w.assigned_department, assigned_person || w.assigned_person, remarks || w.remarks, req.params.id]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'त्रुटि हुई।' }); }
});

module.exports = router;
