import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import FloatingSelect from '../common/FloatingSelect';
import { useSurvey } from '../../context/SurveyContext';
import { REQUIREMENT_CATEGORIES, PRIORITIES } from '../../utils/constants';
import { Trash2, Plus } from 'lucide-react';

export default function RequirementsSection() {
  const { state, dispatch } = useSurvey();
  const { requirements } = state;

  const addReq = () => {
    dispatch({ type: 'SET_REQUIREMENTS', payload: [...requirements, {
      name: '', category: '', description: '', quantity: '', unit: '',
      priority: 'medium', estimated_cost: '', location: '', details: '', question_number: 'Q40'
    }] });
  };

  const removeReq = (idx) => {
    dispatch({ type: 'SET_REQUIREMENTS', payload: requirements.filter((_, i) => i !== idx) });
  };

  const updateReq = (idx, field, value) => {
    const updated = requirements.map((r, i) => i === idx ? { ...r, [field]: value } : r);
    dispatch({ type: 'SET_REQUIREMENTS', payload: updated });
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q40 | अन्य आवश्यक सुविधाएँ</span>
        <h2 className="section-title">अन्य आवश्यक सुविधाओं की मांग</h2>
        <p className="section-description">विद्यालय के लिए आवश्यक सुविधाओं / कार्यों की सूची बनाएँ। प्रत्येक आवश्यकता से कार्य (Work) रिकॉर्ड बनेगा।</p>
      </div>

      {requirements.map((req, idx) => (
        <div key={idx} className="card" style={{borderLeft: '4px solid var(--accent-400)'}}>
          <div className="flex justify-between items-center mb-4">
            <strong style={{color: 'var(--primary-700)'}}>आवश्यकता #{idx + 1}</strong>
            <button className="btn-icon" onClick={() => removeReq(idx)} title="हटाएँ">
              <Trash2 size={16} />
            </button>
          </div>

          <FloatingInput label="सुविधा / कार्य का नाम" name={`req_name_${idx}`}
            value={req.name} onChange={(_, v) => updateReq(idx, 'name', v)} required />

          <div className="inline-fields">
            <FloatingSelect label="श्रेणी" name={`req_cat_${idx}`}
              value={req.category} onChange={(_, v) => updateReq(idx, 'category', v)}
              options={REQUIREMENT_CATEGORIES} required />
            <FloatingSelect label="प्राथमिकता" name={`req_pri_${idx}`}
              value={req.priority} onChange={(_, v) => updateReq(idx, 'priority', v)}
              options={PRIORITIES} />
          </div>

          <FloatingTextarea label="आवश्यकता का विवरण" name={`req_desc_${idx}`}
            value={req.description} onChange={(_, v) => updateReq(idx, 'description', v)} rows={2} />

          <div className="inline-fields">
            <FloatingInput label="मात्रा" name={`req_qty_${idx}`}
              value={req.quantity} onChange={(_, v) => updateReq(idx, 'quantity', v)} />
            <FloatingInput label="इकाई" name={`req_unit_${idx}`}
              value={req.unit} onChange={(_, v) => updateReq(idx, 'unit', v)} />
          </div>

          <div className="inline-fields">
            <FloatingInput label="अनुमानित लागत (₹)" name={`req_cost_${idx}`}
              value={req.estimated_cost} onChange={(_, v) => updateReq(idx, 'estimated_cost', v)} inputMode="numeric" />
            <FloatingInput label="स्थान" name={`req_loc_${idx}`}
              value={req.location} onChange={(_, v) => updateReq(idx, 'location', v)} />
          </div>

          <FloatingTextarea label="अन्य विशेष विवरण" name={`req_det_${idx}`}
            value={req.details} onChange={(_, v) => updateReq(idx, 'details', v)} rows={2} />
        </div>
      ))}

      <button className="btn-add-row" onClick={addReq} style={{marginTop: '8px'}}>
        <Plus size={16} /> आवश्यकता जोड़ें
      </button>
    </div>
  );
}
