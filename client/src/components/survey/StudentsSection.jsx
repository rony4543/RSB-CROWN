import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import RepeatableTable from '../common/RepeatableTable';
import { useSurvey } from '../../context/SurveyContext';
import { Plus } from 'lucide-react';

export default function StudentsSection() {
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
        <span className="section-number">Q29 – Q32 | छात्र विवरण</span>
        <h2 className="section-title">छात्र विवरण</h2>
      </div>

      {/* Q29 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q29</div>
          <div className="question-text">पालनहार योजना में लाभान्वित छात्रों का विवरण।</div>
          <RepeatableTable
            columns={[
              { key: 'student_name', label: 'छात्र/छात्रा का नाम' },
              { key: 'class_name', label: 'कक्षा', width: '80px' },
              { key: 'palanhar_number', label: 'पालनहार संख्या' },
              { key: 'palanhar_category', label: 'पालनहार श्रेणी' },
            ]}
            rows={state.palanharStudents}
            onChange={data => dispatch({ type: 'SET_PALANHAR', payload: data })}
            onAddRow={() => dispatch({ type: 'SET_PALANHAR', payload: [...state.palanharStudents, { student_name:'', class_name:'', palanhar_number:'', palanhar_category:'' }] })}
            onRemoveRow={idx => dispatch({ type: 'SET_PALANHAR', payload: state.palanharStudents.filter((_,i) => i !== idx) })}
            addLabel="+ छात्र जोड़ें"
          />
        </div>
      </div>

      {/* Q30 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q30</div>
          <div className="question-text">विद्यालय में दिव्यांग छात्रों का विवरण दें।</div>
          <RepeatableTable
            columns={[
              { key: 'student_name', label: 'छात्र/छात्रा का नाम' },
              { key: 'class_name', label: 'कक्षा', width: '80px' },
              { key: 'disability_type', label: 'दिव्यांगता का प्रकार' },
              { key: 'percentage', label: 'प्रतिशत', width: '80px' },
              { key: 'certificate_number', label: 'प्रमाण पत्र नंबर' },
            ]}
            rows={state.disabledStudents}
            onChange={data => dispatch({ type: 'SET_DISABLED', payload: data })}
            onAddRow={() => dispatch({ type: 'SET_DISABLED', payload: [...state.disabledStudents, { student_name:'', class_name:'', disability_type:'', percentage:'', certificate_number:'' }] })}
            onRemoveRow={idx => dispatch({ type: 'SET_DISABLED', payload: state.disabledStudents.filter((_,i) => i !== idx) })}
            addLabel="+ छात्र जोड़ें"
          />
        </div>
      </div>

      {/* Q31 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q31</div>
          <div className="question-text">विद्यालय में खिलाड़ी छात्रों का विवरण।</div>
          <FloatingInput label="कुल खिलाड़ी छात्र" name="q31_total"
            value={d.q31_total} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
          <RepeatableTable
            columns={[
              { key: 'student_name', label: 'छात्र का नाम' },
              { key: 'class_name', label: 'कक्षा', width: '80px' },
              { key: 'sport', label: 'खेल' },
              { key: 'level', label: 'स्तर', type: 'select', options: ['जिला', 'राज्य', 'राष्ट्रीय', 'अंतरराष्ट्रीय'] },
            ]}
            rows={state.playerStudents}
            onChange={data => dispatch({ type: 'SET_PLAYERS', payload: data })}
            onAddRow={() => dispatch({ type: 'SET_PLAYERS', payload: [...state.playerStudents, { student_name:'', class_name:'', sport:'', level:'' }] })}
            onRemoveRow={idx => dispatch({ type: 'SET_PLAYERS', payload: state.playerStudents.filter((_,i) => i !== idx) })}
            addLabel="+ खिलाड़ी जोड़ें"
          />
        </div>
      </div>

      {/* Q32 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q32</div>
          <div className="question-text">क्या विद्यालय में Scout Guide / NCC है?</div>
          <RadioGroup name="q32" value={d.q32} onChange={handleChange} options={YN} error={errors.q32} required />
          {d.q32 === 'हाँ' && (
            <div className="conditional-block">
              <RepeatableTable
                columns={[
                  { key: 'student_name', label: 'छात्र का नाम' },
                  { key: 'class_name', label: 'कक्षा', width: '80px' },
                  { key: 'level', label: 'स्तर' },
                  { key: 'details', label: 'विशेष विवरण' },
                ]}
                rows={state.scoutNccStudents}
                onChange={data => dispatch({ type: 'SET_SCOUT_NCC', payload: data })}
                onAddRow={() => dispatch({ type: 'SET_SCOUT_NCC', payload: [...state.scoutNccStudents, { student_name:'', class_name:'', level:'', details:'' }] })}
                onRemoveRow={idx => dispatch({ type: 'SET_SCOUT_NCC', payload: state.scoutNccStudents.filter((_,i) => i !== idx) })}
                addLabel="+ छात्र जोड़ें"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
