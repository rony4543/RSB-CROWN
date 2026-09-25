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
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(13, 27, 62, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(145deg, #ffffff, #f0f5fb)',
          padding: '60px 40px',
          borderRadius: '30px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.8)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--primary-100)', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.6 }}></div>
          <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--accent-100)', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.6 }}></div>
          
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'var(--success-50)',
            border: '4px solid var(--success-100)',
            color: 'var(--success-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px auto',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 10px 25px rgba(34, 197, 94, 0.2)'
          }}>
            <CheckCircle size={50} strokeWidth={2.5} />
          </div>
          
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: 'var(--primary-900)',
            marginBottom: '16px',
            lineHeight: '1.2',
            position: 'relative',
            zIndex: 1
          }}>
            Your survey has been successfully submitted
          </h2>
          
          <p style={{
            fontSize: '18px',
            color: 'var(--gray-600)',
            marginBottom: '40px',
            lineHeight: '1.6',
            position: 'relative',
            zIndex: 1
          }}>
            Thank you for taking the time to share your school's details. Your response is highly valuable to us and will help shape a better future for education.
          </p>

          <button 
            onClick={() => { dispatch({type:'RESET'}); window.location.reload(); }}
            style={{
              background: 'var(--primary-900)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '50px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 10px 20px rgba(13, 27, 62, 0.2)',
              transition: 'transform 0.2s, background 0.2s',
              position: 'relative',
              zIndex: 1
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.background = 'var(--primary-800)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--primary-900)'; }}
          >
            Start a New Survey
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
        <span className="section-number">Overview</span>
        <h2 className="section-title" style={{ fontSize: '36px', fontWeight: '800', background: 'linear-gradient(90deg, var(--primary-900), var(--accent-600))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>One more confirmation</h2>
        <p className="section-description" style={{ fontSize: '18px' }}>Please review the details below. This is the final step before sharing the survey.</p>
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

      <div style={{textAlign:'center', padding: '40px 0', position: 'relative'}}>
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gray-300), transparent)' }}></div>
        <button 
          className="btn btn-lg" 
          style={{
            background: 'linear-gradient(135deg, var(--primary-800), var(--primary-600))',
            color: 'white',
            borderRadius: '50px',
            padding: '16px 48px',
            fontSize: '20px',
            fontWeight: '700',
            boxShadow: '0 10px 25px -5px rgba(26, 58, 107, 0.4), 0 8px 10px -6px rgba(26, 58, 107, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(26, 58, 107, 0.5), 0 10px 10px -5px rgba(26, 58, 107, 0.1)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(26, 58, 107, 0.4), 0 8px 10px -6px rgba(26, 58, 107, 0.1)'; }}
          onClick={() => {
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
          }}
        >
          Share the survey
        </button>
      </div>

      {showConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(13, 27, 62, 0.7)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowConfirm(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            width: '90%',
            maxWidth: '450px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto'
            }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-900)', marginBottom: '16px' }}>Ready to share?</h3>
            <p style={{ fontSize: '16px', color: 'var(--gray-600)', marginBottom: '32px', lineHeight: '1.5' }}>
              Are you sure you want to share the survey for <strong>{school.name || 'this school'}</strong>? You won't be able to make changes after this.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '12px 24px', borderRadius: '12px', border: '2px solid var(--gray-200)', background: 'transparent',
                  color: 'var(--gray-700)', fontSize: '16px', fontWeight: '600', cursor: 'pointer', flex: 1
                }}
              >Cancel</button>
              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                style={{
                  padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--primary-600)',
                  color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', flex: 1,
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Sharing...' : 'Yes, Share'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
