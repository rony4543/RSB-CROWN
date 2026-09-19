import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';
import { AlertTriangle } from 'lucide-react';

export default function ElectricitySection() {
  const { state, setField, dispatch } = useSurvey();
  const d = state.surveyData;
  const errors = state.errors || {};
  const YN = ['हाँ', 'नहीं'];

  const handleChange = (name, value) => {
    setField(name, value);
    if (errors[name]) dispatch({ type: 'SET_ERRORS', errors: { ...errors, [name]: null } });
  };

  // Computer validation
  const total = parseInt(d.q12_total) || 0;
  const working = parseInt(d.q12_working) || 0;
  const broken = parseInt(d.q12_broken) || 0;
  const computerMismatch = total > 0 && (working + broken) > 0 && (working + broken) !== total;

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q11 – Q13 | बिजली, कम्प्यूटर एवं इंटरनेट</span>
        <h2 className="section-title">बिजली, कम्प्यूटर एवं इंटरनेट</h2>
      </div>

      {/* Q11 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q11</div>
          <div className="question-text">विद्यालय में विद्युत व्यवस्था की स्थिति क्या है?</div>
          <RadioGroup name="q11_electricity" value={d.q11_electricity} onChange={handleChange} options={YN} label="बिजली कनेक्शन" error={errors.q11_electricity} required />
          <RadioGroup name="q11_solar" value={d.q11_solar} onChange={(n,v) => setField(n,v)} options={YN} label="सौर ऊर्जा" />
          {(d.q11_electricity === 'नहीं' || d.q11_solar === 'नहीं') && (
            <div className="conditional-block">
              <FloatingTextarea label="आवश्यकता का विवरण" name="q11_details"
                value={d.q11_details} onChange={(n,v) => setField(n,v)} />
            </div>
          )}
        </div>
      </div>

      {/* Q12 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q12</div>
          <div className="question-text">विद्यालय में उपलब्ध कम्प्यूटर की संख्या एवं स्थिति का विवरण दें।</div>
          <div className="inline-fields">
            <FloatingInput label="कुल कम्प्यूटर" name="q12_total"
              value={d.q12_total} onChange={handleChange} type="number" inputMode="numeric" min="0" error={errors.q12_total} required />
            <FloatingInput label="सही / कार्यशील कम्प्यूटर" name="q12_working"
              value={d.q12_working} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
          </div>
          <FloatingInput label="खराब कम्प्यूटर" name="q12_broken"
            value={d.q12_broken} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
          {computerMismatch && (
            <div className="validation-warning">
              <AlertTriangle size={18} />
              <span>कृपया कम्प्यूटर की संख्या जांचें। कुल संख्या ({total}) और कार्यशील ({working}) + खराब ({broken}) = {working+broken} मेल नहीं खा रही है।</span>
            </div>
          )}
        </div>
      </div>

      {/* Q13 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q13</div>
          <div className="question-text">विद्यालय में इंटरनेट सुविधा की स्थिति क्या है?</div>
          <RadioGroup name="q13_internet" value={d.q13_internet} onChange={handleChange} options={YN} label="इंटरनेट कनेक्शन" error={errors.q13_internet} required />
          <RadioGroup name="q13_network" value={d.q13_network} onChange={(n,v) => setField(n,v)} options={YN} label="नेटवर्क उपलब्धता" />
          {(d.q13_internet === 'नहीं' || d.q13_network === 'नहीं') && (
            <div className="conditional-block">
              <FloatingTextarea label="समस्या / आवश्यकता का विवरण" name="q13_details"
                value={d.q13_details} onChange={(n,v) => setField(n,v)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
