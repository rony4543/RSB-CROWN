import { supabase } from '../services/supabase';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const s = String(val).replace(/"/g, '""');
  return `"${s}"`;
}

export async function fetchAllSurveyDataForAI() {
  const { data: surveys, error: surveyErr } = await supabase
    .from('survey_responses')
    .select('*, schools(*)')
    .order('updated_at', { ascending: false });

  if (surveyErr) throw surveyErr;

  const [{ data: enrollments }, { data: requirements }] = await Promise.all([
    supabase.from('student_enrollment').select('*'),
    supabase.from('school_requirements').select('*'),
  ]);

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

  return (surveys || []).map(s => {
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
}

export async function downloadSurveysAsJson() {
  const data = await fetchAllSurveyDataForAI();
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `school_surveys_ai_${dateStr}.json`);
}

export async function downloadSurveysAsCsv() {
  const richData = await fetchAllSurveyDataForAI();
  const dateStr = new Date().toISOString().split('T')[0];

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
    'Ratio Norm',
    'Required Rooms by Ratio',
    'Additional Rooms Needed',
    'Repairable Buildings Count',
    'Repair Condition Details',
    'Has Dilapidated Buildings',
    'Dilapidated Count',
    'Electricity',
    'Computers Total',
    'Internet',
    'Boundary Wall',
    'Playground',
    'Toilet Available',
    'Drinking Water',
    'Smart Classrooms',
    'Requirements Count',
    'Last Updated',
  ];

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
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `school_surveys_ai_${dateStr}.csv`);
}
