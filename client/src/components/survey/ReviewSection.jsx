import { useSurvey } from '../../context/SurveyContext';
import { SECTIONS } from '../../utils/constants';
import { CheckCircle, AlertTriangle, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../services/api';
import { validateSection } from '../../utils/validation';

export default function ReviewSection() {
  const { state, dispatch, goToSection, saveToServer } = useSurvey();
  const { school, surveyData: d, staffPositions, studentEnrollment, requirements, surveyId, status } = state;
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(status === 'submitted');

  const totalBoys = studentEnrollment.reduce((s, r) => s + (parseInt(r.boys) || 0), 0);
  const totalGirls = studentEnrollment.reduce((s, r) => s + (parseInt(r.girls) || 0), 0);
  const totalStaff = staffPositions.filter(r => r.working === 'हाँ' || parseInt(r.working) > 0).length;
  const totalVacant = staffPositions.filter(r => (r.sanctioned === 'हाँ' && r.working !== 'हाँ') || parseInt(r.vacant) > 0).length;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (surveyId && !String(surveyId).startsWith('local_')) {
        await saveToServer();
        await api.submitSurvey(surveyId);
      }
    } catch (err) {
      console.warn('Server submit unavailable, finalizing locally:', err);
    }
    dispatch({ type: 'SET_SUBMITTED' });
    setSubmitted(true);
    localStorage.removeItem('jankali_survey_draft');
    try {
      const savedSurveys = JSON.parse(localStorage.getItem('completed_surveys') || '[]');
      savedSurveys.push({
        id: surveyId,
        school,
        surveyData: d,
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem('completed_surveys', JSON.stringify(savedSurveys));
    } catch (e) {
      console.error('Failed to store completed survey in localStorage:', e);
    }
    setSubmitting(false);
    setShowConfirm(false);
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'var(--white)',
          padding: '60px 40px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '450px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--success-100)',
            color: 'var(--success-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={48} />
          </div>
          
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--primary-900)',
            margin: '0'
          }}>Done</h2>
          
          <p style={{
            fontSize: '16px',
            color: 'var(--gray-600)',
            margin: '0',
            lineHeight: '1.5'
          }}>
            सर्वे सफलतापूर्वक जमा किया गया है।<br/>
            (ID: {surveyId})
          </p>

          <button 
            className="btn btn-primary" 
            onClick={() => { dispatch({type:'RESET'}); window.location.reload(); }}
            style={{
              marginTop: '16px',
              width: '100%',
              borderRadius: '30px',
              padding: '12px',
              fontSize: '16px'
            }}
          >
            नया सर्वे शुरू करें
          </button>
        </div>
      </div>
    );
  }

  const ReviewRow = ({label, value}) => (
    <div className="review-field">
      <span className="review-field-label">{label}</span>
      <span className="review-field-value">{value || '—'}</span>
    </div>
  );

  return (
    <div>
      <div className="section-header">
        <span className="section-number">समीक्षा</span>
        <h2 className="section-title">समीक्षा एवं जमा करें</h2>
        <p className="section-description">कृपया सभी जानकारी की जाँच करें। गलत जानकारी को संपादित करने के लिए "संपादित करें" बटन दबाएँ।</p>
      </div>

      {/* School Profile */}
      <div className="review-section">
        <div className="review-section-header" onClick={() => goToSection(0)}>
          <span className="review-section-title"><CheckCircle size={16} style={{color:'var(--success-600)'}}/> विद्यालय प्रोफाइल</span>
          <button className="btn btn-sm btn-outline"><Edit3 size={14} /> संपादित करें</button>
        </div>
        <div className="review-section-body">
          <ReviewRow label="विद्यालय" value={school.name} />
          <ReviewRow label="गाँव" value={school.village} />
          <ReviewRow label="ग्राम पंचायत" value={school.gram_panchayat} />
          <ReviewRow label="पंचायत समिति" value={school.panchayat_samiti} />
          <ReviewRow label="UDISE CODE" value={school.udise_code} />
          {school.school_code && <ReviewRow label="विद्यालय कोड" value={school.school_code} />}
          <ReviewRow label="संस्थाप्रधान" value={school.principal_name} />
          <ReviewRow label="मोबाइल" value={school.principal_mobile} />
        </div>
      </div>

      {/* Quick summary of key answers */}
      <div className="review-section">
        <div className="review-section-header">
          <span className="review-section-title">मुख्य जानकारी सारांश</span>
        </div>
        <div className="review-section-body">
          <ReviewRow label="Q1 — विद्यालय का प्रकार" value={d.q1} />
          {d.q1 === 'उच्च माध्यमिक विद्यालय' && (
            <>
              <ReviewRow 
                label="Q2 — विद्यालय का संकाय" 
                value={
                  typeof d.q2 === 'object' && d.q2 !== null
                    ? Object.entries(d.q2).map(([fac, subs]) => `${fac}: ${subs.length ? subs.join(', ') : 'कोई विषय नहीं'}`).join(' | ')
                    : d.q2
                } 
              />
              {['कला', 'विज्ञान', 'कृषि', 'वाणिज्य', 'व्यावसायिक'].map(sub => d[`q3_${sub}`] ? (
                <ReviewRow key={sub} label={`Q3 — ${sub} विषय`} value={d[`q3_${sub}`]} />
              ) : null)}
            </>
          )}
          <ReviewRow label="Q4 — PM Shri / MGGS" value={d.q4} />
          <ReviewRow
            label="Q9 — वर्तमान उपलब्ध कुल कक्ष"
            value={d.q9_existing_rooms !== undefined && d.q9_existing_rooms !== ''
              ? `${d.q9_existing_rooms} कक्ष ${d.q9_rooms_upto_2023 || d.q9_new_rooms_after_2023 ? `(2023 तक: ${d.q9_rooms_upto_2023 || 0}, 2023 बाद नए: ${d.q9_new_rooms_after_2023 || 0})` : ''}`
              : '—'}
          />
          <ReviewRow
            label="Q9 — छात्रानुपात में अतिरिक्त कक्ष"
            value={d.q9_additional_rooms !== undefined && d.q9_additional_rooms !== ''
              ? `${d.q9_additional_rooms} कक्ष (मानक: 30 छात्र/कक्ष)`
              : '—'}
          />
          <ReviewRow
            label="Q9 — मरम्मत योग्य भवन संख्या"
            value={d.q9_repairable_buildings_count !== undefined && d.q9_repairable_buildings_count !== ''
              ? `${d.q9_repairable_buildings_count} भवन${d.q9_condition ? ` — ${d.q9_condition}` : ''}`
              : (d.q9_condition || '—')}
          />
          <ReviewRow label="Q9A — जर्जर भवन" value={d.q9a_dilapidated === 'हाँ' ? `हाँ — ${d.q9a_dilapidated_count || '?'} भवन` : d.q9a_dilapidated} />
          <ReviewRow label="Q11 — बिजली" value={d.q11_electricity} />
          <ReviewRow label="Q12 — कम्प्यूटर" value={d.q12_total ? `कुल: ${d.q12_total}, कार्यशील: ${d.q12_working || 0}` : '—'} />
          <ReviewRow label="Q13 — इंटरनेट" value={d.q13_internet} />
          <ReviewRow label="Q16 — चारदीवारी" value={d.q16} />
          <ReviewRow label="Q18 — खेल मैदान" value={d.q18} />
          {d.q18 === 'नहीं' && (
            <>
              <ReviewRow label="Q18 — जमीन उपलब्ध" value={d.q18_has_land} />
              {d.q18_has_land === 'नहीं' && (
                <>
                  <ReviewRow label="Q18 — सरकारी जमीन (5 km)" value={d.q18_govt_land_nearby} />
                  {d.q18_govt_land_nearby === 'हाँ' && (
                    <ReviewRow label="Q18 — खसरा नंबर" value={d.q18_khasra_number} />
                  )}
                </>
              )}
            </>
          )}
          <ReviewRow label="Q21 — सड़क मार्ग" value={d.q21} />
          <ReviewRow label="Q22A — रास्ते का प्रकार" value={d.q22a_road_type} />
          <ReviewRow label="Q22A — कच्चा रस्ता दूरी" value={d.q22a_kaccha_distance ? `${d.q22a_kaccha_distance} किमी` : '—'} />
          <ReviewRow label="Q22A — पक्का रस्ता दूरी" value={d.q22a_pakka_distance ? `${d.q22a_pakka_distance} किमी` : '—'} />
          <ReviewRow label="Q23 — शौचालय" value={d.q23_available} />
          <ReviewRow label="Q23A — शौचालय जियोटैग" value={d.q23_toilet_geo_lat ? `${d.q23_toilet_geo_lat}, ${d.q23_toilet_geo_lng}` : 'फोटो नहीं ली'} />
          <ReviewRow label="Q25 — पेयजल" value={d.q25} />
          <ReviewRow label="Q33 — स्मार्ट क्लासरूम" value={d.q33} />
          {d.q33 === 'हाँ' && d.q33_smart_classes && (
            <ReviewRow label="Q33 — स्मार्ट कक्षाएँ" value={d.q33_smart_classes.split(',').sort((a,b) => Number(a) - Number(b)).map(c => `कक्षा ${c}`).join(', ')} />
          )}
          <ReviewRow label="कुल विद्यार्थी" value={`${totalBoys + totalGirls} (छात्र: ${totalBoys}, छात्रा: ${totalGirls})`} />
          <ReviewRow label="कार्यरत / रिक्त" value={`${totalStaff} कार्यरत, ${totalVacant} रिक्त`} />
          <ReviewRow label="आवश्यकताएँ" value={`${requirements.length} दर्ज`} />
        </div>
      </div>

      <div style={{textAlign:'center', padding: '24px 0'}}>
        <button className="btn btn-lg btn-accent" onClick={() => {
          // Validate entire form before allowing submit
          for (let i = 0; i < SECTIONS.length - 1; i++) {
            const sectionKey = SECTIONS[i].key;
            const errors = validateSection(sectionKey, state);
            if (Object.keys(errors).length > 0) {
              dispatch({ type: 'SET_ERRORS', errors });
              goToSection(i);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              alert(`कृपया "${SECTIONS[i].title}" भाग में सभी अनिवार्य जानकारी भरें।`);
              return;
            }
          }
          setShowConfirm(true);
        }}>
          सर्वे जमा करें
        </button>
      </div>

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">सर्वे जमा करें?</h3>
            <p className="modal-text">
              क्या आप <strong>{school.name || 'इस विद्यालय'}</strong> का सर्वे जमा करना चाहते हैं?
              जमा करने के बाद सर्वे को बदला नहीं जा सकेगा।
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>वापस जाएँ</button>
              <button className="btn btn-accent" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'जमा हो रहा है...' : 'सर्वे जमा करें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
