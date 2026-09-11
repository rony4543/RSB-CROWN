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
  createSurvey: (school) => fetchApi('/surveys', { method: 'POST', body: JSON.stringify({ school }) }),
  getSurveys: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/surveys?${qs}`);
  },
  getSurvey: (id) => fetchApi(`/surveys/${id}`),
  updateSurvey: (id, data) => fetchApi(`/surveys/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  submitSurvey: (id) => fetchApi(`/surveys/${id}/submit`, { method: 'PUT' }),
  deleteSurvey: (id) => fetchApi(`/surveys/${id}`, { method: 'DELETE' }),

  // Schools
  getSchools: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/schools?${qs}`);
  },
  getSchool: (id) => fetchApi(`/schools/${id}`),

  // Works
  getWorks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetchApi(`/works?${qs}`);
  },
  updateWork: (id, data) => fetchApi(`/works/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Dashboard
  getStats: () => fetchApi('/dashboard/stats'),
  getCharts: () => fetchApi('/dashboard/charts'),

  // Export
  exportSurvey: (id) => fetchApi(`/export/survey/${id}`),
  exportAllSurveys: () => fetchApi('/export/surveys/all'),
  exportAllWorks: () => fetchApi('/export/works/all'),

  // Health
  health: () => fetchApi('/health'),
};
