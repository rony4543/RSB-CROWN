const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'jankali_survey.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;
let dbReady = null;

async function initializeDb() {
  const SQL = await initSqlJs();

  // Load existing database or create new
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Run schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.run(schema);

  // Save to disk
  saveDb();
  console.log('✅ Database initialized successfully');
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// Auto-save every 30 seconds
setInterval(() => {
  if (db) saveDb();
}, 30000);

function getDbReady() {
  if (!dbReady) {
    dbReady = initializeDb();
  }
  return dbReady;
}

function getDb() {
  return db;
}

function closeDb() {
  if (db) {
    saveDb();
    db.close();
    db = null;
    dbReady = null;
  }
}

// Helper functions for sql.js (returns objects from queries)
function dbAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function dbGet(sql, params = []) {
  const results = dbAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

function dbRun(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return { changes: db.getRowsModified() };
}

module.exports = { getDbReady, getDb, closeDb, saveDb, dbAll, dbGet, dbRun };
