import { useSurvey } from '../../context/SurveyContext';
import FloatingInput from '../common/FloatingInput';
import { Trash2, Plus } from 'lucide-react';

export default function StaffSection() {
  const { state, dispatch, setField } = useSurvey();
  const { staffPositions, staffMembers } = state;
  const errors = state.errors || {};

  // Q7 — Staff positions helpers
  const handleSanctionedChange = (idx, val) => {
    const updated = [...staffPositions];
    const newSanctioned = parseInt(val) >= 0 ? val : '';
    const s = parseInt(newSanctioned) || 0;
    const w = parseInt(updated[idx].working) || 0;
    const v = s - w;

    updated[idx] = {
      ...updated[idx],
      sanctioned: newSanctioned,
      vacant: v >= 0 ? v : 0,
    };
    dispatch({ type: 'SET_STAFF_POSITIONS', payload: updated });
    if (errors[`staff_pos_${idx}_sanctioned`]) {
      dispatch({ type: 'SET_ERRORS', errors: { ...errors, [`staff_pos_${idx}_sanctioned`]: null } });
    }
  };

  const handleWorkingChange = (idx, val) => {
    const updated = [...staffPositions];
    const newWorking = parseInt(val) >= 0 ? val : '';
    const s = parseInt(updated[idx].sanctioned) || 0;
    const w = parseInt(newWorking) || 0;
    const v = s - w;

    updated[idx] = {
      ...updated[idx],
      working: newWorking,
      vacant: v >= 0 ? v : 0,
    };
    dispatch({ type: 'SET_STAFF_POSITIONS', payload: updated });
    if (errors[`staff_pos_${idx}_working`]) {
      dispatch({ type: 'SET_ERRORS', errors: { ...errors, [`staff_pos_${idx}_working`]: null } });
    }
  };

  // Q8 — Staff members
  const addStaffMember = () => {
    dispatch({
      type: 'SET_STAFF_MEMBERS',
      payload: [...staffMembers, { name: '', staff_id: '', post: '', subject: '', mobile: '', email: '' }]
    });
  };

  const removeStaffMember = (idx) => {
    dispatch({ type: 'SET_STAFF_MEMBERS', payload: staffMembers.filter((_, i) => i !== idx) });
  };

  const handleStaffMemberChange = (idx, field, value) => {
    const updated = staffMembers.map((m, i) => i === idx ? { ...m, [field]: value } : m);
    dispatch({ type: 'SET_STAFF_MEMBERS', payload: updated });
    const keyMap = {
      name: `staff_name_${idx}`,
      staff_id: `staff_id_${idx}`,
      post: `staff_post_${idx}`,
      subject: `staff_subject_${idx}`,
      mobile: `staff_mobile_${idx}`,
      email: `staff_email_${idx}`
    };
    const errKey = keyMap[field] || `staff_${field}_${idx}`;
    if (errors[errKey]) {
      dispatch({ type: 'SET_ERRORS', errors: { ...errors, [errKey]: null } });
    }
  };

  const totalSanctioned = staffPositions.reduce((s, r) => s + (parseInt(r.sanctioned) || 0), 0);
  const totalWorking = staffPositions.reduce((s, r) => s + (parseInt(r.working) || 0), 0);
  const totalVacant = staffPositions.reduce((s, r) => s + (parseInt(r.vacant) || 0), 0);

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q7 – Q8 | कार्मिक जानकारी</span>
        <h2 className="section-title">कार्मिक जानकारी</h2>
      </div>

      {/* Q7 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q7</div>
          <div className="question-text">विद्यालय में पदवार संस्थापन सूचना दर्ज करें।</div>
          <p className="text-sm text-gray mb-4">प्रत्येक पद के लिए स्वीकृत एवं कार्यरत पदों की संख्या दर्ज करें।</p>

          <div className="repeatable-table-wrapper">
            <table className="repeatable-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                  <th style={{ minWidth: '180px' }}>पद का नाम</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>स्वीकृत</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>कार्यरत</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>रिक्त स्थिति</th>
                  <th style={{ minWidth: '180px' }}>विवरण</th>
                </tr>
              </thead>
              <tbody>
                {staffPositions.map((row, ri) => (
                  <tr key={ri}>
                    <td style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>{ri + 1}</td>
                    
                    {/* Full Post Name display without truncation */}
                    <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                      <div className="post-name-text">
                        {row.post_name}
                      </div>
                    </td>

                    {/* स्वीकृत */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <input
                        type="number"
                        min="0"
                        value={row.sanctioned ?? ''}
                        onChange={e => handleSanctionedChange(ri, e.target.value)}
                        inputMode="numeric"
                        style={{
                          textAlign: 'center',
                          ...(errors[`staff_pos_${ri}_sanctioned`] ? { borderColor: '#dc2626' } : {})
                        }}
                      />
                    </td>

                    {/* कार्यरत */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <input
                        type="number"
                        min="0"
                        value={row.working ?? ''}
                        onChange={e => handleWorkingChange(ri, e.target.value)}
                        inputMode="numeric"
                        style={{
                          textAlign: 'center',
                          ...(errors[`staff_pos_${ri}_working`] ? { borderColor: '#dc2626' } : {})
                        }}
                      />
                    </td>

                    {/* रिक्त स्थिति (स्वचालित) */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <input
                        type="text"
                        value={row.vacant || 0}
                        readOnly
                        style={{
                          textAlign: 'center',
                          background: '#fff8f0',
                          fontWeight: 600,
                          color: (parseInt(row.vacant) || 0) > 0 ? '#b91c1c' : '#15803d'
                        }}
                      />
                    </td>

                    {/* विवरण */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <input
                        type="text"
                        value={row.remarks || ''}
                        onChange={e => {
                          const updated = [...staffPositions];
                          updated[ri] = { ...updated[ri], remarks: e.target.value };
                          dispatch({ type: 'SET_STAFF_POSITIONS', payload: updated });
                        }}
                        placeholder="कोई विवरण..."
                        style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                    </td>
                  </tr>
                ))}

                {/* Total row */}
                <tr className="auto-calc-row">
                  <td></td>
                  <td><strong>कुल योग</strong></td>
                  <td style={{ textAlign: 'center' }}>
                    <strong style={{ color: '#16a34a', fontSize: '13px' }}>{totalSanctioned} स्वीकृत</strong>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <strong style={{ color: '#2563eb', fontSize: '13px' }}>{totalWorking} कार्यरत</strong>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <strong style={{ color: '#dc2626', fontSize: '13px' }}>{totalVacant} रिक्त</strong>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Q8 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q8</div>
          <div className="question-text">विद्यालय में कार्यरत कार्मिकों की सूचना दर्ज करें।</div>

          {staffMembers.map((member, idx) => (
            <div key={idx} className="card" style={{ background: '#fafbfc', marginBottom: '16px', padding: '16px' }}>
              <div className="flex justify-between items-center mb-4">
                <strong className="text-sm">कार्मिक #{idx + 1}</strong>
                <button className="btn-icon" onClick={() => removeStaffMember(idx)} title="हटाएँ">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="inline-fields">
                <FloatingInput
                  label="कार्मिक का नाम"
                  name={`staff_name_${idx}`}
                  value={member.name}
                  onChange={(_, v) => handleStaffMemberChange(idx, 'name', v)}
                />
                <FloatingInput
                  label="कार्मिक ID (Staff / Employee ID)"
                  name={`staff_id_${idx}`}
                  value={member.staff_id || ''}
                  onChange={(_, v) => handleStaffMemberChange(idx, 'staff_id', v)}
                  placeholder="उदा. RJ-BM-..."
                />
              </div>

              <div className="inline-fields">
                <FloatingInput
                  label="पद"
                  name={`staff_post_${idx}`}
                  value={member.post}
                  onChange={(_, v) => handleStaffMemberChange(idx, 'post', v)}
                />
                <FloatingInput
                  label="मूल विषय / कार्य"
                  name={`staff_subject_${idx}`}
                  value={member.subject}
                  onChange={(_, v) => handleStaffMemberChange(idx, 'subject', v)}
                />
              </div>

              <div className="inline-fields">
                <FloatingInput
                  label="मोबाइल नंबर"
                  name={`staff_mobile_${idx}`}
                  value={member.mobile}
                  onChange={(_, v) => handleStaffMemberChange(idx, 'mobile', v)}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                />
                <FloatingInput
                  label="ईमेल"
                  name={`staff_email_${idx}`}
                  value={member.email}
                  onChange={(_, v) => handleStaffMemberChange(idx, 'email', v)}
                  type="email"
                />
              </div>
            </div>
          ))}

          <button className="btn-add-row" onClick={addStaffMember}>
            <Plus size={16} /> कार्मिक जोड़ें
          </button>
        </div>
      </div>

      {/* Staff Requirements Question (Psychological) */}
      <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div className="question-block">
          <div className="question-text" style={{ fontSize: '16px', color: 'var(--primary-800)', marginBottom: '8px' }}>
            आपकी राय में, विद्यालय के सुचारू संचालन और विद्यार्थियों के बेहतर भविष्य के लिए किन-किन पदों पर कितने अतिरिक्त कार्मिकों की नितांत आवश्यकता है? 
          </div>
          <p className="text-sm text-gray mb-4">
            (कृपया मनोवैज्ञानिक दृष्टिकोण से बताएँ कि इन शिक्षकों की कमी से बच्चों की पढ़ाई और विद्यालय के माहौल पर क्या प्रभाव पड़ रहा है)
          </p>
          <textarea
            className="input-field"
            value={state.surveyData.staff_requirements_details || ''}
            onChange={(e) => setField('staff_requirements_details', e.target.value)}
            placeholder="विस्तृत विवरण यहाँ लिखें..."
            rows={4}
            style={{ width: '100%', resize: 'vertical' }}
          ></textarea>
        </div>
      </div>
    </div>
  );
}
