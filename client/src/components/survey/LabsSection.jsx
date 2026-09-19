import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import RepeatableTable from '../common/RepeatableTable';
import { useSurvey } from '../../context/SurveyContext';
import { LAB_TYPES } from '../../utils/constants';

export default function LabsSection() {
  const { state, setField, dispatch } = useSurvey();
  const d = state.surveyData;
  const errors = state.errors || {};
  const YN = ['हाँ', 'नहीं'];

  const handleChange = (name, value) => {
    setField(name, value);
    if (errors[name]) dispatch({ type: 'SET_ERRORS', errors: { ...errors, [name]: null } });
  };

  const handleLabChange = (labType, field, value) => {
    setField(`q14_${labType}_${field}`, value);
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q14 – Q15 | प्रयोगशाला</span>
        <h2 className="section-title">प्रयोगशाला</h2>
      </div>

      {/* Q14 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q14</div>
          <div className="question-text">क्या विद्यालय में प्रयोगशाला (Lab) उपलब्ध है?</div>
          <RadioGroup name="q14" value={d.q14} onChange={handleChange} options={YN} error={errors.q14} required />
          {d.q14 === 'हाँ' && (
            <div className="conditional-block">
              {LAB_TYPES.map(lab => (
                <div key={lab} className="card" style={{background:'#fafbfc', padding:'16px', marginBottom:'12px'}}>
                  <strong className="text-sm">{lab}</strong>
                  <RadioGroup name={`q14_${lab}_available`} value={d[`q14_${lab}_available`]}
                    onChange={(n,v) => setField(n,v)} options={YN} label="उपलब्ध है?" />
                  {d[`q14_${lab}_available`] === 'हाँ' && (
                    <>
                      <FloatingInput label="वर्तमान स्थिति" name={`q14_${lab}_condition`}
                        value={d[`q14_${lab}_condition`]} onChange={(n,v) => setField(n,v)} />
                      <FloatingTextarea label="विवरण" name={`q14_${lab}_details`}
                        value={d[`q14_${lab}_details`]} onChange={(n,v) => setField(n,v)} rows={2} />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Q15 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q15</div>
          <div className="question-text">क्या लैब में पर्याप्त संसाधन / उपकरण उपलब्ध हैं?</div>
          <RadioGroup name="q15" value={d.q15} onChange={handleChange} options={YN} error={errors.q15} required />
          {d.q15 === 'नहीं' && (
            <div className="conditional-block">
              <RepeatableTable
                columns={[
                  { key: 'lab_type', label: 'लैब', type: 'select', options: LAB_TYPES, width: '140px' },
                  { key: 'equipment', label: 'आवश्यक उपकरण' },
                  { key: 'quantity', label: 'मात्रा', type: 'number', width: '80px' },
                  { key: 'condition', label: 'स्थिति' },
                  { key: 'details', label: 'विवरण' },
                ]}
                rows={state.labRequirements}
                onChange={data => dispatch({ type: 'SET_LAB_REQS', payload: data })}
                onAddRow={() => dispatch({ type: 'SET_LAB_REQS', payload: [...state.labRequirements, { lab_type:'', equipment:'', quantity:'', condition:'', details:'' }] })}
                onRemoveRow={idx => dispatch({ type: 'SET_LAB_REQS', payload: state.labRequirements.filter((_,i) => i !== idx) })}
                addLabel="+ उपकरण जोड़ें"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
