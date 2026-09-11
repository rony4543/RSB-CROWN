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

// Check if a section has all required fields filled
export function isSectionComplete(sectionKey, surveyData, school) {
  switch (sectionKey) {
    case 'school_profile':
      return Object.keys(validateSchoolProfile(school || {})).length === 0;
    case 'academic':
      return !!surveyData.q1;
    case 'enrollment':
      return surveyData.student_enrollment && surveyData.student_enrollment.length > 0;
    default:
      return true; // Most sections are optional
  }
}
