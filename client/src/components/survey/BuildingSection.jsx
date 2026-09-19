import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';
import { CheckCircle, Home, Users, Hammer } from 'lucide-react';

export default function BuildingSection() {
  const { state, setField, dispatch } = useSurvey();
  const d = state.surveyData;
  const errors = state.errors || {};
  const YN = ['हाँ', 'नहीं'];

  const handleChange = (name, value) => {
    setField(name, value);
    if (errors[name]) dispatch({ type: 'SET_ERRORS', errors: { ...errors, [name]: null } });
  };

  // Calculate enrolled students from studentEnrollment (Section 11)
  const totalEnrolled = (state.studentEnrollment || []).reduce((sum, r) => {
    const b = parseInt(r.boys) || 0;
    const g = parseInt(r.girls) || 0;
    return sum + b + g;
  }, 0);

  // Effective total students for calculation (user override or auto-enrolled)
  const effectiveStudents = d.q9_total_students !== undefined && d.q9_total_students !== ''
    ? (parseInt(d.q9_total_students) || 0)
    : totalEnrolled;

  // 2023 rooms breakdown
  const r2023 = parseInt(d.q9_rooms_upto_2023);
  const rNew = parseInt(d.q9_new_rooms_after_2023);
  const has2023Data = !isNaN(r2023);
  const hasNewData = !isNaN(rNew);
  const calculatedTotalRooms = (has2023Data ? r2023 : 0) + (hasNewData ? rNew : 0);
  const currentRooms = parseInt(d.q9_existing_rooms) || 0;

  // Student-Room Ratio Calculations (30 students per room norm)
  const requiredRoomsByRatio = effectiveStudents > 0 ? Math.ceil(effectiveStudents / 30) : 0;
  const additionalRoomsNeeded = Math.max(0, requiredRoomsByRatio - currentRooms);

  const handleBreakdownChange = (name, val) => {
    setField(name, val);
    const updated2023 = name === 'q9_rooms_upto_2023' ? parseInt(val) : r2023;
    const updatedNew = name === 'q9_new_rooms_after_2023' ? parseInt(val) : rNew;
    if (!isNaN(updated2023) || !isNaN(updatedNew)) {
      const sum = (isNaN(updated2023) ? 0 : updated2023) + (isNaN(updatedNew) ? 0 : updatedNew);
      // If current rooms field is empty or matched previous auto-sum, keep in sync
      if (!d.q9_existing_rooms || parseInt(d.q9_existing_rooms) === calculatedTotalRooms) {
        setField('q9_existing_rooms', String(sum));
      }
    }
  };

  const applyCalculatedRooms = () => {
    setField('q9_existing_rooms', String(calculatedTotalRooms));
  };

  const applyCalculatedRatioRooms = () => {
    setField('q9_additional_rooms', String(additionalRoomsNeeded));
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q9 – Q10 | भवन एवं फर्नीचर</span>
        <h2 className="section-title">भवन एवं फर्नीचर</h2>
        <p className="section-description">
          विद्यालय में उपलब्ध कक्षा-कक्ष, छात्रानुपात आवश्यकता एवं मरम्मत योग्य भवनों का विवरण।
        </p>
      </div>

      {/* HIGHLIGHTED Q9 - ADMIN VALIDATED */}
      <div className="card-highlighted-admin">
        <div className="question-block" style={{marginBottom: 0}}>
          {/* Admin Highlight Badge */}
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px'}}>
            <div className="admin-header-pill">
              ★ व्यवस्थापक सत्यापन प्रश्न (Admin Validated Question)
            </div>
            <span style={{fontSize: '12px', color: 'var(--primary-700)', fontWeight: 600}}>
              Q9 • प्राथमिक सत्यापन मानक
            </span>
          </div>

          <div className="question-number" style={{fontSize: '13px', color: 'var(--primary-700)'}}>Q9</div>
          <div className="question-text" style={{fontSize: '18px', fontWeight: '700', color: 'var(--primary-900)', marginBottom: '8px'}}>
            वर्तमान में उपलब्ध कक्ष — आपके विद्यालय में कितनी कक्ष उपलब्ध हैं?
          </div>

          {/* Admin Validation Criteria Note */}
          <div className="admin-guidance-banner">
            <strong>📋 प्रशासनिक सत्यापन नियम (Validation Norm):</strong>
            <ul style={{margin: '6px 0 0 18px', padding: 0}}>
              <li>वर्ष <strong>2023 तक</strong> उपलब्ध कक्ष + वर्ष <strong>2023 के बाद</strong> बने नए कक्ष = <strong>वर्तमान में उपलब्ध कुल कक्ष</strong>।</li>
              <li>छात्रानुपात मानक: <strong>30 छात्र प्रति कक्ष (30 students per room)</strong> के अनुसार अतिरिक्त कक्ष आवश्यकता निर्धारित करें।</li>
            </ul>
          </div>

          {/* Room Count Breakdown */}
          <div style={{marginBottom: '18px'}}>
            <div style={{fontSize: '14px', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'}}>
              <Home size={16} style={{color: 'var(--primary-600)'}} />
              1. कक्षा-कक्षों की उपलब्धता एवं इतिहास (Room Breakdown)
            </div>

            <div className="inline-fields">
              <FloatingInput
                label="2023 तक विद्यालय में कितनी कक्ष थीं?"
                name="q9_rooms_upto_2023"
                value={d.q9_rooms_upto_2023}
                onChange={handleBreakdownChange}
                type="number"
                inputMode="numeric"
                min="0"
              />
              <FloatingInput
                label="2023 के बाद अब तक नए कक्ष कितने बने हैं?"
                name="q9_new_rooms_after_2023"
                value={d.q9_new_rooms_after_2023}
                onChange={handleBreakdownChange}
                type="number"
                inputMode="numeric"
                min="0"
              />
            </div>

            <div style={{marginTop: '4px'}}>
              <FloatingInput
                label="वर्तमान में उपलब्ध कुल कक्ष (कुल कमरे)"
                name="q9_existing_rooms"
                value={d.q9_existing_rooms}
                onChange={handleChange}
                type="number"
                inputMode="numeric"
                min="0"
                error={errors.q9_existing_rooms}
                required
              />
            </div>

            {/* Breakdown Auto-sum Feedback Banner */}
            {(has2023Data || hasNewData) && (
              <div className="rooms-summary-banner" style={{marginTop: '10px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <CheckCircle size={16} style={{color: 'var(--primary-600)'}} />
                  <span>
                    2023 तक (<strong>{has2023Data ? r2023 : 0}</strong>) + 2023 के बाद नए (<strong>{hasNewData ? rNew : 0}</strong>) = कुल <strong>{calculatedTotalRooms}</strong> कक्ष
                  </span>
                </div>
                {String(calculatedTotalRooms) !== String(d.q9_existing_rooms || '') && (
                  <button
                    type="button"
                    onClick={applyCalculatedRooms}
                    className="btn btn-sm btn-outline"
                    style={{padding: '4px 10px', fontSize: '12px', background: '#ffffff'}}
                  >
                    कुल कक्ष {calculatedTotalRooms} सेट करें
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Student-Room Ratio Management (30 students per room norm) */}
          <div className="ratio-management-card">
            <div className="ratio-header">
              <div className="ratio-title">
                <Users size={18} />
                2. छात्रानुपात में अतिरिक्त कक्ष की आवश्यकता (30 छात्र प्रति कक्ष प्रबंधन)
              </div>
              <span className="ratio-badge">मानक: 30 छात्र / 1 कक्ष</span>
            </div>

            <p style={{fontSize: '13px', color: 'var(--gray-600)', margin: '0 0 14px 0', lineHeight: 1.5}}>
              मानक के अनुसार प्रत्येक 30 विद्यार्थियों पर 1 कक्ष होना चाहिए (उदा. 120-150 छात्रों पर 4 से 5 कक्ष आवश्यक)।
            </p>

            {/* Ratio Calculation Metrics */}
            <div className="ratio-stats-grid">
              <div className="ratio-stat-box">
                <span className="stat-label">कुल विद्यार्थी</span>
                <span className="stat-val" style={{color: 'var(--primary-700)'}}>{effectiveStudents}</span>
              </div>
              <div className="ratio-stat-box">
                <span className="stat-label">मानक अनुपात</span>
                <span className="stat-val" style={{fontSize: '14px', color: 'var(--gray-700)'}}>30 छात्र/कक्ष</span>
              </div>
              <div className="ratio-stat-box highlight">
                <span className="stat-label">आवश्यक कुल कक्ष</span>
                <span className="stat-val" style={{color: 'var(--accent-700)'}}>{requiredRoomsByRatio}</span>
              </div>
              <div className="ratio-stat-box">
                <span className="stat-label">वर्तमान उपलब्ध कक्ष</span>
                <span className="stat-val" style={{color: 'var(--gray-700)'}}>{currentRooms}</span>
              </div>
              <div className="ratio-stat-box target">
                <span className="stat-label">अतिरिक्त आवश्यकता</span>
                <span className="stat-val" style={{color: additionalRoomsNeeded > 0 ? 'var(--danger-600)' : 'var(--success-600)'}}>
                  {additionalRoomsNeeded} कक्ष
                </span>
              </div>
            </div>

            <div className="inline-fields" style={{alignItems: 'flex-start'}}>
              <div>
                <FloatingInput
                  label="कुल अध्ययनरत / नामांकित छात्र संख्या"
                  name="q9_total_students"
                  value={d.q9_total_students !== undefined ? d.q9_total_students : (totalEnrolled > 0 ? String(totalEnrolled) : '')}
                  onChange={(n, v) => setField(n, v)}
                  type="number"
                  inputMode="numeric"
                  min="0"
                />
                {totalEnrolled > 0 && (
                  <span style={{fontSize: '11px', color: 'var(--success-600)', display: 'block', marginTop: '4px'}}>
                    ✓ नामांकन तालिका (Q28) से {totalEnrolled} छात्र स्वतः प्राप्त
                  </span>
                )}
              </div>

              <div>
                <FloatingInput
                  label="छात्रानुपात में अतिरिक्त कक्षा-कक्षों की आवश्यकता"
                  name="q9_additional_rooms"
                  value={d.q9_additional_rooms}
                  onChange={(n, v) => setField(n, v)}
                  type="number"
                  inputMode="numeric"
                  min="0"
                />
                {effectiveStudents > 0 && String(additionalRoomsNeeded) !== String(d.q9_additional_rooms || '') && (
                  <button
                    type="button"
                    onClick={applyCalculatedRatioRooms}
                    className="btn btn-sm"
                    style={{
                      marginTop: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      background: 'var(--accent-50)',
                      color: 'var(--accent-700)',
                      border: '1px solid var(--accent-300)',
                      borderRadius: '6px'
                    }}
                  >
                    ⚡ गणना अनुसार {additionalRoomsNeeded} कक्ष लागू करें
                  </button>
                )}
              </div>
            </div>

            <div style={{marginTop: '12px'}}>
              <FloatingInput
                label="अन्य कारणों से अतिरिक्त कक्षा-कक्षों की सामान्य आवश्यकता"
                name="q9_required_rooms"
                value={d.q9_required_rooms}
                onChange={(n, v) => setField(n, v)}
                type="number"
                inputMode="numeric"
                min="0"
              />
            </div>
          </div>

          {/* Repairable Buildings Section */}
          <div className="repair-building-card">
            <div style={{fontSize: '14px', fontWeight: 700, color: 'var(--warning-700, #b45309)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Hammer size={16} />
              3. मरम्मत योग्य भवन की संख्या एवं विवरण (Building Repair Details)
            </div>

            <div style={{marginBottom: '12px'}}>
              <FloatingInput
                label="मरम्मत योग्य भवन की संख्या"
                name="q9_repairable_buildings_count"
                value={d.q9_repairable_buildings_count}
                onChange={(n, v) => setField(n, v)}
                type="number"
                inputMode="numeric"
                min="0"
              />
            </div>

            <div style={{marginBottom: '12px'}}>
              <div className="question-text" style={{fontSize: '14px', fontWeight: '600', marginBottom: '4px'}}>
                क्या विद्यालय के भवनों की रंगरोगन (Painting) की आवश्यकता है?
              </div>
              <RadioGroup name="q9_needs_painting" value={d.q9_needs_painting} onChange={(n,v) => setField(n,v)} options={YN} />
            </div>

            {d.q9_needs_painting === 'हाँ' && (
              <div className="conditional-block" style={{marginBottom: '12px'}}>
                <FloatingTextarea
                  label="रंगरोगन / मरम्मत योग्य भवन का विवरण"
                  name="q9_condition"
                  value={d.q9_condition}
                  onChange={(n, v) => setField(n, v)}
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Classes Running Outside - NEW */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q9B</div>
          <div className="question-text">क्या विद्यालय में कक्ष की कमी से कक्षाएं बाहर (खुले में) संचालित हो रही हैं?</div>
          <RadioGroup name="q9b_classes_outside" value={d.q9b_classes_outside} onChange={(n,v) => setField(n,v)} options={YN} />

          {d.q9b_classes_outside === 'हाँ' && (
            <div className="conditional-block">
              <FloatingInput label="कितनी कक्षाएं बाहर संचालित हो रही हैं? (संख्या)" name="q9b_classes_outside_count"
                value={d.q9b_classes_outside_count} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
            </div>
          )}
        </div>
      </div>

      {/* Approved but Unbuilt Buildings - NEW */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q9C</div>
          <div className="question-text">क्या किसी अन्य योजना में भवन स्वीकृत हुआ है?</div>
          <RadioGroup name="q9c_approved_unbuilt" value={d.q9c_approved_unbuilt} onChange={(n,v) => setField(n,v)} options={YN} />

          {d.q9c_approved_unbuilt === 'हाँ' && (
            <div className="conditional-block">
              <FloatingTextarea label="स्वीकृत भवनों का विवरण (योजना का नाम, स्वीकृति वर्ष, आदि)" name="q9c_approved_unbuilt_details"
                value={d.q9c_approved_unbuilt_details} onChange={(n,v) => setField(n,v)} rows={2} />
              <FloatingInput label="वर्तमान स्थिति" name="q9c_current_status"
                value={d.q9c_current_status} onChange={(n,v) => setField(n,v)} />
            </div>
          )}
        </div>
      </div>

      {/* Building Dilapidation Status — NEW */}
      <div className="card">
        <div className="question-block">
          <div className="question-number" style={{background: 'var(--accent-100, #fef3c7)', color: 'var(--accent-700, #b45309)'}}>Q9A</div>
          <div className="question-text">भवनों की स्थिति — जर्जर भवन</div>
          
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 16px',
            background: 'var(--warning-50, #fffbeb)',
            borderRadius: '10px',
            borderLeft: '4px solid var(--warning-500, #f59e0b)',
            marginBottom: '16px',
            marginTop: '8px',
            fontSize: '13px',
            color: 'var(--neutral-700)',
          }}>
            कृपया बताएँ कि विद्यालय के कितने भवन जर्जर (dilapidated) घोषित हैं।
          </div>

          <div className="question-text" style={{fontSize: '14px', fontWeight: '600', marginBottom: '4px'}}>
            क्या विद्यालय के कोई भवन जर्जर घोषित हैं?
          </div>
          <RadioGroup name="q9a_dilapidated" value={d.q9a_dilapidated} onChange={(n,v) => setField(n,v)} options={YN} />

          {d.q9a_dilapidated === 'हाँ' && (
            <div className="conditional-block">
              <FloatingInput label="जर्जर घोषित भवनों की संख्या" name="q9a_dilapidated_count"
                value={d.q9a_dilapidated_count} onChange={(n,v) => setField(n,v)} type="number" inputMode="numeric" min="0" />
              <FloatingTextarea label="जर्जर भवनों का विवरण (स्थिति, कब घोषित हुआ, आदि)" name="q9a_dilapidated_details"
                value={d.q9a_dilapidated_details} onChange={(n,v) => setField(n,v)} rows={3} />
            </div>
          )}

          {d.q9a_dilapidated === 'नहीं' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'var(--success-50, #f0fdf4)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--success-500, #22c55e)',
              marginTop: '8px',
              fontSize: '13px',
              color: 'var(--success-700, #15803d)',
            }}>
              ✅ कोई भवन जर्जर घोषित नहीं है।
            </div>
          )}
        </div>
      </div>

      {/* Q10 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q10</div>
          <div className="question-text">विद्यार्थियों के लिए फर्नीचर की स्थिति का विवरण दें। (कक्षा 6 से 12)</div>
          <div className="inline-fields">
            <FloatingInput label="पूर्व में उपलब्ध फर्नीचर की संख्या" name="q10_existing"
              value={d.q10_existing} onChange={handleChange} type="number" inputMode="numeric" min="0" error={errors.q10_existing} required />
            <FloatingInput label="वर्तमान में फर्नीचर की आवश्यकता" name="q10_required"
              value={d.q10_required} onChange={handleChange} type="number" inputMode="numeric" min="0" error={errors.q10_required} required />
          </div>
        </div>
      </div>
    </div>
  );
}
