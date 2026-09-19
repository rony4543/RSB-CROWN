import { supabase } from './supabase';

// Helper to generate UUID
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'uuid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

export const supabaseApi = {
  // ============================================
  // SURVEYS
  // ============================================
  async createSurvey(school) {
    let schoolId = generateId();

    // Check if school with udise_code already exists
    if (school.udise_code) {
      const { data: existing } = await supabase
        .from('schools')
        .select('id')
        .eq('udise_code', school.udise_code)
        .maybeSingle();

      if (existing) {
        schoolId = existing.id;
        await supabase
          .from('schools')
          .update({
            name: school.name,
            village: school.village,
            gram_panchayat: school.gram_panchayat,
            panchayat_samiti: school.panchayat_samiti,
            school_code: school.school_code || '',
            principal_name: school.principal_name,
            principal_mobile: school.principal_mobile,
            principal_email: school.principal_email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', schoolId);
      } else {
        await supabase.from('schools').insert({
          id: schoolId,
          name: school.name,
          village: school.village,
          gram_panchayat: school.gram_panchayat,
          panchayat_samiti: school.panchayat_samiti,
          udise_code: school.udise_code,
          school_code: school.school_code || '',
          principal_name: school.principal_name,
          principal_mobile: school.principal_mobile,
          principal_email: school.principal_email,
        });
      }
    } else {
      await supabase.from('schools').insert({
        id: schoolId,
        name: school.name,
        village: school.village,
        gram_panchayat: school.gram_panchayat,
        panchayat_samiti: school.panchayat_samiti,
        school_code: school.school_code || '',
        principal_name: school.principal_name,
        principal_mobile: school.principal_mobile,
        principal_email: school.principal_email,
      });
    }

    const surveyId = generateId();
    const { error: surveyErr } = await supabase.from('survey_responses').insert({
      id: surveyId,
      school_id: schoolId,
      status: 'draft',
      survey_data: {},
      current_section: 0,
    });

    if (surveyErr) throw surveyErr;

    // Audit log
    await supabase.from('survey_audit_logs').insert({
      survey_id: surveyId,
      action: 'created',
      details: 'Survey draft created',
    });

    return { surveyId, schoolId };
  },

  async getSurveys(params = {}) {
    const { status, search, village, page = 1, limit = 20 } = params;

    let query = supabase
      .from('survey_responses')
      .select('*, schools!inner(*)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }
    if (village) {
      query = query.ilike('schools.village', `%${village}%`);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,udise_code.ilike.%${search}%,village.ilike.%${search}%`, { foreignTable: 'schools' });
    }

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    const { data, count, error } = await query
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const surveys = (data || []).map(row => ({
      ...row,
      school_name: row.schools?.name,
      village: row.schools?.village,
      gram_panchayat: row.schools?.gram_panchayat,
      panchayat_samiti: row.schools?.panchayat_samiti,
      udise_code: row.schools?.udise_code,
      school_code: row.schools?.school_code,
      principal_name: row.schools?.principal_name,
      principal_mobile: row.schools?.principal_mobile,
    }));

    return {
      surveys,
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  },

  async getSurvey(id) {
    const { data: survey, error } = await supabase
      .from('survey_responses')
      .select('*, schools(*)')
      .eq('id', id)
      .single();

    if (error || !survey) throw new Error(error?.message || 'सर्वे नहीं मिला।');

    // Fetch related tables in parallel
    const [
      { data: staff_positions },
      { data: staff_members },
      { data: student_enrollment },
      { data: palanhar_students },
      { data: disabled_students },
      { data: player_students },
      { data: scout_ncc_students },
      { data: labs },
      { data: lab_requirements },
      { data: committee_members },
      { data: panchayat_members },
      { data: exam_results },
      { data: requirements },
      { data: works },
      { data: attachments },
    ] = await Promise.all([
      supabase.from('staff_positions').select('*').eq('survey_id', id),
      supabase.from('staff_members').select('*').eq('survey_id', id),
      supabase.from('student_enrollment').select('*').eq('survey_id', id),
      supabase.from('palanhar_students').select('*').eq('survey_id', id),
      supabase.from('disabled_students').select('*').eq('survey_id', id),
      supabase.from('player_students').select('*').eq('survey_id', id),
      supabase.from('scout_ncc_students').select('*').eq('survey_id', id),
      supabase.from('labs').select('*').eq('survey_id', id),
      supabase.from('lab_requirements').select('*').eq('survey_id', id),
      supabase.from('committee_members').select('*').eq('survey_id', id),
      supabase.from('panchayat_members').select('*').eq('survey_id', id),
      supabase.from('exam_results').select('*').eq('survey_id', id),
      supabase.from('school_requirements').select('*').eq('survey_id', id),
      supabase.from('works').select('*').eq('survey_id', id),
      supabase.from('attachments').select('*').eq('survey_id', id),
    ]);

    return {
      ...survey,
      school_name: survey.schools?.name,
      village: survey.schools?.village,
      gram_panchayat: survey.schools?.gram_panchayat,
      panchayat_samiti: survey.schools?.panchayat_samiti,
      udise_code: survey.schools?.udise_code,
      school_code: survey.schools?.school_code,
      principal_name: survey.schools?.principal_name,
      principal_mobile: survey.schools?.principal_mobile,
      principal_email: survey.schools?.principal_email,
      survey_data: survey.survey_data || {},
      staff_positions: staff_positions || [],
      staff_members: staff_members || [],
      student_enrollment: student_enrollment || [],
      palanhar_students: palanhar_students || [],
      disabled_students: disabled_students || [],
      player_students: player_students || [],
      scout_ncc_students: scout_ncc_students || [],
      labs: labs || [],
      lab_requirements: lab_requirements || [],
      committee_members: committee_members || [],
      panchayat_members: panchayat_members || [],
      exam_results: exam_results || [],
      requirements: requirements || [],
      works: works || [],
      attachments: attachments || [],
    };
  },

  async updateSurvey(id, data) {
    const {
      survey_data, current_section, school, staff_positions, staff_members,
      student_enrollment, palanhar_students, disabled_students, player_students,
      scout_ncc_students, labs, lab_requirements, committee_members, panchayat_members,
      exam_results, requirements
    } = data;

    // 1. Update survey response
    const updatePayload = { updated_at: new Date().toISOString() };
    if (survey_data !== undefined) updatePayload.survey_data = survey_data;
    if (current_section !== undefined) updatePayload.current_section = current_section;

    await supabase
      .from('survey_responses')
      .update(updatePayload)
      .eq('id', id);

    // 2. Update school if provided
    if (school) {
      const { data: survey } = await supabase
        .from('survey_responses')
        .select('school_id')
        .eq('id', id)
        .single();

      if (survey?.school_id) {
        await supabase
          .from('schools')
          .update({
            name: school.name,
            village: school.village,
            gram_panchayat: school.gram_panchayat,
            panchayat_samiti: school.panchayat_samiti,
            udise_code: school.udise_code,
            school_code: school.school_code || '',
            principal_name: school.principal_name,
            principal_mobile: school.principal_mobile,
            principal_email: school.principal_email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', survey.school_id);
      }
    }

    // 3. Helper to sync child tables
    const syncTable = async (tableName, rows, mapFn) => {
      if (rows === undefined) return;
      await supabase.from(tableName).delete().eq('survey_id', id);
      if (rows && rows.length > 0) {
        const cleanRows = rows.map(r => ({ survey_id: id, ...mapFn(r) }));
        await supabase.from(tableName).insert(cleanRows);
      }
    };

    await Promise.all([
      syncTable('staff_positions', staff_positions, r => ({
        post_name: r.post_name,
        sanctioned: String(r.sanctioned || ''),
        working: String(r.working || ''),
        vacant: String(r.vacant || ''),
        remarks: r.remarks || '',
      })),
      syncTable('staff_members', staff_members, r => ({
        name: r.name,
        staff_id: r.staff_id || '',
        post: r.post || '',
        subject: r.subject || '',
        mobile: r.mobile || '',
        email: r.email || '',
      })),
      syncTable('student_enrollment', student_enrollment, r => ({
        class_name: r.class_name,
        boys: parseInt(r.boys) || 0,
        girls: parseInt(r.girls) || 0,
        total: parseInt(r.total) || 0,
      })),
      syncTable('palanhar_students', palanhar_students, r => ({
        student_name: r.student_name,
        class_name: r.class_name || '',
        palanhar_number: r.palanhar_number || '',
        palanhar_category: r.palanhar_category || '',
      })),
      syncTable('disabled_students', disabled_students, r => ({
        student_name: r.student_name,
        class_name: r.class_name || '',
        disability_type: r.disability_type || '',
        percentage: r.percentage || '',
        certificate_number: r.certificate_number || '',
      })),
      syncTable('player_students', player_students, r => ({
        student_name: r.student_name,
        class_name: r.class_name || '',
        sport: r.sport || '',
        level: r.level || '',
      })),
      syncTable('scout_ncc_students', scout_ncc_students, r => ({
        student_name: r.student_name,
        class_name: r.class_name || '',
        level: r.level || '',
        details: r.details || '',
      })),
      syncTable('labs', labs, r => ({
        lab_type: r.lab_type,
        available: parseInt(r.available) || 0,
        condition: r.condition || '',
        details: r.details || '',
      })),
      syncTable('lab_requirements', lab_requirements, r => ({
        lab_type: r.lab_type,
        equipment: r.equipment,
        quantity: parseInt(r.quantity) || 0,
        condition: r.condition || '',
        details: r.details || '',
      })),
      syncTable('committee_members', committee_members, r => ({
        committee_type: r.committee_type || '',
        name: r.name,
        post: r.post || '',
        mobile: r.mobile || '',
        occupation: r.occupation || '',
        tenure: r.tenure || '',
        details: r.details || '',
      })),
      syncTable('panchayat_members', panchayat_members, r => ({
        member_type: r.member_type || 'ward_panch',
        name: r.name,
        mobile: r.mobile || '',
        ward_number: r.ward_number || '',
        details: r.details || '',
      })),
      syncTable('exam_results', exam_results, r => ({
        class_name: r.class_name,
        first_div: parseInt(r.first_div) || 0,
        second_div: parseInt(r.second_div) || 0,
        third_div: parseInt(r.third_div) || 0,
        total: parseInt(r.total) || 0,
      })),
      syncTable('school_requirements', requirements, r => ({
        name: r.name,
        category: r.category || '',
        description: r.description || '',
        quantity: r.quantity || '',
        unit: r.unit || '',
        priority: r.priority || 'medium',
        estimated_cost: r.estimated_cost || '',
        location: r.location || '',
        details: r.details || '',
        question_number: r.question_number || '',
      })),
    ]);

    return { success: true };
  },

  async submitSurvey(id) {
    const submittedAt = new Date().toISOString();

    const { data: survey, error } = await supabase
      .from('survey_responses')
      .update({
        status: 'submitted',
        submitted_at: submittedAt,
        updated_at: submittedAt,
      })
      .eq('id', id)
      .select('school_id')
      .single();

    if (error) throw error;

    // Convert requirements to works
    const { data: reqs } = await supabase
      .from('school_requirements')
      .select('*')
      .eq('survey_id', id);

    if (reqs && reqs.length > 0) {
      const works = reqs.map(r => ({
        id: generateId(),
        survey_id: id,
        school_id: survey.school_id,
        requirement_id: r.id,
        question_number: r.question_number || '',
        category: r.category || '',
        title: r.name || 'आवश्यकता कार्य',
        problem: r.description || '',
        requirement: r.name || '',
        quantity: r.quantity || '',
        unit: r.unit || '',
        priority: r.priority || 'medium',
        estimated_cost: r.estimated_cost || '',
        status: 'pending',
      }));

      await supabase.from('works').insert(works);
    }

    // Audit log
    await supabase.from('survey_audit_logs').insert({
      survey_id: id,
      action: 'submitted',
      details: 'Survey submitted successfully',
    });

    return { success: true, submitted_at: submittedAt };
  },

  async deleteSurvey(id) {
    const { error } = await supabase
      .from('survey_responses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  // ============================================
  // SCHOOLS
  // ============================================
  async getSchools(params = {}) {
    let query = supabase.from('schools').select('*');
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,village.ilike.%${params.search}%,udise_code.ilike.%${params.search}%`);
    }
    const { data, error } = await query.order('name');
    if (error) throw error;
    return { schools: data || [] };
  },

  async getSchool(id) {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // ============================================
  // WORKS
  // ============================================
  async getWorks(params = {}) {
    const { status, priority, search, limit = 50 } = params;
    let query = supabase.from('works').select('*, schools(name, village, udise_code)');

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    const works = (data || []).map(w => ({
      ...w,
      school_name: w.schools?.name,
      village: w.schools?.village,
      udise_code: w.schools?.udise_code,
    }));

    return { works };
  },

  async updateWork(id, data) {
    const { error } = await supabase
      .from('works')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // ============================================
  // DASHBOARD STATS
  // ============================================
  async getStats() {
    const [
      { count: totalSchools },
      { count: totalSurveys },
      { count: completedSurveys },
      { count: pendingWorks },
    ] = await Promise.all([
      supabase.from('schools').select('*', { count: 'exact', head: true }),
      supabase.from('survey_responses').select('*', { count: 'exact', head: true }),
      supabase.from('survey_responses').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
      supabase.from('works').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    return {
      totalSchools: totalSchools || 0,
      totalSurveys: totalSurveys || 0,
      completedSurveys: completedSurveys || 0,
      pendingWorks: pendingWorks || 0,
    };
  },

  async getCharts() {
    const { data: surveys } = await supabase
      .from('survey_responses')
      .select('status, created_at');

    const { data: works } = await supabase
      .from('works')
      .select('status, priority, category');

    return {
      surveys: surveys || [],
      works: works || [],
    };
  },

  // ============================================
  // EXPORT
  // ============================================
  async exportSurvey(id) {
    return this.getSurvey(id);
  },

  async exportAllSurveys() {
    const res = await this.getSurveys({ limit: 1000 });
    return res.surveys;
  },

  async exportAllWorks() {
    const res = await this.getWorks({ limit: 1000 });
    return res.works;
  },

  async health() {
    return { status: 'ok', supabase: true };
  },
};
