import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';

export default function BuildingSection() {
  const { state, setField } = useSurvey();
  const d = state.surveyData;
  const YN = ['हाँ', 'नहीं'];

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q9 – Q10 | भवन एवं फर्नीचर</span>
        <h2 className="section-title">भवन एवं फर्नीचर</h2>
      </div>

      {/* Q9 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q9</div>
          <div className="question-text">विद्यालय में भवन की स्थिति का विवरण दें।</div>
          <div className="inline-fields">
            <FloatingInput label="पूर्व में कक्षा-कक्षों की संख्या" name="q9_existing_rooms"
              value={d.q9_existing_rooms} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
            <FloatingInput label="अतिरिक्त कक्षा-कक्षों की आवश्यकता" name="q9_required_rooms"
              value={d.q9_required_rooms} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
          </div>
          <FloatingInput label="छात्रानुपात में अतिरिक्त कक्षा-कक्षों की संख्या" name="q9_additional_rooms"
            value={d.q9_additional_rooms} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
          <FloatingTextarea label="मरम्मत / रंगरोगन योग्य भवन की वर्तमान स्थिति" name="q9_condition"
            value={d.q9_condition} onChange={(n,v) => setField(n,v)} />
        </div>
      </div>

      {/* Building Dilapidation Status — NEW */}
      <div className="card">
        <div className="question-block">
          <div className="question-number" style={{background: 'var(--accent-100, #fef3c7)', color: 'var(--accent-700, #b45309)'}}>Q9A</div>
          <div className="question-text">भवनों की स्थिति — जर्जर भवन</div>
          
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 16px',
            background: 'var(--warning-50, #fffbeb)',
            borderRadius: '10px',
            borderLeft: '4px solid var(--warning-500, #f59e0b)',
            marginBottom: '16px',
            marginTop: '8px',
            fontSize: '13px',
            color: 'var(--neutral-700)',
          }}>
            कृपया बताएँ कि विद्यालय के कितने भवन जर्जर (dilapidated) घोषित हैं।
          </div>

          <div className="question-text" style={{fontSize: '14px', fontWeight: '600', marginBottom: '4px'}}>
            क्या विद्यालय के कोई भवन जर्जर घोषित हैं?
          </div>
          <RadioGroup name="q9a_dilapidated" value={d.q9a_dilapidated} onChange={(n,v) => setField(n,v)} options={YN} />

          {d.q9a_dilapidated === 'हाँ' && (
            <div className="conditional-block">
              <FloatingInput label="जर्जर घोषित भवनों की संख्या" name="q9a_dilapidated_count"
                value={d.q9a_dilapidated_count} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
              <FloatingTextarea label="जर्जर भवनों का विवरण (स्थिति, कब घोषित हुआ, आदि)" name="q9a_dilapidated_details"
                value={d.q9a_dilapidated_details} onChange={(n,v) => setField(n,v)} rows={3} />
            </div>
          )}

          {d.q9a_dilapidated === 'नहीं' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'var(--success-50, #f0fdf4)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--success-500, #22c55e)',
              marginTop: '8px',
              fontSize: '13px',
              color: 'var(--success-700, #15803d)',
            }}>
              ✅ कोई भवन जर्जर घोषित नहीं है।
            </div>
          )}
        </div>
      </div>

      {/* Q10 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q10</div>
          <div className="question-text">विद्यार्थियों के लिए फर्नीचर की स्थिति का विवरण दें। (कक्षा 6 से 12)</div>
          <div className="inline-fields">
            <FloatingInput label="पूर्व में उपलब्ध फर्नीचर की संख्या" name="q10_existing"
              value={d.q10_existing} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
            <FloatingInput label="वर्तमान में फर्नीचर की आवश्यकता" name="q10_required"
              value={d.q10_required} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
          </div>
        </div>
      </div>
    </div>
  );
}
