import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';
import { CLASSES } from '../../utils/constants';
import { CheckCircle } from 'lucide-react';

export default function SmartLandSection() {
  const { state, setField, dispatch } = useSurvey();
  const d = state.surveyData;
  const errors = state.errors || {};
  const YN = ['हाँ', 'नहीं'];

  const handleChange = (name, value) => {
    setField(name, value);
    if (errors[name]) dispatch({ type: 'SET_ERRORS', errors: { ...errors, [name]: null } });
  };

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
        <span className="section-number">Q18-20, Q33-35 | भूमि एवं खेल मैदान</span>
        <h2 className="section-title">स्मार्ट क्लासरूम, भूमि एवं खेल मैदान</h2>
      </div>

      {/* Q33 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q33</div>
          <div className="question-text">क्या विद्यालय में स्मार्ट क्लासरूम है?</div>
          <RadioGroup name="q33" value={d.q33} onChange={handleChange} options={YN} error={errors.q33} required />
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

              <div style={{marginBottom: '16px'}}>
                <div className="question-text" style={{fontSize: '14px', fontWeight: '600', marginBottom: '8px'}}>क्या स्मार्ट क्लासरूम उपकरण क्रियाशील हैं?</div>
                <RadioGroup name="q33_working" value={d.q33_working} onChange={(n,v) => setField(n,v)} options={['क्रियाशील (Working)', 'अक्रियाशील (Not Working)']} />
              </div>
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
            value={d.q34_condition} onChange={handleChange} error={errors.q34_condition} required />
          <FloatingTextarea label="रास्ते की समस्या" name="q34_problem"
            value={d.q34_problem} onChange={handleChange} />
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
            value={d.q35_available} onChange={handleChange} error={errors.q35_available} required />
          <FloatingInput label="भूमि की स्थिति" name="q35_condition"
            value={d.q35_condition} onChange={handleChange} />
          <FloatingTextarea label="अतिरिक्त भूमि की आवश्यकता / अन्य विवरण" name="q35_details"
            value={d.q35_details} onChange={(n,v) => setField(n,v)} />
        </div>
      </div>

      {/* Q18 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q18</div>
          <div className="question-text">क्या विद्यालय में खेल मैदान है?</div>
          <RadioGroup name="q18" value={d.q18} onChange={handleChange} options={YN} error={errors.q18} required />

          {/* If YES — show condition details */}
          {d.q18 === 'हाँ' && (
            <div className="conditional-block">
              <FloatingInput label="खेल मैदान की स्थिति" name="q18_condition"
                value={d.q18_condition} onChange={(n,v) => setField(n,v)} />
              <FloatingTextarea label="आवश्यकता / समस्या का विवरण" name="q18_details"
                value={d.q18_details} onChange={(n,v) => setField(n,v)} />
            </div>
          )}

          {/* If NO — ask about land ownership */}
          {d.q18 === 'नहीं' && (
            <div className="conditional-block">
              <div style={{
                padding: '12px 16px',
                background: 'var(--warning-50, #fffbeb)',
                borderRadius: '10px',
                borderLeft: '4px solid var(--warning-500, #f59e0b)',
                marginBottom: '16px',
                fontSize: '14px',
                color: 'var(--neutral-700)',
              }}>
                खेल मैदान नहीं है — कृपया नीचे जमीन संबंधी जानकारी दें।
              </div>

              <div className="question-text" style={{marginTop: '8px', fontSize: '14px', fontWeight: '600'}}>
                क्या आपके पास जमीन है?
              </div>
              <RadioGroup name="q18_has_land" value={d.q18_has_land} onChange={(n,v) => setField(n,v)} options={YN} />

              {/* If they HAVE land — OK */}
              {d.q18_has_land === 'हाँ' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'var(--success-50, #f0fdf4)',
                  borderRadius: '10px',
                  borderLeft: '4px solid var(--success-500, #22c55e)',
                  marginTop: '12px',
                  fontSize: '14px',
                  color: 'var(--success-700, #15803d)',
                }}>
                  <CheckCircle size={18} />
                  ठीक है — जमीन उपलब्ध है।
                </div>
              )}

              {/* If they DON'T have land — ask about govt land nearby */}
              {d.q18_has_land === 'नहीं' && (
                <div className="conditional-block" style={{marginTop: '12px'}}>
                  <div className="question-text" style={{fontSize: '14px', fontWeight: '600'}}>
                    क्या आपके आस-पास 5 किलोमीटर के अंदर कोई सरकारी जमीन है?
                  </div>
                  <RadioGroup name="q18_govt_land_nearby" value={d.q18_govt_land_nearby} onChange={(n,v) => setField(n,v)} options={YN} />

                  {/* If govt land IS available — ask for khasra number */}
                  {d.q18_govt_land_nearby === 'हाँ' && (
                    <div className="conditional-block" style={{marginTop: '8px'}}>
                      <FloatingInput label="खसरा नंबर" name="q18_khasra_number"
                        value={d.q18_khasra_number} onChange={(n,v) => setField(n,v)} />
                      <FloatingTextarea label="सरकारी जमीन का विवरण" name="q18_govt_land_details"
                        value={d.q18_govt_land_details} onChange={(n,v) => setField(n,v)} />
                    </div>
                  )}

                  {/* If NO govt land nearby — OK */}
                  {d.q18_govt_land_nearby === 'नहीं' && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      background: 'var(--neutral-50, #f9fafb)',
                      borderRadius: '10px',
                      borderLeft: '4px solid var(--neutral-400, #9ca3af)',
                      marginTop: '12px',
                      fontSize: '14px',
                      color: 'var(--neutral-600)',
                    }}>
                      ठीक है — आस-पास कोई सरकारी जमीन उपलब्ध नहीं है।
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Q19 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q19</div>
          <div className="question-text">विद्यालय की भूमि / खेल मैदान में अतिक्रमित भूमि कितनी है?</div>
          <FloatingInput label="अतिक्रमित भूमि (बीघा में)" name="q19_area"
            value={d.q19_area} onChange={handleChange} type="number" min="0" step="0.01" error={errors.q19_area} required />
          <FloatingTextarea label="अतिक्रमण का विवरण" name="q19_details"
            value={d.q19_details} onChange={handleChange} />
        </div>
      </div>

      {/* Q20 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q20</div>
          <div className="question-text">क्या विद्यालय में खेलों की सामग्री है?</div>
          <RadioGroup name="q20" value={d.q20} onChange={handleChange} options={YN} error={errors.q20} required />
          {d.q20 === 'नहीं' && (
            <div className="conditional-block">
              <FloatingTextarea label="आवश्यक खेल सामग्री का विवरण" name="q20_details"
                value={d.q20_details} onChange={handleChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
