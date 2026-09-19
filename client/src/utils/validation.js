// Validation utilities for the survey

export function validateMobile(value) {
  if (!value) return null;
  const cleaned = value.replace(/\s/g, '');
  if (!/^\d{10}$/.test(cleaned)) {
    return 'मोबाइल नंबर 10 अंकों का होना चाहिए।';
  }
  return null;
}

export function validateEmail(value) {
  if (!value) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'कृपया सही ईमेल दर्ज करें।';
  }
  return null;
}

export function validateUDISE(value) {
  if (!value) return null;
  const cleaned = value.replace(/\s/g, '');
  if (!/^\d{11}$/.test(cleaned)) {
    return 'UDISE CODE 11 अंकों का होना चाहिए।';
  }
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `कृपया ${fieldName} दर्ज करें।`;
  }
  return null;
}

export function validateNonNegative(value) {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    return 'कृपया सही संख्या दर्ज करें (ऋणात्मक नहीं)।';
  }
  return null;
}

export function validateInteger(value) {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return 'कृपया पूर्ण संख्या दर्ज करें।';
  }
  return null;
}

// Validate school profile
export function validateSchoolProfile(school) {
  const errors = {};
  const req = (field, name) => {
    const err = validateRequired(school[field], name);
    if (err) errors[field] = err;
  };
  req('name', 'विद्यालय का नाम');
  req('village', 'राजस्व गाँव');
  req('gram_panchayat', 'ग्राम पंचायत');
  req('panchayat_samiti', 'पंचायत समिति');
  req('principal_name', 'संस्थाप्रधान का नाम');

  const udiseErr = validateUDISE(school.udise_code);
  if (!school.udise_code) errors.udise_code = 'कृपया UDISE CODE दर्ज करें।';
  else if (udiseErr) errors.udise_code = udiseErr;

  const mobileErr = validateMobile(school.principal_mobile);
  if (!school.principal_mobile) errors.principal_mobile = 'कृपया मोबाइल नंबर दर्ज करें।';
  else if (mobileErr) errors.principal_mobile = mobileErr;

  return errors;
}

// Validate a specific survey section
export function validateSection(sectionKey, state) {
  if (sectionKey === 'school_profile') return validateSchoolProfile(state.school);

  const errors = {};
  const d = state.surveyData || {};
  
  const req = (field, message) => {
    const err = validateRequired(d[field], message);
    if (err) errors[field] = err;
  };

  switch (sectionKey) {
    case 'academic':
      req('q1', 'विद्यालय की श्रेणी');
      if (d.q1 === 'उच्च माध्यमिक विद्यालय') {
        const hasFaculties = d.q2 && Object.keys(d.q2).length > 0;
        if (!hasFaculties) errors.q2 = 'कृपया कम से कम एक संकाय और विषय चुनें।';
      }
      break;
    case 'special_status':
      req('q4', 'प्रश्न Q4');
      req('q5', 'प्रश्न Q5');
      req('q6', 'प्रश्न Q6');
      req('q7_skill', 'प्रश्न Q7 (स्किल एक्टिविटी)');
      break;
    case 'staff':
      // Q7 and Q8 are fully optional
      break;
    case 'building':
      req('q9_existing_rooms', 'कुल उपलब्ध कक्ष');
      req('q10_existing', 'पूर्व में उपलब्ध फर्नीचर');
      req('q10_required', 'फर्नीचर की आवश्यकता');
      break;
    case 'electricity':
      req('q11_electricity', 'बिजली कनेक्शन');
      req('q12_total', 'कुल कम्प्यूटर');
      req('q13_internet', 'इंटरनेट कनेक्शन');
      break;
    case 'labs':
      req('q14', 'प्रश्न Q14 (प्रयोगशाला)');
      req('q15', 'प्रश्न Q15 (पर्याप्त संसाधन/उपकरण)');
      break;
    case 'boundary':
      req('q16', 'प्रश्न Q16 (चारदीवारी)');
      break;
    case 'road':
      req('q21', 'प्रश्न Q21 (सड़क से जुड़ाव)');
      req('q22_distance', 'दूरी (किलोमीटर में)');
      break;
    case 'toilet_water':
      req('q23_available', 'प्रश्न Q23 (शौचालय)');
      req('q23b_approved_scheme', 'प्रश्न Q23B (पूर्व योजना में स्वीकृत)');
      req('q24', 'प्रश्न Q24 (शौचालय में नल/जल)');
      req('q25', 'प्रश्न Q25 (पेयजल सुविधा)');
      req('q26_details', 'प्रश्न Q26 (पानी की समस्या)');
      req('q27', 'प्रश्न Q27 (टिन शेड)');
      break;
    case 'enrollment':
      if (!state.studentEnrollment || state.studentEnrollment.length === 0) {
        errors.enrollment = 'कृपया नामांकन विवरण दर्ज करें।';
      }
      break;
    case 'smart_land':
      req('q33', 'प्रश्न Q33 (स्मार्ट क्लासरूम)');
      req('q34_condition', 'प्रश्न Q34 (रास्ते की स्थिति)');
      req('q35_available', 'प्रश्न Q35 (उपलब्ध भूमि)');
      req('q18', 'प्रश्न Q18 (खेल मैदान)');
      req('q19_area', 'अतिक्रमित भूमि (बीघा में)');
      req('q20', 'प्रश्न Q20 (खेल सामग्री)');
      break;
    case 'committees':
      if (!state.committeeMembers || !state.committeeMembers.some(m => m.committee_type === 'vikas_samiti')) {
        errors.q36 = 'कृपया विद्यालय विकास प्रबंधन समिति का कम से कम एक सदस्य जोड़ें।';
      }
      const sarpanch = state.panchayatMembers?.find(m => m.member_type === 'sarpanch');
      if (!sarpanch || !sarpanch.name) {
        errors.q37_sarpanch = 'कृपया सरपंच का नाम दर्ज करें।';
      }
      if (!state.committeeMembers || !state.committeeMembers.some(m => m.committee_type !== 'vikas_samiti')) {
        errors.q38 = 'कृपया SMC/SDMC का कम से कम एक सदस्य जोड़ें।';
      }
      break;
    case 'exams':
      if (!state.examResults || state.examResults.length === 0) {
        errors.exams = 'कृपया परीक्षा परिणाम दर्ज करें।';
      } else {
        const hasData = state.examResults.some(r => r.total || r.first_div || r.second_div || r.third_div);
        if (!hasData) errors.exams = 'कृपया कम से कम एक कक्षा का परीक्षा परिणाम प्रतिशत दर्ज करें।';
      }
      break;
    case 'students':
      req('q32', 'प्रश्न Q32 (Scout Guide / NCC)');
      break;
    // requirements is optional
    default:
      break;
  }

  return errors;
}
