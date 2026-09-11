import { useSurvey } from '../../context/SurveyContext';
import { EXAM_CLASSES } from '../../utils/constants';
import { useEffect } from 'react';

export default function ExamsSection() {
  const { state, dispatch } = useSurvey();
  const { examResults } = state;

  // Initialize exam results if empty
  useEffect(() => {
    if (examResults.length === 0) {
      dispatch({ type: 'SET_EXAMS', payload: EXAM_CLASSES.map(c => ({ class_name: c, first_div: '', second_div: '', third_div: '', total: '' })) });
    }
  }, []);

  const handleChange = (idx, field, value) => {
    const updated = examResults.map((row, i) => {
      if (i !== idx) return row;
      const newRow = { ...row, [field]: value };
      const f = parseInt(field === 'first_div' ? value : newRow.first_div) || 0;
      const s = parseInt(field === 'second_div' ? value : newRow.second_div) || 0;
      const t = parseInt(field === 'third_div' ? value : newRow.third_div) || 0;
      newRow.total = f + s + t;
      return newRow;
    });
    dispatch({ type: 'SET_EXAMS', payload: updated });
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q39 | परीक्षा परिणाम</span>
        <h2 className="section-title">परीक्षा परिणाम</h2>
      </div>

      <div className="card">
        <div className="question-block">
          <div className="question-number">Q39</div>
          <div className="question-text">कक्षा वार विद्यालय के परीक्षा परिणाम का विवरण दें।</div>

          <div className="repeatable-table-wrapper">
            <table className="repeatable-table">
              <thead>
                <tr>
                  <th style={{width: '120px'}}>कक्षा</th>
                  <th>1ST</th>
                  <th>2ND</th>
                  <th>3RD</th>
                  <th>कुल</th>
                </tr>
              </thead>
              <tbody>
                {examResults.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{fontWeight: 500, padding: '8px 12px'}}>{row.class_name}</td>
                    <td><input type="number" min="0" value={row.first_div ?? ''} onChange={e => handleChange(idx, 'first_div', e.target.value)} /></td>
                    <td><input type="number" min="0" value={row.second_div ?? ''} onChange={e => handleChange(idx, 'second_div', e.target.value)} /></td>
                    <td><input type="number" min="0" value={row.third_div ?? ''} onChange={e => handleChange(idx, 'third_div', e.target.value)} /></td>
                    <td><input type="text" value={row.total || 0} readOnly style={{background: '#fff8f0', fontWeight: 600, textAlign: 'center'}} /></td>
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
