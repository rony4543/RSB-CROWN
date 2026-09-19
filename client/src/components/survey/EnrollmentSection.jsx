import { useSurvey } from '../../context/SurveyContext';

export default function EnrollmentSection() {
  const { state, dispatch } = useSurvey();
  const errors = state.errors || {};
  const { studentEnrollment } = state;

  const handleChange = (idx, field, value) => {
    const updated = studentEnrollment.map((row, i) => {
      if (i !== idx) return row;
      const newRow = { ...row, [field]: value };
      // Auto-calc total
      const boys = parseInt(field === 'boys' ? value : newRow.boys) || 0;
      const girls = parseInt(field === 'girls' ? value : newRow.girls) || 0;
      newRow.total = boys + girls;
      return newRow;
    });
    dispatch({ type: 'SET_STUDENT_ENROLLMENT', payload: updated });
  };

  const schoolType = state.surveyData.q1 || 'उच्च माध्यमिक विद्यालय';
  let maxClasses = 12;
  if (schoolType === 'प्राथमिक विद्यालय') maxClasses = 5;
  else if (schoolType === 'उच्च प्राथमिक विद्यालय') maxClasses = 8;
  else if (schoolType === 'माध्यमिक विद्यालय') maxClasses = 10;

  const visibleEnrollment = studentEnrollment.slice(0, maxClasses);

  const totalBoys = visibleEnrollment.reduce((s, r) => s + (parseInt(r.boys) || 0), 0);
  const totalGirls = visibleEnrollment.reduce((s, r) => s + (parseInt(r.girls) || 0), 0);
  const totalStudents = totalBoys + totalGirls;

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q28 | कक्षा वार नामांकन</span>
        <h2 className="section-title">कक्षा वार नामांकन</h2>
        <p className="section-description">कुल = छात्र + छात्रा (स्वचालित गणना)</p>
      </div>

      <div className="card">
        <div className="question-block">
          <div className="question-number">Q28</div>
          <div className="question-text">कक्षावार विद्यार्थियों का नामांकन (Enrollment) दर्ज करें: <span className="required-mark">*</span></div>
          {errors.enrollment && <div className="field-error" style={{marginBottom: '10px'}}>⚠ {errors.enrollment}</div>}

          <div className="repeatable-table-wrapper">
            <table className="repeatable-table">
              <thead>
                <tr>
                  <th style={{width: '120px'}}>कक्षा</th>
                  <th style={{width: '100px'}}>छात्र</th>
                  <th style={{width: '100px'}}>छात्रा</th>
                  <th style={{width: '100px'}}>कुल</th>
                </tr>
              </thead>
              <tbody>
                {visibleEnrollment.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{fontWeight: 500, padding: '8px 12px'}}>{row.class_name}</td>
                    <td>
                      <input type="number" min="0" value={row.boys ?? ''}
                        onChange={e => handleChange(idx, 'boys', e.target.value)} inputMode="numeric" />
                    </td>
                    <td>
                      <input type="number" min="0" value={row.girls ?? ''}
                        onChange={e => handleChange(idx, 'girls', e.target.value)} inputMode="numeric" />
                    </td>
                    <td>
                      <input type="text" value={row.total || 0} readOnly
                        style={{background: '#fff8f0', fontWeight: 600, textAlign: 'center'}} />
                    </td>
                  </tr>
                ))}
                <tr className="auto-calc-row">
                  <td><strong>कुल योग</strong></td>
                  <td><strong style={{padding: '8px 12px', display: 'block'}}>{totalBoys}</strong></td>
                  <td><strong style={{padding: '8px 12px', display: 'block'}}>{totalGirls}</strong></td>
                  <td><strong style={{padding: '8px 12px', display: 'block', color: 'var(--primary-700)'}}>{totalStudents}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 mt-4" style={{justifyContent: 'center'}}>
            <div className="summary-item" style={{textAlign: 'center', minWidth: '120px'}}>
              <div className="summary-item-label">कुल छात्र</div>
              <div className="summary-item-value" style={{color: 'var(--primary-600)'}}>{totalBoys}</div>
            </div>
            <div className="summary-item" style={{textAlign: 'center', minWidth: '120px'}}>
              <div className="summary-item-label">कुल छात्रा</div>
              <div className="summary-item-value" style={{color: 'var(--accent-600)'}}>{totalGirls}</div>
            </div>
            <div className="summary-item" style={{textAlign: 'center', minWidth: '120px'}}>
              <div className="summary-item-label">कुल विद्यार्थी</div>
              <div className="summary-item-value" style={{color: 'var(--success-600)'}}>{totalStudents}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
