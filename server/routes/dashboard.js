const express = require('express');
const router = express.Router();
const { dbGet } = require('../db/database');

router.get('/stats', (req, res) => {
  try {
    res.json({
      totalSchools: dbGet('SELECT COUNT(*) as c FROM schools')?.c || 0,
      totalSurveys: dbGet('SELECT COUNT(*) as c FROM survey_responses')?.c || 0,
      completedSurveys: dbGet("SELECT COUNT(*) as c FROM survey_responses WHERE status='submitted'")?.c || 0,
      pendingSurveys: dbGet("SELECT COUNT(*) as c FROM survey_responses WHERE status='draft'")?.c || 0,
      totalWorks: dbGet('SELECT COUNT(*) as c FROM works')?.c || 0,
      pendingWorks: dbGet("SELECT COUNT(*) as c FROM works WHERE status='pending'")?.c || 0,
      inProgressWorks: dbGet("SELECT COUNT(*) as c FROM works WHERE status='in_progress'")?.c || 0,
      completedWorks: dbGet("SELECT COUNT(*) as c FROM works WHERE status='completed'")?.c || 0,
      totalRequirements: dbGet('SELECT COUNT(*) as c FROM school_requirements')?.c || 0,
      highPriorityReqs: dbGet("SELECT COUNT(*) as c FROM school_requirements WHERE priority='high'")?.c || 0
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'त्रुटि हुई।' }); }
});

router.get('/charts', (req, res) => {
  try {
    const { dbAll } = require('../db/database');
    res.json({
      schoolsByVillage: dbAll('SELECT village, COUNT(*) as count FROM schools WHERE village IS NOT NULL AND village != "" GROUP BY village ORDER BY count DESC LIMIT 10'),
      surveysByStatus: dbAll('SELECT status, COUNT(*) as count FROM survey_responses GROUP BY status'),
      worksByCategory: dbAll('SELECT category, COUNT(*) as count FROM works GROUP BY category ORDER BY count DESC'),
      worksByPriority: dbAll('SELECT priority, COUNT(*) as count FROM works GROUP BY priority'),
      worksByStatus: dbAll('SELECT status, COUNT(*) as count FROM works GROUP BY status'),
      reqsByCategory: dbAll('SELECT category, COUNT(*) as count FROM school_requirements GROUP BY category ORDER BY count DESC')
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'त्रुटि हुई।' }); }
});

module.exports = router;
