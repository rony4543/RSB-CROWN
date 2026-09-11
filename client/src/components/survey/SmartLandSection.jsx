import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';
import { CLASSES } from '../../utils/constants';

export default function SmartLandSection() {
  const { state, setField } = useSurvey();
  const d = state.surveyData;
  const YN = ['हाँ', 'नहीं'];

  // Parse selected smart classes from comma-separated string
  const selectedClasses = d.q33_smart_classes ? d.q33_smart_classes.split(',') : [];

  const toggleClass = (cls) => {
    const updated = selectedClasses.includes(cls)
      ? selectedClasses.filter(c => c !== cls)
      : [...selectedClasses, cls];
    setField('q33_smart_classes', updated.join(','));
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q33 – Q35 | स्मार्ट क्लासरूम, रास्ता एवं भूमि</span>
        <h2 className="section-title">स्मार्ट क्लासरूम, रास्ता एवं भूमि</h2>
      </div>

      {/* Q33 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q33</div>
          <div className="question-text">क्या विद्यालय में स्मार्ट क्लासरूम है?</div>
          <RadioGroup name="q33" value={d.q33} onChange={(n,v) => setField(n,v)} options={YN} />
          {d.q33 === 'हाँ' && (
            <div className="conditional-block">
              <FloatingInput label="स्मार्ट क्लासरूम की संख्या" name="q33_count"
                value={d.q33_count} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
              
              {/* Class selection checkboxes */}
              <div style={{marginTop: '16px', marginBottom: '16px'}}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--neutral-700)',
                  marginBottom: '10px'
                }}>
                  कौन-कौन सी कक्षाएँ स्मार्ट क्लास हैं? (चुनें)
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '8px'
                }}>
                  {CLASSES.map(cls => {
                    const isSelected = selectedClasses.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => toggleClass(cls)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid var(--primary-600)' : '2px solid var(--neutral-200)',
                          background: isSelected ? 'var(--primary-50)' : 'var(--white)',
                          color: isSelected ? 'var(--primary-700)' : 'var(--neutral-600)',
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isSelected ? '2px solid var(--primary-600)' : '2px solid var(--neutral-300)',
                          background: isSelected ? 'var(--primary-600)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: 'white',
                          flexShrink: 0,
                        }}>
                          {isSelected ? '✓' : ''}
                        </span>
                        कक्षा {cls}
                      </button>
                    );
                  })}
                </div>
                {selectedClasses.length > 0 && (
                  <div style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    background: 'var(--primary-50)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--primary-700)',
                  }}>
                    चयनित स्मार्ट कक्षाएँ: {selectedClasses.sort((a,b) => Number(a) - Number(b)).map(c => `कक्षा ${c}`).join(', ')}
                  </div>
                )}
              </div>

              <FloatingInput label="वर्तमान स्थिति" name="q33_condition"
                value={d.q33_condition} onChange={(n,v) => setField(n,v)} />
              <FloatingTextarea label="उपकरण/अन्य विवरण" name="q33_details"
                value={d.q33_details} onChange={(n,v) => setField(n,v)} />
            </div>
          )}
          {d.q33 === 'नहीं' && (
            <div className="conditional-block">
              <FloatingInput label="आवश्यक स्मार्ट क्लासरूम की संख्या" name="q33_required_count"
                value={d.q33_required_count} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
              <FloatingTextarea label="आवश्यक उपकरण / आवश्यकता का विवरण" name="q33_required_details"
                value={d.q33_required_details} onChange={(n,v) => setField(n,v)} />
            </div>
          )}
        </div>
      </div>

      {/* Q34 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q34</div>
          <div className="question-text">विद्यालय के लिए रास्ते का विवरण दें।</div>
          <FloatingInput label="रास्ते की वर्तमान स्थिति" name="q34_condition"
            value={d.q34_condition} onChange={(n,v) => setField(n,v)} />
          <FloatingTextarea label="रास्ते की समस्या" name="q34_problem"
            value={d.q34_problem} onChange={(n,v) => setField(n,v)} />
          <FloatingTextarea label="भूमि की आवश्यकता / अन्य विवरण" name="q34_details"
            value={d.q34_details} onChange={(n,v) => setField(n,v)} />
        </div>
      </div>

      {/* Q35 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q35</div>
          <div className="question-text">विद्यालय के नाम समर्पित भूमि का विवरण दें।</div>
          <FloatingInput label="उपलब्ध भूमि" name="q35_available"
            value={d.q35_available} onChange={(n,v) => setField(n,v)} />
          <FloatingInput label="भूमि की स्थिति" name="q35_condition"
            value={d.q35_condition} onChange={(n,v) => setField(n,v)} />
          <FloatingTextarea label="अतिरिक्त भूमि की आवश्यकता / अन्य विवरण" name="q35_details"
            value={d.q35_details} onChange={(n,v) => setField(n,v)} />
        </div>
      </div>
    </div>
  );
}
