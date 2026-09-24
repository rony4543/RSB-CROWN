const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDbReady, closeDb } = require('./db/database');
const surveyRoutes = require('./routes/survey');
const schoolRoutes = require('./routes/schools');
const worksRoutes = require('./routes/works');
const dashboardRoutes = require('./routes/dashboard');
const exportRoutes = require('./routes/export');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads
const uploadsDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/surveys', requireAuth, surveyRoutes);
app.use('/api/schools', requireAuth, schoolRoutes);
app.use('/api/works', requireAuth, worksRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/export', requireAuth, exportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Initialize DB then start server
getDbReady().then(() => {
  app.listen(PORT, () => {
    console.log(`🏫 JANKALI Survey Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});

// Cleanup
process.on('SIGINT', () => {
  closeDb();
  process.exit(0);
});

module.exports = app;
