const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server/.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://ydnmibzxpdcosnrzgzfq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportForAI() {
  console.log('Fetching all school surveys from Supabase...');

  const { data: surveys, error: surveyErr } = await supabase
    .from('survey_responses')
    .select('*, schools(*)')
    .order('updated_at', { ascending: false });

  if (surveyErr) {
    console.error('Error fetching surveys:', surveyErr);
    return;
  }

  // Fetch enrollment and requirements for all surveys
  const { data: enrollments } = await supabase.from('student_enrollment').select('*');
  const { data: requirements } = await supabase.from('school_requirements').select('*');

  // Group by survey_id
  const enrollmentMap = {};
  (enrollments || []).forEach(e => {
    if (!enrollmentMap[e.survey_id]) enrollmentMap[e.survey_id] = [];
    enrollmentMap[e.survey_id].push(e);
  });

  const requirementsMap = {};
  (requirements || []).forEach(r => {
    if (!requirementsMap[r.survey_id]) requirementsMap[r.survey_id] = [];
    requirementsMap[r.survey_id].push(r);
  });

  const outDir = path.join(__dirname, '..', 'ai_exports');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Prepare Rich JSON
  const richData = (surveys || []).map(s => {
    const d = s.survey_data || {};
    const enroll = enrollmentMap[s.id] || [];
    const totalEnrollment = enroll.reduce((acc, row) => acc + (parseInt(row.total) || 0), 0);
    const reqs = requirementsMap[s.id] || [];

    return {
      survey_id: s.id,
      status: s.status,
      last_updated: s.updated_at,
      school: {
        name: s.schools?.name || '—',
        udise_code: s.schools?.udise_code || '—',
        village: s.schools?.village || '—',
        gram_panchayat: s.schools?.gram_panchayat || '—',
        panchayat_samiti: s.schools?.panchayat_samiti || '—',
        principal_name: s.schools?.principal_name || '—',
        principal_mobile: s.schools?.principal_mobile || '—',
      },
      infrastructure_q9: {
        rooms_upto_2023: parseInt(d.q9_rooms_upto_2023) || 0,
        new_rooms_after_2023: parseInt(d.q9_new_rooms_after_2023) || 0,
        total_current_rooms: parseInt(d.q9_existing_rooms) || 0,
        total_enrolled_students: parseInt(d.q9_total_students) || totalEnrollment,
        ratio_norm: '30 students per room',
        ratio_required_rooms: Math.ceil(((parseInt(d.q9_total_students) || totalEnrollment) || 0) / 30),
        ratio_additional_rooms_needed: parseInt(d.q9_additional_rooms) || 0,
        repairable_buildings_count: parseInt(d.q9_repairable_buildings_count) || 0,
        repair_condition_details: d.q9_condition || '—',
      },
      dilapidated_status_q9a: {
        has_dilapidated_buildings: d.q9a_dilapidated || 'नहीं',
        dilapidated_count: parseInt(d.q9a_dilapidated_count) || 0,
        dilapidated_details: d.q9a_dilapidated_details || '—',
      },
      facilities: {
        electricity: d.q11_electricity || '—',
        computers_total: parseInt(d.q12_total) || 0,
        computers_working: parseInt(d.q12_working) || 0,
        internet: d.q13_internet || '—',
        boundary_wall: d.q16 || '—',
        playground: d.q18 || '—',
        road_access: d.q21 || '—',
        road_type: d.q22a_road_type || '—',
        toilet_facility: d.q23_available || '—',
        drinking_water: d.q25 || '—',
        smart_classrooms: d.q33 || '—',
      },
      student_enrollment: enroll.map(e => ({
        class: e.class_name,
        boys: e.boys,
        girls: e.girls,
        total: e.total,
      })),
      requirements: reqs.map(r => ({
        category: r.category,
        name: r.name,
        quantity: r.quantity,
        priority: r.priority,
        estimated_cost: r.estimated_cost,
      })),
    };
  });

  const jsonFile = path.join(outDir, 'school_surveys_for_ai.json');
  fs.writeFileSync(jsonFile, JSON.stringify(richData, null, 2), 'utf-8');
  console.log(`✓ JSON Export created: ${jsonFile} (${richData.length} surveys)`);

  // 2. Prepare Flattened CSV
  const csvHeaders = [
    'Survey ID',
    'Status',
    'School Name',
    'UDISE Code',
    'Village',
    'Gram Panchayat',
    'Panchayat Samiti',
    'Principal Name',
    'Principal Mobile',
    'Rooms Upto 2023',
    'New Rooms After 2023',
    'Total Current Rooms',
    'Total Students',
    'Ratio Norm (Per Room)',
    'Required Rooms by Ratio',
    'Additional Rooms Needed',
    'Repairable Buildings Count',
    'Repair Condition Details',
    'Has Dilapidated Buildings',
    'Dilapidated Buildings Count',
    'Electricity',
    'Computers Total',
    'Computers Working',
    'Internet',
    'Boundary Wall',
    'Playground',
    'Toilet Available',
    'Drinking Water',
    'Smart Classrooms',
    'Total Requirements Count',
    'Last Updated',
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvRows = richData.map(r => [
    escapeCsv(r.survey_id),
    escapeCsv(r.status),
    escapeCsv(r.school.name),
    escapeCsv(r.school.udise_code),
    escapeCsv(r.school.village),
    escapeCsv(r.school.gram_panchayat),
    escapeCsv(r.school.panchayat_samiti),
    escapeCsv(r.school.principal_name),
    escapeCsv(r.school.principal_mobile),
    r.infrastructure_q9.rooms_upto_2023,
    r.infrastructure_q9.new_rooms_after_2023,
    r.infrastructure_q9.total_current_rooms,
    r.infrastructure_q9.total_enrolled_students,
    escapeCsv(r.infrastructure_q9.ratio_norm),
    r.infrastructure_q9.ratio_required_rooms,
    r.infrastructure_q9.ratio_additional_rooms_needed,
    r.infrastructure_q9.repairable_buildings_count,
    escapeCsv(r.infrastructure_q9.repair_condition_details),
    escapeCsv(r.dilapidated_status_q9a.has_dilapidated_buildings),
    r.dilapidated_status_q9a.dilapidated_count,
    escapeCsv(r.facilities.electricity),
    r.facilities.computers_total,
    r.facilities.computers_working,
    escapeCsv(r.facilities.internet),
    escapeCsv(r.facilities.boundary_wall),
    escapeCsv(r.facilities.playground),
    escapeCsv(r.facilities.toilet_facility),
    escapeCsv(r.facilities.drinking_water),
    escapeCsv(r.facilities.smart_classrooms),
    r.requirements.length,
    escapeCsv(r.last_updated),
  ].join(','));

  const csvContent = '\uFEFF' + [csvHeaders.join(','), ...csvRows].join('\n');
  const csvFile = path.join(outDir, 'school_surveys_for_ai.csv');
  fs.writeFileSync(csvFile, csvContent, 'utf-8');
  console.log(`✓ CSV Export created: ${csvFile}`);

  console.log('\n🎉 AI Export complete! Files are saved in ai_exports/ directory.');
}

exportForAI();
