import { useState, useRef } from 'react';
import RadioGroup from '../common/RadioGroup';
import FloatingInput from '../common/FloatingInput';
import FloatingTextarea from '../common/FloatingTextarea';
import FloatingSelect from '../common/FloatingSelect';
import { useSurvey } from '../../context/SurveyContext';
import { WATER_SOURCES } from '../../utils/constants';
import { Camera, MapPin, X, Image as ImageIcon } from 'lucide-react';

export default function ToiletWaterSection() {
  const { state, setField } = useSurvey();
  const d = state.surveyData;
  const YN = ['हाँ', 'नहीं'];
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(d.q23_toilet_photo_preview || null);
  const [geoStatus, setGeoStatus] = useState('');

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPhotoPreview(dataUrl);
      setField('q23_toilet_photo_preview', dataUrl);
      setField('q23_toilet_photo_name', file.name);
    };
    reader.readAsDataURL(file);

    // Capture geolocation
    setGeoStatus('स्थान प्राप्त हो रहा है...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setField('q23_toilet_geo_lat', lat);
          setField('q23_toilet_geo_lng', lng);
          setGeoStatus(`✅ स्थान: ${lat}, ${lng}`);
        },
        (err) => {
          setGeoStatus('⚠️ स्थान प्राप्त नहीं हो सका — कृपया GPS चालू करें');
          console.error('Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      setGeoStatus('⚠️ इस ब्राउज़र में GPS उपलब्ध नहीं है');
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setField('q23_toilet_photo_preview', '');
    setField('q23_toilet_photo_name', '');
    setField('q23_toilet_geo_lat', '');
    setField('q23_toilet_geo_lng', '');
    setGeoStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-number">Q23 – Q27 | शौचालय एवं पेयजल</span>
        <h2 className="section-title">शौचालय एवं पेयजल</h2>
      </div>

      {/* Q23 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q23</div>
          <div className="question-text">क्या विद्यालय में शौचालय बने हुए हैं?</div>
          <RadioGroup name="q23_available" value={d.q23_available} onChange={(n,v) => setField(n,v)} options={YN} label="शौचालय उपलब्ध" />
          <RadioGroup name="q23_girls_separate" value={d.q23_girls_separate} onChange={(n,v) => setField(n,v)} options={YN} label="बालिकाओं के लिए पृथक शौचालय" />
          <FloatingTextarea label="शौचालय की स्थिति / विवरण" name="q23_details"
            value={d.q23_details} onChange={(n,v) => setField(n,v)} rows={2} />
        </div>
      </div>

      {/* Toilet Geotagging with Camera — NEW */}
      <div className="card">
        <div className="question-block">
          <div className="question-number" style={{background: 'var(--accent-100, #fef3c7)', color: 'var(--accent-700, #b45309)'}}>Q23A</div>
          <div className="question-text">शौचालय स्थिति — जियोटैगिंग फोटो</div>
          
          {/* Note */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, var(--primary-50, #eff6ff), var(--accent-50, #fffbeb))',
            borderRadius: '10px',
            borderLeft: '4px solid var(--primary-500, #3b82f6)',
            marginBottom: '16px',
            marginTop: '8px',
            fontSize: '13px',
            color: 'var(--neutral-700)',
          }}>
            <MapPin size={18} style={{flexShrink: 0, color: 'var(--primary-600)', marginTop: '2px'}} />
            <div>
              <strong>नोट:</strong> कृपया शौचालय की फोटो कैमरा से लें। फोटो के साथ स्थान (GPS) स्वतः सेव होगा। GPS चालू रखें।
            </div>
          </div>

          {/* Camera Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            style={{display: 'none'}}
            id="toilet-photo-input"
          />

          {!photoPreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '32px 24px',
                border: '2px dashed var(--primary-300, #93c5fd)',
                borderRadius: '12px',
                background: 'var(--primary-50, #eff6ff)',
                color: 'var(--primary-600, #2563eb)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
            >
              <Camera size={36} />
              शौचालय की फोटो लें
              <span style={{fontSize: '12px', fontWeight: '400', color: 'var(--neutral-500)'}}>
                कैमरा खुलेगा — फोटो क्लिक करें
              </span>
            </button>
          ) : (
            <div style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid var(--success-300, #86efac)',
              marginBottom: '12px',
            }}>
              <img
                src={photoPreview}
                alt="शौचालय फोटो"
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <button
                type="button"
                onClick={removePhoto}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(220,38,38,0.9)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
              <div style={{
                padding: '8px 12px',
                background: 'var(--success-50, #f0fdf4)',
                fontSize: '12px',
                color: 'var(--success-700, #15803d)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <ImageIcon size={14} />
                फोटो सफलतापूर्वक ली गई
              </div>
            </div>
          )}

          {/* Geolocation Status */}
          {geoStatus && (
            <div style={{
              padding: '8px 12px',
              background: geoStatus.includes('✅') ? 'var(--success-50, #f0fdf4)' : geoStatus.includes('⚠️') ? 'var(--warning-50, #fffbeb)' : 'var(--neutral-50)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--neutral-700)',
              marginBottom: '12px',
            }}>
              {geoStatus}
            </div>
          )}

          {/* Show saved coordinates */}
          {d.q23_toilet_geo_lat && d.q23_toilet_geo_lng && (
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <div style={{
                flex: 1,
                padding: '10px 12px',
                background: 'var(--neutral-50)',
                borderRadius: '8px',
                fontSize: '12px',
              }}>
                <span style={{color: 'var(--neutral-500)'}}>अक्षांश (Lat): </span>
                <strong>{d.q23_toilet_geo_lat}</strong>
              </div>
              <div style={{
                flex: 1,
                padding: '10px 12px',
                background: 'var(--neutral-50)',
                borderRadius: '8px',
                fontSize: '12px',
              }}>
                <span style={{color: 'var(--neutral-500)'}}>देशांतर (Lng): </span>
                <strong>{d.q23_toilet_geo_lng}</strong>
              </div>
            </div>
          )}

          {/* Notes/Remarks */}
          <FloatingTextarea label="शौचालय स्थिति पर टिप्पणी / नोट्स" name="q23_toilet_geo_notes"
            value={d.q23_toilet_geo_notes} onChange={(n,v) => setField(n,v)} rows={3} />
        </div>
      </div>

      {/* Q24 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q24</div>
          <div className="question-text">क्या शौचालयों में जल कनेक्शन उपलब्ध है?</div>
          <RadioGroup name="q24" value={d.q24} onChange={(n,v) => setField(n,v)} options={YN} />
          {d.q24 === 'नहीं' && (
            <div className="conditional-block">
              <FloatingTextarea label="आवश्यकता का विवरण" name="q24_details"
                value={d.q24_details} onChange={(n,v) => setField(n,v)} />
            </div>
          )}
        </div>
      </div>

      {/* Q25 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q25</div>
          <div className="question-text">क्या विद्यालय में पेयजल स्रोत उपलब्ध है?</div>
          <RadioGroup name="q25" value={d.q25} onChange={(n,v) => setField(n,v)} options={YN} />
          {d.q25 === 'हाँ' && (
            <div className="conditional-block">
              <FloatingSelect label="पेयजल स्रोत" name="q25_source"
                value={d.q25_source} onChange={(n,v) => setField(n,v)} options={WATER_SOURCES} />
              <RadioGroup name="q25_ro" value={d.q25_ro} onChange={(n,v) => setField(n,v)} options={YN} label="RO / Water Cooler उपलब्ध है?" />
            </div>
          )}
        </div>
      </div>

      {/* Q26 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q26</div>
          <div className="question-text">पानी से संबंधित आ रही समस्याओं का विवरण दें।</div>
          <FloatingTextarea label="पानी की समस्या का विवरण" name="q26_details"
            value={d.q26_details} onChange={(n,v) => setField(n,v)} rows={4} />
        </div>
      </div>

      {/* Q27 */}
      <div className="card">
        <div className="question-block">
          <div className="question-number">Q27</div>
          <div className="question-text">क्या विद्यालय में रेन शेड है?</div>
          <RadioGroup name="q27" value={d.q27} onChange={(n,v) => setField(n,v)} options={YN} />
          {d.q27 === 'नहीं' && (
            <div className="conditional-block">
              <FloatingTextarea label="रेन शेड आवश्यकता का विवरण" name="q27_details"
                value={d.q27_details} onChange={(n,v) => setField(n,v)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
