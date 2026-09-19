import RadioGroup from '../common/RadioGroup';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';

export default function SpecialStatusSection() {
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
        <span className="section-number">Q4 – Q6 | विशेष स्थिति</span>
        <h2 className="section-title">विशेष स्थिति</h2>
      </div>

      {/* Q4 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q4</div>
          <div className="question-text">क्या विद्यालय PM Shri / MGGS है?</div>
          <RadioGroup name="q4" value={d.q4} onChange={handleChange} options={YN} error={errors.q4} required />
        </div>
      </div>

      {/* Q5 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q5</div>
          <div className="question-text">क्या विद्यालय को क्रमोन्नति (Upgradation) की आवश्यकता है?</div>
          <RadioGroup name="q5" value={d.q5} onChange={handleChange} options={YN} error={errors.q5} required />
          {d.q5 === 'हाँ' && (
            <div className="conditional-block">
              <FloatingTextarea
                label="क्रमोन्नति की आवश्यकता का विवरण" name="q5_details"
                value={d.q5_details} onChange={(n,v) => setField(n,v)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Q6 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q6</div>
          <div className="question-text">क्या विद्यालय में महिला शिक्षक कार्यरत हैं?</div>
          <RadioGroup name="q6" value={d.q6} onChange={handleChange} options={YN} error={errors.q6} required />
        </div>
      </div>

      {/* Q7 - Skill Activity */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q7</div>
          <div className="question-text">क्या आपके विद्यालय में कोई स्किल एक्टिविटी (Skill Activity) करवाई जाती है?</div>
          <RadioGroup name="q7_skill" value={d.q7_skill} onChange={handleChange} options={YN} error={errors.q7_skill} required />
          {d.q7_skill === 'हाँ' && (
            <div className="conditional-block">
              <FloatingTextarea
                label="स्किल एक्टिविटी का विवरण" name="q7_skill_details"
                value={d.q7_skill_details} onChange={(n,v) => setField(n,v)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
