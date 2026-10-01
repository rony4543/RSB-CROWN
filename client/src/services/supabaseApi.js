import { supabase } from './supabase';

// ============================================
// HELPER: Generate UUID
// ============================================
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'uuid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

// ============================================
// HELPER: Generate Error Reference ID
// ============================================
function generateErrorRef() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ERR-${date}-${rand}`;
}

export const supabaseApi = {
  // ============================================
  // SURVEYS
  // ============================================
  async createSurvey(school) {
    let schoolId = generateId();

    // Get current user for user_id association
    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch (_) { /* ignore if auth not available */ }

    // Enforce: one account = one active survey
    if (userId) {
      const { data: existingSurvey } = await supabase
        .from('survey_responses')
        .select('id, status')
        .eq('user_id', userId)
        .in('status', ['draft', 'submitted'])
        .maybeSingle();

      if (existingSurvey) {
        throw new Error('एक अकाउंट से केवल एक ही स्कूल का फॉर्म भरा जा सकता है। कृपया नए स्कूल के लिए नया अकाउंट बनाएं।');
      }
    }

    // Check if school with udise_code already exists
    if (school.udise_code) {
      const { data: existing } = await supabase
        .from('schools')
        .select('id')
        .eq('udise_code', school.udise_code)
        .maybeSingle();

      if (existing) {
        schoolId = existing.id;
        const { error: updateErr } = await supabase
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
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from('schools').insert({
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
        if (insertErr) throw insertErr;
      }
    } else {
      const { error: insertErr } = await supabase.from('schools').insert({
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
      if (insertErr) throw insertErr;
    }

    const surveyId = generateId();

    const { error: surveyErr } = await supabase.from('survey_responses').insert({
      id: surveyId,
      school_id: schoolId,
      user_id: userId,
      status: 'draft',
      survey_data: {},
      current_section: 0,
    });

    if (surveyErr) throw surveyErr;

    // Audit log
    await supabase.from('survey_audit_logs').insert({
      survey_id: surveyId,
      action: 'created',
      details: JSON.stringify({
        message: 'Survey draft created',
        user_id: userId,
        school_id: schoolId,
        udise_code: school.udise_code || null,
      }),
      user_info: userId,
    }).catch(() => {}); // Audit failure should not block survey creation

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

    const errorRef = generateErrorRef();

    // ============================================
    // STEP 1: Check survey exists and is editable
    // ============================================
    const { data: existingSurvey, error: fetchErr } = await supabase
      .from('survey_responses')
      .select('id, status, school_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existingSurvey) {
      throw new Error('सर्वे नहीं मिला।');
    }

    if (existingSurvey.status === 'submitted') {
      throw new Error('जमा किया गया सर्वे संशोधित नहीं किया जा सकता।');
    }

    // ============================================
    // STEP 2: Update survey_responses (main record)
    // ============================================
    const updatePayload = { updated_at: new Date().toISOString() };
    if (survey_data !== undefined) updatePayload.survey_data = survey_data;
    if (current_section !== undefined) updatePayload.current_section = current_section;

    const { error: updateErr } = await supabase
      .from('survey_responses')
      .update(updatePayload)
      .eq('id', id);

    if (updateErr) {
      console.error(`[${errorRef}] survey_responses update failed:`, updateErr);
      throw new Error(`सर्वे अपडेट में त्रुटि: ${updateErr.message}`);
    }

    // ============================================
    // STEP 3: Update school if provided
    // ============================================
    if (school && existingSurvey.school_id) {
      const { error: schoolErr } = await supabase
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
        .eq('id', existingSurvey.school_id);

      if (schoolErr) {
        console.error(`[${errorRef}] school update failed:`, schoolErr);
        // Non-fatal: school update failure shouldn't block survey save
      }
    }

    // ============================================
    // STEP 4: Sync child tables (with error tracking)
    // ============================================
    const syncTable = async (tableName, rows, mapFn) => {
      if (rows === undefined) return { table: tableName, status: 'skipped' };

      const cleanRows = (rows && rows.length > 0)
        ? rows.map(r => ({ survey_id: id, ...mapFn(r) }))
        : [];

      // DELETE existing rows
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('survey_id', id);

      if (deleteError) {
        console.error(`[${errorRef}] ${tableName} delete failed:`, deleteError);
        return { table: tableName, status: 'delete_failed', error: deleteError.message };
      }

      // INSERT new rows
      if (cleanRows.length > 0) {
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(cleanRows);

        if (insertError) {
          console.error(`[${errorRef}] CRITICAL: ${tableName} insert failed after delete! Lost ${cleanRows.length} rows.`, insertError);
          console.error(`[${errorRef}] Lost data for recovery:`, JSON.stringify(cleanRows).substring(0, 2000));
          return { table: tableName, status: 'insert_failed_after_delete', error: insertError.message, lostRows: cleanRows.length };
        }
      }

      return { table: tableName, status: 'ok', rows: cleanRows.length };
    };

    const syncResults = await Promise.all([
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

    // ============================================
    // STEP 5: Check for failures in child table syncs
    // ============================================
    const failures = syncResults.filter(r => r && r.status && r.status.includes('failed'));
    
    if (failures.length > 0) {
      // Log detailed audit for debugging
      await supabase.from('survey_audit_logs').insert({
        survey_id: id,
        action: 'save_error',
        details: JSON.stringify({
          errorRef,
          message: 'Child table sync failures during save',
          failures: failures.map(f => ({
            table: f.table,
            status: f.status,
            error: f.error,
            lostRows: f.lostRows,
          })),
          section: current_section,
          timestamp: new Date().toISOString(),
        }),
        user_info: (await supabase.auth.getUser().catch(() => ({}))).data?.user?.id || null,
      }).catch(() => {}); // Don't fail on audit log failure

      throw new Error(
        `डेटा सेव करने में ${failures.length} तालिकाओं में त्रुटि हुई। आपका डेटा स्थानीय रूप से सुरक्षित है। संदर्भ: ${errorRef}`
      );
    }

    // ============================================
    // STEP 6: Audit log — successful save
    // ============================================
    await supabase.from('survey_audit_logs').insert({
      survey_id: id,
      action: 'updated',
      details: JSON.stringify({
        section: current_section,
        tablesUpdated: syncResults
          .filter(r => r && r.status === 'ok')
          .map(r => `${r.table}(${r.rows})`),
        timestamp: new Date().toISOString(),
      }),
      user_info: (await supabase.auth.getUser().catch(() => ({}))).data?.user?.id || null,
    }).catch(() => {}); // Don't fail on audit log failure

    return { success: true };
  },

  // ============================================
  // SUBMIT SURVEY — IDEMPOTENT
  // ============================================
  async submitSurvey(id) {
    const errorRef = generateErrorRef();

    // Check current status first (idempotent)
    const { data: currentSurvey, error: fetchErr } = await supabase
      .from('survey_responses')
      .select('id, status, school_id, submitted_at')
      .eq('id', id)
      .single();

    if (fetchErr || !currentSurvey) {
      throw new Error('सर्वे नहीं मिला।');
    }

    // If already submitted, return success (idempotent)
    if (currentSurvey.status === 'submitted') {
      return { 
        success: true, 
        already_submitted: true,
        submitted_at: currentSurvey.submitted_at,
      };
    }

    const submittedAt = new Date().toISOString();

    // Update status to submitted
    const { error: updateErr } = await supabase
      .from('survey_responses')
      .update({
        status: 'submitted',
        submitted_at: submittedAt,
        updated_at: submittedAt,
      })
      .eq('id', id)
      .eq('status', 'draft'); // Only update if still draft (prevents race condition)

    if (updateErr) {
      console.error(`[${errorRef}] submit status update failed:`, updateErr);
      throw new Error(`सर्वे जमा करने में त्रुटि: ${updateErr.message}`);
    }

    // Verify the update actually happened
    const { data: verifiedSurvey } = await supabase
      .from('survey_responses')
      .select('status')
      .eq('id', id)
      .single();

    if (verifiedSurvey?.status !== 'submitted') {
      // Race condition: another request submitted it first
      return { success: true, already_submitted: true, submitted_at: submittedAt };
    }

    // ============================================
    // GENERATE WORKS — IDEMPOTENT
    // Delete existing works first, then create new
    // ============================================
    // Delete any existing works for this survey (idempotent cleanup)
    await supabase.from('works').delete().eq('survey_id', id);

    // Convert requirements to works
    const { data: reqs } = await supabase
      .from('school_requirements')
      .select('*')
      .eq('survey_id', id);

    if (reqs && reqs.length > 0) {
      const works = reqs.map(r => ({
        id: generateId(),
        survey_id: id,
        school_id: currentSurvey.school_id,
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

      const { error: worksErr } = await supabase.from('works').insert(works);
      if (worksErr) {
        console.error(`[${errorRef}] Works generation failed (non-fatal):`, worksErr);
        // Works generation failure should not un-submit the survey
      }
    }

    // Audit log
    await supabase.from('survey_audit_logs').insert({
      survey_id: id,
      action: 'submitted',
      details: JSON.stringify({
        message: 'Survey submitted successfully',
        submitted_at: submittedAt,
        works_generated: reqs?.length || 0,
        errorRef,
        timestamp: new Date().toISOString(),
      }),
      user_info: (await supabase.auth.getUser().catch(() => ({}))).data?.user?.id || null,
    }).catch(() => {});

    return { success: true, submitted_at: submittedAt };
  },

  async deleteSurvey(id) {
    // Check if survey is submitted — don't allow deletion
    const { data: survey } = await supabase
      .from('survey_responses')
      .select('status')
      .eq('id', id)
      .single();

    if (survey?.status === 'submitted') {
      throw new Error('जमा किए गए सर्वे को हटाया नहीं जा सकता।');
    }

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

  // ============================================
  // DIAGNOSTICS
  // ============================================
  async getDiagnosticLogs(params = {}) {
    const { limit = 100, type } = params;
    
    let query = supabase
      .from('survey_audit_logs')
      .select('*, survey_responses(school_id, schools(name))')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('action', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async health() {
    return { status: 'ok', supabase: true };
  },
};
