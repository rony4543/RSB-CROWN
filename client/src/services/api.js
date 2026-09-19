import { supabaseApi } from './supabaseApi';

// Set to true to use Supabase cloud database directly
const USE_SUPABASE = true;
const API_BASE = 'http://localhost:3001/api';

async function fetchApi(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || 'Request failed');
  }
  return response.json();
}

export const api = {
  // Surveys
  createSurvey: async (school) => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.createSurvey(school);
      } catch (err) {
        console.warn('Supabase createSurvey error, falling back to server API:', err);
      }
    }
    return fetchApi('/surveys', { method: 'POST', body: JSON.stringify({ school }) });
  },

  getSurveys: async (params = {}) => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.getSurveys(params);
      } catch (err) {
        console.warn('Supabase getSurveys error, falling back to server API:', err);
      }
    }
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/surveys?${qs}`);
  },

  getSurvey: async (id) => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.getSurvey(id);
      } catch (err) {
        console.warn('Supabase getSurvey error, falling back to server API:', err);
      }
    }
    return fetchApi(`/surveys/${id}`);
  },

  updateSurvey: async (id, data) => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.updateSurvey(id, data);
      } catch (err) {
        console.warn('Supabase updateSurvey error, falling back to server API:', err);
      }
    }
    return fetchApi(`/surveys/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  submitSurvey: async (id) => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.submitSurvey(id);
      } catch (err) {
        console.warn('Supabase submitSurvey error, falling back to server API:', err);
      }
    }
    return fetchApi(`/surveys/${id}/submit`, { method: 'PUT' });
  },

  deleteSurvey: async (id) => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.deleteSurvey(id);
      } catch (err) {
        console.warn('Supabase deleteSurvey error, falling back to server API:', err);
      }
    }
    return fetchApi(`/surveys/${id}`, { method: 'DELETE' });
  },

  // Schools
  getSchools: async (params = {}) => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.getSchools(params);
      } catch (err) {
        console.warn('Supabase getSchools error, falling back to server API:', err);
      }
    }
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/schools?${qs}`);
  },

  getSchool: async (id) => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.getSchool(id);
      } catch (err) {
        console.warn('Supabase getSchool error, falling back to server API:', err);
      }
    }
    return fetchApi(`/schools/${id}`);
  },

  // Works
  getWorks: async (params = {}) => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.getWorks(params);
      } catch (err) {
        console.warn('Supabase getWorks error, falling back to server API:', err);
      }
    }
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/works?${qs}`);
  },

  updateWork: async (id, data) => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.updateWork(id, data);
      } catch (err) {
        console.warn('Supabase updateWork error, falling back to server API:', err);
      }
    }
    return fetchApi(`/works/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  // Dashboard
  getStats: async () => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.getStats();
      } catch (err) {
        console.warn('Supabase getStats error, falling back to server API:', err);
      }
    }
    return fetchApi('/dashboard/stats');
  },

  getCharts: async () => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.getCharts();
      } catch (err) {
        console.warn('Supabase getCharts error, falling back to server API:', err);
      }
    }
    return fetchApi('/dashboard/charts');
  },

  // Export
  exportSurvey: async (id) => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.exportSurvey(id);
      } catch (err) {
        console.warn('Supabase exportSurvey error:', err);
      }
    }
    return fetchApi(`/export/survey/${id}`);
  },

  exportAllSurveys: async () => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.exportAllSurveys();
      } catch (err) {
        console.warn('Supabase exportAllSurveys error:', err);
      }
    }
    return fetchApi('/export/surveys/all');
  },

  exportAllWorks: async () => {
    if (USE_SUPABASE) {
      try {
        return await supabaseApi.exportAllWorks();
      } catch (err) {
        console.warn('Supabase exportAllWorks error:', err);
      }
    }
    return fetchApi('/export/works/all');
  },

  // Health
  health: async () => {
    if (USE_SUPABASE) {
      return supabaseApi.health();
    }
    return fetchApi('/health');
  },
};

