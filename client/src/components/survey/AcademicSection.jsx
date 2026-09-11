import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';
import { SCHOOL_TYPES, FACULTY_SUBJECTS } from '../../utils/constants';

export default function AcademicSection() {
  const { state, setField } = useSurvey();
  const d = state.surveyData;

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q1 – Q3 | शैक्षणिक जानकारी</span>
        <h2 className="section-title">शैक्षणिक जानकारी</h2>
      </div>

      {/* Q1 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q1</div>
          <div className="question-text">विद्यालय का प्रकार क्या है?</div>
          <RadioGroup
            name="q1" value={d.q1} onChange={(n, v) => setField(n, v)}
            options={SCHOOL_TYPES} required
          />
        </div>
      </div>

      {/* Q2 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q2</div>
          <div className="question-text">विद्यालय का संकाय क्या है?</div>
          <FloatingInput
            label="विद्यालय का संकाय" name="q2"
            value={d.q2} onChange={(n, v) => setField(n, v)}
          />
        </div>
      </div>

      {/* Q3 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q3</div>
          <div className="question-text">संकाय का विषयवार विवरण दर्ज करें।</div>
          {FACULTY_SUBJECTS.map(sub => (
            <FloatingInput
              key={sub} label={`${sub} — विवरण`} name={`q3_${sub}`}
              value={d[`q3_${sub}`]} onChange={(n, v) => setField(n, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
