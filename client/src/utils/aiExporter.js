import { api } from '../services/api';

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

export async function downloadSurveysAsJson() {
  const response = await api.exportFullDatabase();
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([JSON.stringify(response.surveys, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `school_surveys_full_${dateStr}.json`);
}

export async function downloadSurveysAsCsv() {
  const response = await api.exportFullDatabase();
  const surveys = response.surveys || [];
  const dateStr = new Date().toISOString().split('T')[0];

  if (surveys.length === 0) {
    alert('कोई डेटा उपलब्ध नहीं है।');
    return;
  }

  // 1. Define base columns (User/School/Meta info)
  const baseColumns = [
    'Survey ID',
    'Status',
    'Created At',
    'Submitted At',
    'Submitted By (User)',
    'School Name',
    'UDISE Code',
    'School Code',
    'Village',
    'Gram Panchayat',
    'Panchayat Samiti',
    'Principal Name',
    'Principal Mobile',
    'Principal Email',
  ];

  // 2. Discover all dynamic keys from survey_data across ALL surveys
  const dynamicKeysSet = new Set();
  surveys.forEach(s => {
    if (s.survey_data && typeof s.survey_data === 'object') {
      Object.keys(s.survey_data).forEach(key => dynamicKeysSet.add(key));
    }
  });
  
  // Sort dynamic keys alphabetically for consistency
  const dynamicKeys = Array.from(dynamicKeysSet).sort();

  // 3. Build Header Row
  const csvHeaders = [...baseColumns, ...dynamicKeys];

  // 4. Build Data Rows
  const csvRows = surveys.map(s => {
    const row = [
      escapeCsv(s.id),
      escapeCsv(s.status),
      escapeCsv(s.created_at),
      escapeCsv(s.submitted_at),
      escapeCsv(s.submitted_by || '—'),
      escapeCsv(s.school_name),
      escapeCsv(s.udise_code),
      escapeCsv(s.school_code),
      escapeCsv(s.village),
      escapeCsv(s.gram_panchayat),
      escapeCsv(s.panchayat_samiti),
      escapeCsv(s.principal_name),
      escapeCsv(s.principal_mobile),
      escapeCsv(s.principal_email),
    ];

    // Append dynamic data
    const sData = s.survey_data || {};
    dynamicKeys.forEach(key => {
      let val = sData[key];
      // If it's an array or object, stringify it
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      row.push(escapeCsv(val));
    });

    return row.join(',');
  });

  const csvContent = '\uFEFF' + [csvHeaders.join(','), ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `school_surveys_full_database_${dateStr}.csv`);
}
