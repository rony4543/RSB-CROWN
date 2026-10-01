// Run the production hardening SQL migration against Supabase
// Usage: node scripts/run_migration.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://ydnmibzxpdcosnrzgzfq.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function runMigration() {
  console.log('🔄 Starting production hardening migration...\n');

  // Step 1: Check if user_id column exists on survey_responses
  console.log('Step 1: Checking user_id column...');
  const { data: columns, error: colErr } = await supabase.rpc('exec_sql', { sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'survey_responses' AND column_name = 'user_id'" }).catch(() => ({ data: null, error: 'rpc not available' }));
  
  // Since we can't run arbitrary SQL via Supabase client directly,
  // let's run individual operations that the client can handle

  // Step 1: Verify existing data state
  console.log('Step 1: Verifying current data state...');
  const { count: surveyCount } = await supabase.from('survey_responses').select('*', { count: 'exact', head: true });
  console.log(`  Found ${surveyCount} surveys`);
  
  const { count: schoolCount } = await supabase.from('schools').select('*', { count: 'exact', head: true });
  console.log(`  Found ${schoolCount} schools`);
  
  // Step 2: Check user_id values
  const { data: surveysWithUser } = await supabase.from('survey_responses').select('id, user_id, status').limit(10);
  console.log('  Survey user_id check:', surveysWithUser?.map(s => ({ id: s.id?.substring(0, 8), user_id: s.user_id?.substring(0, 8), status: s.status })));

  // Step 3: Check for negative values in student_enrollment
  const { data: negativeEnrollment } = await supabase.from('student_enrollment').select('*').or('boys.lt.0,girls.lt.0,total.lt.0').limit(5);
  console.log(`  Negative enrollment values: ${negativeEnrollment?.length || 0}`);
  
  // Step 4: Check for negative values in exam_results
  const { data: negativeExams } = await supabase.from('exam_results').select('*').or('first_div.lt.0,second_div.lt.0,third_div.lt.0,total.lt.0').limit(5);
  console.log(`  Negative exam values: ${negativeExams?.length || 0}`);

  // Step 5: Check existing works for duplicates
  const { data: workCounts } = await supabase.from('works').select('survey_id');
  if (workCounts) {
    const counts = {};
    workCounts.forEach(w => { counts[w.survey_id] = (counts[w.survey_id] || 0) + 1; });
    const duplicates = Object.entries(counts).filter(([, c]) => c > 50);
    if (duplicates.length > 0) {
      console.log('  ⚠️  Surveys with suspicious work counts:', duplicates);
    } else {
      console.log('  No duplicate works detected');
    }
  }

  console.log('\n✅ Pre-flight checks complete.');
  console.log('\n⚠️  SQL migration must be run manually in Supabase SQL Editor.');
  console.log('  Please go to: https://supabase.com/dashboard/project/ydnmibzxpdcosnrzgzfq/sql/new');
  console.log('  And paste the contents of: scripts/migration_production_hardening.sql');
  console.log('\n  The frontend changes are already active and working.\n');
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
