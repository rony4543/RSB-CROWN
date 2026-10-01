import { supabaseApi } from './supabaseApi';

// ============================================
// ERROR REFERENCE ID GENERATOR
// Produces IDs like: SAVE-20260927-A3K9
// ============================================
export function generateErrorRef() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SAVE-${date}-${rand}`;
}

// ============================================
// SAVE ERROR CLASS
// Carries a diagnostic reference ID for tracing
// ============================================
export class SaveError extends Error {
  constructor(message, referenceId, originalError) {
    super(message);
    this.name = 'SaveError';
    this.referenceId = referenceId;
    this.originalError = originalError;
  }
}

// ============================================
// SINGLE-SOURCE API — SUPABASE ONLY
// No silent SQLite fallback. Errors propagate.
// ============================================
export const api = {
  // Surveys
  createSurvey: async (school) => {
    try {
      return await supabaseApi.createSurvey(school);
    } catch (err) {
      const ref = generateErrorRef();
      console.error(`[${ref}] createSurvey failed:`, err);
      throw new SaveError(
        err.message || 'सर्वे बनाने में त्रुटि हुई।',
        ref,
        err
      );
    }
  },

  getSurveys: async (params = {}) => {
    return await supabaseApi.getSurveys(params);
  },

  getSurvey: async (id) => {
    return await supabaseApi.getSurvey(id);
  },

  updateSurvey: async (id, data) => {
    try {
      return await supabaseApi.updateSurvey(id, data);
    } catch (err) {
      const ref = generateErrorRef();
      console.error(`[${ref}] updateSurvey failed for survey ${id}:`, err);
      throw new SaveError(
        err.message || 'सर्वे सेव करने में त्रुटि हुई।',
        ref,
        err
      );
    }
  },

  submitSurvey: async (id) => {
    try {
      return await supabaseApi.submitSurvey(id);
    } catch (err) {
      const ref = generateErrorRef();
      console.error(`[${ref}] submitSurvey failed for survey ${id}:`, err);
      throw new SaveError(
        err.message || 'सर्वे जमा करने में त्रुटि हुई।',
        ref,
        err
      );
    }
  },

  deleteSurvey: async (id) => {
    return await supabaseApi.deleteSurvey(id);
  },

  // Schools
  getSchools: async (params = {}) => {
    return await supabaseApi.getSchools(params);
  },

  getSchool: async (id) => {
    return await supabaseApi.getSchool(id);
  },

  // Works
  getWorks: async (params = {}) => {
    return await supabaseApi.getWorks(params);
  },

  updateWork: async (id, data) => {
    return await supabaseApi.updateWork(id, data);
  },

  // Dashboard
  getStats: async () => {
    return await supabaseApi.getStats();
  },

  getCharts: async () => {
    return await supabaseApi.getCharts();
  },

  // Export
  exportSurvey: async (id) => {
    return await supabaseApi.exportSurvey(id);
  },

  exportAllSurveys: async () => {
    return await supabaseApi.exportAllSurveys();
  },

  exportAllWorks: async () => {
    return await supabaseApi.exportAllWorks();
  },

  // Diagnostics
  getDiagnosticLogs: async (params = {}) => {
    return await supabaseApi.getDiagnosticLogs(params);
  },

  // Health
  health: async () => {
    return supabaseApi.health();
  },
};
