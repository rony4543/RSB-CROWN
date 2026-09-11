import { useSurvey } from '../../context/SurveyContext';
import RepeatableTable from '../common/RepeatableTable';
import FloatingInput from '../common/FloatingInput';
import { Trash2, Plus } from 'lucide-react';

export default function StaffSection() {
  const { state, dispatch } = useSurvey();
  const { staffPositions, staffMembers } = state;

  // Q7 — Staff positions
  const handlePositionChange = (updated) => {
    // Auto-calculate vacant = sanctioned - working
    const calc = updated.map(row => ({
      ...row,
      vacant: (parseInt(row.sanctioned) || 0) - (parseInt(row.working) || 0)
    }));
    dispatch({ type: 'SET_STAFF_POSITIONS', payload: calc });
  };

  const positionColumns = [
    { key: 'post_name', label: 'पद', width: '180px' },
    { key: 'sanctioned', label: 'स्वीकृत', type: 'number', width: '90px' },
    { key: 'working', label: 'कार्यरत', type: 'number', width: '90px' },
    { key: 'vacant', label: 'रिक्त', readOnly: true, width: '90px' },
    { key: 'remarks', label: 'वि.वि.' },
  ];

  // Q8 — Staff members
  const addStaffMember = () => {
    dispatch({ type: 'SET_STAFF_MEMBERS', payload: [...staffMembers, { name: '', post: '', subject: '', mobile: '', email: '' }] });
  };

  const removeStaffMember = (idx) => {
    dispatch({ type: 'SET_STAFF_MEMBERS', payload: staffMembers.filter((_, i) => i !== idx) });
  };

  const handleStaffMemberChange = (idx, field, value) => {
    const updated = staffMembers.map((m, i) => i === idx ? { ...m, [field]: value } : m);
    dispatch({ type: 'SET_STAFF_MEMBERS', payload: updated });
  };

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
          <p className="text-sm text-gray mb-4">रिक्त = स्वीकृत − कार्यरत (स्वचालित गणना)</p>

          <div className="repeatable-table-wrapper">
            <table className="repeatable-table">
              <thead>
                <tr>
                  <th style={{width: '40px'}}>#</th>
                  {positionColumns.map((col, i) => (
                    <th key={i} style={col.width ? { width: col.width } : {}}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffPositions.map((row, ri) => (
                  <tr key={ri}>
                    <td style={{textAlign: 'center', color: '#9ca3af', fontSize: '12px'}}>{ri + 1}</td>
                    <td><input type="text" value={row.post_name} readOnly style={{background:'#f9fafb', fontWeight: 500}} /></td>
                    <td><input type="number" min="0" value={row.sanctioned} onChange={e => {
                      const u = [...staffPositions]; u[ri] = {...u[ri], sanctioned: e.target.value, vacant: (parseInt(e.target.value)||0) - (parseInt(u[ri].working)||0)};
                      dispatch({type:'SET_STAFF_POSITIONS', payload:u});
                    }} /></td>
                    <td><input type="number" min="0" value={row.working} onChange={e => {
                      const u = [...staffPositions]; u[ri] = {...u[ri], working: e.target.value, vacant: (parseInt(u[ri].sanctioned)||0) - (parseInt(e.target.value)||0)};
                      dispatch({type:'SET_STAFF_POSITIONS', payload:u});
                    }} /></td>
                    <td><input type="text" value={row.vacant || 0} readOnly style={{background:'#fff8f0', fontWeight: 600, color: row.vacant > 0 ? '#dc2626' : '#16a34a'}} /></td>
                    <td><input type="text" value={row.remarks || ''} onChange={e => {
                      const u = [...staffPositions]; u[ri] = {...u[ri], remarks: e.target.value};
                      dispatch({type:'SET_STAFF_POSITIONS', payload:u});
                    }} /></td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="auto-calc-row">
                  <td></td>
                  <td><strong>कुल</strong></td>
                  <td><strong>{staffPositions.reduce((s,r) => s + (parseInt(r.sanctioned)||0), 0)}</strong></td>
                  <td><strong>{staffPositions.reduce((s,r) => s + (parseInt(r.working)||0), 0)}</strong></td>
                  <td><strong>{staffPositions.reduce((s,r) => s + (parseInt(r.vacant)||0), 0)}</strong></td>
                  <td><span className="auto-calc-badge">स्वचालित</span></td>
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
            <div key={idx} className="card" style={{background: '#fafbfc', marginBottom: '16px', padding: '16px'}}>
              <div className="flex justify-between items-center mb-4">
                <strong className="text-sm">कार्मिक #{idx + 1}</strong>
                <button className="btn-icon" onClick={() => removeStaffMember(idx)} title="हटाएँ">
                  <Trash2 size={16} />
                </button>
              </div>
              <FloatingInput label="कार्मिक का नाम" name={`staff_name_${idx}`} value={member.name}
                onChange={(_, v) => handleStaffMemberChange(idx, 'name', v)} />
              <div className="inline-fields">
                <FloatingInput label="पद" name={`staff_post_${idx}`} value={member.post}
                  onChange={(_, v) => handleStaffMemberChange(idx, 'post', v)} />
                <FloatingInput label="मूल विषय / कार्य" name={`staff_subject_${idx}`} value={member.subject}
                  onChange={(_, v) => handleStaffMemberChange(idx, 'subject', v)} />
              </div>
              <div className="inline-fields">
                <FloatingInput label="मोबाइल नंबर" name={`staff_mobile_${idx}`} value={member.mobile}
                  onChange={(_, v) => handleStaffMemberChange(idx, 'mobile', v)} type="tel" inputMode="numeric" maxLength={10} />
                <FloatingInput label="ईमेल" name={`staff_email_${idx}`} value={member.email}
                  onChange={(_, v) => handleStaffMemberChange(idx, 'email', v)} type="email" />
              </div>
            </div>
          ))}

          <button className="btn-add-row" onClick={addStaffMember}>
            <Plus size={16} /> कार्मिक जोड़ें
          </button>
        </div>
      </div>
    </div>
  );
}
