import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';

export default function BoundarySection() {
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
        <span className="section-number">Q16 – Q17 | चारदीवारी</span>
        <h2 className="section-title">चारदीवारी</h2>
      </div>

      <div className="card">
        <div className="question-block">
          <div className="question-number">Q16</div>
          <div className="question-text">क्या विद्यालय में चारदीवारी (Boundary Wall) उपलब्ध है?</div>
          <RadioGroup name="q16" value={d.q16} onChange={handleChange} options={YN} error={errors.q16} required />
        </div>

        {d.q16 === 'नहीं' && (
          <div className="question-block conditional-block">
            <div className="question-number">Q17</div>
            <div className="question-text">चारदीवारी की आवश्यकता का विवरण दें।</div>
            <FloatingInput label="चारदीवारी की आवश्यकता (मीटर में)" name="q17_meters"
              value={d.q17_meters} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
            <FloatingTextarea label="अन्य विवरण" name="q17_details"
              value={d.q17_details} onChange={(n,v) => setField(n,v)} />
          </div>
        )}
      </div>
    </div>
  );
}
