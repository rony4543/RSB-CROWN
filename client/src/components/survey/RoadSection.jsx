import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';

export default function RoadSection() {
  const { state, setField, dispatch } = useSurvey();
  const d = state.surveyData;
  const errors = state.errors || {};
  const YN = ['हाँ', 'नहीं'];

  const handleChange = (name, value) => {
    setField(name, value);
    if (errors[name]) dispatch({ type: 'SET_ERRORS', errors: { ...errors, [name]: null } });
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q21 – Q22 | सड़क मार्ग</span>
        <h2 className="section-title">सड़क मार्ग</h2>
      </div>

      {/* Q21 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q21</div>
          <div className="question-text">क्या विद्यालय सड़क मार्ग से जुड़ा हुआ है?</div>
          <RadioGroup name="q21" value={d.q21} onChange={handleChange} options={YN} error={errors.q21} required />
        </div>

        {d.q21 === 'नहीं' && (
          <div className="question-block conditional-block">
            <div className="question-number">Q22</div>
            <div className="question-text">निकटतम सड़क से दूरी कितनी है?</div>
            <FloatingInput label="दूरी (किलोमीटर में)" name="q22_distance"
              value={d.q22_distance} onChange={handleChange} type="number" min="0" step="0.1" error={errors.q22_distance} required />
            <FloatingTextarea label="सड़क/रास्ते की समस्या का विवरण" name="q22_details"
              value={d.q22_details} onChange={handleChange} />
          </div>
        )}
      </div>

      {/* Road Type & Distance — NEW */}
      <div className="card">
        <div className="question-block">
          <div className="question-number" style={{background: 'var(--accent-100, #fef3c7)', color: 'var(--accent-700, #b45309)'}}>Q22A</div>
          <div className="question-text">विद्यालय के आस-पास रास्ते की स्थिति</div>
          <p style={{fontSize: '13px', color: 'var(--neutral-500)', marginBottom: '16px', marginTop: '4px'}}>
            कृपया विद्यालय से निकटतम कच्चे और पक्के रस्ते की दूरी बताएँ।
          </p>

          {/* Road type connected to school */}
          <div style={{marginBottom: '16px'}}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--neutral-700)',
              marginBottom: '8px'
            }}>
              विद्यालय से जुड़ा रास्ता किस प्रकार का है?
            </label>
            <RadioGroup name="q22a_road_type" value={d.q22a_road_type} onChange={(n,v) => setField(n,v)} options={['कच्चा रस्ता', 'पक्का रस्ता', 'दोनों', 'कोई रस्ता नहीं']} />
          </div>

          <div className="inline-fields">
            <FloatingInput label="निकटतम कच्चा रस्ता — दूरी (किमी)" name="q22a_kaccha_distance"
              value={d.q22a_kaccha_distance} onChange={(n,v) => setField(n,v)} type="number" inputMode="decimal" min="0" step="0.1" />
            <FloatingInput label="निकटतम पक्का रस्ता — दूरी (किमी)" name="q22a_pakka_distance"
              value={d.q22a_pakka_distance} onChange={(n,v) => setField(n,v)} type="number" inputMode="decimal" min="0" step="0.1" />
          </div>

          <FloatingTextarea label="रास्ते संबंधी अन्य विवरण / समस्या" name="q22a_road_remarks"
            value={d.q22a_road_remarks} onChange={(n,v) => setField(n,v)} />
        </div>
      </div>
    </div>
  );
}
