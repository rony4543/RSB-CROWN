import FloatingInput from '../common/FloatingInput';
import RepeatableTable from '../common/RepeatableTable';
import { useSurvey } from '../../context/SurveyContext';
import { Trash2, Plus } from 'lucide-react';

export default function CommitteesSection() {
  const { state, dispatch } = useSurvey();

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q36 – Q38 | समिति एवं पंचायत</span>
        <h2 className="section-title">समिति एवं पंचायत</h2>
      </div>

      {/* Q36 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q36</div>
          <div className="question-text">विद्यालय विकास प्रबंधन स्थिति</div>
          <RepeatableTable
            columns={[
              { key: 'name', label: 'नाम' },
              { key: 'occupation', label: 'व्यवसाय' },
              { key: 'mobile', label: 'मोबाइल नंबर', width: '120px' },
              { key: 'details', label: 'विशेष विवरण' },
            ]}
            rows={state.committeeMembers.filter(m => m.committee_type === 'vikas_samiti')}
            onChange={data => {
              const others = state.committeeMembers.filter(m => m.committee_type !== 'vikas_samiti');
              dispatch({ type: 'SET_COMMITTEE', payload: [...others, ...data.map(d => ({...d, committee_type: 'vikas_samiti'}))] });
            }}
            onAddRow={() => dispatch({ type: 'SET_COMMITTEE', payload: [...state.committeeMembers, { committee_type: 'vikas_samiti', name:'', occupation:'', mobile:'', details:'' }] })}
            onRemoveRow={idx => {
              const filtered = state.committeeMembers.filter(m => m.committee_type === 'vikas_samiti');
              filtered.splice(idx, 1);
              const others = state.committeeMembers.filter(m => m.committee_type !== 'vikas_samiti');
              dispatch({ type: 'SET_COMMITTEE', payload: [...others, ...filtered] });
            }}
            addLabel="+ सदस्य जोड़ें"
          />
        </div>
      </div>

      {/* Q37 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q37</div>
          <div className="question-text">सरपंच और वार्ड पंच की सूचना नाम व मोबाइल नंबर सहित दें।</div>

          <h4 className="text-sm font-bold mb-4" style={{color: 'var(--primary-700)'}}>सरपंच</h4>
          {(() => {
            const sarpanch = state.panchayatMembers.find(m => m.member_type === 'sarpanch') || { member_type: 'sarpanch', name: '', mobile: '', details: '' };
            const updateSarpanch = (field, value) => {
              const others = state.panchayatMembers.filter(m => m.member_type !== 'sarpanch');
              dispatch({ type: 'SET_PANCHAYAT', payload: [...others, { ...sarpanch, [field]: value }] });
            };
            return (
              <div className="inline-fields">
                <FloatingInput label="सरपंच का नाम" name="sarpanch_name" value={sarpanch.name} onChange={(_, v) => updateSarpanch('name', v)} />
                <FloatingInput label="मोबाइल नंबर" name="sarpanch_mobile" value={sarpanch.mobile} onChange={(_, v) => updateSarpanch('mobile', v)} type="tel" inputMode="numeric" maxLength={10} />
              </div>
            );
          })()}

          <h4 className="text-sm font-bold mb-4 mt-6" style={{color: 'var(--primary-700)'}}>वार्ड पंच</h4>
          <RepeatableTable
            columns={[
              { key: 'name', label: 'नाम' },
              { key: 'mobile', label: 'मोबाइल नंबर', width: '120px' },
              { key: 'ward_number', label: 'वार्ड नंबर', width: '90px' },
              { key: 'details', label: 'विशेष विवरण' },
            ]}
            rows={state.panchayatMembers.filter(m => m.member_type === 'ward_panch')}
            onChange={data => {
              const others = state.panchayatMembers.filter(m => m.member_type !== 'ward_panch');
              dispatch({ type: 'SET_PANCHAYAT', payload: [...others, ...data.map(d => ({...d, member_type: 'ward_panch'}))] });
            }}
            onAddRow={() => dispatch({ type: 'SET_PANCHAYAT', payload: [...state.panchayatMembers, { member_type: 'ward_panch', name:'', mobile:'', ward_number:'', details:'' }] })}
            onRemoveRow={idx => {
              const filtered = state.panchayatMembers.filter(m => m.member_type === 'ward_panch');
              filtered.splice(idx, 1);
              const others = state.panchayatMembers.filter(m => m.member_type !== 'ward_panch');
              dispatch({ type: 'SET_PANCHAYAT', payload: [...others, ...filtered] });
            }}
            addLabel="+ वार्ड पंच जोड़ें"
          />
        </div>
      </div>

      {/* Q38 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q38</div>
          <div className="question-text">SMC / SDMC / अन्य कार्यकारिणी सदस्यों का विवरण।</div>
          <RepeatableTable
            columns={[
              { key: 'name', label: 'नाम' },
              { key: 'post', label: 'पद' },
              { key: 'mobile', label: 'मोबाइल', width: '110px' },
              { key: 'committee_type', label: 'समिति', type: 'select', options: ['SMC', 'SDMC', 'अन्य'] },
              { key: 'tenure', label: 'कार्यकाल', width: '100px' },
            ]}
            rows={state.committeeMembers.filter(m => m.committee_type !== 'vikas_samiti')}
            onChange={data => {
              const vikas = state.committeeMembers.filter(m => m.committee_type === 'vikas_samiti');
              dispatch({ type: 'SET_COMMITTEE', payload: [...vikas, ...data] });
            }}
            onAddRow={() => dispatch({ type: 'SET_COMMITTEE', payload: [...state.committeeMembers, { committee_type: 'SMC', name:'', post:'', mobile:'', tenure:'', details:'' }] })}
            onRemoveRow={idx => {
              const filtered = state.committeeMembers.filter(m => m.committee_type !== 'vikas_samiti');
              filtered.splice(idx, 1);
              const vikas = state.committeeMembers.filter(m => m.committee_type === 'vikas_samiti');
              dispatch({ type: 'SET_COMMITTEE', payload: [...vikas, ...filtered] });
            }}
            addLabel="+ सदस्य जोड़ें"
          />
        </div>
      </div>
    </div>
  );
}
