import RadioGroup from '../common/RadioGroup';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';

export default function SpecialStatusSection() {
  const { state, setField } = useSurvey();
  const d = state.surveyData;
  const YN = ['हाँ', 'नहीं'];

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
          <RadioGroup name="q4" value={d.q4} onChange={(n,v) => setField(n,v)} options={YN} />
        </div>
      </div>

      {/* Q5 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q5</div>
          <div className="question-text">क्या विद्यालय को कम्युनिटी की आवश्यकता है?</div>
          <RadioGroup name="q5" value={d.q5} onChange={(n,v) => setField(n,v)} options={YN} />
          {d.q5 === 'हाँ' && (
            <div className="conditional-block">
              <FloatingTextarea
                label="कम्युनिटी की आवश्यकता का विवरण" name="q5_details"
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
          <RadioGroup name="q6" value={d.q6} onChange={(n,v) => setField(n,v)} options={YN} />
        </div>
      </div>
    </div>
  );
}
