import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import { useSurvey } from '../../context/SurveyContext';
import { CheckCircle } from 'lucide-react';

export default function PlaygroundSection() {
  const { state, setField } = useSurvey();
  const d = state.surveyData;
  const YN = ['हाँ', 'नहीं'];

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q18 – Q20 | खेल मैदान एवं सामग्री</span>
        <h2 className="section-title">खेल मैदान एवं सामग्री</h2>
      </div>

      {/* Q18 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q18</div>
          <div className="question-text">विद्यालय में खेल मैदान है?</div>
          <RadioGroup name="q18" value={d.q18} onChange={(n,v) => setField(n,v)} options={YN} />

          {/* If YES — show condition details */}
          {d.q18 === 'हाँ' && (
            <div className="conditional-block">
              <FloatingInput label="खेल मैदान की स्थिति" name="q18_condition"
                value={d.q18_condition} onChange={(n,v) => setField(n,v)} />
              <FloatingTextarea label="आवश्यकता / समस्या का विवरण" name="q18_details"
                value={d.q18_details} onChange={(n,v) => setField(n,v)} />
            </div>
          )}

          {/* If NO — ask about land ownership */}
          {d.q18 === 'नहीं' && (
            <div className="conditional-block">
              <div style={{
                padding: '12px 16px',
                background: 'var(--warning-50, #fffbeb)',
                borderRadius: '10px',
                borderLeft: '4px solid var(--warning-500, #f59e0b)',
                marginBottom: '16px',
                fontSize: '14px',
                color: 'var(--neutral-700)',
              }}>
                खेल मैदान नहीं है — कृपया नीचे जमीन संबंधी जानकारी दें।
              </div>

              <div className="question-text" style={{marginTop: '8px', fontSize: '14px', fontWeight: '600'}}>
                क्या आपके पास जमीन है?
              </div>
              <RadioGroup name="q18_has_land" value={d.q18_has_land} onChange={(n,v) => setField(n,v)} options={YN} />

              {/* If they HAVE land — OK */}
              {d.q18_has_land === 'हाँ' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'var(--success-50, #f0fdf4)',
                  borderRadius: '10px',
                  borderLeft: '4px solid var(--success-500, #22c55e)',
                  marginTop: '12px',
                  fontSize: '14px',
                  color: 'var(--success-700, #15803d)',
                }}>
                  <CheckCircle size={18} />
                  ठीक है — जमीन उपलब्ध है।
                </div>
              )}

              {/* If they DON'T have land — ask about govt land nearby */}
              {d.q18_has_land === 'नहीं' && (
                <div className="conditional-block" style={{marginTop: '12px'}}>
                  <div className="question-text" style={{fontSize: '14px', fontWeight: '600'}}>
                    क्या आपके आस-पास 5 किलोमीटर के अंदर कोई सरकारी जमीन है?
                  </div>
                  <RadioGroup name="q18_govt_land_nearby" value={d.q18_govt_land_nearby} onChange={(n,v) => setField(n,v)} options={YN} />

                  {/* If govt land IS available — ask for khasra number */}
                  {d.q18_govt_land_nearby === 'हाँ' && (
                    <div className="conditional-block" style={{marginTop: '8px'}}>
                      <FloatingInput label="खसरा नंबर" name="q18_khasra_number"
                        value={d.q18_khasra_number} onChange={(n,v) => setField(n,v)} />
                      <FloatingTextarea label="सरकारी जमीन का विवरण" name="q18_govt_land_details"
                        value={d.q18_govt_land_details} onChange={(n,v) => setField(n,v)} />
                    </div>
                  )}

                  {/* If NO govt land nearby — OK */}
                  {d.q18_govt_land_nearby === 'नहीं' && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      background: 'var(--neutral-50, #f9fafb)',
                      borderRadius: '10px',
                      borderLeft: '4px solid var(--neutral-400, #9ca3af)',
                      marginTop: '12px',
                      fontSize: '14px',
                      color: 'var(--neutral-600)',
                    }}>
                      ठीक है — आस-पास कोई सरकारी जमीन उपलब्ध नहीं है।
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Q19 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q19</div>
          <div className="question-text">विद्यालय की भूमि / खेल मैदान में अतिक्रमित भूमि कितनी है?</div>
          <FloatingInput label="अतिक्रमित भूमि (बीघा में)" name="q19_area"
            value={d.q19_area} onChange={(n,v) => setField(n,v)} type="number" inputMode="decimal" min="0" />
          <FloatingTextarea label="अतिक्रमण का विवरण" name="q19_details"
            value={d.q19_details} onChange={(n,v) => setField(n,v)} />
        </div>
      </div>

      {/* Q20 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q20</div>
          <div className="question-text">क्या विद्यालय में खेलों की सामग्री है?</div>
          <RadioGroup name="q20" value={d.q20} onChange={(n,v) => setField(n,v)} options={YN} />
          {d.q20 === 'नहीं' && (
            <div className="conditional-block">
              <FloatingTextarea label="आवश्यक खेल सामग्री का विवरण" name="q20_details"
                value={d.q20_details} onChange={(n,v) => setField(n,v)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
