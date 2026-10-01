require('dotenv').config({ path: __dirname + '/../.env' });
const { createClient } = require('@supabase/supabase-js');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Service Role Key in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function migrateData() {
  console.log("🚀 Starting Data Migration: SQLite -> Supabase");
  
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'jankali_survey.db');
  
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Local database not found at ${dbPath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);
  
  // 1. Verify destination tables exist
  const { error: checkErr } = await supabase.from('school_surveys').select('id').limit(1);
  if (checkErr) {
    console.error("❌ ERROR: Destination tables not found in Supabase!");
    console.error("Please run master_schema.sql in the Supabase SQL Editor first.");
    console.error("Error details:", checkErr.message);
    process.exit(1);
  }

  // Helper to fetch from sqlite
  const fetchTable = (table) => {
    try {
      const stmt = db.prepare(`SELECT * FROM ${table}`);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    } catch (err) {
      console.warn(`⚠️ Could not fetch from ${table}: ${err.message}`);
      return [];
    }
  };

  const oldSurveys = fetchTable('survey_responses');
  const oldSchools = fetchTable('schools');
  
  console.log(`📊 Found ${oldSurveys.length} surveys and ${oldSchools.length} schools to migrate.\n`);
  
  // In our new schema, we just use `migrate_old_surveys` function if we loaded the old data.
  // But wait! The `migrate_old_surveys` function in Postgres expects the old tables (survey_responses, etc.) to exist in Postgres!
  // Since they don't exist in Postgres, we have to construct the new format in Node.js, OR insert into the old tables in Supabase and run the function.
  
  // Let's copy all old tables to Supabase as they are, then run the Postgres migration function.
  const tablesToCopy = [
    'schools',
    'survey_responses',
    'staff_positions',
    'staff_members',
    'student_enrollment',
    'palanhar_students',
    'disabled_students',
    'player_students',
    'scout_ncc_students',
    'labs',
    'lab_requirements',
    'committee_members',
    'panchayat_members',
    'exam_results',
    'school_requirements',
    'works',
    'attachments',
    'survey_audit_logs'
  ];

  for (const table of tablesToCopy) {
    const rows = fetchTable(table);
    if (rows.length === 0) {
      console.log(`⏭️  Skipping ${table} (0 rows)`);
      continue;
    }

    console.log(`⏳ Uploading ${rows.length} rows to ${table}...`);
    // Supabase allows inserting arrays of objects
    // We process in batches of 100 to avoid request size limits
    const BATCH_SIZE = 100;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from(table).upsert(batch);
      if (error) {
        console.error(`❌ Error inserting into ${table}:`, error.message);
      }
    }
    console.log(`✅ Uploaded ${table}`);
  }

  // Now run the migration function that we created in master_schema.sql
  console.log("\n⏳ Running Postgres migration function (migrate_old_surveys)...");
  const { data: migrationResult, error: migErr } = await supabase.rpc('migrate_old_surveys');
  
  if (migErr) {
    console.error("❌ Migration function failed:", migErr.message);
  } else {
    console.log("✅ Migration completed successfully!");
    console.log(migrationResult);
  }
  
  console.log("\n🎉 All local SQLite data has been synced to Supabase!");
  db.close();
}

migrateData().catch(console.error);
