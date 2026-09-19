import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';
import { SCHOOL_TYPES, FACULTY_SUBJECT_MAPPING } from '../../utils/constants';

export default function AcademicSection() {
  const { state, setField, dispatch } = useSurvey();
  const d = state.surveyData;
  const errors = state.errors || {};

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q1 – Q2 | शैक्षणिक जानकारी</span>
        <h2 className="section-title">शैक्षणिक जानकारी</h2>
      </div>

      {/* Q1 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q1</div>
          <div className="question-text">विद्यालय का प्रकार क्या है? <span className="required-mark">*</span></div>
          <RadioGroup
            name="q1" value={d.q1} onChange={(n, v) => {
              setField(n, v);
              if (errors.q1) dispatch({ type: 'SET_ERRORS', errors: { ...errors, q1: null } });
            }}
            options={SCHOOL_TYPES} 
            error={errors.q1}
          />
        </div>
      </div>

      {/* Q2 (Only for उच्च माध्यमिक विद्यालय) */}
      {d.q1 === 'उच्च माध्यमिक विद्यालय' ? (
        <>
          {/* Q2 */}
          <div className="card">
            <div className="question-block">
              <div className="question-number">Q2</div>
              <div className="question-text">विद्यालय का संकाय/विषय क्या है? <span className="required-mark">*</span></div>
              {errors.q2 && <div className="field-error" style={{marginBottom: '10px'}}>⚠ {errors.q2}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                {Object.entries(FACULTY_SUBJECT_MAPPING).map(([faculty, subjects]) => {
                  const isFacultySelected = d.q2 && d.q2[faculty] !== undefined;

                  return (
                    <div key={faculty} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', color: 'var(--primary-800)' }}>
                        <input 
                          type="checkbox"
                          checked={isFacultySelected}
                          onChange={(e) => {
                            const newQ2 = { ...(d.q2 || {}) };
                            if (e.target.checked) {
                              newQ2[faculty] = []; // Initialize empty subjects array
                            } else {
                              delete newQ2[faculty]; // Remove faculty and its subjects
                            }
                            setField('q2', newQ2);
                          }}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)' }}
                        />
                        {faculty}
                      </label>
                      
                      {isFacultySelected && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', paddingLeft: '26px' }}>
                          {subjects.map(sub => (
                            <label key={sub} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--gray-800)' }}>
                              <input 
                                type="checkbox"
                                checked={d.q2[faculty].includes(sub)}
                                onChange={(e) => {
                                  const newQ2 = { ...d.q2 };
                                  if (e.target.checked) {
                                    newQ2[faculty] = [...newQ2[faculty], sub];
                                  } else {
                                    newQ2[faculty] = newQ2[faculty].filter(s => s !== sub);
                                  }
                                  setField('q2', newQ2);
                                }}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--primary-500)' }}
                              />
                              {sub}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : d.q1 ? (
        <div className="card" style={{ background: '#f8fafc', borderLeft: '4px solid var(--primary-500)', padding: '16px 20px' }}>
          <p style={{ margin: 0, color: 'var(--gray-700)', fontSize: '14px', lineHeight: 1.5 }}>
            ℹ️ <strong>सूचना:</strong> संकाय एवं विषयवार विवरण (Q2) केवल <strong>उच्च माध्यमिक विद्यालय</strong> के लिए ही उपलब्ध है।
          </p>
        </div>
      ) : null}
    </div>
  );
}
