import { useSurvey } from '../../context/SurveyContext';
import { EXAM_CLASSES } from '../../utils/constants';
import { useEffect } from 'react';

export default function ExamsSection() {
  const { state, dispatch } = useSurvey();
  const { examResults } = state;
  const errors = state.errors || {};

  const totalEnrolled = (state.studentEnrollment || []).reduce((sum, r) => {
    const b = parseInt(r.boys) || 0;
    const g = parseInt(r.girls) || 0;
    return sum + b + g;
  }, 0);

  // Initialize exam results if empty
  useEffect(() => {
    if (examResults.length === 0) {
      dispatch({ type: 'SET_EXAMS', payload: EXAM_CLASSES.map(c => ({ class_name: c, first_div: '', second_div: '', third_div: '', total: '' })) });
    }
  }, []);

  const handleChange = (idx, field, value) => {
    const updated = examResults.map((row, i) => {
      if (i !== idx) return row;
      return { ...row, [field]: value };
    });
    dispatch({ type: 'SET_EXAMS', payload: updated });
  };

  const schoolType = state.surveyData.q1 || 'उच्च माध्यमिक विद्यालय';
  let maxExams = 4;
  if (schoolType === 'प्राथमिक विद्यालय') maxExams = 1; // Class 5
  else if (schoolType === 'उच्च प्राथमिक विद्यालय') maxExams = 2; // Class 5, 8
  else if (schoolType === 'माध्यमिक विद्यालय') maxExams = 3; // Class 5, 8, 10

  const visibleExams = examResults.slice(0, maxExams);

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q39 | परीक्षा परिणाम</span>
        <h2 className="section-title">परीक्षा परिणाम</h2>
      </div>

      <div className="card">
        <div className="question-block">
          <div className="question-number">Q39</div>
          <div className="question-text">
            पिछले वर्ष का परीक्षा परिणाम (कक्षावार प्रतिशत) दर्ज करें: <span className="required-mark">*</span>
          </div>
          {errors.exams && <div className="field-error" style={{marginBottom: '10px'}}>⚠ {errors.exams}</div>}
          
          <div style={{
            padding: '12px 16px',
            background: 'var(--primary-50)',
            borderRadius: '8px',
            borderLeft: '4px solid var(--primary-500)',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{fontSize: '14px', fontWeight: 600, color: 'var(--primary-900)'}}>
              विद्यालय में कुल विद्यार्थियों की संख्या (नामांकन के आधार पर):
            </span>
            <span style={{fontSize: '18px', fontWeight: 700, color: 'var(--primary-700)'}}>
              {totalEnrolled}
            </span>
          </div>

          <div style={{fontSize: '13px', color: 'var(--gray-600)', marginBottom: '12px'}}>
            कक्षा वार विद्यालय के पिछले वर्ष के परीक्षा परिणाम का विवरण दर्ज करें।
          </div>

          <div className="repeatable-table-wrapper">
            <table className="repeatable-table">
              <thead>
                <tr>
                  <th style={{width: '120px'}}>कक्षा</th>
                  <th>1ST</th>
                  <th>2ND</th>
                  <th>3RD</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {visibleExams.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{fontWeight: 500, padding: '8px 12px'}}>{row.class_name}</td>
                    <td><input type="number" min="0" value={row.first_div ?? ''} onChange={e => handleChange(idx, 'first_div', e.target.value)} /></td>
                    <td><input type="number" min="0" value={row.second_div ?? ''} onChange={e => handleChange(idx, 'second_div', e.target.value)} /></td>
                    <td><input type="number" min="0" value={row.third_div ?? ''} onChange={e => handleChange(idx, 'third_div', e.target.value)} /></td>
                    <td><input type="text" value={row.total ?? ''} onChange={e => handleChange(idx, 'total', e.target.value)} style={{background: '#fff', fontWeight: 600, textAlign: 'center'}} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
